/**
 * VERITY Content Sanitizer & HTML Normalizer
 * 
 * Provides robust, safe content normalization for external titles, descriptions,
 * excerpts, and timelines. Eliminates raw HTML tags, decodes HTML entities, removes
 * Google News RSS artifacts, and deduplicates timeline milestones without data loss.
 */

import { TimelineEvent } from '../search/types';

const HTML_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&#160;': ' ',
  '&amp;': '&',
  '&#38;': '&',
  '&lt;': '<',
  '&#60;': '<',
  '&gt;': '>',
  '&#62;': '>',
  '&quot;': '"',
  '&#34;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&#x27;': "'",
  '&mdash;': '—',
  '&#8212;': '—',
  '&ndash;': '–',
  '&#8211;': '–',
  '&hellip;': '…',
  '&#8230;': '…',
  '&lsquo;': '‘',
  '&#8216;': '‘',
  '&rsquo;': '’',
  '&#8217;': '’',
  '&ldquo;': '“',
  '&#8220;': '“',
  '&rdquo;': '”',
  '&#8221;': '”',
  '&laquo;': '«',
  '&raquo;': '»',
  '&bull;': '•',
  '&#8226;': '•',
  '&trade;': '™',
  '&#8482;': '™',
  '&copy;': '©',
  '&#169;': '©',
  '&reg;': '®',
  '&#174;': '®',
  '&deg;': '°',
  '&#176;': '°',
  '&plusmn;': '±',
  '&#177;': '±',
  '&times;': '×',
  '&#215;': '×',
  '&divide;': '÷',
  '&#247;': '÷',
  '&cent;': '¢',
  '&#162;': '¢',
  '&pound;': '£',
  '&#163;': '£',
  '&euro;': '€',
  '&#8364;': '€',
  '&yen;': '¥',
  '&#165;': '¥',
  '&sect;': '§',
  '&#167;': '§',
  '&para;': '¶',
  '&#182;': '¶',
  '&micro;': 'µ',
  '&#181;': 'µ',
  '&middot;': '·',
  '&#183;': '·'
};

/**
 * Safely decodes named and numeric (decimal/hex) HTML entities.
 */
export function decodeHtmlEntities(input: string): string {
  if (!input) return '';

  let text = input;

  // 1. Decode numeric decimal entities: &#123;
  text = text.replace(/&#(\d+);/g, (match, dec) => {
    try {
      const code = parseInt(dec, 10);
      if (code > 0 && code < 0x10ffff) {
        return String.fromCodePoint(code);
      }
    } catch {
      // ignore invalid code point
    }
    return match;
  });

  // 2. Decode numeric hex entities: &#x1f; or &#X1F;
  text = text.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
    try {
      const code = parseInt(hex, 16);
      if (code > 0 && code < 0x10ffff) {
        return String.fromCodePoint(code);
      }
    } catch {
      // ignore invalid code point
    }
    return match;
  });

  // 3. Decode known named entities
  for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
    if (text.includes(entity)) {
      text = text.replaceAll(entity, char);
    }
  }

  return text;
}

/**
 * Strips HTML tags, CDATA, comments, scripts, styles, and tag fragments.
 */
export function stripHtmlTags(input: string): string {
  if (!input) return '';

  return input
    // CDATA wrappers
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
    // Comments
    .replace(/<!--[\s\S]*?-->/g, ' ')
    // Script & Style blocks
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    // Common container blocks in scraped web content
    .replace(/<(?:noscript|nav|header|footer|aside|form)\b[^<]*(?:(?!<\/(?:noscript|nav|header|footer|aside|form)>)<[^<]*)*<\/(?:noscript|nav|header|footer|aside|form)>/gi, ' ')
    // All HTML/XML tags (opening, closing, self-closing)
    .replace(/<[^>]+>/g, ' ');
}

/**
 * Primary text sanitizer for external headlines, snippets, and content.
 * Runs iterative passes to resolve nested, escaped, and entity-encoded tags.
 */
export function cleanText(input: string | null | undefined): string {
  if (input === null || input === undefined) return '';
  if (typeof input !== 'string') return String(input);

  let text = input;

  // Perform iterative passes to handle nested/double-encoded HTML
  // (e.g., &lt;font color=&quot;#6f6f6f&quot;&gt;NDTV&lt;/font&gt;)
  for (let pass = 0; pass < 3; pass++) {
    const prev = text;
    text = stripHtmlTags(text);
    text = decodeHtmlEntities(text);
    text = stripHtmlTags(text);
    if (text === prev) break;
  }

  // Normalize Unicode non-breaking spaces and whitespace
  text = text
    .replace(/[\u00A0\u1680\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')
    .replace(/\s+/g, ' ')
    // Fix space preceding standard punctuation (e.g., "word ." -> "word.")
    .replace(/\s+([.,!?:;])/g, '$1')
    .trim();

  return text;
}

/**
 * Specifically cleans and formats article snippets and descriptions.
 * Removes redundant repeating headlines and Google News RSS publisher suffix tags.
 */
export function cleanSnippet(snippet: string | null | undefined, title?: string, publisher?: string): string {
  let cleaned = cleanText(snippet);
  if (!cleaned) return '';

  const cleanPub = cleanText(publisher);
  const cleanTitle = cleanText(title);

  // If the snippet starts with or is an exact match for the title, trim it
  if (cleanTitle && cleaned.startsWith(cleanTitle)) {
    cleaned = cleaned.substring(cleanTitle.length).trim();
  }

  // Strip trailing publisher name if it duplicated at the end (e.g. "... NDTV")
  if (cleanPub && cleanPub.length > 2) {
    const pubRegex = new RegExp(`[\\s|•·–—:-]*\\b${escapeRegExp(cleanPub)}\\s*[.]?$`, 'i');
    cleaned = cleaned.replace(pubRegex, '').trim();
  }

  // If nothing left after removing redundant title/publisher, fall back to clean title
  if (!cleaned && cleanTitle) {
    return cleanTitle;
  }

  // Strip leading punctuation left behind (e.g., "- ", ". ", ": ")
  cleaned = cleaned.replace(/^[\\s|•·–—:;,.-]+/, '').trim();

  return cleaned;
}

/**
 * Cleans headlines by stripping trailing publisher suffixes (e.g., "Headline - NDTV").
 */
export function cleanHeadline(title: string | null | undefined, publisher?: string): string {
  let cleaned = cleanText(title);
  if (!cleaned) return '';

  // 1. Remove standard trailing " - Publisher" or " | Publisher"
  const dashSeparators = [' - ', ' | ', ' – ', ' — ', ' : '];
  for (const sep of dashSeparators) {
    const lastIdx = cleaned.lastIndexOf(sep);
    if (lastIdx > 12) {
      const suffix = cleaned.substring(lastIdx + sep.length).trim();
      // If suffix is short (likely a publisher name like "NDTV", "Reuters", "BBC News")
      if (suffix.length <= 40 && !suffix.includes('.')) {
        cleaned = cleaned.substring(0, lastIdx).trim();
        break;
      }
    }
  }

  // 2. Remove explicit publisher match at the end if provided
  if (publisher) {
    const cleanPub = cleanText(publisher);
    if (cleanPub.length > 2) {
      const pubRegex = new RegExp(`[\\s|•·–—:-]+${escapeRegExp(cleanPub)}\\s*$`, 'i');
      cleaned = cleaned.replace(pubRegex, '').trim();
    }
  }

  return cleaned;
}

/**
 * Cleans timeline event text specifically, removing raw markup, fragmented tags,
 * and trailing publisher attribution duplicates.
 */
export function cleanTimelineEventText(text: string | null | undefined, publisher?: string): string {
  let cleaned = cleanText(text);
  if (!cleaned) return '';

  // Remove trailing publisher attribution duplicate (e.g. "NDTV" or " - NDTV")
  if (publisher) {
    const cleanPub = cleanText(publisher);
    if (cleanPub.length > 2) {
      const pubRegex = new RegExp(`[\\s|•·–—:-]*\\b${escapeRegExp(cleanPub)}\\s*[.]?$`, 'i');
      cleaned = cleaned.replace(pubRegex, '').trim();
    }
  }

  // Strip leading punctuation but preserve terminal sentence punctuation (periods)
  cleaned = cleaned.replace(/^[\\s|•·–—:;,.-]+/, '').replace(/[\\s|•·–—:;,-]+$/, '').trim();

  // Ensure reasonable sentence capitalization
  if (cleaned.length > 0 && /^[a-z]/.test(cleaned)) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned;
}

/**
 * Tokenizes text into normalized word stems for similarity matching.
 */
function tokenizeForSimilarity(text: string): Set<string> {
  return new Set(
    cleanText(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
  );
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'were',
  'been', 'will', 'about', 'after', 'over', 'into', 'some', 'more'
]);

/**
 * Computes Jaccard word-token similarity between two text snippets.
 */
export function computeTokenSimilarity(a: string, b: string): number {
  const setA = tokenizeForSimilarity(a);
  const setB = tokenizeForSimilarity(b);

  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }

  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? intersection / union : 0;
}

/**
 * Deduplicates and sanitizes timeline milestones.
 * Identifies duplicate/near-identical events based on token similarity and substring containment.
 * Formats dates and source attributions cleanly.
 */
export function deduplicateTimelineEvents(rawEvents: TimelineEvent[]): TimelineEvent[] {
  if (!rawEvents || rawEvents.length === 0) return [];

  const cleanedEvents: TimelineEvent[] = [];

  for (const ev of rawEvents) {
    const cleanEvent = cleanTimelineEventText(ev.event, ev.source);
    const cleanSource = cleanText(ev.source) || 'Verified Source';
    const cleanDate = cleanText(ev.date) || 'Recent';

    // Discard empty or trivial fragments (e.g. single words, lone dates, or short publisher names)
    if (cleanEvent.length < 15 || cleanEvent.toLowerCase() === cleanSource.toLowerCase()) {
      continue;
    }

    // Check if this event represents a duplicate of an already accepted milestone
    let isDuplicate = false;
    for (let i = 0; i < cleanedEvents.length; i++) {
      const existing = cleanedEvents[i];
      const similarity = computeTokenSimilarity(cleanEvent, existing.event);

      // Substring check: one event contains the other almost entirely
      const cleanLower = cleanEvent.toLowerCase();
      const existingLower = existing.event.toLowerCase();
      const isSubstring =
        (cleanLower.length > 25 && existingLower.includes(cleanLower)) ||
        (existingLower.length > 25 && cleanLower.includes(existingLower));

      if (similarity >= 0.65 || isSubstring) {
        isDuplicate = true;
        // If the new event has more detail or better date, enhance the existing one
        if (cleanEvent.length > existing.event.length && !existing.event.endsWith('.')) {
          existing.event = cleanEvent;
        }
        if (existing.date === 'Recent' && cleanDate !== 'Recent') {
          existing.date = cleanDate;
        }
        break;
      }
    }

    if (!isDuplicate) {
      cleanedEvents.push({
        id: `evt_${cleanedEvents.length + 1}`,
        date: cleanDate,
        time: ev.time ? cleanText(ev.time) : undefined,
        event: cleanEvent,
        source: cleanSource,
        sourceUrl: ev.sourceUrl || ''
      });
    }

    if (cleanedEvents.length >= 8) break;
  }

  return cleanedEvents;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
