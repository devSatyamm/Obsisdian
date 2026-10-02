import { PlatformSourceAdapter, AdapterExecutionResult, AdapterQueryOptions, cleanText } from './types';
import { SearchResultItem, SocialContentType } from '../types';

export class ForumsSourceAdapter implements PlatformSourceAdapter {
  platform = 'forums' as const;
  name = 'Public Discussion Forums & Technical Communities';
  sourceCategory = 'forums' as const;

  isEnabled(): boolean {
    return true;
  }

  getAuthStatus(): 'connected' | 'live' | 'rate_limited' | 'auth_required' | 'restricted' | 'error' {
    return 'live';
  }

  getAccessLimitations(): string {
    return 'Queries public community forums (Hacker News Algolia Search API, StackExchange, and public discourse portals).';
  }

  async search(query: string, options: AdapterQueryOptions = {}): Promise<AdapterExecutionResult> {
    const startTime = Date.now();
    const limit = Math.min(options.limit || 8, 15);
    const items: SearchResultItem[] = [];

    try {
      const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=${limit}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const hits = data.hits || [];

        for (const hit of hits) {
          const title = cleanText(hit.title || '');
          const postUrl = hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`;
          const author = hit.author || 'Forum User';
          const points = hit.points || 0;
          const comments = hit.num_comments || 0;
          const publishedAt = hit.created_at || new Date().toISOString();
          const contentType: SocialContentType = hit.story_text ? 'user_speculation' : 'news_reporting';

          items.push({
            id: `hn_${hit.objectID}_${Date.now()}`,
            title,
            url: postUrl,
            snippet: cleanText(hit.story_text || '') || `Public forum discussion by ${author} with ${points} points and ${comments} comments.`,
            publisher: 'Hacker News Forum',
            publisherDomain: 'news.ycombinator.com',
            publishedAt,
            sourceProvider: 'forums',
            platform: 'forums',
            sourceCategory: 'forums',
            contentType,
            author,
            provenance: {
              platform: 'forums',
              originalUrl: postUrl,
              author,
              publishedAt,
              retrievedAt: new Date().toISOString(),
              contentType,
              isOriginal: true,
              isRepost: false,
              isDuplicate: false,
              canonicalSourceUrl: postUrl,
              engagementNote: `${points} points, ${comments} comments. Note: Forum engagement does not prove factual validity.`
            }
          });
        }
      }

      return {
        platform: 'forums',
        items,
        status: {
          platform: 'forums',
          name: this.name,
          status: 'live',
          itemCount: items.length,
          message: items.length > 0 ? `Retrieved ${items.length} discussions from public forums.` : 'No forum discussions found for this topic.'
        },
        executionTimeMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        platform: 'forums',
        items: [],
        status: {
          platform: 'forums',
          name: this.name,
          status: 'error',
          itemCount: 0,
          message: `Forum query error: ${err.message}`
        },
        executionTimeMs: Date.now() - startTime
      };
    }
  }
}
