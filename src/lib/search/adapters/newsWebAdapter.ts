import { PlatformSourceAdapter, AdapterExecutionResult, AdapterQueryOptions, cleanText, cleanSnippet, cleanHeadline } from './types';
import { SearchResultItem } from '../types';
import { resolvePublisherDomain, detectWireSyndication } from '../searchProvider';

export class NewsWebSourceAdapter implements PlatformSourceAdapter {
  platform = 'news' as const;
  name = 'Global & National News Outlets (RSS & Web Index)';
  sourceCategory = 'news' as const;

  isEnabled(): boolean {
    return true;
  }

  getAuthStatus(): 'connected' | 'live' | 'rate_limited' | 'auth_required' | 'restricted' | 'error' {
    return 'live';
  }

  getAccessLimitations(): string {
    return 'Aggregates real-time news reporting via Google News RSS and public web indices, with wire syndication tracking.';
  }

  async search(query: string, options: AdapterQueryOptions = {}): Promise<AdapterExecutionResult> {
    const startTime = Date.now();
    const limit = options.limit || 15;
    const items: SearchResultItem[] = [];

    try {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8'
        },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        const xml = await res.text();
        const rawItems = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

        for (let i = 0; i < Math.min(rawItems.length, limit); i++) {
          const it = rawItems[i][1];
          const rawTitle = it.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
          const link = it.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
          const pubDate = it.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
          const sourceMatch = it.match(/<source[^>]*>([\s\S]*?)<\/source>/);
          const sourceUrlAttr = it.match(/<source[^>]*url="([^"]+)"[^>]*>/)?.[1];
          const publisher = sourceMatch ? cleanText(sourceMatch[1]) : 'Public Media';
          const descMatch = it.match(/<description>([\s\S]*?)<\/description>/);
          const title = cleanHeadline(rawTitle, publisher);
          const snippet = cleanSnippet(descMatch ? descMatch[1] : '', title, publisher);

          const pubDomain = resolvePublisherDomain(publisher, link, sourceUrlAttr);
          const wire = detectWireSyndication(title, snippet, publisher);

          if (title && link) {
            items.push({
              id: `news_${i}_${Date.now()}`,
              title,
              url: link,
              snippet: snippet || title,
              publisher,
              publisherDomain: pubDomain,
              isWireSyndicated: wire.isWire,
              wireService: wire.wireService,
              publishedAt: pubDate || new Date().toISOString(),
              sourceProvider: 'google_news',
              platform: 'news',
              sourceCategory: 'news',
              contentType: 'news_reporting',
              provenance: {
                platform: 'news',
                originalUrl: link,
                author: publisher,
                publishedAt: pubDate,
                retrievedAt: new Date().toISOString(),
                contentType: 'news_reporting',
                isOriginal: !wire.isWire,
                isRepost: wire.isWire,
                isDuplicate: false,
                canonicalSourceUrl: link,
                engagementNote: wire.isWire ? `Syndicated via ${wire.wireService}` : 'Original publisher reporting'
              }
            });
          }
        }
      }

      return {
        platform: 'news',
        items,
        status: {
          platform: 'news',
          name: this.name,
          status: 'live',
          itemCount: items.length,
          message: `Retrieved ${items.length} verified news reports across independent outlets.`
        },
        executionTimeMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        platform: 'news',
        items: [],
        status: {
          platform: 'news',
          name: this.name,
          status: 'error',
          itemCount: 0,
          message: `News search error: ${err.message}`
        },
        executionTimeMs: Date.now() - startTime
      };
    }
  }
}
