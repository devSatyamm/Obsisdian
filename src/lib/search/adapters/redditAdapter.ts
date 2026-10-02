import { PlatformSourceAdapter, AdapterExecutionResult, AdapterQueryOptions, cleanText } from './types';
import { SearchResultItem, SocialContentType } from '../types';

function classifyRedditContentType(title: string, body: string): SocialContentType {
  const combined = `${title} ${body}`.toLowerCase();
  if (/\b(?:i was there|i saw|in person|eyewitness|recorded this|my own eyes|happened right in front)\b/.test(combined)) {
    return 'firsthand_eyewitness';
  }
  if (/\b(?:satire|parody|joke|meme|shitpost|humor)\b/.test(combined)) {
    return 'satire';
  }
  if (/\b(?:allegedly|rumor|unconfirmed|hearsay|someone claimed|claims without proof)\b/.test(combined)) {
    return 'unverified_allegation';
  }
  if (/\b(?:official statement|press release|authorities announced|police confirmed)\b/.test(combined)) {
    return 'official_statement';
  }
  return 'user_speculation';
}

export class RedditSourceAdapter implements PlatformSourceAdapter {
  platform = 'reddit' as const;
  name = 'Reddit Public Communities & Discussions';
  sourceCategory = 'social_media' as const;

  isEnabled(): boolean {
    return true;
  }

  getAuthStatus(): 'connected' | 'live' | 'rate_limited' | 'auth_required' | 'restricted' | 'error' {
    return 'live';
  }

  getAccessLimitations(): string {
    return 'Public subreddit search via rate-limited JSON API. Restricted to publicly accessible community submissions.';
  }

  async search(query: string, options: AdapterQueryOptions = {}): Promise<AdapterExecutionResult> {
    const startTime = Date.now();
    const limit = Math.min(options.limit || 8, 15);
    const items: SearchResultItem[] = [];

    try {
      const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&limit=${limit}&type=link`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (VerityIntelligence/2.0)',
          Accept: 'application/json'
        },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.status === 429) {
        return {
          platform: 'reddit',
          items: [],
          status: {
            platform: 'reddit',
            name: this.name,
            status: 'rate_limited',
            itemCount: 0,
            message: 'Reddit public search rate limit reached. Backing off gracefully.',
            documentationUrl: 'https://www.reddit.com/dev/api'
          },
          executionTimeMs: Date.now() - startTime
        };
      }

      if (res.status === 403 || res.status === 401) {
        return {
          platform: 'reddit',
          items: [],
          status: {
            platform: 'reddit',
            name: this.name,
            status: 'auth_required',
            itemCount: 0,
            message: 'Reddit Data API requires official OAuth Client credentials (REDDIT_CLIENT_ID & REDDIT_CLIENT_SECRET). Anonymous requests restricted per platform policy.',
            documentationUrl: 'https://www.reddit.com/dev/api'
          },
          executionTimeMs: Date.now() - startTime
        };
      }

      if (!res.ok) {
        return {
          platform: 'reddit',
          items: [],
          status: {
            platform: 'reddit',
            name: this.name,
            status: 'error',
            itemCount: 0,
            message: `Reddit search returned HTTP ${res.status}`,
            documentationUrl: 'https://www.reddit.com/dev/api'
          },
          executionTimeMs: Date.now() - startTime
        };
      }

      const json = await res.json();
      const posts = json?.data?.children || [];

      for (let i = 0; i < posts.length; i++) {
        const post = posts[i].data;
        if (!post || post.over_18) continue;

        const title = cleanText(post.title || '');
        const selftext = cleanText(post.selftext || '');
        const subreddit = post.subreddit_name_prefixed || `r/${post.subreddit}`;
        const author = post.author ? `u/${post.author}` : 'Reddit Community User';
        const permalink = post.permalink ? `https://www.reddit.com${post.permalink}` : post.url;
        const upvotes = post.score || 0;
        const comments = post.num_comments || 0;
        const publishedAt = post.created_utc ? new Date(post.created_utc * 1000).toISOString() : new Date().toISOString();

        const contentType = classifyRedditContentType(title, selftext);

        items.push({
          id: `reddit_${post.id || i}_${Date.now()}`,
          title,
          url: permalink,
          snippet: selftext ? selftext.substring(0, 280) : `Public community discussion in ${subreddit} with ${upvotes} upvotes and ${comments} comments.`,
          publisher: `Reddit (${subreddit})`,
          publisherDomain: 'reddit.com',
          publishedAt,
          sourceProvider: 'reddit',
          platform: 'reddit',
          sourceCategory: 'social_media',
          contentType,
          author,
          provenance: {
            platform: 'reddit',
            originalUrl: permalink,
            author,
            publishedAt,
            retrievedAt: new Date().toISOString(),
            contentType,
            isOriginal: true,
            isRepost: false,
            isDuplicate: false,
            canonicalSourceUrl: permalink,
            engagementNote: `${upvotes} community score, ${comments} comments. Note: Platform engagement counts do not indicate factual accuracy.`
          }
        });
      }

      return {
        platform: 'reddit',
        items,
        status: {
          platform: 'reddit',
          name: this.name,
          status: 'live',
          itemCount: items.length,
          message: `Retrieved ${items.length} community discussions from Reddit public communities.`
        },
        executionTimeMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        platform: 'reddit',
        items: [],
        status: {
          platform: 'reddit',
          name: this.name,
          status: 'error',
          itemCount: 0,
          message: `Reddit retrieval error: ${err.message || 'Timeout'}`
        },
        executionTimeMs: Date.now() - startTime
      };
    }
  }
}
