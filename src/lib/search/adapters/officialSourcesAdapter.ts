import { PlatformSourceAdapter, AdapterExecutionResult, AdapterQueryOptions, cleanText } from './types';
import { SearchResultItem, SocialContentType } from '../types';

export class OfficialSourcesAdapter implements PlatformSourceAdapter {
  platform = 'official' as const;
  name = 'Official Institutional & Government Portals';
  sourceCategory = 'official' as const;

  isEnabled(): boolean {
    return true;
  }

  getAuthStatus(): 'connected' | 'live' | 'rate_limited' | 'auth_required' | 'restricted' | 'error' {
    return 'live';
  }

  getAccessLimitations(): string {
    return 'Official government press releases, gazettes, health directives, and institutional announcements (.gov, .nic.in, pib.gov.in, who.int).';
  }

  async search(query: string, options: AdapterQueryOptions = {}): Promise<AdapterExecutionResult> {
    const startTime = Date.now();
    const limit = Math.min(options.limit || 6, 10);
    const items: SearchResultItem[] = [];

    // Search query targeted to institutional domains
    const officialQuery = `${query} (site:pib.gov.in OR site:gov.in OR site:who.int OR site:nic.in OR site:gov)`;

    try {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(officialQuery)}&hl=en-US&gl=US&ceid=US:en`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'application/rss+xml, application/xml, text/xml'
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
          const publisher = sourceMatch ? cleanText(sourceMatch[1]) : 'Government / Institutional Portal';
          const descMatch = it.match(/<description>([\s\S]*?)<\/description>/);
          const snippet = descMatch ? cleanText(descMatch[1]) : '';

          let title = cleanText(rawTitle);
          const lastDash = title.lastIndexOf(' - ');
          if (lastDash > 10) title = title.substring(0, lastDash).trim();

          const contentType: SocialContentType = 'official_statement';

          items.push({
            id: `gov_${i}_${Date.now()}`,
            title,
            url: link,
            snippet: snippet || title,
            publisher,
            publisherDomain: 'gov.in',
            publishedAt: pubDate || new Date().toISOString(),
            sourceProvider: 'official',
            platform: 'official',
            sourceCategory: 'official',
            contentType,
            author: publisher,
            provenance: {
              platform: 'official',
              originalUrl: link,
              author: publisher,
              publishedAt: pubDate,
              retrievedAt: new Date().toISOString(),
              contentType,
              isOriginal: true,
              isRepost: false,
              isDuplicate: false,
              canonicalSourceUrl: link,
              engagementNote: 'Official institutional record or government press release'
            }
          });
        }
      }

      return {
        platform: 'official',
        items,
        status: {
          platform: 'official',
          name: this.name,
          status: 'live',
          itemCount: items.length,
          message: items.length > 0 ? `Retrieved ${items.length} official institutional bulletins.` : 'No official institutional statements directly matched this query.'
        },
        executionTimeMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        platform: 'official',
        items: [],
        status: {
          platform: 'official',
          name: this.name,
          status: 'error',
          itemCount: 0,
          message: `Official sources query error: ${err.message}`
        },
        executionTimeMs: Date.now() - startTime
      };
    }
  }
}
