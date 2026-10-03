import { NextResponse } from 'next/server';
import { getJobHistory } from '@/lib/ingestion/jobRunner';
import { getSupabaseServerClient, isSupabaseServerConfigured } from '@/lib/supabaseServer';

export async function GET() {
  if (isSupabaseServerConfigured) {
    const client = getSupabaseServerClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('ingestion_jobs')
          .select('*')
          .order('started_at', { ascending: false })
          .limit(20);

        if (!error && data) {
          return NextResponse.json({ jobs: data, source: 'supabase' });
        }
      } catch (err) {
        console.warn('Query ingestion_jobs from Supabase failed:', err);
      }
    }
  }

  const memoryJobs = getJobHistory();
  return NextResponse.json({ jobs: memoryJobs, source: 'memory' });
}
