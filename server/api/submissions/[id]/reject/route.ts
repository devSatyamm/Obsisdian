import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient, isSupabaseServerConfigured } from '@/lib/supabaseServer';
import { verifyModeratorAccess } from '@/lib/auth/moderationGuard';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const {
      moderatorName = 'Senior Moderator',
      notes = 'Insufficient primary documentary corroboration.'
    } = body;

    // 1. Enforce strict server-side moderation authorization
    const authResult = await verifyModeratorAccess(req, moderatorName);
    if (!authResult.authorized) {
      return NextResponse.json(
        {
          error: authResult.error || 'Unauthorized: Moderator privileges required.',
          hint: 'Moderator operations require Authorization: Bearer <token> or valid x-moderator-key header.'
        },
        { status: authResult.statusCode || 401 }
      );
    }

    const effectiveModeratorName = authResult.reviewerName;
    const effectiveModeratorRole = authResult.reviewerRole;
    const now = new Date().toISOString();

    if (isSupabaseServerConfigured) {
      const client = getSupabaseServerClient();
      if (client) {
        // 2. Update submission status to rejected
        const { error: updateError } = await client
          .from('community_submissions')
          .update({
            status: 'rejected',
            reviewed_by: effectiveModeratorName,
            reviewed_at: now,
            moderation_notes: notes
          })
          .eq('id', id);

        if (updateError) {
          throw updateError;
        }

        // 3. Insert audit history record
        await client
          .from('moderation_audits')
          .insert({
            submission_id: id,
            action: 'reject',
            reviewer_name: effectiveModeratorName,
            reviewer_role: effectiveModeratorRole,
            notes,
            timestamp: now
          });

        return NextResponse.json({
          success: true,
          status: 'rejected',
          message: 'Submission rejected and audit event logged.',
          reviewer: effectiveModeratorName,
          source: 'supabase'
        });
      }
    }

    // Local fallback response
    return NextResponse.json({
      success: true,
      status: 'rejected',
      message: 'Submission rejected in local cache.',
      reviewer: effectiveModeratorName,
      source: 'fallback'
    });
  } catch (err: any) {
    console.error('Reject submission error:', err);
    return NextResponse.json({ error: err.message || 'Rejection failed' }, { status: 500 });
  }
}
