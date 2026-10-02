import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Validates whether Supabase client-side credentials are provided and non-placeholder.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project-ref') &&
  supabaseAnonKey &&
  supabaseAnonKey.length > 20 &&
  !supabaseAnonKey.includes('your-anon-key-placeholder')
);

/**
 * Public Supabase client for client-side operations governed by Row Level Security.
 * Returns null if Supabase credentials are not configured in environment variables.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

/**
 * Production-Ready SQL Schema
 * Exported for transparency and developer manual execution in Supabase SQL editor.
 */
export const SUPABASE_SQL_SCHEMA = `
-- VERITY Database Schema (Refer to supabase/migrations/20261002000000_verity_core_schema.sql for the full migration)
-- Includes:
-- 1. organisations (unique slug, category, registration status, verification badge)
-- 2. claims (organisation reference, title, status)
-- 3. claim_versions (immutable versioning, statement text, diffs, primary source reference)
-- 4. source_records (statutory and press source exhibits)
-- 5. evidence_items (corroborated community and moderator exhibits)
-- 6. official_notices (SEBI/RBI/MCA circulars)
-- 7. community_submissions (moderation queue)
-- 8. profile_revisions (traceable audit history)
-- 9. moderation_audits (formal review action ledger)
-- 10. Immutability trigger on published claim versions
-- 11. Row Level Security (RLS) on all tables
`;
