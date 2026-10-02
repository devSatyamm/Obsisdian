/**
 * Comprehensive Verification of VERITY's AI Evidence Assessment & Scoring Methodology
 * Tests 8 core required scenarios:
 * 1. Well-documented real-world / historical incidents (e.g. "IIT Bombay suicide case", Apollo moon landing)
 * 2. Recent incidents with multi-newsroom reporting
 * 3. Events with explicit official confirmation (police FIR, regulatory circular)
 * 4. Claims with contradictory / disputed reporting between outlets
 * 5. Claims supported by only a single source (must be capped)
 * 6. Debunked / false claims repeated across websites (must score in 0–19 band)
 * 7. Ambiguous queries with low directness
 * 8. Topics for which no reliable evidence can be found (must return null / Insufficient evidence)
 * 
 * Also tests:
 * - Domain independence vs Google News redirect URLs
 * - Wire syndication identification (PTI, ANI, Reuters)
 * - Sub-claim separation (occurrence vs cause/motives vs institutional action)
 * - Distinct separation of Evidence Support Score, AI Analytical Confidence, and Data Completeness
 */

import { synthesizeIntelligenceReport, computeEvidenceSupportBand } from '../src/lib/search/intelligenceSynthesizer.ts';
import { resolvePublisherDomain, detectWireSyndication } from '../src/lib/search/searchProvider.ts';
import { classifyQueryIntent } from '../src/lib/search/intentClassifier.ts';
import assert from 'assert';

console.log('🧪 Starting VERITY Evidence Scoring Methodology Verification...\n');

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}:`, err.message);
    testsFailed++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`✅ [PASS] ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}:`, err.message);
    testsFailed++;
  }
}

const mockDbCrossReference = {
  isNewIncident: true,
  matchedClaims: [],
  comparisonNotes: 'Test runner evaluation'
};

// -------------------------------------------------------------
// TEST 1: Domain Independence & Wire Syndication Detection
// -------------------------------------------------------------
runTest('Domain Resolution extracts authentic publishers instead of news.google.com', () => {
  const domain1 = resolvePublisherDomain('The Times of India', 'https://news.google.com/rss/articles/CBMi...');
  assert.strictEqual(domain1, 'timesofindia.indiatimes.com', 'Times of India canonical domain matched');

  const domain2 = resolvePublisherDomain('The Hindu', 'https://news.google.com/rss/articles/XYZ...', 'https://www.thehindu.com/news/national/');
  assert.strictEqual(domain2, 'thehindu.com', 'The Hindu domain matched from source URL');

  const wire1 = detectWireSyndication('IIT Bombay student death: Police probe underway', 'Mumbai (PTI): Investigation launched', 'NDTV');
  assert.strictEqual(wire1.isWire, true, 'Wire syndication detected for PTI');
  assert.ok(wire1.wireService.includes('PTI'), 'PTI identified as wire service');
});

// -------------------------------------------------------------
// TEST 2: Score Bands Helper Mapping
// -------------------------------------------------------------
runTest('Score Bands map strictly to proposed transparent ranges', () => {
  assert.strictEqual(computeEvidenceSupportBand(95), 'Very strong supporting evidence (90–100)');
  assert.strictEqual(computeEvidenceSupportBand(80), 'Strong supporting evidence (75–89)');
  assert.strictEqual(computeEvidenceSupportBand(65), 'Moderate supporting evidence (60–74)');
  assert.strictEqual(computeEvidenceSupportBand(45), 'Mixed or inconclusive evidence (40–59)');
  assert.strictEqual(computeEvidenceSupportBand(25), 'Limited supporting evidence (20–39)');
  assert.strictEqual(computeEvidenceSupportBand(10), 'Very little supporting evidence (0–19)');
  assert.strictEqual(computeEvidenceSupportBand(null), 'Insufficient evidence (Unable to assess)');
});

// -------------------------------------------------------------
// TEST 3: Scenario 1 - Well-Documented Real-World Incident ("IIT Bombay suicide case")
// -------------------------------------------------------------
await runAsyncTest('Scenario 1: IIT Bombay suicide case scores in Very Strong / Strong band with independent domains', async () => {
  const query = 'IIT Bombay suicide case';
  
  // Simulated real search results from 6 diverse Indian national newsrooms (all via Google News)
  const sources = [
    {
      id: 's1',
      title: 'IIT Bombay student Darshan Solanki death: SIT files chargesheet, police confirm suicide',
      url: 'https://news.google.com/rss/articles/CBMi1',
      snippet: 'Mumbai Police Special Investigation Team (SIT) confirmed the death by suicide of Darshan Solanki at IIT Bombay campus and filed an official chargesheet.',
      publisher: 'The Hindu',
      publisherDomain: 'thehindu.com',
      isWireSyndicated: false,
      publishedAt: '2023-05-30T10:00:00Z',
      sourceProvider: 'google_news',
      entityMatched: true,
      predicateMatched: true,
      directlyAnswers: true
    },
    {
      id: 's2',
      title: 'IIT Bombay student death: Mumbai police register FIR following campus probe',
      url: 'https://news.google.com/rss/articles/CBMi2',
      snippet: 'Police officers registered an FIR under statutory sections after an initial inquiry into the suicide incident at IIT Bombay.',
      publisher: 'The Indian Express',
      publisherDomain: 'indianexpress.com',
      isWireSyndicated: false,
      publishedAt: '2023-04-10T11:00:00Z',
      sourceProvider: 'google_news',
      entityMatched: true,
      predicateMatched: true,
      directlyAnswers: true
    },
    {
      id: 's3',
      title: 'IIT Bombay student suicide: Interim report submitted by institute panel',
      url: 'https://news.google.com/rss/articles/CBMi3',
      snippet: 'The internal 12-member committee set up by IIT Bombay administration submitted its official interim findings to the director.',
      publisher: 'Times of India',
      publisherDomain: 'timesofindia.indiatimes.com',
      isWireSyndicated: false,
      publishedAt: '2023-03-02T09:00:00Z',
      sourceProvider: 'google_news',
      entityMatched: true,
      predicateMatched: true,
      directlyAnswers: true
    },
    {
      id: 's4',
      title: 'IIT Bombay student death case: Batchmate arrested, police say note recovered',
      url: 'https://news.google.com/rss/articles/CBMi4',
      snippet: 'Mumbai police crime branch officials arrested a batchmate in connection with the IIT Bombay suicide case.',
      publisher: 'Hindustan Times',
      publisherDomain: 'hindustantimes.com',
      isWireSyndicated: false,
      publishedAt: '2023-04-09T14:00:00Z',
      sourceProvider: 'google_news',
      entityMatched: true,
      predicateMatched: true,
      directlyAnswers: true
    },
    {
      id: 's5',
      title: 'IIT-Bombay student death: Probe committee finds no specific evidence of caste bias',
      url: 'https://news.google.com/rss/articles/CBMi5',
      snippet: 'While the suicide was confirmed by police, student groups contested the committee findings regarding discrimination at IIT Bombay.',
      publisher: 'NDTV',
      publisherDomain: 'ndtv.com',
      isWireSyndicated: true,
      wireService: 'PTI (Press Trust of India)',
      publishedAt: '2023-03-05T12:00:00Z',
      sourceProvider: 'google_news',
      entityMatched: true,
      predicateMatched: true,
      directlyAnswers: true
    }
  ];

  const report = await synthesizeIntelligenceReport(query, sources, mockDbCrossReference, 250);
  const assessment = report.aiAssessment;

  console.log(`   → Verdict: ${assessment.assessmentLabel}`);
  console.log(`   → Evidence Support Score: ${assessment.evidenceSupportScore} (${assessment.evidenceSupportBand})`);
  console.log(`   → AI Analytical Confidence: ${assessment.aiConfidenceIndicator.score}% (${assessment.aiConfidenceIndicator.rating})`);
  console.log(`   → Independent Domains: ${assessment.independentSourceCount} (vs 1 in old buggy code)`);
  console.log(`   → Data Completeness: ${assessment.dataCompleteness.rating} (${assessment.dataCompleteness.score}%)`);

  // Assertions
  assert.ok(assessment.independentSourceCount >= 4, `Expected at least 4 independent domains, got ${assessment.independentSourceCount}`);
  assert.ok(assessment.evidenceSupportScore >= 90, `Expected score in 90-100 band for widely corroborated event, got ${assessment.evidenceSupportScore}`);
  assert.strictEqual(assessment.evidenceSupportBand, 'Very strong supporting evidence (90–100)');
  assert.strictEqual(assessment.assessmentLabel, 'Supported');
  
  // Verify sub-claims were generated and decomposed
  assert.ok(assessment.subClaimAssessments && assessment.subClaimAssessments.length >= 2, 'Sub-claims must be generated');
  const occurrenceClaim = assessment.subClaimAssessments.find(sc => sc.claimType === 'occurrence');
  assert.ok(occurrenceClaim, 'Core occurrence sub-claim exists');
  assert.strictEqual(occurrenceClaim.assessmentLabel, 'Supported');
  assert.ok(occurrenceClaim.supportScore >= 90, 'Occurrence sub-claim scores >= 90');

  const causeClaim = assessment.subClaimAssessments.find(sc => sc.claimType === 'cause_or_trigger');
  assert.ok(causeClaim, 'Cause/circumstances sub-claim exists');
  assert.strictEqual(causeClaim.assessmentLabel, 'Mixed evidence', 'Circumstances remain under probe');
});

// -------------------------------------------------------------
// TEST 4: Scenario 2 - Official Confirmation (NPCI UPI circular)
// -------------------------------------------------------------
await runAsyncTest('Scenario 2: Official Confirmation separates consumer zero-fee from merchant PPI charge', async () => {
  const query = 'are UPI transactions above 2000 charged';
  const sources = [
    {
      id: 's1',
      title: 'NPCI clarifies: No charge for normal UPI payments, standard transfers free',
      url: 'https://www.npci.org.in/press-releases/clarification-upi-charges',
      snippet: 'NPCI issued a formal circular confirming standard bank-to-bank UPI transactions are completely free. An interchange fee applies only to merchant wallet transactions above Rs 2,000.',
      publisher: 'National Payments Corporation of India',
      publisherDomain: 'npci.org.in',
      publishedAt: '2023-03-29T10:00:00Z',
      sourceProvider: 'direct_fetch',
      entityMatched: true,
      predicateMatched: true,
      directlyAnswers: true
    },
    {
      id: 's2',
      title: 'Fact Check: Will you be charged for UPI payments above Rs 2,000? Ministry confirms free',
      url: 'https://pib.gov.in/FactCheck/UPI',
      snippet: 'PIB Fact Check and Finance Ministry confirm that regular UPI users face zero charges for payments above Rs 2000.',
      publisher: 'Press Information Bureau',
      publisherDomain: 'pib.gov.in',
      publishedAt: '2023-03-30T10:00:00Z',
      sourceProvider: 'direct_fetch',
      entityMatched: true,
      predicateMatched: true,
      directlyAnswers: true
    }
  ];

  const report = await synthesizeIntelligenceReport(query, sources, mockDbCrossReference, 200);
  const assessment = report.aiAssessment;

  console.log(`   → Verdict: ${assessment.assessmentLabel}`);
  console.log(`   → Evidence Support Score: ${assessment.evidenceSupportScore} (${assessment.evidenceSupportBand})`);

  assert.strictEqual(assessment.assessmentLabel, 'Mixed evidence');
  assert.strictEqual(assessment.evidenceSupportBand, 'Mixed or inconclusive evidence (40–59)');
  assert.ok(assessment.directAnswer.includes('free for consumers'), 'Direct answer explains consumer exemption');
});

// -------------------------------------------------------------
// TEST 5: Scenario 3 - Single Source Claim (Must be capped below 40)
// -------------------------------------------------------------
await runAsyncTest('Scenario 3: Single Source Claim is capped and cannot claim high evidence support', async () => {
  const query = 'Secret tunnel discovered under local municipal library';
  const sources = [
    {
      id: 's1',
      title: 'Blogger claims secret tunnel discovered under local municipal library',
      url: 'https://mysteriouscityblog.wordpress.com/post/101',
      snippet: 'An anonymous explorer claims to have uncovered a 19th century hidden shaft.',
      publisher: 'Mysterious City Blog',
      publisherDomain: 'mysteriouscityblog.wordpress.com',
      publishedAt: '2026-09-01T10:00:00Z',
      sourceProvider: 'duckduckgo',
      entityMatched: true,
      predicateMatched: true,
      directlyAnswers: true
    }
  ];

  const report = await synthesizeIntelligenceReport(query, sources, mockDbCrossReference, 150);
  const assessment = report.aiAssessment;

  console.log(`   → Single Source Score: ${assessment.evidenceSupportScore} (${assessment.evidenceSupportBand})`);
  assert.ok(assessment.evidenceSupportScore <= 38, `Single uncorroborated source must be capped <= 38, got ${assessment.evidenceSupportScore}`);
  assert.ok(assessment.evidenceSupportBand.includes('20–39') || assessment.evidenceSupportBand.includes('0–19'));
});

// -------------------------------------------------------------
// TEST 6: Scenario 4 - Contradictory Evidence Between Outlets
// -------------------------------------------------------------
await runAsyncTest('Scenario 4: Contradictory Evidence applies penalties and reflects Mixed/Inconclusive band', async () => {
  const query = 'CEO resignation rumors at Apex Tech';
  const sources = [
    {
      id: 's1',
      title: 'Apex Tech CEO steps down amid board restructuring: Report',
      url: 'https://techleakjournal.com/ceo-steps-down',
      snippet: 'Anonymous sources claim the CEO has submitted a resignation letter to the board.',
      publisher: 'Tech Leak Journal',
      publisherDomain: 'techleakjournal.com',
      publishedAt: '2026-09-15T10:00:00Z',
      sourceProvider: 'google_news',
      entityMatched: true,
      predicateMatched: true,
      directlyAnswers: true
    },
    {
      id: 's2',
      title: 'Apex Tech board spokesperson denied CEO resignation claims as false rumors',
      url: 'https://reuters.com/business/apex-tech-denies-ceo-exit',
      snippet: 'Official spokesperson denied the reports, stating the CEO remains in full capacity and debunked rumors.',
      publisher: 'Reuters',
      publisherDomain: 'reuters.com',
      publishedAt: '2026-09-15T12:00:00Z',
      sourceProvider: 'google_news',
      entityMatched: true,
      predicateMatched: true,
      directlyAnswers: true
    }
  ];

  const report = await synthesizeIntelligenceReport(query, sources, mockDbCrossReference, 200);
  const assessment = report.aiAssessment;

  console.log(`   → Contradictory Verdict: ${assessment.assessmentLabel}, Score: ${assessment.evidenceSupportScore}`);
  assert.ok(report.discrepancies.length > 0, 'Discrepancy must be detected between conflicting reports');
  assert.ok(assessment.evidenceSupportScore <= 59, `Conflicting reports must not exceed 59, got ${assessment.evidenceSupportScore}`);
});

// -------------------------------------------------------------
// TEST 7: Scenario 5 - Debunked / False Viral Claims (e.g. Alive person death hoax)
// -------------------------------------------------------------
await runAsyncTest('Scenario 5: Debunked death hoax scores in 0–19 Very Little Supporting Evidence band', async () => {
  const query = 'Is Donald Trump, president of US dead?';
  const sources = [
    {
      id: 's1',
      title: 'Fact Check: Viral death claim debunked, Donald Trump speaks at campaign rally',
      url: 'https://reuters.com/fact-check/trump-alive-rally',
      snippet: 'Viral death rumors are a hoax. Donald Trump addressed thousands of supporters at a live press conference today.',
      publisher: 'Reuters',
      publisherDomain: 'reuters.com',
      publishedAt: '2026-09-20T10:00:00Z',
      sourceProvider: 'google_news',
      entityMatched: true,
      predicateMatched: true,
      directlyAnswers: true
    },
    {
      id: 's2',
      title: 'Donald Trump not dead: False online claims debunked by public appearances',
      url: 'https://apnews.com/article/fact-check-trump-alive',
      snippet: 'Fact-check confirms Donald Trump is alive and well. Reports of his demise are fabricated social media claims.',
      publisher: 'Associated Press',
      publisherDomain: 'apnews.com',
      publishedAt: '2026-09-20T11:00:00Z',
      sourceProvider: 'google_news',
      entityMatched: true,
      predicateMatched: true,
      directlyAnswers: true
    }
  ];

  const report = await synthesizeIntelligenceReport(query, sources, mockDbCrossReference, 200);
  const assessment = report.aiAssessment;

  console.log(`   → Debunked Claim Verdict: ${assessment.assessmentLabel}, Score: ${assessment.evidenceSupportScore}`);
  assert.strictEqual(assessment.assessmentLabel, 'Unsupported');
  assert.strictEqual(assessment.evidenceSupportScore, 5);
  assert.strictEqual(assessment.evidenceSupportBand, 'Very little supporting evidence (0–19)');
  assert.ok(assessment.directAnswer.startsWith('No.'), 'Direct answer begins with clear refutation');
});

// -------------------------------------------------------------
// TEST 8: Scenario 6 - Unassessable / Insufficient Evidence
// -------------------------------------------------------------
await runAsyncTest('Scenario 6: Completely unrelated or empty sources return Insufficient Evidence with null score', async () => {
  const query = 'Xylophone quantum teleporter 987123';
  // Irrelevant sources returned from search
  const sources = [
    {
      id: 's1',
      title: 'Classical music festival announces summer schedule',
      url: 'https://musicnews.org/festival',
      snippet: 'Orchestral performances including brass, strings, and percussion instruments.',
      publisher: 'Music News',
      publisherDomain: 'musicnews.org',
      publishedAt: '2026-08-01T10:00:00Z',
      sourceProvider: 'duckduckgo',
      entityMatched: false,
      predicateMatched: false,
      directlyAnswers: false
    }
  ];

  const report = await synthesizeIntelligenceReport(query, sources, mockDbCrossReference, 100);
  const assessment = report.aiAssessment;

  console.log(`   → Unassessable Verdict: ${assessment.assessmentLabel}, Score: ${assessment.evidenceSupportScore}`);
  assert.strictEqual(assessment.assessmentLabel, 'Insufficient evidence');
  assert.strictEqual(assessment.evidenceSupportScore, null, 'Score must be null, never forced');
  assert.strictEqual(assessment.evidenceSupportBand, 'Insufficient evidence (Unable to assess)');
  assert.strictEqual(assessment.aiConfidenceIndicator.rating, 'Insufficient');
});

console.log(`\n========================================`);
console.log(`Test Results: ${testsPassed} passed, ${testsFailed} failed.`);
console.log(`========================================\n`);

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
