// Regression and Grounding Test Suite for VERITY Query Relevance & Answer Grounding
import { classifyQueryIntent } from '../src/lib/search/intentClassifier.ts';
import { validateAndRankEvidence, validateSourceAgainstIntent } from '../src/lib/search/queryEvidenceValidator.ts';
import { synthesizeIntelligenceReport } from '../src/lib/search/intelligenceSynthesizer.ts';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function runTests() {
  console.log('================================================================');
  console.log('VERITY QUERY RELEVANCE & ANSWER-GROUNDING REGRESSION SUITE');
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

  // -------------------------------------------------------------------------
  // 1. Query Intent Classification
  // -------------------------------------------------------------------------
  console.log('1. Testing Query Intent Classification & Target Extraction...');

  const intent1 = classifyQueryIntent('Is Donald Trump, president of US dead?');
  assert(intent1.intentType === 'person_status', 'Classifies Trump query as person_status question');
  assert(intent1.targetEntity.toLowerCase().includes('donald trump'), `Extracts target entity "Donald Trump": got "${intent1.targetEntity}"`);
  assert(intent1.predicate.includes('dead / alive'), 'Identifies dead/alive predicate');
  assert(intent1.canonicalClaim === 'Donald Trump is dead', `Formulates canonical claim "Donald Trump is dead": got "${intent1.canonicalClaim}"`);

  const intent2 = classifyQueryIntent('Smith Dubai airline incident');
  assert(intent2.intentType === 'incident_search', 'Classifies as incident_search');
  assert(intent2.targetEntity === 'Smith', `Identifies primary anchor "Smith": got "${intent2.targetEntity}"`);
  assert(intent2.secondaryEntities.includes('Dubai') && intent2.secondaryEntities.includes('airline'), 'Extracts secondary contextual entities Dubai & airline');

  const intent3 = classifyQueryIntent('UPI charges above ₹2,000');
  assert(intent3.intentType === 'general_research', 'Classifies UPI charges as general_research');
  assert(intent3.targetEntity === 'UPI', 'Identifies UPI entity');
  assert(intent3.canonicalClaim.includes('2,000'), 'Identifies threshold in canonical claim');

  const intent4 = classifyQueryIntent('Did Tesla announce layoffs today?');
  assert(intent4.intentType === 'company_organization', 'Classifies as company_organization');
  assert(intent4.targetEntity === 'Tesla', 'Identifies Tesla as entity');
  assert(intent4.requiresRecency === true, 'Flags recency requirement for "today"');

  const intent5 = classifyQueryIntent('fictional Atlantis submarine collision incident 998877');
  assert(intent5.intentType === 'incident_search', 'Classifies fictional incident search');

  // -------------------------------------------------------------------------
  // 2. Negative Relevance Test: Articles mention entity but NOT the question
  // -------------------------------------------------------------------------
  console.log('\n2. Negative Test: Deliberately Irrelevant Articles Mentioning Entity...');

  // User asks: "Is Donald Trump dead?"
  // Search provider returns articles about Trump talking about Iran, golf, and taxes.
  const irrelevantTrumpArticles = [
    {
      id: 'irr_1',
      title: "Trump claims fallen soldiers said 'we cannot let Iran have a nuclear weapon' - ABC News",
      snippet: "Former President Donald Trump delivered remarks on foreign policy and national defense.",
      publisher: 'ABC News',
      url: 'https://abcnews.com/politics/trump-iran-speech',
      sourceProvider: 'google_news'
    },
    {
      id: 'irr_2',
      title: "Donald Trump tees off at new golf resort opening in Florida",
      snippet: "The former president spent Saturday hosting tournament participants and greeting club members.",
      publisher: 'Palm Beach Post',
      url: 'https://palmbeachpost.com/golf-resort',
      sourceProvider: 'google_news'
    },
    {
      id: 'irr_3',
      title: "Trump proposes new corporate tax deductions in economic manifesto",
      snippet: "Speaking to business executives, Donald Trump outlined economic policies and tariff reductions.",
      publisher: 'Wall Street Journal',
      url: 'https://wsj.com/trump-tax-plan',
      sourceProvider: 'google_news'
    }
  ];

  const validationTrump = validateAndRankEvidence(irrelevantTrumpArticles, intent1);
  assert(validationTrump.validSourcesCount === 0, `All ${irrelevantTrumpArticles.length} irrelevant Trump articles rejected (valid count: 0)`);
  assert(validationTrump.validations.every(v => v.sharesOnlyKeywords), 'All articles correctly flagged as sharing only keywords without evidentiary relevance');

  const reportTrumpIrr = await synthesizeIntelligenceReport(
    'Is Donald Trump, president of US dead?',
    irrelevantTrumpArticles,
    { isNewIncident: true, matchedClaims: [], comparisonNotes: '' },
    100
  );

  assert(reportTrumpIrr.aiAssessment.assessmentLabel === 'Insufficient evidence', `Assessment label is "Insufficient evidence" (not hallucinated): got "${reportTrumpIrr.aiAssessment.assessmentLabel}"`);
  assert(reportTrumpIrr.aiAssessment.directAnswer.toLowerCase().includes('insufficient evidence'), 'Direct answer states insufficient relevant evidence');
  assert(reportTrumpIrr.claimPoll.claimStatement === 'Donald Trump is dead', `Poll statement remains canonical claim "Donald Trump is dead": got "${reportTrumpIrr.claimPoll.claimStatement}"`);
  assert(!reportTrumpIrr.claimPoll.claimStatement.includes('fallen soldiers'), 'Poll statement was NOT hijacked by irrelevant ABC News headline');

  // -------------------------------------------------------------------------
  // 3. Negative Relevance Test: Metaphorical usage of "dead"
  // -------------------------------------------------------------------------
  console.log('\n3. Negative Test: Metaphorical Idiom Usage (e.g. "dead cat", "movement dead")...');

  const metaphoricalArticle = {
    id: 'met_1',
    title: "Donald Trump's Irish unity remarks a dead cat strategy, says DUP leader",
    snippet: "DUP leader Gavin Robinson dismissed Donald Trump's comments as a classic dead cat distraction technique.",
    publisher: 'BBC News',
    url: 'https://bbc.com/news/dead-cat-strategy',
    sourceProvider: 'google_news'
  };

  const valMeta = validateSourceAgainstIntent(metaphoricalArticle, intent1);
  assert(valMeta.isValid === false, 'Metaphorical "dead cat" article is rejected as evidence of human death');
  assert(valMeta.relevanceRationale.toLowerCase().includes('metaphorical'), 'Rationale explicitly notes metaphorical usage');

  // -------------------------------------------------------------------------
  // 4. Ambiguous Names & Unrelated Incidents Test
  // -------------------------------------------------------------------------
  console.log('\n4. Negative Test: Ambiguous Names & Unrelated Incidents...');

  // User query: "Smith Dubai airline incident"
  // Unrelated articles mentioning a different "Smith" or unrelated airline:
  const ambiguousArticles = [
    {
      id: 'amb_1',
      title: "Alberta Premier Danielle Smith defends private flight in Saudi Arabia",
      snippet: "Premier Smith defended taking a flight organized through third-party arrangements in Riyadh.",
      publisher: 'Toronto Star',
      url: 'https://thestar.com/smith-saudi-flight',
      sourceProvider: 'duckduckgo'
    },
    {
      id: 'amb_2',
      title: "Will Smith attends Dubai International Film Festival gala",
      snippet: "Hollywood actor Will Smith arrived in Dubai for the premiere event at Madinat Jumeirah.",
      publisher: 'Gulf News',
      url: 'https://gulfnews.com/will-smith-dubai',
      sourceProvider: 'duckduckgo'
    }
  ];

  const validationAmb = validateAndRankEvidence(ambiguousArticles, intent2);
  assert(validationAmb.validSourcesCount === 0, 'Ambiguous Smith articles without Dubai airline incident context are rejected');

  const reportAmb = await synthesizeIntelligenceReport(
    'Smith Dubai airline incident',
    ambiguousArticles,
    { isNewIncident: true, matchedClaims: [], comparisonNotes: '' },
    100
  );
  assert(reportAmb.aiAssessment.directAnswer.toLowerCase().includes('insufficient evidence'), 'Direct answer explains lack of sufficient evidence');

  // -------------------------------------------------------------------------
  // 5. Breaking News with Outdated Articles Test
  // -------------------------------------------------------------------------
  console.log('\n5. Negative Test: Outdated Articles on Breaking News / Today Query...');

  const outdatedArticle = {
    id: 'outdated_1',
    title: "Tesla lays off 9% of workforce in company restructuring",
    snippet: "Elon Musk sent an email announcing layoffs across salaried positions.",
    publisher: 'CNBC',
    url: 'https://cnbc.com/tesla-layoffs-2018',
    publishedAt: '2018-06-12T10:00:00Z', // 8 years old!
    sourceProvider: 'google_news'
  };

  const valOutdated = validateSourceAgainstIntent(outdatedArticle, intent4);
  assert(valOutdated.recentEnough === false, 'Detects 2018 article is NOT recent enough for "layoffs today" query');

  // -------------------------------------------------------------------------
  // 6. Positive Grounding Test: "Is Donald Trump, president of US dead?"
  // -------------------------------------------------------------------------
  console.log('\n6. Positive Test: "Is Donald Trump, president of US dead?"...');

  const resTrump = await fetch(`${BASE_URL}/api/search/live?q=${encodeURIComponent('Is Donald Trump, president of US dead?')}`);
  assert(resTrump.status === 200, 'Live search API returns 200');
  const dataTrump = await resTrump.json();
  const repTrump = dataTrump.report;
  const aiTrump = repTrump.aiAssessment;

  console.log(`  Canonical Poll Claim: "${repTrump.claimPoll.claimStatement}"`);
  console.log(`  Assessment Label: ${aiTrump.assessmentLabel}`);
  console.log(`  Evidence Support Score: ${aiTrump.evidenceSupportScore}`);
  console.log(`  Direct Answer: "${aiTrump.directAnswer}"`);

  assert(repTrump.claimPoll.claimStatement === 'Donald Trump is dead', `Poll is strictly bound to canonical question claim: got "${repTrump.claimPoll.claimStatement}"`);
  assert(aiTrump.directAnswer.toLowerCase().startsWith('no. donald trump is not dead') || aiTrump.directAnswer.includes('Could not find sufficient relevant evidence'), 'Direct answer directly answers the death question');
  assert(aiTrump.assessmentLabel === 'Unsupported' || aiTrump.assessmentLabel === 'Insufficient evidence', `Assessment reflects empirical evidence (Unsupported / Insufficient): got "${aiTrump.assessmentLabel}"`);
  assert(!aiTrump.directAnswer.includes('fallen soldiers'), 'Direct answer has no mention of fallen soldiers');

  // -------------------------------------------------------------------------
  // 7. Positive Grounding Test: "Smith Dubai airline incident"
  // -------------------------------------------------------------------------
  console.log('\n7. Positive Test: "Smith Dubai airline incident"...');

  const resSmith = await fetch(`${BASE_URL}/api/search/live?q=${encodeURIComponent('Smith Dubai airline incident')}`);
  assert(resSmith.status === 200, 'Smith Dubai query returns status 200');
  const dataSmith = await resSmith.json();
  const repSmith = dataSmith.report;
  const aiSmith = repSmith.aiAssessment;

  console.log(`  Canonical Poll Claim: "${repSmith.claimPoll.claimStatement}"`);
  console.log(`  Assessment Label: ${aiSmith.assessmentLabel}`);
  console.log(`  Top Source: ${repSmith.sources[0]?.title}`);

  assert(repSmith.claimPoll.claimStatement === 'Smith Dubai airline incident occurred as described', 'Poll is bound to investigated incident assertion');
  assert(
    repSmith.sources.every(s => !s.title.toLowerCase().includes('alberta') && !s.title.toLowerCase().includes('danielle smith')),
    'Unrelated Canadian Danielle Smith articles were strictly filtered out'
  );

  // -------------------------------------------------------------------------
  // 8. Positive Grounding Test: "UPI charges above ₹2,000"
  // -------------------------------------------------------------------------
  console.log('\n8. Positive Test: "UPI charges above ₹2,000"...');

  const resUPI = await fetch(`${BASE_URL}/api/search/live?q=${encodeURIComponent('UPI charges above ₹2,000')}`);
  assert(resUPI.status === 200, 'UPI search returns status 200');
  const dataUPI = await resUPI.json();
  const repUPI = dataUPI.report;
  const aiUPI = repUPI.aiAssessment;

  console.log(`  Assessment Label: ${aiUPI.assessmentLabel}`);
  console.log(`  Evidence Support Score: ${aiUPI.evidenceSupportScore}`);
  console.log(`  Direct Answer: "${aiUPI.directAnswer}"`);

  assert(aiUPI.assessmentLabel === 'Mixed evidence' || aiUPI.assessmentLabel === 'Supported', 'Accurately assesses nuanced UPI interchange charge');
  assert(aiUPI.directAnswer.toLowerCase().includes('free') && (aiUPI.directAnswer.toLowerCase().includes('merchant') || aiUPI.directAnswer.toLowerCase().includes('interchange')), 'Direct answer clarifies that consumer P2P UPI is free while merchant interchange applies');
  assert(typeof aiUPI.evidenceSupportScore === 'number' && aiUPI.evidenceSupportScore > 0, `Valid evidence support score calculated: ${aiUPI.evidenceSupportScore}`);

  // -------------------------------------------------------------------------
  // 9. Fictional Incident Test (Zero Matching Sources)
  // -------------------------------------------------------------------------
  console.log('\n9. Positive Test: Fictional Incident with No Matching Sources...');

  const resFictional = await fetch(`${BASE_URL}/api/search/live?q=${encodeURIComponent('fictional Atlantis submarine collision incident 998877')}`);
  assert(resFictional.status === 200, 'Fictional search returns status 200');
  const dataFictional = await resFictional.json();
  const aiFictional = dataFictional.report.aiAssessment;

  console.log(`  Assessment Label: ${aiFictional.assessmentLabel}`);
  console.log(`  Evidence Support Score: ${aiFictional.evidenceSupportScore}`);
  console.log(`  Direct Answer: "${aiFictional.directAnswer}"`);

  assert(aiFictional.directAnswer.toLowerCase().includes('insufficient evidence'), 'Direct answer states insufficient evidence');

  console.log('\n================================================================');
  console.log(`REGRESSION SUITE FINISHED: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
