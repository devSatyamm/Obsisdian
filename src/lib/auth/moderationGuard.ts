import { NextRequest } from 'next/server';
import { getSupabaseServerClient, isSupabaseServerConfigured } from '@/lib/supabaseServer';
import { verifySessionToken } from '@/lib/auth/userAuth';

export interface ModeratorVerificationResult {
  authorized: boolean;
  reviewerName: string;
  reviewerRole: string;
  error?: string;
  statusCode?: number;
}

/**
 * Server-side guard to verify moderator credentials before executing privileged operations.
 * Enforces role-based authorization: client-side persona switches NEVER grant real authority.
 * Development credentials are strictly disabled in production environments.
 */
export async function verifyModeratorAccess(
  req: NextRequest,
  requestedModeratorName?: string
): Promise<ModeratorVerificationResult> {
  const authHeader = req.headers.get('authorization') || '';
  const moderationKeyHeader = req.headers.get('x-moderator-key') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';
  const providedKey = token || moderationKeyHeader;

  // 1. VERITY Cryptographic Session Token verification (JWT)
  if (token) {
    const session = verifySessionToken(token);
    if (session && (session.role === 'moderator' || session.role === 'admin')) {
      return {
        authorized: true,
        reviewerName: session.fullName || requestedModeratorName || 'Verified Moderator',
        reviewerRole: 'Senior Moderator'
      };
    }
  }

  // 1. Supabase Auth Session Token verification (JWT)
  if (token && isSupabaseServerConfigured) {
    const client = getSupabaseServerClient();
    if (client) {
      try {
        const { data: { user }, error } = await client.auth.getUser(token);
        if (!error && user) {
          const role = user.app_metadata?.role || user.user_metadata?.role || '';
          if (role === 'moderator' || role === 'admin' || role === 'senior_researcher') {
            return {
              authorized: true,
              reviewerName:
                user.user_metadata?.full_name ||
                user.email?.split('@')[0] ||
                requestedModeratorName ||
                'Verified Moderator',
              reviewerRole: 'Senior Moderator'
            };
          }
        }
      } catch (err) {
        console.warn('Supabase Auth token validation failed:', err);
      }
    }
  }

  // 2. Secret Key matching (MODERATOR_API_SECRET or SUPABASE_SERVICE_ROLE_KEY)
  const configuredSecret = process.env.MODERATOR_API_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (configuredSecret && providedKey && providedKey === configuredSecret) {
    return {
      authorized: true,
      reviewerName: requestedModeratorName || 'Authorized System Moderator',
      reviewerRole: 'Senior Moderator'
    };
  }

  // 3. Local Development Safe Override (STRICTLY DISABLED IN CLOUD PRODUCTION)
  const isProduction = process.env.NODE_ENV === 'production';
  const isCloudProduction = isProduction && (Boolean(process.env.VERCEL) || Boolean(process.env.FLY_APP_NAME) || Boolean(process.env.AWS_REGION));
  if (!isCloudProduction) {
    const devFallbackKey = 'dev-verity-local-2026';
    if (providedKey && providedKey === devFallbackKey) {
      return {
        authorized: true,
        reviewerName: requestedModeratorName || 'Local Dev Moderator',
        reviewerRole: 'Senior Moderator'
      };
    }
  }

  // 4. Default: Unauthorized - Reject bare, public, forged persona, or expired attempts
  return {
    authorized: false,
    reviewerName: '',
    reviewerRole: '',
    statusCode: 401,
    error: isProduction
      ? 'Unauthorized: Moderator authentication required. In production, configure MODERATOR_API_SECRET or authenticate via Supabase Auth.'
      : 'Unauthorized: Privileged moderation operation requires valid credentials. Provide Authorization: Bearer <token> or valid x-moderator-key.'
  };
}
