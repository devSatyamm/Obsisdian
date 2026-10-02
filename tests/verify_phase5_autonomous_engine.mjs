// Automated Phase 5 Verification Test Suite:
// Autonomous Web Discovery, Content Extraction, Meaningful Claim Identification,
// Robots.txt Compliance, Change & Contradiction Detection, and Dashboard Data Staging

import { parseRobotsTxt } from '../src/lib/ingestion/robotsTxtGuard.ts';
import { parseSitemapXml, extractArticleFromHtml, discoverUrlsFromHtml } from '../src/lib/ingestion/contentExtractor.ts';
import { extractClaimsFromFeedItem } from '../src/lib/ingestion/claimExtractor.ts';
import { matchClaimAgainstRegistry, calculateStatementSimilarity, generateDiffSnippet } from '../src/lib/ingestion/claimMatcher.ts';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
let TEST_AUTH_TOKEN = 'verity-test-audit-moderator-token';

async function runPhase5Tests() {
  console.log('================================================================');
  console.log('VERITY PHASE 5: AUTONOMOUS WEB DISCOVERY & CLAIM INTELLIGENCE');
  console.log('================================================================\n');

  // Authenticate as moderator for server-verified authorization
  try {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'vikram@verity.org', password: 'password123' })
    });
    const loginData = await loginRes.json();
    if (loginData.token) {
      TEST_AUTH_TOKEN = loginData.token;
    }
  } catch (err) {
    console.warn('Warning: Could not pre-login moderator:', err.message);
  }

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // ---------------------------------------------------------------------------
  // PART A: MOCKED FIXTURE & UNIT TESTS (Deterministic & Offline)
  // ---------------------------------------------------------------------------
  console.log('PART A: Unit & Fixture Tests (Robots, Sitemaps, Content & Claims):');

  // Test 1: Robots.txt parsing & directive compliance
  const sampleRobotsTxt = `
User-agent: *
Disallow: /admin/
Disallow: /private-api/
Disallow: /checkout/
Crawl-delay: 2

User-agent: BadBot
Disallow: /
`;
  const parsedRobots = parseRobotsTxt(sampleRobotsTxt);
  assert(
    parsedRobots.disallowedPaths.includes('/admin/') &&
    parsedRobots.disallowedPaths.includes('/private-api/') &&
    parsedRobots.crawlDelayMs === 2000,
    `Robots.txt Parser: Extracted ${parsedRobots.disallowedPaths.length} disallow rules and 2000ms crawl delay`
  );

  // Test 2: Sitemap XML parsing
  const sampleSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/press/sebi-order-aug-2026.html</loc>
    <lastmod>2026-08-25T10:00:00Z</lastmod>
  </url>
  <url>
    <loc>https://example.com/press/rbi-circular-2026.html</loc>
    <lastmod>2026-09-01T12:00:00Z</lastmod>
  </url>
</urlset>`;
  const sitemapEntries = parseSitemapXml(sampleSitemapXml);
  assert(
    sitemapEntries.length === 2 &&
    sitemapEntries[0].loc === 'https://example.com/press/sebi-order-aug-2026.html' &&
    sitemapEntries[1].lastmod === '2026-09-01T12:00:00Z',
    `Sitemap Parser: Correctly extracted ${sitemapEntries.length} sitemap URLs with timestamps`
  );

  // Test 3: HTML link discovery from registry page
  const sampleHtmlRegistry = `
<!DOCTYPE html>
<html>
<body>
  <nav><a href="/home">Home</a></nav>
  <article>
    <h2>Recent Enforcement Orders</h2>
    <a href="/circulars/2026/notice-101.html">Enforcement Order 101</a>
    <a href="/orders/advisory-trade-bot.html">Advisory on Trading Bot</a>
    <a href="https://external-spam.com/link">External site</a>
  </article>
</body>
</html>`;
  const discoveredLinks = discoverUrlsFromHtml(sampleHtmlRegistry, 'https://regulator.gov.in/registry/index.html');
  assert(
    discoveredLinks.some(l => l.includes('/circulars/2026/notice-101.html')) &&
    !discoveredLinks.some(l => l.includes('external-spam.com')),
    `HTML Discovery: Discovered internal registry article URLs and excluded off-domain targets`
  );

  // Test 4: Deep HTML article extraction & metadata parsing
  const sampleArticleHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>SEBI Penalizes ABC Capital for Algorithmic Non-Compliance - Official Release</title>
  <meta property="og:title" content="SEBI Penalizes ABC Capital for Algorithmic Non-Compliance" />
  <meta name="author" content="Press Bureau Officer" />
  <meta property="og:site_name" content="Securities Registry Press" />
  <meta property="article:published_time" content="2026-09-15T08:30:00Z" />
  <link rel="canonical" href="https://regulatory-news.org/enforcement/sebi-penalizes-abc.html" />
</head>
<body>
  <header><nav>Navigation links and menu bar</nav></header>
  <main>
    <article>
      <h1>SEBI Penalizes ABC Capital for Algorithmic Non-Compliance</h1>
      <p class="byline">By Press Bureau Officer • Published September 15, 2026</p>
      <p>The Securities and Exchange Board of India (SEBI) penalizes ABC Capital for operating algorithmic trading models without statutory clearance under Section 11B.</p>
      <p>Multiple retail investors were promised guaranteed 18% quarterly returns via automated demat account bridges.</p>
    </article>
  </main>
  <footer>Copyright 2026 All rights reserved. Cookie policies apply.</footer>
</body>
</html>`;
  const extractedArticle = extractArticleFromHtml(
    sampleArticleHtml,
    'https://regulatory-news.org/enforcement/sebi-penalizes-abc.html',
    'Securities Registry'
  );
  assert(
    extractedArticle.headline === 'SEBI Penalizes ABC Capital for Algorithmic Non-Compliance' &&
    extractedArticle.author === 'Press Bureau Officer' &&
    extractedArticle.canonicalUrl === 'https://regulatory-news.org/enforcement/sebi-penalizes-abc.html' &&
    extractedArticle.cleanText.includes('Section 11B') &&
    !extractedArticle.cleanText.includes('Navigation links') &&
    extractedArticle.contentHash.length === 64,
    `Article Extractor: Extracted clean article text, author, publication date, and SHA-256 fingerprint`
  );

  // Test 5: Meaningful claim extraction vs routine boilerplate
  const routineBulletinItem = {
    id: 'test_bulletin_1',
    sourceId: 'src_test',
    sourceName: 'Reserve Bank of India',
    url: 'https://rbi.org.in/press/bulletin-sep.html',
    canonicalUrl: 'https://rbi.org.in/press/bulletin-sep.html',
    title: "Processing of Applications Under Citizen's Charter for the Quarter Ended September 2026",
    publisher: 'Reserve Bank of India',
    publicationDate: '2026-09-30T10:00:00Z',
    rawExcerpt: "Quarterly bulletin regarding processing of citizen charter applications.",
    cleanText: "Quarterly bulletin detailing operational application numbers received at regional offices.",
    contentHash: 'hash_bulletin_01'
  };
  const routineExtracted = extractClaimsFromFeedItem(routineBulletinItem);
  assert(
    routineExtracted.length === 0,
    'Quality Guard: Routine administrative/calendar bulletin correctly yielded 0 claims'
  );

  // Test 6: Actionable regulatory assertion extraction with speaker attribution
  const regulatoryItem = {
    id: 'test_reg_1',
    sourceId: 'src_test',
    sourceName: 'SEBI Enforcement Registry',
    url: 'https://sebi.gov.in/enforcement/orders/tradegenius-order.html',
    canonicalUrl: 'https://sebi.gov.in/enforcement/orders/tradegenius-order.html',
    title: 'SEBI Warns TradeGenius AI Algorithms over unauthorized advisory operations',
    publisher: 'Securities and Exchange Board of India',
    publicationDate: '2026-08-24T14:30:00Z',
    rawExcerpt: 'SEBI Warns TradeGenius AI Algorithms over unapproved algorithmic investment schemes.',
    cleanText: 'The Securities and Exchange Board of India (SEBI) issued an enforcement advisory stating that TradeGenius AI Algorithms operates as an unregistered investment adviser.',
    contentHash: 'hash_reg_02'
  };
  const regCandidates = extractClaimsFromFeedItem(regulatoryItem);
  assert(
    regCandidates.length === 1 &&
    regCandidates[0].targetEntityName.includes('TradeGenius') &&
    regCandidates[0].speakerOrSource?.includes('SEBI') &&
    regCandidates[0].detectionSignals.includes('Regulatory Enforcement / Statutory Warning'),
    `Claim Extraction: Extracted attributable assertion with speaker "${regCandidates[0]?.speakerOrSource}" and entity "${regCandidates[0]?.targetEntityName}"`
  );

  // Test 7: Subjective opinion commentary filtering
  const opinionItem = {
    id: 'test_opinion_1',
    sourceId: 'src_test',
    sourceName: 'Market Blog',
    url: 'https://blog.com/opinion/stock-picks.html',
    canonicalUrl: 'https://blog.com/opinion/stock-picks.html',
    title: 'In our view, this stock could potentially reach the moon by year end',
    publisher: 'Market Bloggers',
    publicationDate: '2026-09-20T10:00:00Z',
    rawExcerpt: 'In our opinion and personal reflection on market momentum.',
    cleanText: 'We believe that retail momentum could drive prices up. This is not financial advice.',
    contentHash: 'hash_opinion_03'
  };
  const opinionCandidates = extractClaimsFromFeedItem(opinionItem);
  assert(
    opinionCandidates.length === 0 || opinionCandidates[0]?.status === 'needs_review',
    'Opinion Filter: Speculative opinion/op-ed headline excluded or flagged for review'
  );

  // Test 8: Claim matching & change detection (diff generation)
  const statementV1 = 'TradeGenius AI Algorithms guarantees 22% monthly compounding returns with 100% principal safety';
  const statementV2 = 'TradeGenius AI Algorithms provides educational algorithmic parameters; historical models achieved up to 22% target returns subject to market volatility';
  const matchUpdate = matchClaimAgainstRegistry(statementV2, 'tradegenius-ai-algorithms');
  assert(
    matchUpdate.matchType === 'potential_update' && Boolean(matchUpdate.diffSnippet),
    `Change Detection: Detected statement revision with git-style diff snippet`
  );

  // Test 9: Claim contradiction detection
  const contradictoryAssertion = 'SEBI caution alert issued against TradeGenius AI Algorithms for prohibited guaranteed return marketing';
  const matchContradiction = matchClaimAgainstRegistry(contradictoryAssertion, 'tradegenius-ai-algorithms');
  assert(
    matchContradiction.matchType === 'potential_contradiction' && Boolean(matchContradiction.contradictionNote),
    `Contradiction Analysis: Identified potential discrepancy between prior safety claims and regulatory warning (${matchContradiction.contradictionNote?.substring(0, 50)}...)`
  );

  // ---------------------------------------------------------------------------
  // PART B: LIVE INTERNET INTEGRATION & API TESTS
  // ---------------------------------------------------------------------------
  console.log('\nPART B: Live Ingestion & Server API Integration Tests:');

  // Test 10: Ingestion Run via API endpoint
  try {
    const runRes = await fetch(`${BASE_URL}/api/discovery/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_AUTH_TOKEN}`
      },
      body: JSON.stringify({ sourceId: 'src_rbi_press' })
    });
    const runData = await runRes.json();
    assert(
      runRes.status === 200 && runData.report?.status === 'completed',
      `Live Feed Execution: Completed autonomous crawl on RBI RSS feed (${runData.report?.itemsDiscovered || 0} items discovered)`
    );
  } catch (e) {
    assert(false, `Live discovery API error: ${e.message}`);
  }

  // Test 11: Scheduled Cron Endpoint Authorization Gate
  try {
    const cronUnauth = await fetch(`${BASE_URL}/api/discovery/cron`);
    assert(cronUnauth.status === 401, 'Scheduler Security: Unauthenticated request to /api/discovery/cron blocked with HTTP 401');

    const cronAuth = await fetch(`${BASE_URL}/api/discovery/cron`, {
      headers: { Authorization: `Bearer ${TEST_AUTH_TOKEN}` }
    });
    const cronData = await cronAuth.json();
    assert(cronAuth.status === 200 && cronData.success, 'Scheduler Security: Authenticated cron trigger succeeded');
  } catch (e) {
    assert(false, `Cron security test error: ${e.message}`);
  }

  // Test 12: Discovery Sources Registry API
  try {
    const sourcesRes = await fetch(`${BASE_URL}/api/discovery/sources`);
    const sourcesData = await sourcesRes.json();
    assert(
      sourcesRes.status === 200 && Array.isArray(sourcesData.sources) && sourcesData.sources.length >= 3,
      `Source Registry: API returns active discovery sources (${sourcesData.sources?.length} configured sources)`
    );
  } catch (e) {
    assert(false, `Sources API error: ${e.message}`);
  }

  console.log('\n================================================================');
  console.log(`PHASE 5 VERIFICATION: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase5Tests();
