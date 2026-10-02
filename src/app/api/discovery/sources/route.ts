import { NextResponse } from 'next/server';
import { getDiscoverySources } from '@/lib/ingestion/discoveryRegistry';

export async function GET() {
  try {
    const sources = await getDiscoverySources();
    return NextResponse.json({ sources, count: sources.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch discovery sources' }, { status: 500 });
  }
}
