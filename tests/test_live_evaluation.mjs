import { searchInternetLive } from '../src/lib/search/searchProvider.ts';
import { synthesizeIntelligenceReport } from '../src/lib/search/intelligenceSynthesizer.ts';

async function test() {
  const queries = [
    'Is Donald Trump, president of US dead?',
    'Smith Dubai airline incident',
    'UPI charges above ₹2,000'
  ];

  for (const q of queries) {
    console.log('\n======================================================');
    console.log('QUERY:', q);
    const start = Date.now();
    const sources = await searchInternetLive(q, { maxResults: 10 });
    const duration = Date.now() - start;
    console.log(`Fetched ${sources.length} sources in ${duration}ms`);
    console.log('Top sources:');
    for (const s of sources.slice(0, 3)) {
      console.log(`  - [${s.relevanceScore}/100] ${s.title} (${s.publisher})`);
      console.log(`    Rationale: ${s.relevanceRationale}`);
    }

    const report = await synthesizeIntelligenceReport(
      q,
      sources,
      { isNewIncident: true, matchedClaims: [], comparisonNotes: '' },
      duration
    );

    console.log('\n--- SYNTHESIZED REPORT ---');
    console.log('Canonical Poll Claim:', report.claimPoll.claimStatement);
    console.log('Assessment Label:', report.aiAssessment.assessmentLabel);
    console.log('Evidence Support Score:', report.aiAssessment.evidenceSupportScore);
    console.log('Direct Answer:', report.aiAssessment.directAnswer);
    console.log('Concise Explanation:', report.aiAssessment.conciseExplanation);
    console.log('Relevance Gate Passed:', report.aiAssessment.relevanceGatePassed);
    console.log('AI Confidence:', report.aiAssessment.aiConfidenceIndicator);
  }
}

test().catch(console.error);
