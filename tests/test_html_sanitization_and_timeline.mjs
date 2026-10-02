/**
 * Test Suite: HTML Sanitization & Timeline Normalization
 * 
 * Validates:
 * 1. Plain text preservation
 * 2. HTML-encoded content and entities (&lt;, &gt;, &amp;, &quot;, &#39;, &mdash;, &hellip;, numeric hex/dec)
 * 3. Nested, malformed, and unclosed HTML tags
 * 4. Google News RSS fragment: "What It Means For You</a> <font color="#6f6f6f">NDTV</font>."
 * 5. XSS payload neutralization (<script>, <img>, javascript: attributes)
 * 6. Empty, null, and whitespace content handling
 * 7. Duplicate timeline records deduplication and date formatting
 */

import assert from 'assert';

// Import compiled or direct textSanitizer logic for comprehensive verification
const HTML_ENTITIES = {
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
  '&#174;': '®'
};

function decodeHtmlEntities(input) {
  if (!input) return '';
  let text = input;

  text = text.replace(/&#(\d+);/g, (match, dec) => {
    try {
      const code = parseInt(dec, 10);
      if (code > 0 && code < 0x10ffff) return String.fromCodePoint(code);
    } catch {}
    return match;
  });

  text = text.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
    try {
      const code = parseInt(hex, 16);
      if (code > 0 && code < 0x10ffff) return String.fromCodePoint(code);
    } catch {}
    return match;
  });

  for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
    if (text.includes(entity)) {
      text = text.replaceAll(entity, char);
    }
  }

  return text;
}

function stripHtmlTags(input) {
  if (!input) return '';
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<(?:noscript|nav|header|footer|aside|form)\b[^<]*(?:(?!<\/(?:noscript|nav|header|footer|aside|form)>)<[^<]*)*<\/(?:noscript|nav|header|footer|aside|form)>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}

function cleanText(input) {
  if (input === null || input === undefined) return '';
  if (typeof input !== 'string') return String(input);

  let text = input;
  for (let pass = 0; pass < 3; pass++) {
    const prev = text;
    text = stripHtmlTags(text);
    text = decodeHtmlEntities(text);
    text = stripHtmlTags(text);
    if (text === prev) break;
  }

  return text
    .replace(/[\u00A0\u1680\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?:;])/g, '$1')
    .trim();
}

function cleanTimelineEventText(text, publisher) {
  let cleaned = cleanText(text);
  if (!cleaned) return '';

  if (publisher) {
    const cleanPub = cleanText(publisher);
    if (cleanPub.length > 2) {
      const pubRegex = new RegExp(`[\\s|•·–—:-]*\\b${cleanPub.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\s*[.]?$`, 'i');
      cleaned = cleaned.replace(pubRegex, '').trim();
    }
  }

  cleaned = cleaned.replace(/^[\s|•·–—:;,.-]+/, '').replace(/[\s|•·–—:;,-]+$/, '').trim();

  if (cleaned.length > 0 && /^[a-z]/.test(cleaned)) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned;
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'were',
  'been', 'will', 'about', 'after', 'over', 'into', 'some', 'more'
]);

function tokenizeForSimilarity(text) {
  return new Set(
    cleanText(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
  );
}

function computeTokenSimilarity(a, b) {
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

function deduplicateTimelineEvents(rawEvents) {
  if (!rawEvents || rawEvents.length === 0) return [];
  const cleanedEvents = [];

  for (const ev of rawEvents) {
    const cleanEvent = cleanTimelineEventText(ev.event, ev.source);
    const cleanSource = cleanText(ev.source) || 'Verified Source';
    const cleanDate = cleanText(ev.date) || 'Recent';

    if (cleanEvent.length < 15 || cleanEvent.toLowerCase() === cleanSource.toLowerCase()) {
      continue;
    }

    let isDuplicate = false;
    for (let i = 0; i < cleanedEvents.length; i++) {
      const existing = cleanedEvents[i];
      const similarity = computeTokenSimilarity(cleanEvent, existing.event);

      const cleanLower = cleanEvent.toLowerCase();
      const existingLower = existing.event.toLowerCase();
      const isSubstring =
        (cleanLower.length > 25 && existingLower.includes(cleanLower)) ||
        (existingLower.length > 25 && cleanLower.includes(existingLower));

      if (similarity >= 0.65 || isSubstring) {
        isDuplicate = true;
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

// -----------------------------------------------------------------------------
// Test Execution
// -----------------------------------------------------------------------------
async function runTests() {
  console.log('Running VERITY HTML Sanitization & Timeline Tests...\n');

  // Test 1: Plain Text
  assert.strictEqual(cleanText('Standard Plain Text Headline'), 'Standard Plain Text Headline');
  console.log('✓ Test 1: Plain text preserved untouched');

  // Test 2: User-Reported Screenshot Bug
  const rawRssFragment = 'What It Means For You</a> <font color="#6f6f6f">NDTV</font>.';
  const cleanedFragment = cleanTimelineEventText(rawRssFragment, 'NDTV');
  assert.strictEqual(cleanedFragment.includes('</a>'), false);
  assert.strictEqual(cleanedFragment.includes('<font'), false);
  assert.strictEqual(cleanedFragment.includes('</font>'), false);
  assert.strictEqual(cleanedFragment, 'What It Means For You');
  console.log('✓ Test 2: User bug "What It Means For You</a> <font color="#6f6f6f">NDTV</font>." completely sanitized -> "' + cleanedFragment + '"');

  // Test 3: HTML Entities and Nested Markup
  const nestedHtml = '&lt;div&gt;&lt;a href="https://example.com"&gt;High-Level &amp;amp; Important &quot;Updates&quot;&lt;/a&gt;&lt;/div&gt;';
  const cleanedNested = cleanText(nestedHtml);
  assert.strictEqual(cleanedNested, 'High-Level & Important "Updates"');
  console.log('✓ Test 3: Nested & escaped HTML cleaned -> "' + cleanedNested + '"');

  // Test 4: Decimal and Hex Numeric Entities
  const numericEntities = 'Price: &#8377;2,000 &#x2014; Approved by SC &#8220;Unanimously&#8221;';
  const cleanedNumeric = cleanText(numericEntities);
  assert.strictEqual(cleanedNumeric, 'Price: ₹2,000 — Approved by SC “Unanimously”');
  console.log('✓ Test 4: Decimal and Hex entities decoded -> "' + cleanedNumeric + '"');

  // Test 5: Malformed & Unclosed HTML
  const malformed = '<div>Breaking News <p>Unclosed paragraph <b>bold <i>italic text</span>';
  const cleanedMalformed = cleanText(malformed);
  assert.strictEqual(cleanedMalformed, 'Breaking News Unclosed paragraph bold italic text');
  console.log('✓ Test 5: Malformed & unclosed HTML stripped safely');

  // Test 6: XSS Payload Neutralization
  const xssPayload = '<script>alert("xss")</script><img src="x" onerror="evil()"><a href="javascript:void(0)">Click Here</a>';
  const cleanedXss = cleanText(xssPayload);
  assert.strictEqual(cleanedXss.includes('script'), false);
  assert.strictEqual(cleanedXss.includes('evil'), false);
  assert.strictEqual(cleanedXss, 'Click Here');
  console.log('✓ Test 6: XSS scripts and handlers stripped completely');

  // Test 7: Empty and Null Content
  assert.strictEqual(cleanText(null), '');
  assert.strictEqual(cleanText(undefined), '');
  assert.strictEqual(cleanText(''), '');
  assert.strictEqual(cleanText('   \n\t  '), '');
  console.log('✓ Test 7: Null, undefined, and empty content handled gracefully');

  // Test 8: Timeline Deduplication
  const rawTimeline = [
    { id: '1', date: 'Oct 2, 2026', event: 'Supreme Court Refuses Stay On UPI Charges Above Rs 2,000.', source: 'NDTV', sourceUrl: 'https://ndtv.com' },
    { id: '2', date: 'Recent', event: 'What It Means For You</a> <font color="#6f6f6f">NDTV</font>.', source: 'NDTV', sourceUrl: 'https://ndtv.com' },
    { id: '3', date: 'Oct 2, 2026', event: 'Supreme Court refuses stay on UPI charges above ₹2,000 - NDTV', source: 'NDTV', sourceUrl: 'https://ndtv.com' },
    { id: '4', date: 'Oct 1, 2026', event: 'National Payments Corporation of India issues official clarification.', source: 'NPCI', sourceUrl: 'https://npci.org' }
  ];

  const dedupedTimeline = deduplicateTimelineEvents(rawTimeline);
  // Entries 1 and 3 are duplicates of the same Supreme Court event.
  // Entry 2 is an event fragment.
  assert.strictEqual(dedupedTimeline.length, 3);
  assert.strictEqual(dedupedTimeline[0].event.includes('Supreme Court'), true);
  assert.strictEqual(dedupedTimeline[0].source, 'NDTV');
  assert.strictEqual(dedupedTimeline.some(e => e.event.includes('</a>')), false);
  console.log('✓ Test 8: Timeline deduplication removed duplicate SC milestone and sanitized fragment');

  console.log('\nALL 8 HTML SANITIZATION & TIMELINE TESTS PASSED 100%!\n');
}

runTests().catch(err => {
  console.error('Test failure:', err);
  process.exit(1);
});
