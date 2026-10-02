async function runE2EVerification() {
  console.log('================================================================');
  console.log('VERITY Real-Time On-Demand Internet Intelligence Engine E2E Test');
  console.log('================================================================\n');

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

  const query = 'Smith Dubai airline incident';

  // 1. API Live Search Call
  console.log(`1. Testing Live Search API for unindexed event: "${query}"...`);
  const t0 = Date.now();
  const apiRes = await fetch(`http://localhost:3000/api/search/live?q=${encodeURIComponent(query)}`);
  const duration = Date.now() - t0;
  assert(apiRes.status === 200, `API returned status 200 OK (latency: ${duration}ms)`);

  const data = await apiRes.json();
  assert(data.success === true, 'API response success flag is true');
  assert(!!data.report, 'Intelligence report object exists');

  const report = data.report;

  // 2. Real External Internet Search & Discovered Sources
  console.log('\n2. Verifying Real Internet Source Discovery...');
  assert(Array.isArray(report.sources) && report.sources.length >= 3, `Discovered ${report.sources?.length} real web sources`);
  
  if (report.sources?.length > 0) {
    const top = report.sources[0];
    assert(top.title.length > 10, `First source has authentic headline: "${top.title}"`);
    assert(top.url.startsWith('http'), `First source has valid external URL: "${top.url.substring(0, 50)}..."`);
    assert(top.publisher.length > 0, `First source has identified publisher: "${top.publisher}"`);
  }

  // 3. Factual Claims Extraction & Attribution
  console.log('\n3. Verifying Meaningful Attributable Claim Extraction...');
  assert(Array.isArray(report.keyClaims) && report.keyClaims.length >= 2, `Extracted ${report.keyClaims?.length} attributable factual claims`);
  
  if (report.keyClaims?.length > 0) {
    const claim = report.keyClaims[0];
    assert(claim.statement.length > 20, `Statement text captured: "${claim.statement.substring(0, 70)}..."`);
    assert(!!claim.speakerOrSource, `Speaker/Authority attributed: "${claim.speakerOrSource}"`);
    assert(!!claim.category, `Epistemological standard categorized: "${claim.category}"`);
    assert(claim.supportingExcerpt.length > 15, `Exact supporting excerpt preserved`);
    assert(claim.confidenceScore > 0 && claim.confidenceScore <= 1, `Confidence score bounded: ${claim.confidenceScore}`);
  }

  // 4. Incident Chronology / Timeline
  console.log('\n4. Verifying Incident Chronology Reconstructed...');
  assert(Array.isArray(report.timeline) && report.timeline.length >= 2, `Reconstructed ${report.timeline?.length} chronological timeline events`);
  if (report.timeline?.length > 0) {
    console.log(`  Sample Timeline Event: [${report.timeline[0].date}] (${report.timeline[0].source}): ${report.timeline[0].event.substring(0, 70)}...`);
  }

  // 5. Verification Breakdown: Confirmed vs Reported vs Disputed vs Unknown
  console.log('\n5. Verifying 4-Quadrant Verification Breakdown...');
  assert(Array.isArray(report.breakdown.confirmed) && report.breakdown.confirmed.length > 0, `Confirmed statements list populated (${report.breakdown.confirmed.length} items)`);
  assert(Array.isArray(report.breakdown.reported) && report.breakdown.reported.length > 0, `Reported statements list populated (${report.breakdown.reported.length} items)`);
  assert(Array.isArray(report.breakdown.unknown) && report.breakdown.unknown.length > 0, `Uncertain/unknown questions documented (${report.breakdown.unknown.length} items)`);

  // 6. Database Integration & Staging without Overwrite
  console.log('\n6. Verifying Database Cross-Reference & Safe Staging...');
  assert(report.databaseComparison.isNewIncident === true, 'Query correctly recognized as completely new, unindexed incident');
  assert(report.databaseComparison.matchedClaims.length === 0, 'No false historical claims substituted');
  assert(report.databaseComparison.comparisonNotes.includes('Zero pre-existing database records'), 'Explicit transparent notice that no old data was substituted');
  assert(!!report.databaseComparison.stagedCandidateId, `Incident safely staged in moderation desk: ID ${report.databaseComparison.stagedCandidateId}`);

  // 7. Search UI Page Render
  console.log('\n7. Verifying /search Web UI Route...');
  const searchPageRes = await fetch(`http://localhost:3000/search?q=${encodeURIComponent(query)}`);
  const searchHtml = await searchPageRes.text();
  assert(searchHtml.includes('Claim') && (searchHtml.includes('Intelligence') || searchHtml.includes('AI Claim Assessment')), 'Search page headline rendered');
  assert(searchHtml.includes('Smith Dubai airline incident'), 'Search input query preserved');

  // 8. Homepage Entry Point
  console.log('\n8. Verifying Homepage Search Entry Point...');
  const homeRes = await fetch('http://localhost:3000');
  assert(homeRes.status === 200, 'Homepage returns status 200');
  const homeHtml = await homeRes.text();
  assert(homeHtml.includes('action="/search"') || homeHtml.includes('/search?q=') || homeHtml.includes('Smith Dubai airline incident'), 'Homepage features real-time search and example pill');
  assert(homeHtml.includes('Live Search...'), 'Navbar features Live Search input pill');

  // 9. Explore Page Fallback CTA
  console.log('\n9. Verifying /explore Unindexed Query Fallback...');
  const exploreRes = await fetch(`http://localhost:3000/explore?q=${encodeURIComponent(query)}`);
  assert(exploreRes.status === 200, 'Explore page returns status 200');
  const exploreHtml = await exploreRes.text();
  assert(exploreHtml.includes('is not yet in the local registry'), 'Explore page shows informative unindexed query message');
  assert(exploreHtml.includes('/search?q='), 'Explore page provides direct one-click link to live web search');

  console.log('\n================================================================');
  console.log(`E2E TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runE2EVerification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
