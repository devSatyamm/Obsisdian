import { PlatformSourceAdapter, AdapterExecutionResult, AdapterQueryOptions, cleanText } from './types';
import { SearchResultItem, SocialContentType } from '../types';

function classifyYouTubeContentType(title: string, desc: string, channel: string): SocialContentType {
  const combined = `${title} ${desc} ${channel}`.toLowerCase();
  if (/\b(?:press briefing|press conference|official address|ministry|white house|pib|statement|full speech)\b/.test(combined)) {
    return 'official_statement';
  }
  if (/\b(?:caught on camera|raw footage|cellphone footage|eyewitness|on the ground|witnesses record)\b/.test(combined)) {
    return 'firsthand_eyewitness';
  }
  if (/\b(?:debunk|fact check|investigation|timeline analysis|forensic)\b/.test(combined)) {
    return 'corroborated_evidence';
  }
  if (/\b(?:parody|satire|meme|funny)\b/.test(combined)) {
    return 'satire';
  }
  return 'user_speculation';
}

export class YouTubeSourceAdapter implements PlatformSourceAdapter {
  platform = 'youtube' as const;
  name = 'YouTube Video Metadata & Official Broadcasts';
  sourceCategory = 'social_media' as const;

  isEnabled(): boolean {
    return true;
  }

  getAuthStatus(): 'connected' | 'live' | 'rate_limited' | 'auth_required' | 'restricted' | 'error' {
    return 'live';
  }

  getAccessLimitations(): string {
    return 'Public video metadata and descriptions. Official YouTube Data API v3 utilized when key is configured, with public video indexing fallback.';
  }

  async search(query: string, options: AdapterQueryOptions = {}): Promise<AdapterExecutionResult> {
    const startTime = Date.now();
    const limit = Math.min(options.limit || 6, 10);
    const items: SearchResultItem[] = [];

    // 1. Try official YouTube Data API v3 if key exists
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (apiKey) {
      try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${limit}&key=${apiKey}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          for (const item of (data.items || [])) {
            const vid = item.id?.videoId;
            const snippet = item.snippet;
            if (!vid || !snippet) continue;

            const title = cleanText(snippet.title);
            const desc = cleanText(snippet.description);
            const channel = cleanText(snippet.channelTitle);
            const publishedAt = snippet.publishedAt || new Date().toISOString();
            const videoUrl = `https://www.youtube.com/watch?v=${vid}`;
            const contentType = classifyYouTubeContentType(title, desc, channel);

            items.push({
              id: `yt_${vid}_${Date.now()}`,
              title,
              url: videoUrl,
              snippet: desc ? desc.substring(0, 260) : `Public video published by ${channel}`,
              publisher: `YouTube (${channel})`,
              publisherDomain: 'youtube.com',
              publishedAt,
              sourceProvider: 'youtube',
              platform: 'youtube',
              sourceCategory: 'social_media',
              contentType,
              author: channel,
              provenance: {
                platform: 'youtube',
                originalUrl: videoUrl,
                author: channel,
                publishedAt,
                retrievedAt: new Date().toISOString(),
                contentType,
                isOriginal: true,
                isRepost: false,
                isDuplicate: false,
                canonicalSourceUrl: videoUrl,
                engagementNote: `Published on official channel: ${channel}`
              }
            });
          }

          return {
            platform: 'youtube',
            items,
            status: {
              platform: 'youtube',
              name: this.name,
              status: 'live',
              itemCount: items.length,
              message: `Retrieved ${items.length} public video records via YouTube Data API.`
            },
            executionTimeMs: Date.now() - startTime
          };
        }
      } catch (err) {
        console.warn('YouTube API query failed, falling back to public search index');
      }
    }

    // 2. Fallback: Search YouTube public video indexing via DuckDuckGo site filter
    try {
      const siteQuery = `site:youtube.com/watch ${query}`;
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(siteQuery)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html'
        },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        const html = await res.text();
        const blocks = [...html.matchAll(/<div class="result results_links results_links_deep[^"]*"[\s\S]*?<\/div>\s*<\/div>/g)];

        for (let i = 0; i < Math.min(blocks.length, limit); i++) {
          const block = blocks[i][0];
          const titleMatch = block.match(/class="result__a"[^>]*>([\s\S]*?)<\/a>/);
          const urlMatch = block.match(/class="result__url"[^>]*href="([^"]+)"/);
          const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);

          let rawUrl = urlMatch ? urlMatch[1] : '';
          if (rawUrl.includes('uddg=')) {
            try {
              const match = rawUrl.match(/uddg=([^&]+)/);
              if (match) rawUrl = decodeURIComponent(match[1]);
            } catch {}
          }

          if (!rawUrl.includes('youtube.com/watch') && !rawUrl.includes('youtu.be/')) continue;

          let title = cleanText(titleMatch ? titleMatch[1] : '');
          title = title.replace(/\s*-\s*YouTube$/i, '').trim();
          const snippet = cleanText(snippetMatch ? snippetMatch[1] : '');
          const channel = 'YouTube Channel';
          const contentType = classifyYouTubeContentType(title, snippet, channel);

          items.push({
            id: `yt_pub_${i}_${Date.now()}`,
            title,
            url: rawUrl,
            snippet: snippet || title,
            publisher: 'YouTube',
            publisherDomain: 'youtube.com',
            publishedAt: new Date().toISOString(),
            sourceProvider: 'youtube',
            platform: 'youtube',
            sourceCategory: 'social_media',
            contentType,
            author: channel,
            provenance: {
              platform: 'youtube',
              originalUrl: rawUrl,
              author: channel,
              retrievedAt: new Date().toISOString(),
              contentType,
              isOriginal: true,
              isRepost: false,
              isDuplicate: false,
              canonicalSourceUrl: rawUrl,
              engagementNote: 'Public video indexing'
            }
          });
        }
      }

      return {
        platform: 'youtube',
        items,
        status: {
          platform: 'youtube',
          name: this.name,
          status: 'live',
          itemCount: items.length,
          message: items.length > 0 ? `Retrieved ${items.length} public video records.` : 'No relevant public video content discovered for this specific query.'
        },
        executionTimeMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        platform: 'youtube',
        items: [],
        status: {
          platform: 'youtube',
          name: this.name,
          status: 'error',
          itemCount: 0,
          message: `YouTube metadata retrieval timed out or failed: ${err.message}`
        },
        executionTimeMs: Date.now() - startTime
      };
    }
  }
}
