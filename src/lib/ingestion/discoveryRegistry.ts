import { DiscoverySource } from './types';
import { getSupabaseServerClient, isSupabaseServerConfigured } from '../supabaseServer';

export const INITIAL_DISCOVERY_SOURCES: DiscoverySource[] = [
  {
    id: 'src_rbi_press',
    slug: 'rbi-press-releases',
    name: 'Reserve Bank of India (RBI) Press Releases',
    sourceType: 'rss_feed',
    url: 'https://www.rbi.org.in/pressreleases_rss.xml',
    targetRegulator: 'RBI',
    pollIntervalMinutes: 60,
    isActive: true,
    errorCount: 0,
    createdAt: '2026-10-01T00:00:00Z'
  },
  {
    id: 'src_sebi_alerts',
    slug: 'sebi-caution-alerts',
    name: 'SEBI Public Caution & Regulatory Notices Feed',
    sourceType: 'rss_feed',
    url: 'https://news.google.com/rss/search?q=SEBI+caution+notice+when:7d&hl=en-IN&gl=IN&ceid=IN:en',
    targetRegulator: 'SEBI',
    pollIntervalMinutes: 30,
    isActive: true,
    errorCount: 0,
    createdAt: '2026-10-01T00:00:00Z'
  },
  {
    id: 'src_bbc_business',
    slug: 'bbc-business-markets',
    name: 'BBC Global Business & Financial Markets',
    sourceType: 'rss_feed',
    url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    targetRegulator: 'General Market',
    pollIntervalMinutes: 120,
    isActive: true,
    errorCount: 0,
    createdAt: '2026-10-01T00:00:00Z'
  }
];

// In-memory runtime state for offline/fallback mode
const runtimeSourceState = new Map<string, DiscoverySource>();
INITIAL_DISCOVERY_SOURCES.forEach((s) => runtimeSourceState.set(s.id, { ...s }));

export async function getDiscoverySources(): Promise<DiscoverySource[]> {
  if (isSupabaseServerConfigured) {
    const client = getSupabaseServerClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('discovery_sources')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            slug: d.slug,
            name: d.name,
            sourceType: d.source_type,
            url: d.url,
            targetRegulator: d.target_regulator,
            pollIntervalMinutes: d.poll_interval_minutes,
            lastPolledAt: d.last_polled_at,
            lastEtag: d.last_etag,
            lastModifiedHeader: d.last_modified_header,
            isActive: d.is_active,
            errorCount: d.error_count,
            lastError: d.last_error,
            createdAt: d.created_at
          }));
        }
      } catch (err) {
        console.warn('Discovery sources query failed:', err);
      }
    }
  }

  return Array.from(runtimeSourceState.values());
}

export async function updateDiscoverySourceStatus(
  sourceId: string,
  updates: Partial<DiscoverySource>
): Promise<void> {
  const current = runtimeSourceState.get(sourceId);
  if (current) {
    runtimeSourceState.set(sourceId, { ...current, ...updates });
  }

  if (isSupabaseServerConfigured) {
    const client = getSupabaseServerClient();
    if (client) {
      try {
        const dbUpdate: Record<string, any> = {
          updated_at: new Date().toISOString()
        };
        if (updates.isActive !== undefined) dbUpdate.is_active = updates.isActive;
        if (updates.lastPolledAt !== undefined) dbUpdate.last_polled_at = updates.lastPolledAt;
        if (updates.lastEtag !== undefined) dbUpdate.last_etag = updates.lastEtag;
        if (updates.lastModifiedHeader !== undefined) dbUpdate.last_modified_header = updates.lastModifiedHeader;
        if (updates.errorCount !== undefined) dbUpdate.error_count = updates.errorCount;
        if (updates.lastError !== undefined) dbUpdate.last_error = updates.lastError;

        await client
          .from('discovery_sources')
          .update(dbUpdate)
          .eq('id', sourceId);
      } catch (err) {
        console.warn('Update discovery source status in Supabase failed:', err);
      }
    }
  }
}
