import { classifyQueryIntent } from '../src/lib/search/intentClassifier.ts';
import { validateAndRankEvidence } from '../src/lib/search/queryEvidenceValidator.ts';
import { synthesizeIntelligenceReport } from '../src/lib/search/intelligenceSynthesizer.ts';

const DUMMY_DB_MATCH = {
  isNewIncident: true,
  matchedClaims: [],
  comparisonNotes: 'No database match.',
  stagedCandidateId: 'sub_test_regression'
};

async function runRegressionSuite() {
  console.log('========================================================================');
  console.log('       VERITY MANDATORY RELEVANCE & ANSWER GROUNDING REGRESSION SUITE   ');
  console.log('========================================================================\n');

  let passedAll = true;

  // TEST CASE 1: Justin Bieber elected prime minister of Japan (CRITICAL BUG CASE)
  {
    const query = 'Justin Bieber elected prime minister of Japan';
    console.log(`[TEST 1] Query: "${query}"`);
    const intent = classifyQueryIntent(query);
    console.log('  Target Entity:', intent.targetEntity);
    console.log('  Predicate:', intent.predicate);
    console.log('  Predicate Keywords:', intent.predicateKeywords);
    console.log('  Geographic Anchors:', intent.geographicOrOrgAnchors);

    // Provide deliberately irrelevant articles that share keywords (e.g. Coachella)
    const mockSources = [
      {
        id: 'mock_coachella_1',
        sourceProvider: 'google_news',
        title: 'Justin Trudeau and Katy Perry check out Bieber set at Coachella',
        snippet: 'Canadian Prime Minister Justin Trudeau and Katy Perry were spotted watching Justin Bieber set at Coachella festival.',
        url: 'https://news.example.com/coachella-bieber',
        publisher: 'Entertainment Weekly',
        publisherDomain: 'ew.com'
      },
      {
        id: 'mock_coachella_2',
        sourceProvider: 'google_news',
        title: 'Justin Bieber headlines music festival amid world tour announcements',
        snippet: 'Pop superstar Justin Bieber took the stage in California for an electrifying pop set.',
        url: 'https://news.example.com/bieber-tour',
        publisher: 'Rolling Stone',
        publisherDomain: 'rollingstone.com'
      },
      {
        id: 'mock_japan_unrelated_3',
        sourceProvider: 'google_news',
        title: 'Japan elects new ruling party leader in Tokyo parliament vote',
        snippet: 'Japanese lawmakers cast ballots in Tokyo today to select the new leader of the Liberal Democratic Party.',
        url: 'https://news.example.com/japan-politics',
        publisher: 'Japan Times',
        publisherDomain: 'japantimes.co.jp'
      }
    ];

    const validation = validateAndRankEvidence(mockSources, intent);
    console.log(`  Valid Sources Count: ${validation.validSourcesCount} / ${mockSources.length}`);
    console.log(`  Has Direct Evidence: ${validation.hasDirectEvidence}`);
    console.log(`  Has Sufficient Evidence: ${validation.hasSufficientEvidence}`);
    console.log(`  Rejection Reason: ${validation.rejectionReason}`);

    const report = await synthesizeIntelligenceReport(query, mockSources, DUMMY_DB_MATCH, 100);
    console.log('  -> Verdict Label:', report.aiAssessment.assessmentLabel);
    console.log('  -> Evidence Support Score:', report.aiAssessment.evidenceSupportScore);
    console.log('  -> AI Confidence:', report.aiAssessment.aiConfidenceIndicator.rating, `(${report.aiAssessment.aiConfidenceIndicator.score}%)`);
    console.log('  -> Direct Answer:', report.aiAssessment.directAnswer);
    console.log('  -> Supporting Evidence Count:', report.aiAssessment.strongestSupportingEvidence.length);
    console.log('  -> Relevance Gate Passed:', report.aiAssessment.relevanceGatePassed);

    const test1Passed =
      report.aiAssessment.assessmentLabel === 'Insufficient evidence' &&
      report.aiAssessment.evidenceSupportScore === null &&
      report.aiAssessment.strongestSupportingEvidence.length === 0 &&
      !report.aiAssessment.directAnswer.toLowerCase().includes('coachella') &&
      report.aiAssessment.relevanceGatePassed === false;

    if (test1Passed) {
      console.log('  [PASS] Test 1: Irrelevant Coachella articles rejected, score withheld, honest answer generated.\n');
    } else {
      console.error('  [FAIL] Test 1 FAILED!\n');
      passedAll = false;
    }
  }

  // TEST CASE 2: Is Donald Trump dead? (Death Hoax vs. Active Status)
  {
    const query = 'Is Donald Trump dead?';
    console.log(`[TEST 2] Query: "${query}"`);
    const intent = classifyQueryIntent(query);

    const mockSources = [
      {
        id: 'dt_1',
        sourceProvider: 'google_news',
        title: 'Fact Check: Viral claims that Donald Trump died suddenly are completely false',
        snippet: 'Reuters Fact Check debunked viral online rumors alleging that Donald Trump passed away. Trump was seen speaking at a rally in Pennsylvania.',
        url: 'https://reuters.com/fact-check/trump-alive',
        publisher: 'Reuters Fact Check',
        publisherDomain: 'reuters.com',
        entityMatched: true,
        predicateMatched: true,
        directlyAnswers: true
      },
      {
        id: 'dt_2',
        sourceProvider: 'google_news',
        title: 'Donald Trump addresses supporters at Florida press conference',
        snippet: 'Former President Donald Trump spoke live to reporters for over an hour at Mar-a-Lago, discussing upcoming campaign events.',
        url: 'https://apnews.com/trump-press-conf',
        publisher: 'Associated Press',
        publisherDomain: 'apnews.com',
        entityMatched: true,
        predicateMatched: true,
        directlyAnswers: true
      }
    ];

    const report = await synthesizeIntelligenceReport(query, mockSources, DUMMY_DB_MATCH, 100);
    console.log('  -> Verdict Label:', report.aiAssessment.assessmentLabel);
    console.log('  -> Evidence Support Score:', report.aiAssessment.evidenceSupportScore);
    console.log('  -> Direct Answer:', report.aiAssessment.directAnswer);

    const test2Passed =
      report.aiAssessment.assessmentLabel === 'Unsupported' &&
      report.aiAssessment.evidenceSupportScore !== null &&
      report.aiAssessment.evidenceSupportScore <= 20;

    if (test2Passed) {
      console.log('  [PASS] Test 2: Death hoax recognized as Unsupported based on fact checks and active appearances.\n');
    } else {
      console.error('  [FAIL] Test 2 FAILED!\n');
      passedAll = false;
    }
  }

  // TEST CASE 3: Smith Dubai airline incident (Entity + Context Disambiguation)
  {
    const query = 'Smith Dubai airline incident';
    console.log(`[TEST 3] Query: "${query}"`);
    const intent = classifyQueryIntent(query);

    const mockSources = [
      {
        id: 'smith_1',
        sourceProvider: 'google_news',
        title: 'Pilot Smith grounded following FlyDubai cockpit altercation incident in UAE',
        snippet: 'A commercial airline pilot named Smith was detained in Dubai following an unruly incident aboard a regional airliner.',
        url: 'https://aviationherald.com/smith-dubai',
        publisher: 'The Aviation Herald',
        publisherDomain: 'aviationherald.com',
        entityMatched: true,
        predicateMatched: true,
        directlyAnswers: true
      },
      {
        id: 'smith_unrelated_2',
        sourceProvider: 'google_news',
        title: 'Will Smith attends premier in Los Angeles',
        snippet: 'Actor Will Smith walked the red carpet in Hollywood for his new film.',
        url: 'https://variety.com/will-smith',
        publisher: 'Variety',
        publisherDomain: 'variety.com'
      }
    ];

    const validation = validateAndRankEvidence(mockSources, intent);
    const report = await synthesizeIntelligenceReport(query, mockSources, DUMMY_DB_MATCH, 100);
    console.log('  -> Valid Sources:', validation.validSourcesCount);
    console.log('  -> Verdict Label:', report.aiAssessment.assessmentLabel);
    console.log('  -> Will Smith LA red carpet rejected:', !validation.validSources.some(s => s.id === 'smith_unrelated_2'));

    const test3Passed =
      !validation.validSources.some(s => s.id === 'smith_unrelated_2') &&
      validation.validSources.some(s => s.id === 'smith_1');

    if (test3Passed) {
      console.log('  [PASS] Test 3: Disambiguated secondary context (Dubai airline), rejected unrelated celebrity news.\n');
    } else {
      console.error('  [FAIL] Test 3 FAILED!\n');
      passedAll = false;
    }
  }

  // TEST CASE 4: UPI charges above ₹2,000 (Nuanced Policy & Clarification)
  {
    const query = 'UPI charges above ₹2,000';
    console.log(`[TEST 4] Query: "${query}"`);
    const intent = classifyQueryIntent(query);

    const mockSources = [
      {
        id: 'upi_1',
        sourceProvider: 'google_news',
        title: 'NPCI clarifies: Regular UPI transactions above ₹2,000 remain completely free for consumers',
        snippet: 'National Payments Corporation of India (NPCI) issued an official notification clarifying that standard person-to-person and merchant UPI payments have zero surcharge. An interchange fee applies only to PPI merchant wallet transactions above ₹2,000.',
        url: 'https://npci.org.in/press/upi-fee-clarification',
        publisher: 'NPCI Official Record',
        publisherDomain: 'npci.org.in',
        entityMatched: true,
        predicateMatched: true,
        directlyAnswers: true
      },
      {
        id: 'upi_2',
        sourceProvider: 'google_news',
        title: 'Explained: The truth behind rumors of fees on UPI transactions above 2000 rupees',
        snippet: 'Financial express analysis confirms standard bank account to bank account UPI transfers remain 100% free.',
        url: 'https://financialexpress.com/upi-rules',
        publisher: 'Financial Express',
        publisherDomain: 'financialexpress.com',
        entityMatched: true,
        predicateMatched: true,
        directlyAnswers: true
      }
    ];

    const report = await synthesizeIntelligenceReport(query, mockSources, DUMMY_DB_MATCH, 100);
    console.log('  -> Verdict Label:', report.aiAssessment.assessmentLabel);
    console.log('  -> Direct Answer:', report.aiAssessment.directAnswer);

    const test4Passed =
      report.aiAssessment.assessmentLabel === 'Mixed evidence' &&
      report.aiAssessment.directAnswer.includes('Partially true');

    if (test4Passed) {
      console.log('  [PASS] Test 4: Financial policy claim accurately classified as Mixed evidence (Partially true / Clarified).\n');
    } else {
      console.error('  [FAIL] Test 4 FAILED!\n');
      passedAll = false;
    }
  }

  // TEST CASE 5: Did Tesla announce layoffs today? (Corporate Layoff Recency & Corroboration)
  {
    const query = 'Did Tesla announce layoffs today?';
    console.log(`[TEST 5] Query: "${query}"`);
    const intent = classifyQueryIntent(query);

    const mockSources = [
      {
        id: 'tesla_1',
        sourceProvider: 'google_news',
        title: 'Tesla announces 10% global workforce reduction in internal memo',
        snippet: 'Tesla CEO sent an email to employees announcing workforce layoffs affecting more than 14,000 staff members across global operations.',
        url: 'https://reuters.com/business/tesla-layoffs',
        publisher: 'Reuters',
        publisherDomain: 'reuters.com',
        publishedAt: new Date().toISOString(),
        entityMatched: true,
        predicateMatched: true,
        directlyAnswers: true
      },
      {
        id: 'tesla_2',
        sourceProvider: 'google_news',
        title: 'Bloomberg: Tesla cutting more than 10 percent of employees amid EV slowdown',
        snippet: 'Tesla is laying off over 10% of its workforce as electric vehicle competition intensifies, according to internal company communications.',
        url: 'https://bloomberg.com/news/articles/tesla-cuts',
        publisher: 'Bloomberg',
        publisherDomain: 'bloomberg.com',
        publishedAt: new Date().toISOString(),
        entityMatched: true,
        predicateMatched: true,
        directlyAnswers: true
      }
    ];

    const report = await synthesizeIntelligenceReport(query, mockSources, DUMMY_DB_MATCH, 100);
    console.log('  -> Verdict Label:', report.aiAssessment.assessmentLabel);
    console.log('  -> Evidence Support Score:', report.aiAssessment.evidenceSupportScore);
    console.log('  -> Direct Answer:', report.aiAssessment.directAnswer);

    const test5Passed =
      (report.aiAssessment.assessmentLabel === 'Supported' || report.aiAssessment.assessmentLabel === 'Likely supported') &&
      report.aiAssessment.evidenceSupportScore !== null &&
      report.aiAssessment.evidenceSupportScore >= 70;

    if (test5Passed) {
      console.log('  [PASS] Test 5: Corporate layoff corroborated across major financial wire reporting.\n');
    } else {
      console.error('  [FAIL] Test 5 FAILED!\n');
      passedAll = false;
    }
  }

  console.log('========================================================================');
  if (passedAll) {
    console.log('  ALL 5 MANDATORY REGRESSION TEST CASES PASSED WITH 100% ACCURACY!    ');
  } else {
    console.log('  REGRESSION FAILURES DETECTED!                                        ');
  }
  console.log('========================================================================\n');

  if (!passedAll) {
    process.exit(1);
  }
}

runRegressionSuite().catch(err => {
  console.error('Suite error:', err);
  process.exit(1);
});
