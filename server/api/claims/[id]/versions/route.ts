import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient, isSupabaseServerConfigured } from '@/lib/supabaseServer';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (isSupabaseServerConfigured) {
    const client = getSupabaseServerClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('claim_versions')
          .select('*')
          .eq('claim_id', id)
          .order('version_number', { ascending: true });

        if (!error && data) {
          return NextResponse.json({ data, source: 'supabase' });
        }
      } catch (err) {
        console.warn('Claim versions fetch error:', err);
      }
    }
  }

  return NextResponse.json({
    data: [],
    source: 'fallback',
    message: 'Claim versions for this identifier are managed in the local dossier cache.'
  });
}
