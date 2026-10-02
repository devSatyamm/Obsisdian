import crypto from 'crypto';
import { URL } from 'url';

export interface ExtractedArticle {
  url: string;
  canonicalUrl: string;
  headline: string;
  author?: string;
  publisher: string;
  publishedDate?: string;
  retrievedAt: string;
  cleanText: string;
  rawExcerpt: string;
  contentHash: string;
  wordCount: number;
}

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
}

/**
 * Extracts links from an XML sitemap (<urlset> or <sitemapindex>).
 */
export function parseSitemapXml(xmlContent: string): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  const urlRegex = /<url[\s\S]*?>([\s\S]*?)<\/url>/gi;
  let match: RegExpExecArray | null;

  while ((match = urlRegex.exec(xmlContent)) !== null) {
    const block = match[1];
    const locMatch = block.match(/<loc>([\s\S]*?)<\/loc>/i);
    const lastmodMatch = block.match(/<lastmod>([\s\S]*?)<\/lastmod>/i);

    if (locMatch) {
      const loc = locMatch[1].trim();
      if (loc.startsWith('http://') || loc.startsWith('https://')) {
        entries.push({
          loc,
          lastmod: lastmodMatch ? lastmodMatch[1].trim() : undefined
        });
      }
    }
  }

  // Also check for sitemap index
  if (entries.length === 0) {
    const sitemapRegex = /<sitemap[\s\S]*?>([\s\S]*?)<\/sitemap>/gi;
    while ((match = sitemapRegex.exec(xmlContent)) !== null) {
      const block = match[1];
      const locMatch = block.match(/<loc>([\s\S]*?)<\/loc>/i);
      const lastmodMatch = block.match(/<lastmod>([\s\S]*?)<\/lastmod>/i);

      if (locMatch) {
        entries.push({
          loc: locMatch[1].trim(),
          lastmod: lastmodMatch ? lastmodMatch[1].trim() : undefined
        });
      }
    }
  }

  return entries;
}

/**
 * Discovers potential article / notice URLs from an HTML listing page.
 */
export function discoverUrlsFromHtml(html: string, baseUrl: string): string[] {
  const discovered = new Set<string>();
  let baseOrigin = '';
  try {
    const parsed = new URL(baseUrl);
    baseOrigin = parsed.origin;
  } catch {
    return [];
  }

  // Find all <a href="...">
  const linkRegex = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;

  // Patterns that typically signify articles, press releases, circulars, or regulatory notices
  const relevancePatterns = [
    /\/(?:press|releases|news|circulars|orders|notices|advisories|statements|media|articles)\//i,
    /(?:pr_|order_|notice_|advisory_|\d{4}-\d{2})/i,
    /\.(?:html|htm|pdf)$/i
  ];

  while ((match = linkRegex.exec(html)) !== null) {
    let href = match[1].trim();
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) {
      continue;
    }

    try {
      // Resolve relative URLs
      const fullUrl = new URL(href, baseUrl).toString();
      const parsedFull = new URL(fullUrl);

      // Only crawl within the same domain/origin
      if (parsedFull.origin === baseOrigin) {
        // Strip query params and fragments to deduplicate URLs
        parsedFull.hash = '';
        const normalized = parsedFull.toString();

        const isRelevant = relevancePatterns.some((p) => p.test(normalized));
        if (isRelevant || discovered.size < 10) {
          discovered.add(normalized);
        }
      }
    } catch {
      // Skip invalid URLs
    }
  }

  return Array.from(discovered);
}

/**
 * Strips HTML tags, comments, script/style blocks, and decodes entities.
 */
function stripHtml(rawHtml: string): string {
  if (!rawHtml) return '';
  return rawHtml
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<(?:noscript|nav|header|footer|aside|form)\b[^<]*(?:(?!<\/(?:noscript|nav|header|footer|aside|form)>)<[^<]*)*<\/(?:noscript|nav|header|footer|aside|form)>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts structured metadata and readable clean text from an HTML document.
 */
export function extractArticleFromHtml(html: string, url: string, fallbackPublisher = 'Public Web'): ExtractedArticle {
  const retrievedAt = new Date().toISOString();

  // 1. Canonical URL
  const canonicalMatch =
    html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["'][^>]*>/i) ||
    html.match(/<meta\b[^>]*\bproperty=["']og:url["'][^>]*\bcontent=["']([^"']+)["'][^>]*>/i);
  let canonicalUrl = canonicalMatch ? canonicalMatch[1].trim() : url;
  try {
    canonicalUrl = new URL(canonicalUrl, url).toString();
  } catch {
    canonicalUrl = url;
  }

  // 2. Headline / Title
  let headline = '';
  const ogTitleMatch = html.match(/<meta\b[^>]*\b(?:property|name)=["'](?:og:title|twitter:title)["'][^>]*\bcontent=["']([^"']+)["'][^>]*>/i);
  if (ogTitleMatch) {
    headline = ogTitleMatch[1].trim();
  }
  if (!headline) {
    const h1Match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
      headline = stripHtml(h1Match[1]);
    }
  }
  if (!headline) {
    const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch) {
      headline = stripHtml(titleMatch[1]);
    }
  }
  headline = headline.replace(/\s+/g, ' ').trim();

  // 3. Author
  let author: string | undefined;
  const authorMatch =
    html.match(/<meta\b[^>]*\b(?:name|property)=["'](?:author|article:author|dc\.creator)["'][^>]*\bcontent=["']([^"']+)["'][^>]*>/i) ||
    html.match(/<[a-z]+\b[^>]*\b(?:class|rel)=["'][^"']*\b(?:author|byline|writer)\b[^"']*["'][^>]*>([\s\S]*?)<\/[a-z]+>/i);
  if (authorMatch) {
    const extracted = stripHtml(authorMatch[1]);
    if (extracted.length > 2 && extracted.length < 80) {
      author = extracted;
    }
  }

  // 4. Publisher / Source Name
  let publisher = fallbackPublisher;
  const siteNameMatch = html.match(/<meta\b[^>]*\bproperty=["']og:site_name["'][^>]*\bcontent=["']([^"']+)["'][^>]*>/i);
  if (siteNameMatch && siteNameMatch[1]) {
    publisher = siteNameMatch[1].trim();
  } else {
    try {
      publisher = new URL(url).hostname.replace(/^www\./i, '');
    } catch {
      publisher = fallbackPublisher;
    }
  }

  // 5. Published Date
  let publishedDate: string | undefined;
  const dateMatch =
    html.match(/<meta\b[^>]*\b(?:property|name)=["'](?:article:published_time|pubdate|date|dc\.date)["'][^>]*\bcontent=["']([^"']+)["'][^>]*>/i) ||
    html.match(/<time\b[^>]*\bdatetime=["']([^"']+)["'][^>]*>/i);
  if (dateMatch) {
    try {
      publishedDate = new Date(dateMatch[1].trim()).toISOString();
    } catch {
      // Keep undefined if unparseable
    }
  }

  // 6. Clean Text Extraction (focusing on article body or paragraphs)
  let mainHtml = html;
  const articleTagMatch = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
  if (articleTagMatch) {
    mainHtml = articleTagMatch[1];
  } else {
    const mainTagMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
    if (mainTagMatch) {
      mainHtml = mainTagMatch[1];
    }
  }

  const cleanText = stripHtml(mainHtml);
  const rawExcerpt = cleanText.substring(0, 500);

  // 7. Content Fingerprint (SHA-256)
  const normalizedForHash = `${headline.toLowerCase()}|${cleanText.substring(0, 1500).toLowerCase()}`;
  const contentHash = crypto.createHash('sha256').update(normalizedForHash).digest('hex');

  const wordCount = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;

  return {
    url,
    canonicalUrl,
    headline: headline || 'Untitled Web Document',
    author,
    publisher,
    publishedDate,
    retrievedAt,
    cleanText,
    rawExcerpt,
    contentHash,
    wordCount
  };
}
