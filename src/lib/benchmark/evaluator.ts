import { BenchmarkClaimItem, VERITY_BENCHMARK_DATASET } from './dataset';
import { synthesizeIntelligenceReport } from '../search/intelligenceSynthesizer';
import { compareQueryWithDatabase } from '../search/databaseComparator';
import { searchInternetLive } from '../search/searchProvider';
import { resolveSearchResultsContent } from '../search/contentResolver';
import { SearchResultItem, AssessmentLabel, LiveIntelligenceReport } from '../search/types';
import { repository } from '../db/repository';

export interface EvaluationItemResult {
  benchmarkId: string;
  query: string;
  category: string;
  testType: 'live' | 'fixture';
  targetEntity: string;
  expectedLabel: AssessmentLabel;
  actualLabel: AssessmentLabel;
  labelMatch: boolean;
  acceptableMatch: boolean; // Supported and Likely supported treated as directionally concordant
  expectedScoreMin: number | null;
  expectedScoreMax: number | null;
  actualScore: number | null;
  scoreInExpectedRange: boolean;
  scoreError: number | null;
  isFalsePositive: boolean;
  isFalseNegative: boolean;
  isUnrelatedLeakage: boolean;
  retrievalSuccess: boolean;
  validSourceCount: number;
  independentOriginsCount: number;
  auditTrailPresent: boolean;
  auditFactorsCount: number;
  healthStatus: 'healthy' | 'warning' | 'degraded';
  revisionsCount: number;
  summary: string;
}

export interface BenchmarkAggregateReport {
  timestamp: string;
  totalEvaluated: number;
  liveTestsCount: number;
  fixtureTestsCount: number;
  metrics: {
    exactLabelAccuracyPct: number;
    directionalAccuracyPct: number;
    falsePositiveCount: number;
    falsePositiveRatePct: number;
    falseNegativeCount: number;
    falseNegativeRatePct: number;
    unrelatedLeakageCount: number;
    unrelatedLeakageRatePct: number;
    retrievalRelevanceSuccessPct: number;
    meanAbsoluteScoreError: number | null;
    auditTrailCoveragePct: number;
    revisionTrackingCoveragePct: number;
  };
  probabilityCalibrationAnalysis: {
    isEmpiricallyCalibrated: boolean;
    sampleSizeSufficiency: string;
    brierScoreEstimate: number | null;
    scoreInterpretationDisclosure: string;
  };
  itemResults: EvaluationItemResult[];
  identifiedFailureCases: Array<{
    benchmarkId: string;
    query: string;
    failureReason: string;
    recommendedMitigation: string;
  }>;
}

function toSearchResultItem(item: any, index: number): SearchResultItem {
  return {
    id: item.id || `fixture_src_${index}_${Date.now()}`,
    sourceProvider: item.sourceProvider || 'benchmark_fixture',
    title: item.title,
    url: item.url,
    snippet: item.snippet,
    publisher: item.publisher,
    publisherDomain: item.publisherDomain,
    publishedAt: item.publishedAt,
    isWireSyndicated: item.isWireSyndicated,
    wireService: item.wireService,
    extractedBody: item.extractedBody || item.snippet,
    entityMatched: item.entityMatched,
    predicateMatched: item.predicateMatched,
    directlyAnswers: item.directlyAnswers
  };
}

/**
 * Evaluates a single benchmark claim item against VERITY's intelligence pipeline.
 */
export async function evaluateBenchmarkItem(
  item: BenchmarkClaimItem,
  mode: 'live' | 'fixture'
): Promise<EvaluationItemResult> {
  let sources: SearchResultItem[] = [];

  if (mode === 'live') {
    try {
      const raw = await searchInternetLive(item.query, { maxResults: 12 });
      sources = await resolveSearchResultsContent(raw, 5);
    } catch (e) {
      console.warn(`Live search failed for ${item.query}, fallback to fixture:`, e);
      sources = (item.fixtureSources || []).map((s, idx) => toSearchResultItem(s, idx));
    }
  } else {
    sources = (item.fixtureSources || []).map((s, idx) => toSearchResultItem(s, idx));
  }

  // Database cross-reference
  const topHeadline = sources[0]?.title;
  const primaryUrl = sources[0]?.url;
  const publisher = sources[0]?.publisher;
  const dbMatch = await compareQueryWithDatabase(item.query, topHeadline, primaryUrl, publisher);

  // Run intelligence synthesis
  const report: LiveIntelligenceReport = await synthesizeIntelligenceReport(
    item.query,
    sources,
    dbMatch,
    150
  );

  const actualLabel = report.aiAssessment.assessmentLabel;
  const actualScore = report.aiAssessment.evidenceSupportScore;

  // Label matching
  const labelMatch = actualLabel === item.groundTruthLabel;
  const acceptableMatch =
    labelMatch ||
    (item.groundTruthLabel === 'Supported' && actualLabel === 'Likely supported') ||
    (item.groundTruthLabel === 'Unsupported' && actualLabel === 'Likely unsupported') ||
    (item.groundTruthLabel === 'Insufficient evidence' && actualLabel === 'Likely unsupported');

  // Score range check
  let scoreInExpectedRange = false;
  let scoreError: number | null = null;

  if (item.expectedScoreMin === null && item.expectedScoreMax === null) {
    scoreInExpectedRange = actualScore === null;
    scoreError = actualScore === null ? 0 : Math.abs(actualScore);
  } else if (item.expectedScoreMin !== null && item.expectedScoreMax !== null && actualScore !== null) {
    scoreInExpectedRange = actualScore >= item.expectedScoreMin && actualScore <= item.expectedScoreMax;
    const midpoint = (item.expectedScoreMin + item.expectedScoreMax) / 2;
    scoreError = Math.abs(actualScore - midpoint);
  } else if (actualScore === null && item.expectedScoreMin !== null) {
    scoreInExpectedRange = false;
    scoreError = item.expectedScoreMin;
  }

  // Error condition definitions:
  // 1. False Positive: Ground truth is Unsupported / Insufficient, but actual is Supported / Likely supported
  const isFalsePositive =
    (item.groundTruthLabel === 'Unsupported' || item.groundTruthLabel === 'Insufficient evidence') &&
    (actualLabel === 'Supported' || actualLabel === 'Likely supported');

  // 2. False Negative: Ground truth is Supported / Likely supported, but actual is Unsupported
  const isFalseNegative =
    (item.groundTruthLabel === 'Supported' || item.groundTruthLabel === 'Likely supported') &&
    actualLabel === 'Unsupported';

  // 3. Unrelated content leakage: Query is fictional or uncorroborated, but got positive support score
  const isUnrelatedLeakage =
    item.category === 'fabricated_fictional_trap' &&
    actualScore !== null &&
    actualScore > 20;

  const retrievalSuccess = sources.length > 0;
  const auditTrailPresent = !!report.aiAssessment.auditTrail;
  const auditFactorsCount = report.aiAssessment.auditTrail?.scoringFactors?.length || 0;
  const healthStatus = report.healthMonitoring?.status || 'degraded';
  const revisions = report.aiAssessment.revisionHistory || [];

  return {
    benchmarkId: item.id,
    query: item.query,
    category: item.category,
    testType: mode,
    targetEntity: item.targetEntity,
    expectedLabel: item.groundTruthLabel,
    actualLabel,
    labelMatch,
    acceptableMatch,
    expectedScoreMin: item.expectedScoreMin,
    expectedScoreMax: item.expectedScoreMax,
    actualScore,
    scoreInExpectedRange,
    scoreError,
    isFalsePositive,
    isFalseNegative,
    isUnrelatedLeakage,
    retrievalSuccess,
    validSourceCount: report.aiAssessment.sourceCount,
    independentOriginsCount: report.aiAssessment.independentSourceCount,
    auditTrailPresent,
    auditFactorsCount,
    healthStatus,
    revisionsCount: revisions.length,
    summary: `Label: ${actualLabel} (Expected: ${item.groundTruthLabel}) | Score: ${actualScore ?? 'null'} (Expected: ${item.expectedScoreMin ?? 'null'}-${item.expectedScoreMax ?? 'null'})`
  };
}

/**
 * Runs the benchmark evaluation harness across all claims in the dataset.
 */
export async function runBenchmarkEvaluation(options: {
  liveItems?: string[]; // IDs to run live
  dataset?: BenchmarkClaimItem[];
} = {}): Promise<BenchmarkAggregateReport> {
  const items = options.dataset || VERITY_BENCHMARK_DATASET;
  const liveSet = new Set(options.liveItems || []);

  const results: EvaluationItemResult[] = [];
  let liveCount = 0;
  let fixtureCount = 0;

  for (const item of items) {
    const isLive = liveSet.has(item.id);
    if (isLive) liveCount++;
    else fixtureCount++;

    const res = await evaluateBenchmarkItem(item, isLive ? 'live' : 'fixture');
    results.push(res);
  }

  // Aggregate metrics
  const total = results.length;
  const exactMatches = results.filter((r) => r.labelMatch).length;
  const acceptableMatches = results.filter((r) => r.acceptableMatch).length;
  const falsePositives = results.filter((r) => r.isFalsePositive).length;
  const falseNegatives = results.filter((r) => r.isFalseNegative).length;
  const unrelatedLeakages = results.filter((r) => r.isUnrelatedLeakage).length;
  const retrievalSuccesses = results.filter((r) => r.retrievalSuccess).length;
  const auditTrailSuccesses = results.filter((r) => r.auditTrailPresent).length;
  const revisionSuccesses = results.filter((r) => r.revisionsCount > 0).length;

  const validScoreErrors = results.map((r) => r.scoreError).filter((e): e is number => e !== null);
  const meanScoreError =
    validScoreErrors.length > 0
      ? Math.round((validScoreErrors.reduce((a, b) => a + b, 0) / validScoreErrors.length) * 10) / 10
      : null;

  // Identify specific failure cases
  const failures: BenchmarkAggregateReport['identifiedFailureCases'] = [];
  results.forEach((r) => {
    if (!r.acceptableMatch) {
      failures.push({
        benchmarkId: r.benchmarkId,
        query: r.query,
        failureReason: `Assessment label mismatch: Got "${r.actualLabel}", expected "${r.expectedLabel}".`,
        recommendedMitigation: 'Tune intent predicate classification or discrepancy thresholds.'
      });
    }
    if (r.isFalsePositive) {
      failures.push({
        benchmarkId: r.benchmarkId,
        query: r.query,
        failureReason: `Critical False Positive: Debunked or uncorroborated claim marked "${r.actualLabel}".`,
        recommendedMitigation: 'Tighten relevance gating to prevent non-verifying sources from reaching scoring stage.'
      });
    }
    if (r.isUnrelatedLeakage) {
      failures.push({
        benchmarkId: r.benchmarkId,
        query: r.query,
        failureReason: `Unrelated content leakage: Fictional query produced score ${r.actualScore}.`,
        recommendedMitigation: 'Enforce null score suppression whenever predicate matching fails.'
      });
    }
  });

  return {
    timestamp: new Date().toISOString(),
    totalEvaluated: total,
    liveTestsCount: liveCount,
    fixtureTestsCount: fixtureCount,
    metrics: {
      exactLabelAccuracyPct: Math.round((exactMatches / total) * 100),
      directionalAccuracyPct: Math.round((acceptableMatches / total) * 100),
      falsePositiveCount: falsePositives,
      falsePositiveRatePct: Math.round((falsePositives / total) * 100),
      falseNegativeCount: falseNegatives,
      falseNegativeRatePct: Math.round((falseNegatives / total) * 100),
      unrelatedLeakageCount: unrelatedLeakages,
      unrelatedLeakageRatePct: Math.round((unrelatedLeakages / total) * 100),
      retrievalRelevanceSuccessPct: Math.round((retrievalSuccesses / total) * 100),
      meanAbsoluteScoreError: meanScoreError,
      auditTrailCoveragePct: Math.round((auditTrailSuccesses / total) * 100),
      revisionTrackingCoveragePct: Math.round((revisionSuccesses / total) * 100)
    },
    probabilityCalibrationAnalysis: {
      isEmpiricallyCalibrated: false,
      sampleSizeSufficiency: `Benchmark sample (N=${total}) provides deterministic heuristic validation across representative classes, but is insufficient for frequentist empirical probability calibration (which requires N >= 5,000 ground-truth outcomes).`,
      brierScoreEstimate: null,
      scoreInterpretationDisclosure:
        'DISCLOSURE: The Evidence Support Score (0–100) is a deterministic heuristic index measuring multi-source consensus, primary authority documentation, and publication diversity. It DOES NOT represent a frequentist or Bayesian posterior probability of ontological truth. Users must not interpret an 85/100 score as an "85% statistical probability that the claim is true".'
    },
    itemResults: results,
    identifiedFailureCases: failures
  };
}

/**
 * Demonstrates an assessment dynamically changing and generating a transparent revision
 * when new independent evidence is introduced.
 */
export async function demonstrateAssessmentRevision(query: string = 'SpaceTech engine test'): Promise<{
  claimId: string;
  step1Initial: { score: number | null; label: AssessmentLabel; origins: number };
  step2Updated: { score: number | null; label: AssessmentLabel; origins: number };
  revisions: any[];
}> {
  const claimId = `demo_rev_${Date.now()}`;

  // Step 1: Initial single wire source
  const initialSources: SearchResultItem[] = [
    toSearchResultItem({
      title: 'SpaceTech conducts preliminary engine test in Mojave desert',
      url: 'https://wirenews.com/spacetech-test',
      snippet: 'SpaceTech reportedly conducted a static fire test according to a wire report.',
      publisher: 'WireNews',
      publisherDomain: 'wirenews.com',
      isWireSyndicated: true,
      wireService: 'PTI',
      entityMatched: true,
      predicateMatched: true,
      directlyAnswers: true
    }, 1)
  ];

  const dbMatch = await compareQueryWithDatabase(query);
  const report1 = await synthesizeIntelligenceReport(query, initialSources, dbMatch, 50);

  // Step 2: New corroborating sources + official company statement arrive
  const updatedSources: SearchResultItem[] = [
    ...initialSources,
    toSearchResultItem({
      title: 'SpaceTech officially confirms successful full-duration engine burn',
      url: 'https://spacetech.com/press/engine-success',
      snippet: 'Official press release: SpaceTech engineering team completed a 120-second hot fire test with nominal telemetry.',
      publisher: 'SpaceTech Official',
      publisherDomain: 'spacetech.com',
      publishedAt: new Date().toISOString(),
      entityMatched: true,
      predicateMatched: true,
      directlyAnswers: true
    }, 2),
    toSearchResultItem({
      title: 'Aviation Week analyzes SpaceTech static fire video and telemetry',
      url: 'https://aviationweek.com/space/spacetech-engine',
      snippet: 'Independent aerospace analysts verify video footage and thrust data from Mojave test site.',
      publisher: 'Aviation Week',
      publisherDomain: 'aviationweek.com',
      publishedAt: new Date().toISOString(),
      entityMatched: true,
      predicateMatched: true,
      directlyAnswers: true
    }, 3),
    toSearchResultItem({
      title: 'Reuters: SpaceTech hits propulsion milestone ahead of orbital flight',
      url: 'https://reuters.com/aerospace/spacetech-milestone',
      snippet: 'SpaceTech completed key qualification fire for its reusable engine, confirmed by FAA launch license monitors.',
      publisher: 'Reuters',
      publisherDomain: 'reuters.com',
      publishedAt: new Date().toISOString(),
      entityMatched: true,
      predicateMatched: true,
      directlyAnswers: true
    }, 4)
  ];

  const report2 = await synthesizeIntelligenceReport(query, updatedSources, dbMatch, 60);

  return {
    claimId,
    step1Initial: {
      score: report1.aiAssessment.evidenceSupportScore,
      label: report1.aiAssessment.assessmentLabel,
      origins: report1.aiAssessment.independentSourceCount
    },
    step2Updated: {
      score: report2.aiAssessment.evidenceSupportScore,
      label: report2.aiAssessment.assessmentLabel,
      origins: report2.aiAssessment.independentSourceCount
    },
    revisions: report2.aiAssessment.revisionHistory || []
  };
}
