import crypto from 'crypto';
import { IngestedFeedItem } from './types';

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTagContent(xml: string, tagName: string): string {
  const cdataRegex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tagName}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  const standardRegex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const standardMatch = xml.match(standardRegex);
  if (standardMatch) return standardMatch[1].trim();

  return '';
}

function extractAttribute(tagStr: string, attrName: string): string {
  const match = tagStr.match(new RegExp(`${attrName}=["']([^"']+)["']`, 'i'));
  return match ? match[1] : '';
}

/**
 * Parses RSS 2.0 or Atom XML content into structured IngestedFeedItems.
 */
export function parseFeedContent(
  xmlContent: string,
  sourceId: string,
  sourceName: string
): IngestedFeedItem[] {
  const items: IngestedFeedItem[] = [];

  // Check if Atom (<entry>) or RSS (<item>)
  const isAtom = xmlContent.includes('<entry');
  const itemTag = isAtom ? 'entry' : 'item';
  const itemRegex = new RegExp(`<${itemTag}[^>]*>([\\s\\S]*?)<\\/${itemTag}>`, 'gi');

  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xmlContent)) !== null) {
    const itemXml = match[1];

    const titleRaw = extractTagContent(itemXml, 'title');
    const title = stripHtml(titleRaw);

    // Link handling (RSS <link> or Atom <link href="..."/>)
    let url = extractTagContent(itemXml, 'link');
    if (!url) {
      const linkTagMatch = itemXml.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);
      if (linkTagMatch) url = linkTagMatch[1];
    }
    url = url.trim();

    // Publisher / source
    let publisher = extractTagContent(itemXml, 'source') || extractTagContent(itemXml, 'dc:creator') || sourceName;
    publisher = stripHtml(publisher) || sourceName;

    // Publication date
    const pubDateRaw =
      extractTagContent(itemXml, 'pubDate') ||
      extractTagContent(itemXml, 'published') ||
      extractTagContent(itemXml, 'updated') ||
      extractTagContent(itemXml, 'dc:date');
    let publicationDate = '';
    try {
      publicationDate = pubDateRaw ? new Date(pubDateRaw).toISOString() : new Date().toISOString();
    } catch {
      publicationDate = new Date().toISOString();
    }

    // Description / Content
    const descriptionRaw =
      extractTagContent(itemXml, 'description') ||
      extractTagContent(itemXml, 'content') ||
      extractTagContent(itemXml, 'content:encoded') ||
      extractTagContent(itemXml, 'summary');
    const cleanText = stripHtml(descriptionRaw);

    // Compute unique content hash for change and duplicate tracking
    const contentToHash = `${title.toLowerCase()}|${cleanText.toLowerCase()}`;
    const contentHash = crypto.createHash('sha256').update(contentToHash).digest('hex');

    if (title && url) {
      items.push({
        id: `feed_${contentHash.substring(0, 16)}`,
        sourceId,
        sourceName,
        url,
        canonicalUrl: url,
        title,
        publisher,
        publicationDate,
        rawExcerpt: descriptionRaw.substring(0, 500),
        cleanText,
        contentHash
      });
    }
  }

  return items;
}
