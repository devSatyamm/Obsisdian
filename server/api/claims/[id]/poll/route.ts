import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/userAuth';
import { repository } from '@/lib/db/repository';
import { CommunityVoteOption } from '@/lib/search/types';

const VALID_OPTIONS: CommunityVoteOption[] = ['true', 'false', 'partially_true', 'insufficient_evidence'];

// In-memory rate limiting map for votes: IP / User -> timestamps
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(key: string, limit = 20, windowMs = 60000): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(key) || [];
  const validTimestamps = timestamps.filter((t) => now - t < windowMs);
  if (validTimestamps.length >= limit) {
    return false;
  }
  validTimestamps.push(now);
  rateLimitMap.set(key, validTimestamps);
  return true;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: claimId } = await context.params;
    const url = new URL(req.url);
    const versionParam = url.searchParams.get('version');
    const claimVersion = versionParam ? parseInt(versionParam, 10) : 1;

    // Check if requester is authenticated to populate user's active vote
    const user = await getAuthenticatedUser(req);
    const poll = repository.getClaimPoll(claimId, isNaN(claimVersion) ? 1 : claimVersion, user?.id);

    return NextResponse.json({
      success: true,
      poll,
      authenticated: Boolean(user)
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch poll.' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: claimId } = await context.params;

    // 1. Enforce strict server-side authentication (Do NOT trust client persona or user IDs)
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        {
          error: 'Authentication required. Sign in or create an account to participate in community polling.',
          hint: 'Send a valid session cookie or Authorization: Bearer <token>.'
        },
        { status: 401 }
      );
    }

    // 2. Rate limiting by authenticated user ID
    if (!checkRateLimit(`vote_${user.id}`)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before voting again.' },
        { status: 429 }
      );
    }

    // 3. Parse and validate payload
    const body = await req.json().catch(() => ({}));
    const {
      voteOption,
      claimVersion = 1,
      rationale,
      claimStatement,
      claimTitle
    } = body;

    if (!voteOption || !VALID_OPTIONS.includes(voteOption)) {
      return NextResponse.json(
        {
          error: `Invalid vote option: "${voteOption}". Must be one of: ${VALID_OPTIONS.join(', ')}`
        },
        { status: 400 }
      );
    }

    // 4. Atomic upsert to enforce ONE active vote per user per claim version
    const result = repository.castClaimVote({
      claimId,
      claimVersion: typeof claimVersion === 'number' ? claimVersion : 1,
      userId: user.id,
      voteOption,
      rationale: typeof rationale === 'string' ? rationale.trim().substring(0, 500) : undefined,
      claimStatement,
      claimTitle
    });

    return NextResponse.json({
      success: true,
      message: 'Vote recorded successfully.',
      poll: result.poll,
      userVote: result.vote.voteOption,
      voter: {
        id: user.id,
        name: user.fullName
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to record vote.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: claimId } = await context.params;

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required to withdraw a vote.' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const versionParam = url.searchParams.get('version');
    const claimVersion = versionParam ? parseInt(versionParam, 10) : 1;

    const result = repository.withdrawClaimVote({
      claimId,
      claimVersion: isNaN(claimVersion) ? 1 : claimVersion,
      userId: user.id
    });

    return NextResponse.json({
      success: true,
      message: result.withdrawn ? 'Vote successfully withdrawn.' : 'No active vote found to withdraw.',
      poll: result.poll
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to withdraw vote.' },
      { status: 500 }
    );
  }
}
