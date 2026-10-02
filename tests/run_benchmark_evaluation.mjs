import { runBenchmarkEvaluation, demonstrateAssessmentRevision } from '../src/lib/benchmark/evaluator';
import { VERITY_BENCHMARK_DATASET } from '../src/lib/benchmark/dataset';

async function main() {
  console.log('================================================================');
  console.log('VERITY PHASE 6: REAL-WORLD RELIABILITY & BENCHMARK EVALUATION');
  console.log('================================================================\n');

  console.log(`[1/3] Loading Benchmark Dataset (${VERITY_BENCHMARK_DATASET.length} Curated Claims across 6 Epistemological Classes)...`);
  VERITY_BENCHMARK_DATASET.forEach((item, idx) => {
    console.log(`  ${idx + 1}. [${item.category}] "${item.query}" -> Expected: ${item.groundTruthLabel} (${item.expectedScoreMin ?? 'null'}-${item.expectedScoreMax ?? 'null'})`);
  });

  console.log('\n[2/3] Executing Benchmark Evaluation (Testing Fixtures & Live Internet Queries)...');
  // Run IIT Bombay suicide case as live internet query, others as deterministic ground-truth fixtures
  const liveItems = ['bmk_002_iit_bombay_suicide'];
  const startTime = Date.now();
  const report = await runBenchmarkEvaluation({ liveItems });
  const durationMs = Date.now() - startTime;

  console.log(`\nEvaluation completed in ${durationMs}ms.\n`);

  console.log('----------------------------------------------------------------');
  console.log('INDIVIDUAL CLAIM EVALUATION RESULTS');
  console.log('----------------------------------------------------------------');
  report.itemResults.forEach((res, i) => {
    const statusIcon = res.acceptableMatch && !res.isFalsePositive && !res.isUnrelatedLeakage ? '✅' : '❌';
    console.log(`${statusIcon} Claim #${i + 1} [${res.testType.toUpperCase()}]: "${res.query}"`);
    console.log(`   - Entity: "${res.targetEntity}" | Category: ${res.category}`);
    console.log(`   - Expected Label: ${res.expectedLabel} | Actual: ${res.actualLabel} (Match: ${res.labelMatch ? 'EXACT' : res.acceptableMatch ? 'DIRECTIONAL' : 'FAIL'})`);
    console.log(`   - Support Score: ${res.actualScore ?? 'null'} (Expected: ${res.expectedScoreMin ?? 'null'}-${res.expectedScoreMax ?? 'null'} | Score Error: ${res.scoreError ?? 0})`);
    console.log(`   - Audit Trail: ${res.auditTrailPresent ? `Active (${res.auditFactorsCount} factors)` : 'Missing'} | Health: ${res.healthStatus}`);
    console.log(`   - Origins: ${res.independentOriginsCount} | False Positive: ${res.isFalsePositive} | Leakage: ${res.isUnrelatedLeakage}`);
  });

  console.log('\n----------------------------------------------------------------');
  console.log('AGGREGATE BENCHMARK RELIABILITY METRICS');
  console.log('----------------------------------------------------------------');
  console.log(`Total Claims Evaluated:       ${report.totalEvaluated} (${report.liveTestsCount} Live Internet, ${report.fixtureTestsCount} Deterministic Fixtures)`);
  console.log(`Exact Label Accuracy:         ${report.metrics.exactLabelAccuracyPct}%`);
  console.log(`Directional Accuracy:         ${report.metrics.directionalAccuracyPct}%`);
  console.log(`False Positive Rate:          ${report.metrics.falsePositiveRatePct}% (${report.metrics.falsePositiveCount} false positive(s))`);
  console.log(`False Negative Rate:          ${report.metrics.falseNegativeRatePct}% (${report.metrics.falseNegativeCount} false negative(s))`);
  console.log(`Unrelated Content Leakage:    ${report.metrics.unrelatedLeakageRatePct}% (${report.metrics.unrelatedLeakageCount} instance(s))`);
  console.log(`Retrieval Relevance Success:  ${report.metrics.retrievalRelevanceSuccessPct}%`);
  console.log(`Mean Absolute Score Error:    ${report.metrics.meanAbsoluteScoreError ?? 'N/A'} points`);
  console.log(`Audit Trail Coverage:         ${report.metrics.auditTrailCoveragePct}%`);
  console.log(`Revision History Tracking:    ${report.metrics.revisionTrackingCoveragePct}%`);

  console.log('\n----------------------------------------------------------------');
  console.log('PROBABILITY CALIBRATION ANALYSIS & DISCLOSURES');
  console.log('----------------------------------------------------------------');
  console.log(`Empirically Calibrated: ${report.probabilityCalibrationAnalysis.isEmpiricallyCalibrated ? 'YES' : 'NO (Heuristic Evidence Score)'}`);
  console.log(`Sample Size Note:       ${report.probabilityCalibrationAnalysis.sampleSizeSufficiency}`);
  console.log(`Official Disclosure:    ${report.probabilityCalibrationAnalysis.scoreInterpretationDisclosure}`);

  if (report.identifiedFailureCases.length > 0) {
    console.log('\n----------------------------------------------------------------');
    console.log(`IDENTIFIED FAILURE CASES (${report.identifiedFailureCases.length})`);
    console.log('----------------------------------------------------------------');
    report.identifiedFailureCases.forEach((f, idx) => {
      console.log(`[Failure ${idx + 1}] ID: ${f.benchmarkId} | Query: "${f.query}"`);
      console.log(`   Reason: ${f.failureReason}`);
      console.log(`   Mitigation: ${f.recommendedMitigation}`);
    });
  } else {
    console.log('\n✅ Zero critical failure cases detected across the benchmark dataset.');
  }

  console.log('\n[3/3] Testing Dynamic Assessment Revision & Audit Trail Evolution...');
  const revisionDemo = await demonstrateAssessmentRevision('SpaceTech prototype engine test');
  console.log(`  Claim ID: ${revisionDemo.claimId}`);
  console.log(`  Initial State (Single Wire Source):`);
  console.log(`    - Verdict: ${revisionDemo.step1Initial.label} | Score: ${revisionDemo.step1Initial.score}/100 | Origins: ${revisionDemo.step1Initial.origins}`);
  console.log(`  Updated State (+3 Corroborating Primary Outlets & Official Statement):`);
  console.log(`    - Verdict: ${revisionDemo.step2Updated.label} | Score: ${revisionDemo.step2Updated.score}/100 | Origins: ${revisionDemo.step2Updated.origins}`);
  console.log(`  Revision History Trail (${revisionDemo.revisions.length} revision(s)):`);
  revisionDemo.revisions.forEach((rev) => {
    console.log(`    • v${rev.versionNumber} [${rev.triggerEvent}] ${rev.previousScore ?? 'null'} -> ${rev.newScore ?? 'null'} (${rev.newAssessmentLabel}): "${rev.whatChangedRationale}"`);
  });

  // Strict acceptance criteria checks
  let allPass = true;
  if (report.metrics.directionalAccuracyPct < 90) {
    console.error(`❌ Directional accuracy below 90%: got ${report.metrics.directionalAccuracyPct}%`);
    allPass = false;
  }
  if (report.metrics.falsePositiveCount > 0) {
    console.error(`❌ Critical False Positives detected: ${report.metrics.falsePositiveCount}`);
    allPass = false;
  }
  if (report.metrics.unrelatedLeakageCount > 0) {
    console.error(`❌ Unrelated content leakage detected: ${report.metrics.unrelatedLeakageCount}`);
    allPass = false;
  }
  if (revisionDemo.revisions.length < 2) {
    console.error(`❌ Assessment revision did not preserve history (expected >= 2 revisions)`);
    allPass = false;
  }
  if (revisionDemo.step2Updated.score <= revisionDemo.step1Initial.score) {
    console.error(`❌ New corroborating evidence failed to raise score: ${revisionDemo.step1Initial.score} -> ${revisionDemo.step2Updated.score}`);
    allPass = false;
  }

  if (allPass) {
    console.log('\n================================================================');
    console.log('🎉 PHASE 6 BENCHMARK EVALUATION: ALL CRITERIA VERIFIED');
    console.log('================================================================');
    process.exit(0);
  } else {
    console.error('\n❌ Benchmark evaluation failed one or more strict reliability criteria.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error running benchmark evaluation:', err);
  process.exit(1);
});
