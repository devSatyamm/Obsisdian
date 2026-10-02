import { SearchResultItem } from './types';
import { classifyQueryIntent } from './intentClassifier';
import { validateSourceAgainstIntent } from './queryEvidenceValidator';
import { cleanText } from './adapters/types';

const KNOWN_PUBLISHER_DOMAINS: Record<string, string> = {
  'times of india': 'timesofindia.indiatimes.com',
  'the times of india': 'timesofindia.indiatimes.com',
  'hindustan times': 'hindustantimes.com',
  'the hindu': 'thehindu.com',
  'the indian express': 'indianexpress.com',
  'indian express': 'indianexpress.com',
  'ndtv': 'ndtv.com',
  'ndtv news': 'ndtv.com',
  'india today': 'indiatoday.in',
  'the print': 'theprint.in',
  'the wire': 'thewire.in',
  'scroll.in': 'scroll.in',
  'livemint': 'livemint.com',
  'mint': 'livemint.com',
  'financial express': 'financialexpress.com',
  'deccan herald': 'deccanherald.com',
  'business standard': 'business-standard.com',
  'telegraph india': 'telegraphindia.com',
  'the telegraph': 'telegraphindia.com',
  'reuters': 'reuters.com',
  'associated press': 'apnews.com',
  'ap news': 'apnews.com',
  'bbc news': 'bbc.com',
  'bbc': 'bbc.com',
  'cnn': 'cnn.com',
  'the guardian': 'theguardian.com',
  'bloomberg': 'bloomberg.com',
  'afp': 'afp.com',
  'al jazeera': 'aljazeera.com',
  'the washington post': 'washingtonpost.com',
  'the new york times': 'nytimes.com',
  'abc news': 'abcnews.go.com',
  'cbs news': 'cbsnews.com',
  'nbc news': 'nbcnews.com',
  'press trust of india': 'ptinews.com',
  'pti': 'ptinews.com',
  'asian news international': 'aninews.in',
  'ani': 'aninews.in'
};

export function resolvePublisherDomain(publisher: string, rawUrl?: string, sourceUrlAttr?: string): string {
  if (sourceUrlAttr) {
    try {
      const hostname = new URL(sourceUrlAttr).hostname.replace(/^www\./, '');
      if (hostname && !hostname.includes('google.com') && !hostname.includes('duckduckgo.com')) {
        return hostname;
      }
    } catch {}
  }
  const normalized = (publisher || '').toLowerCase().trim();
  if (KNOWN_PUBLISHER_DOMAINS[normalized]) {
    return KNOWN_PUBLISHER_DOMAINS[normalized];
  }
  for (const [name, domain] of Object.entries(KNOWN_PUBLISHER_DOMAINS)) {
    if (normalized.includes(name) || name.includes(normalized)) {
      return domain;
    }
  }
  if (rawUrl && rawUrl.startsWith('http')) {
    try {
      const parsed = new URL(rawUrl).hostname.replace(/^www\./, '');
      if (!parsed.includes('google.com') && !parsed.includes('duckduckgo.com')) {
        return parsed;
      }
    } catch {}
  }
  return normalized ? `${normalized.replace(/[^a-z0-9]/g, '')}.com` : 'unknown-domain.org';
}

export function detectWireSyndication(title: string, snippet: string, publisher: string): { isWire: boolean; wireService?: string } {
  const combined = `${title} ${snippet} ${publisher}`.toUpperCase();
  if (/\b(PTI|PRESS TRUST OF INDIA)\b/.test(combined)) {
    return { isWire: true, wireService: 'PTI (Press Trust of India)' };
  }
  if (/\b(ANI|ASIAN NEWS INTERNATIONAL)\b/.test(combined)) {
    return { isWire: true, wireService: 'ANI (Asian News International)' };
  }
  if (/\b(REUTERS)\b/.test(combined)) {
    return { isWire: true, wireService: 'Reuters' };
  }
  if (/\b(ASSOCIATED PRESS|AP WIRE)\b/.test(combined)) {
    return { isWire: true, wireService: 'Associated Press' };
  }
  if (/\b(IANS|INDO-ASIAN NEWS SERVICE)\b/.test(combined)) {
    return { isWire: true, wireService: 'IANS' };
  }
  if (/\b(AFP|AGENCE FRANCE-PRESSE)\b/.test(combined)) {
    return { isWire: true, wireService: 'AFP' };
  }
  return { isWire: false };
}

/**
 * Provider 1: Google News Live Search (Free, zero-credential, high-quality worldwide coverage)
 */
async function searchGoogleNews(query: string, limit = 15): Promise<SearchResultItem[]> {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const xml = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    const results: SearchResultItem[] = [];

    for (let i = 0; i < Math.min(items.length, limit); i++) {
      const it = items[i][1];
      const rawTitle = it.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
      const link = it.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
      const pubDate = it.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
      const sourceMatch = it.match(/<source[^>]*>([\s\S]*?)<\/source>/);
      const sourceUrlAttr = it.match(/<source[^>]*url="([^"]+)"[^>]*>/)?.[1];
      const publisher = sourceMatch ? cleanText(sourceMatch[1]) : 'Public Media';
      const descMatch = it.match(/<description>([\s\S]*?)<\/description>/);
      const snippet = descMatch ? cleanText(descMatch[1]) : '';

      // Clean title if it ends with " - Publisher"
      let title = cleanText(rawTitle);
      const lastDash = title.lastIndexOf(' - ');
      if (lastDash > 15) {
        title = title.substring(0, lastDash).trim();
      }

      const pubDomain = resolvePublisherDomain(publisher, link, sourceUrlAttr);
      const wire = detectWireSyndication(title, snippet, publisher);

      if (title && link) {
        results.push({
          id: `gn_${i}_${Date.now()}`,
          title,
          url: link,
          snippet: snippet || title,
          publisher,
          publisherDomain: pubDomain,
          isWireSyndicated: wire.isWire,
          wireService: wire.wireService,
          publishedAt: pubDate || new Date().toISOString(),
          sourceProvider: 'google_news'
        });
      }
    }

    return results;
  } catch (err: any) {
    console.warn('Google News search failed or timed out:', err.message);
    return [];
  }
}

/**
 * Provider 2: DuckDuckGo HTML Web Search
 */
async function searchDuckDuckGo(query: string, limit = 10): Promise<SearchResultItem[]> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const html = await res.text();
    const results: SearchResultItem[] = [];

    // Parse DDG HTML results
    const blocks = [...html.matchAll(/<div class="result results_links results_links_deep[^"]*"[\s\S]*?<\/div>\s*<\/div>/g)];
    
    for (let i = 0; i < Math.min(blocks.length, limit); i++) {
      const block = blocks[i][0];
      const titleMatch = block.match(/class="result__a"[^>]*>([\s\S]*?)<\/a>/);
      const urlMatch = block.match(/class="result__url"[^>]*href="([^"]+)"/);
      const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);

      const title = titleMatch ? cleanText(titleMatch[1]) : '';
      let rawUrl = urlMatch ? urlMatch[1] : '';
      const snippet = snippetMatch ? cleanText(snippetMatch[1]) : '';

      // Unpack uddg redirect if needed
      if (rawUrl.includes('uddg=')) {
        try {
          const match = rawUrl.match(/uddg=([^&]+)/);
          if (match) rawUrl = decodeURIComponent(match[1]);
        } catch {
          // Keep raw
        }
      }

      let publisher = 'Web Source';
      let publisherDomain = 'web-source.org';
      try {
        if (rawUrl.startsWith('http')) {
          publisherDomain = new URL(rawUrl).hostname.replace(/^www\./, '');
          publisher = publisherDomain;
        }
      } catch {}

      const wire = detectWireSyndication(title, snippet, publisher);

      if (title && rawUrl.startsWith('http')) {
        results.push({
          id: `ddg_${i}_${Date.now()}`,
          title,
          url: rawUrl,
          snippet: snippet || title,
          publisher,
          publisherDomain,
          isWireSyndicated: wire.isWire,
          wireService: wire.wireService,
          publishedAt: new Date().toISOString(),
          sourceProvider: 'duckduckgo'
        });
      }
    }

    return results;
  } catch (err: any) {
    console.warn('DuckDuckGo search failed or timed out:', err.message);
    return [];
  }
}

/**
 * Provider 3: Optional Tavily Search API (if TAVILY_API_KEY is configured)
 */
async function searchTavily(query: string, apiKey: string, limit = 10): Promise<SearchResultItem[]> {
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: 'advanced',
        include_answer: true,
        max_results: limit
      })
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((r: any, idx: number) => ({
      id: `tav_${idx}_${Date.now()}`,
      title: cleanText(r.title),
      url: r.url,
      snippet: cleanText(r.content),
      publisher: new URL(r.url).hostname.replace(/^www\./, ''),
      publishedAt: r.published_date || new Date().toISOString(),
      sourceProvider: 'tavily'
    }));
  } catch (err) {
    return [];
  }
}

/**
 * Primary Real-Time Multi-Provider Search Function
 * Queries Google News RSS and DuckDuckGo in parallel, and incorporates premium search APIs if keys exist.
 * Integrates Query Intent Classification and Semantic Relevance Filtering.
 */
import { platformAdapterRegistry } from './adapters/registry';
import { PlatformRetrievalStatus, SocialEvidenceAnalysis } from './types';

export interface MultiPlatformSearchResult {
  sources: SearchResultItem[];
  platformStatuses: PlatformRetrievalStatus[];
  socialAnalysis: SocialEvidenceAnalysis;
}

/**
 * Primary Multi-Platform Live Retrieval Function
 * Queries News, Official portals, Reddit, YouTube, Forums, and configured social networks in parallel.
 * Validates candidates against query intent and generates platform health metrics.
 */
export async function searchMultiPlatformLive(
  query: string,
  options: { maxResults?: number } = {}
): Promise<MultiPlatformSearchResult> {
  const limit = options.maxResults || 20;
  const intent = classifyQueryIntent(query);

  // 1. Query the unified multi-platform adapter registry
  const adapterResponse = await platformAdapterRegistry.retrieveAll(query, {
    limit,
    intent
  });

  // 2. Also query extra targeted predicate queries on Google News if intent specifies them
  const extraQueries = (intent.searchQueries || []).filter((q) => q !== query).slice(0, 2);
  const extraItems: SearchResultItem[] = [];
  if (extraQueries.length > 0) {
    const extraPromises = extraQueries.map((eq) => searchGoogleNews(eq, 6));
    const extraSettled = await Promise.allSettled(extraPromises);
    for (const res of extraSettled) {
      if (res.status === 'fulfilled') {
        extraItems.push(...res.value);
      }
    }
  }

  // Combine adapter items + extra predicate search items
  const combined = [...adapterResponse.items, ...extraItems];

  // 3. Deduplicate by URL and normalized title
  const seenTitles = new Set<string>();
  const seenUrls = new Set<string>();
  const deduped: SearchResultItem[] = [];

  for (const item of combined) {
    const normalizedTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedUrl = item.url.split('?')[0].toLowerCase();

    if (seenTitles.has(normalizedTitle) || seenUrls.has(normalizedUrl)) {
      continue;
    }

    seenTitles.add(normalizedTitle);
    seenUrls.add(normalizedUrl);
    deduped.push(item);
  }

  // 4. Validate and score each candidate source against classified intent
  const annotated: SearchResultItem[] = [];
  for (const item of deduped) {
    const val = validateSourceAgainstIntent(item, intent);
    if (intent.intentType === 'incident_search' && intent.secondaryEntities.length > 0 && !val.correctPredicate && !val.directlyAnswers) {
      continue;
    }
    annotated.push({
      ...item,
      relevanceScore: val.relevanceScore,
      relevanceRationale: val.relevanceRationale,
      entityMatched: val.correctEntity,
      predicateMatched: val.correctPredicate,
      supportsPart: val.supportsPart,
      directlyAnswers: val.directlyAnswers
    });
  }

  // Sort by relevance score descending
  annotated.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

  return {
    sources: annotated.slice(0, limit),
    platformStatuses: adapterResponse.platformStatuses,
    socialAnalysis: adapterResponse.socialAnalysis
  };
}

/**
 * Backward-compatible search function used by live search endpoints and test suites.
 */
export async function searchInternetLive(
  query: string,
  options: { maxResults?: number } = {}
): Promise<SearchResultItem[]> {
  const result = await searchMultiPlatformLive(query, options);
  return result.sources;
}

