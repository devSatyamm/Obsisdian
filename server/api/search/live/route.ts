import { NextRequest, NextResponse } from 'next/server';
import { searchInternetLive, searchMultiPlatformLive } from '@/lib/search/searchProvider';
import { resolveSearchResultsContent } from '@/lib/search/contentResolver';
import { compareQueryWithDatabase } from '@/lib/search/databaseComparator';
import { synthesizeIntelligenceReport } from '@/lib/search/intelligenceSynthesizer';
import { getAuthenticatedUser } from '@/lib/auth/userAuth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const user = await getAuthenticatedUser(req);
  return handleSearch(query, user?.id);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = body.query || '';
    const user = await getAuthenticatedUser(req);
    return handleSearch(query, user?.id);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Invalid request body' }, { status: 400 });
  }
}

async function handleSearch(query: string, userId?: string) {
  const startTime = Date.now();
  const trimmed = query.trim();

  if (!trimmed) {
    return NextResponse.json(
      { error: 'Search query parameter "q" is required.' },
      { status: 400 }
    );
  }

  try {
    // 1. Search across multi-platform sources (News, Official, Reddit, YouTube, Forums)
    const multiPlatformResult = await searchMultiPlatformLive(trimmed, { maxResults: 15 });
    const rawSources = multiPlatformResult.sources;

    // 2. Resolve content for top articles using safe SSRF guard
    const resolvedSources = await resolveSearchResultsContent(rawSources, 5);

    // 3. Cross-reference query against existing VERITY database
    const topHeadline = resolvedSources[0]?.title;
    const primaryUrl = resolvedSources[0]?.url;
    const publisher = resolvedSources[0]?.publisher;
    const dbMatch = await compareQueryWithDatabase(trimmed, topHeadline, primaryUrl, publisher);

    // 4. Synthesize live intelligence report
    const durationMs = Date.now() - startTime;
    const report = await synthesizeIntelligenceReport(trimmed, resolvedSources, dbMatch, durationMs, userId);

    // Attach platform statuses & social analysis
    report.platformStatuses = multiPlatformResult.platformStatuses;
    report.socialAnalysis = multiPlatformResult.socialAnalysis;

    return NextResponse.json({
      success: true,
      report
    });
  } catch (err: any) {
    console.error('Live search error:', err);
    return NextResponse.json(
      { error: err.message || 'Live search failed' },
      { status: 500 }
    );
  }
}
