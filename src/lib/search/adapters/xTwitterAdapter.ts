import { PlatformSourceAdapter, AdapterExecutionResult, AdapterQueryOptions } from './types';
import { SearchResultItem, SocialContentType } from '../types';

export class XTwitterSourceAdapter implements PlatformSourceAdapter {
  platform = 'x' as const;
  name = 'X (formerly Twitter) Public Conversations';
  sourceCategory = 'social_media' as const;

  isEnabled(): boolean {
    return true;
  }

  getAuthStatus(): 'connected' | 'live' | 'rate_limited' | 'auth_required' | 'restricted' | 'error' {
    return (process.env.X_BEARER_TOKEN || process.env.TWITTER_BEARER_TOKEN) ? 'live' : 'auth_required';
  }

  getAccessLimitations(): string {
    return 'Platform terms require official X API v2 Bearer Token. VERITY strictly obeys robots.txt and platform developer terms; unauthenticated scraping is not permitted.';
  }

  async search(query: string, options: AdapterQueryOptions = {}): Promise<AdapterExecutionResult> {
    const startTime = Date.now();
    const token = process.env.X_BEARER_TOKEN || process.env.TWITTER_BEARER_TOKEN;

    if (!token) {
      return {
        platform: 'x',
        items: [],
        status: {
          platform: 'x',
          name: this.name,
          status: 'auth_required',
          itemCount: 0,
          message: 'Access requires X API v2 Bearer Token. Unauthenticated scraping is prohibited per platform terms.',
          documentationUrl: 'https://developer.x.com'
        },
        executionTimeMs: Date.now() - startTime
      };
    }

    try {
      const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=${Math.min(options.limit || 10, 20)}&tweet.fields=created_at,author_id,public_metrics`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });

      if (!res.ok) {
        return {
          platform: 'x',
          items: [],
          status: {
            platform: 'x',
            name: this.name,
            status: res.status === 429 ? 'rate_limited' : 'error',
            itemCount: 0,
            message: `X API v2 returned HTTP ${res.status}`,
            documentationUrl: 'https://developer.x.com'
          },
          executionTimeMs: Date.now() - startTime
        };
      }

      const data = await res.json();
      const tweets = data.data || [];
      const items: SearchResultItem[] = [];

      for (const t of tweets) {
        const text = t.text || '';
        const tweetUrl = `https://x.com/i/web/status/${t.id}`;
        const isOfficial = /\b(?:statement|verified|official|spokesperson)\b/i.test(text);
        const contentType: SocialContentType = isOfficial ? 'official_statement' : 'user_speculation';

        items.push({
          id: `x_${t.id}_${Date.now()}`,
          title: text.substring(0, 100),
          url: tweetUrl,
          snippet: text,
          publisher: 'X (Twitter)',
          publisherDomain: 'x.com',
          publishedAt: t.created_at || new Date().toISOString(),
          sourceProvider: 'x',
          platform: 'x',
          sourceCategory: 'social_media',
          contentType,
          author: `user_${t.author_id}`,
          provenance: {
            platform: 'x',
            originalUrl: tweetUrl,
            author: `user_${t.author_id}`,
            publishedAt: t.created_at,
            retrievedAt: new Date().toISOString(),
            contentType,
            isOriginal: true,
            isRepost: false,
            isDuplicate: false,
            canonicalSourceUrl: tweetUrl,
            engagementNote: `${t.public_metrics?.retweet_count || 0} reposts, ${t.public_metrics?.like_count || 0} likes (Engagement does not prove accuracy)`
          }
        });
      }

      return {
        platform: 'x',
        items,
        status: {
          platform: 'x',
          name: this.name,
          status: 'live',
          itemCount: items.length,
          message: `Retrieved ${items.length} public posts via official X API v2.`
        },
        executionTimeMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        platform: 'x',
        items: [],
        status: {
          platform: 'x',
          name: this.name,
          status: 'error',
          itemCount: 0,
          message: `X API request failed: ${err.message}`
        },
        executionTimeMs: Date.now() - startTime
      };
    }
  }
}
