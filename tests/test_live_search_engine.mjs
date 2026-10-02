async function testLiveSearch() {
  const query = 'Smith Dubai airline incident';
  console.log(`=== Testing Real-Time Internet Search for: "${query}" ===`);

  const { searchInternetLive } = await import('../src/lib/search/searchProvider.ts');
  const { resolveSearchResultsContent } = await import('../src/lib/search/contentResolver.ts');
  const { compareQueryWithDatabase } = await import('../src/lib/search/databaseComparator.ts');
  const { synthesizeIntelligenceReport } = await import('../src/lib/search/intelligenceSynthesizer.ts');

  const start = Date.now();

  // 1. Search
  console.log('1. Initiating live multi-provider search...');
  const sources = await searchInternetLive(query, { maxResults: 10 });
  console.log(`Discovered ${sources.length} sources.`);
  if (sources.length > 0) {
    console.log(`Top Source: [${sources[0].publisher}] ${sources[0].title}`);
  }

  // 2. Resolve content
  console.log('\n2. Resolving content for top articles...');
  const resolved = await resolveSearchResultsContent(sources, 4);
  console.log(`Resolved content for ${resolved.length} articles.`);

  // 3. Compare with DB
  console.log('\n3. Cross-referencing with VERITY database...');
  const dbMatch = await compareQueryWithDatabase(
    query,
    resolved[0]?.title,
    resolved[0]?.url,
    resolved[0]?.publisher
  );
  console.log('Is New Incident:', dbMatch.isNewIncident);
  console.log('Comparison Notes:', dbMatch.comparisonNotes);
  if (dbMatch.stagedCandidateId) {
    console.log('Staged Candidate ID in Moderation Queue:', dbMatch.stagedCandidateId);
  }

  // 4. Synthesize Intelligence Report
  console.log('\n4. Synthesizing Intelligence Dossier...');
  const durationMs = Date.now() - start;
  const report = await synthesizeIntelligenceReport(query, resolved, dbMatch, durationMs);

  console.log('\n=== SYNTHESIZED INTELLIGENCE REPORT ===');
  console.log('Status:', report.incidentStatus);
  console.log('Evidence Strength:', report.evidenceStrength);
  console.log('Source Diversity Score:', `${report.sourceDiversityScore}%`);
  console.log('Summary:\n', report.topicSummary);
  console.log('\nTimeline Events:', report.timeline.length);
  report.timeline.forEach((t) => console.log(`  - [${t.date}] (${t.source}): ${t.event.substring(0, 80)}...`));
  console.log('\nKey Claims Extracted:', report.keyClaims.length);
  report.keyClaims.forEach((c) =>
    console.log(`  * [${c.category.toUpperCase()}] (${c.speakerOrSource}): ${c.statement.substring(0, 80)}...`)
  );
  console.log('\nVerification Breakdown:');
  console.log('  Confirmed:', report.breakdown.confirmed.length);
  console.log('  Reported:', report.breakdown.reported.length);
  console.log('  Disputed:', report.breakdown.disputed.length);
  console.log('  Unknown:', report.breakdown.unknown.length);
  console.log(`\nCompleted in ${durationMs}ms.`);
}

testLiveSearch().catch(console.error);
