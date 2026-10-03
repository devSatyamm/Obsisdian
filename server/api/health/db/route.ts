import { NextResponse } from 'next/server';
import { getSupabaseServerClient, isSupabaseServerConfigured } from '@/lib/supabaseServer';

export async function GET() {
  if (!isSupabaseServerConfigured) {
    return NextResponse.json({
      status: 'unconfigured',
      connected: false,
      message:
        'Supabase credentials are not configured in environment variables. Running in local fallback mode.',
      timestamp: new Date().toISOString()
    });
  }

  const client = getSupabaseServerClient();
  if (!client) {
    return NextResponse.json({
      status: 'error',
      connected: false,
      message: 'Failed to initialize Supabase server client.',
      timestamp: new Date().toISOString()
    });
  }

  try {
    // Attempt a light query to test database connectivity
    const { data, error, count } = await client
      .from('organisations')
      .select('id', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({
        status: 'error',
        connected: false,
        error: error.message,
        hint:
          'Supabase credentials were provided, but the database query returned an error. Ensure migrations have been executed in Supabase SQL editor.',
        timestamp: new Date().toISOString()
      }, { status: 502 });
    }

    return NextResponse.json({
      status: 'healthy',
      connected: true,
      organisationsCount: count ?? 0,
      message: 'Successfully connected to Supabase PostgreSQL database.',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      connected: false,
      error: err.message || 'Unknown connection error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
