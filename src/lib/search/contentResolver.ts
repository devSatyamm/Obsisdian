import { SearchResultItem } from './types';
import { safeFetchPublicContent } from '../ingestion/ssrfGuard';
import { extractArticleFromHtml } from '../ingestion/contentExtractor';

/**
 * Resolves full web content for the top discovered search results.
 * Respects timeouts (max 4s per article), SSRF security, and polite fetching.
 */
export async function resolveSearchResultsContent(
  results: SearchResultItem[],
  maxToFetch = 6
): Promise<SearchResultItem[]> {
  const resolved = [...results];
  const targets = resolved.slice(0, maxToFetch);

  const fetchPromises = targets.map(async (item) => {
    // Skip if not a standard http URL
    if (!item.url.startsWith('http')) return item;

    try {
      const res = await safeFetchPublicContent(item.url, {
        timeoutMs: 4000,
        maxBytes: 1.5 * 1024 * 1024
      });

      if (res.ok && res.data) {
        const article = extractArticleFromHtml(res.data, item.url);
        item.extractedBody = article.cleanText || item.snippet;
        if (article.author) item.author = article.author;
        if (article.headline && !item.title) item.title = article.headline;
        item.contentFetched = true;
      } else {
        // Fallback to snippet
        item.extractedBody = item.snippet;
        item.contentFetched = false;
      }
    } catch {
      item.extractedBody = item.snippet;
      item.contentFetched = false;
    }
    return item;
  });

  await Promise.allSettled(fetchPromises);
  return resolved;
}
