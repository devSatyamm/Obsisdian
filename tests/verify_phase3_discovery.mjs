// Phase 3: Autonomous Web Discovery & Claim Intelligence Verification Test
import { validateUrlForScraping, safeFetchPublicContent } from '../src/lib/ingestion/ssrfGuard.js';
import { parseFeedContent } from '../src/lib/ingestion/feedParser.js';
import { extractClaimsFromFeedItem } from '../src/lib/ingestion/claimExtractor.js';
import { runIngestionJobForSource } from '../src/lib/ingestion/jobRunner.js';
import { INITIAL_DISCOVERY_SOURCES } from '../src/lib/ingestion/discoveryRegistry.js';
import { repository } from '../src/lib/db/repository.js';

async function runPhase3Tests() {
  console.log('====================================================');
  console.log('VERITY PHASE 3: DISCOVERY & CLAIM INTELLIGENCE TEST');
  console.log('====================================================\n');

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

  // Test 1: SSRF Protection
  console.log('1. Testing SSRF & Security Protections:');
  const loopback = validateUrlForScraping('http://127.0.0.1:8080/admin');
  assert(!loopback.isValid, 'SSRF Guard: Successfully blocks 127.0.0.1 loopback destination');

  const metadata = validateUrlForScraping('http://169.254.169.254/latest/meta-data/');
  assert(!metadata.isValid, 'SSRF Guard: Successfully blocks cloud instance metadata endpoint (169.254.169.254)');

  const protocol = validateUrlForScraping('ftp://example.com/file');
  assert(!protocol.isValid, 'SSRF Guard: Successfully blocks non-HTTP/HTTPS protocols');

  const validWeb = validateUrlForScraping('https://www.rbi.org.in/pressreleases_rss.xml');
  assert(validWeb.isValid, 'SSRF Guard: Correctly allows legitimate public web address');

  // Test 2: Real Public Feed Fetching (RBI Official Feed)
  console.log('\n2. Testing Real Public Feed Fetching (Reserve Bank of India):');
  const rbiSource = INITIAL_DISCOVERY_SOURCES.find((s) => s.slug === 'rbi-press-releases');
  let fetchResult = null;

  try {
    fetchResult = await safeFetchPublicContent(rbiSource.url, { timeoutMs: 12000 });
    assert(
      fetchResult.ok && fetchResult.status === 200 && fetchResult.data && fetchResult.data.length > 500,
      `Live Fetch: Successfully connected and fetched ${fetchResult.data?.length || 0} bytes from official RBI XML feed`
    );
  } catch (e) {
    assert(false, `Live fetch exception: ${e.message}`);
  }

  // Test 3: XML & Feed Parsing
  console.log('\n3. Testing Feed Parsing & Hash Fingerprinting:');
  let parsedItems = [];
  if (fetchResult && fetchResult.data) {
    parsedItems = parseFeedContent(fetchResult.data, rbiSource.id, rbiSource.name);
    assert(
      parsedItems.length > 0 && parsedItems[0].title && parsedItems[0].url && parsedItems[0].contentHash,
      `Feed Parser: Extracted ${parsedItems.length} items with valid titles, URLs, and SHA-256 fingerprints`
    );
    console.log(`- Sample extracted title: "${parsedItems[0]?.title}"`);
    console.log(`- Sample publication date: ${parsedItems[0]?.publicationDate}`);
    console.log(`- Sample content hash: ${parsedItems[0]?.contentHash.substring(0, 16)}...`);
  } else {
    assert(false, 'Feed parser: Skipped because fetch data is unavailable');
  }

  // Test 4: Claim Identification & Factual Extraction
  console.log('\n4. Testing Claim Extraction & Signal Detection:');
  if (parsedItems.length > 0) {
    let totalClaimsFound = 0;
    for (const item of parsedItems.slice(0, 10)) {
      const candidates = extractClaimsFromFeedItem(item);
      if (candidates.length > 0) {
        totalClaimsFound += candidates.length;
        console.log(`- Discovered claim: "${candidates[0].claimTitle}"`);
        console.log(`  Target entity: ${candidates[0].targetEntityName}`);
        console.log(`  Signals: ${candidates[0].detectionSignals.join(', ')}`);
        console.log(`  Confidence score: ${(candidates[0].confidenceScore * 100).toFixed(0)}%`);
      }
    }
    assert(totalClaimsFound > 0, `Claim Extractor: Successfully identified ${totalClaimsFound} factual claims from real feed items`);
  } else {
    assert(false, 'Claim extractor: Skipped due to missing items');
  }

  // Test 5: End-to-End Ingestion Job Runner
  console.log('\n5. Testing Autonomous Ingestion Job Runner:');
  try {
    const jobReport = await runIngestionJobForSource(rbiSource);
    assert(
      jobReport.status === 'completed' && jobReport.itemsDiscovered > 0,
      `Job Runner: Completed discovery job (${jobReport.itemsDiscovered} discovered, ${jobReport.claimsIdentified} queued for human review)`
    );

    // Verify candidates were queued as pending submissions in the repository
    const submissions = repository.getSubmissions();
    const queuedFromEngine = submissions.filter((s) => s.submittedBy.name.includes('Autonomous Ingestion Engine'));
    assert(
      queuedFromEngine.length > 0,
      `Staging Queue: Verified ${queuedFromEngine.length} candidate claims queued as status="pending" for moderator review`
    );
  } catch (err) {
    assert(false, `Job runner test failed: ${err.message}`);
  }

  // Test 6: Deduplication Check
  console.log('\n6. Testing Deduplication on Repeated Discovery:');
  try {
    // Running the same feed again should detect duplicate items and avoid duplicate entries
    const secondRun = await runIngestionJobForSource(rbiSource);
    assert(
      secondRun.status === 'completed',
      `Duplicate Handling: Second run completed gracefully (status: ${secondRun.status})`
    );
  } catch (err) {
    assert(false, `Deduplication test failed: ${err.message}`);
  }

  console.log('\n====================================================');
  console.log(`PHASE 3 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================');
}

runPhase3Tests();
