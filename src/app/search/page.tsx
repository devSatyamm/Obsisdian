import SearchClient from './SearchClient';
import { searchInternetLive } from '@/lib/search/searchProvider';
import { resolveSearchResultsContent } from '@/lib/search/contentResolver';
import { compareQueryWithDatabase } from '@/lib/search/databaseComparator';
import { synthesizeIntelligenceReport } from '@/lib/search/intelligenceSynthesizer';
import { LiveIntelligenceReport } from '@/lib/search/types';

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const trimmed = q?.trim() || '';
  let initialReport: LiveIntelligenceReport | null = null;

  if (trimmed) {
    try {
      const startTime = Date.now();
      const rawSources = await searchInternetLive(trimmed, { maxResults: 15 });
      const resolvedSources = await resolveSearchResultsContent(rawSources, 5);
      const dbMatch = await compareQueryWithDatabase(
        trimmed,
        resolvedSources[0]?.title,
        resolvedSources[0]?.url,
        resolvedSources[0]?.publisher
      );
      const durationMs = Date.now() - startTime;
      initialReport = await synthesizeIntelligenceReport(trimmed, resolvedSources, dbMatch, durationMs);
    } catch (e) {
      console.warn('SSR search failed; client will execute on mount:', e);
    }
  }

  return <SearchClient initialQuery={trimmed} initialReport={initialReport} />;
}
