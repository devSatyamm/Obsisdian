import { createClient, SupabaseClient } from '@supabase/supabase-js';

if (typeof window !== 'undefined') {
  throw new Error('VERITY Security Violation: supabaseServer must never be executed on the client!');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Server-side check for whether Supabase backend is configured.
 */
export const isSupabaseServerConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project-ref') &&
  ((supabaseServiceRoleKey &&
    supabaseServiceRoleKey.length > 20 &&
    !supabaseServiceRoleKey.includes('your-service-role-key-placeholder')) ||
   (supabaseAnonKey &&
    supabaseAnonKey.length > 20 &&
    !supabaseAnonKey.includes('your-anon-key-placeholder')))
);

/**
 * Creates a server-only Supabase client.
 * Prioritizes the service role key for privileged administrative and moderation tasks
 * when running securely in Next.js Server Components or Route Handlers.
 * Falls back to anon key if service role is not provided.
 *
 * NOTE: NEVER import or call this function in client components ('use client').
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (!isSupabaseServerConfigured) {
    return null;
  }

  const keyToUse =
    supabaseServiceRoleKey &&
    !supabaseServiceRoleKey.includes('your-service-role-key-placeholder')
      ? supabaseServiceRoleKey
      : supabaseAnonKey;

  return createClient(supabaseUrl, keyToUse, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
