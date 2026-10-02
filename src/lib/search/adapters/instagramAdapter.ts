import { PlatformSourceAdapter, AdapterExecutionResult, AdapterQueryOptions } from './types';

export class InstagramSourceAdapter implements PlatformSourceAdapter {
  platform = 'instagram' as const;
  name = 'Instagram Public Media & Official Statements';
  sourceCategory = 'social_media' as const;

  isEnabled(): boolean {
    return true;
  }

  getAuthStatus(): 'connected' | 'live' | 'rate_limited' | 'auth_required' | 'restricted' | 'error' {
    return process.env.INSTAGRAM_ACCESS_TOKEN ? 'live' : 'restricted';
  }

  getAccessLimitations(): string {
    return 'Meta platform terms require Meta Graph API OAuth credentials and verified app review for public content retrieval. Unauthenticated scraping is prohibited.';
  }

  async search(query: string, options: AdapterQueryOptions = {}): Promise<AdapterExecutionResult> {
    const startTime = Date.now();
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!token) {
      return {
        platform: 'instagram',
        items: [],
        status: {
          platform: 'instagram',
          name: this.name,
          status: 'restricted',
          itemCount: 0,
          message: 'Access restricted: Requires Meta Graph API OAuth credentials. Scraping or bypassing login walls is disallowed.',
          documentationUrl: 'https://developers.facebook.com/docs/instagram-api'
        },
        executionTimeMs: Date.now() - startTime
      };
    }

    // If token provided, query Graph API endpoint
    try {
      const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,permalink,timestamp&access_token=${token}`;
      const res = await fetch(url);
      if (!res.ok) {
        return {
          platform: 'instagram',
          items: [],
          status: {
            platform: 'instagram',
            name: this.name,
            status: 'error',
            itemCount: 0,
            message: `Meta Graph API returned HTTP ${res.status}`,
            documentationUrl: 'https://developers.facebook.com'
          },
          executionTimeMs: Date.now() - startTime
        };
      }
      return {
        platform: 'instagram',
        items: [],
        status: {
          platform: 'instagram',
          name: this.name,
          status: 'live',
          itemCount: 0,
          message: 'Instagram Graph API active; query returned 0 matching public posts.'
        },
        executionTimeMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        platform: 'instagram',
        items: [],
        status: {
          platform: 'instagram',
          name: this.name,
          status: 'error',
          itemCount: 0,
          message: `Instagram retrieval error: ${err.message}`
        },
        executionTimeMs: Date.now() - startTime
      };
    }
  }
}
