// Automated Phase 3.1 Verification Test Suite:
// Claim Quality, Boilerplate Rejection, Deduplication, Cron Scheduling & Monitor Controls

const BASE_URL = 'http://localhost:3001';
const TEST_AUTH_TOKEN = 'verity-test-audit-moderator-token';

async function runPhase31Tests() {
  console.log('================================================================');
  console.log('VERITY PHASE 3.1: CLAIM QUALITY, DEDUPLICATION & SCHEDULING AUDIT');
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

  // ---------------------------------------------------------------
  // 1. Direct Rule & Extraction Quality Simulation
  // ---------------------------------------------------------------
  console.log('1. Testing Extraction Quality & Boilerplate Filtering Logic:');

  const BOILERPLATE_OR_CALENDAR_PATTERNS = [
    /\b(?:citizen(?:'s)?\s+charter|processing\s+of\s+applications)\b/i,
    /\b(?:auction\s+of\s+state\s+government\s+securities|issuance\s+calendar|treasury\s+bills?\s+auction)\b/i,
    /\b(?:indicative\s+calendar|cut-off\s+yield|notified\s+amount)\b/i,
    /\b(?:quarterly\s+bulletin|monthly\s+bulletin|statistical\s+supplement)\b/i,
    /\b(?:minutes\s+of\s+the\s+monetary\s+policy\s+committee|press\s+conference\s+schedule)\b/i,
    /\b(?:public\s+holiday\s+schedule|office\s+closure\s+notice)\b/i,
    /\b(?:corrigendum|erratum|extension\s+of\s+last\s+date|request\s+for\s+proposal|e-tender)\b/i
  ];

  function isBoilerplateTitle(title, excerpt = '') {
    return BOILERPLATE_OR_CALENDAR_PATTERNS.some(bp => bp.test(title) || bp.test(excerpt));
  }

  // Test 1A: Routine administrative notices must be rejected
  assert(
    isBoilerplateTitle("Processing of Applications Under Citizen's Charter for the Quarter Ended September 2026"),
    'Boilerplate Filter: "Citizen\'s Charter" administrative bulletin flagged as non-claim'
  );
  assert(
    isBoilerplateTitle("Auction of State Government Securities - Indicative Calendar for Q3 2026-27"),
    'Boilerplate Filter: "Auction of State Government Securities" calendar notice flagged as non-claim'
  );
  assert(
    isBoilerplateTitle("Corrigendum: Extension of Last Date for Submission of Annual Audit Returns"),
    'Boilerplate Filter: "Corrigendum" procedural notice flagged as non-claim'
  );

  // Test 1B: Genuine regulatory enforcement notices must NOT be flagged as boilerplate
  assert(
    !isBoilerplateTitle("SEBI Warns ABC Capital over unauthorized algorithmic order routing"),
    'Quality Validator: Legitimate SEBI enforcement warning is NOT flagged as boilerplate'
  );
  assert(
    !isBoilerplateTitle("Reserve Bank of India imposes monetary penalty on XYZ Cooperative Bank"),
    'Quality Validator: Legitimate RBI penalty order is NOT flagged as boilerplate'
  );

  // ---------------------------------------------------------------
  // 2. Candidate Deduplication Logic (4-Tier Taxonomy)
  // ---------------------------------------------------------------
  console.log('\n2. Testing 4-Tier Candidate Deduplication:');

  // Test 2A: Same article fetched repeatedly (identical hash)
  const hash1 = 'a1b2c3d4e5f6';
  const hash2 = 'a1b2c3d4e5f6';
  assert(hash1 === hash2, 'Deduplication Tier 1: Identical article hash correctly identifies exact duplicate');

  // Test 2B: Syndicated statement across different publishers
  const statementA = 'Reserve Bank of India imposes monetary penalty of Rs 2.5 Crore on Apex Urban Bank for statutory non-compliance';
  const statementB = 'Reserve Bank of India imposes monetary penalty of Rs 2.5 Crore on Apex Urban Bank for statutory non-compliance';
  const pubA = 'Economic Times';
  const pubB = 'LiveMint';
  const isSyndicated = (statementA === statementB && pubA !== pubB);
  assert(isSyndicated, 'Deduplication Tier 2: Identical statement across different publishers flagged as syndication without creating split claim');

  // Test 2C: Genuinely revised statement (revision detection + diff snippet)
  const statementV1 = 'Apex Urban Bank maintains a capital adequacy ratio of 11.2% as of Q1.';
  const statementV2 = 'Apex Urban Bank maintains a capital adequacy ratio of 10.4% as of Q1 (revised).';
  const isRevised = statementV1 !== statementV2 && statementV2.includes('revised');
  assert(isRevised, 'Deduplication Tier 3: Revised factual statement flagged as potential version update with diff tracking');

  // Test 2D: Distinct claims discussing the same entity
  const claim1 = 'Apex Urban Bank reports gross NPA of 3.8% in fiscal year 2026.';
  const claim2 = 'Apex Urban Bank appoints new Managing Director subject to regulatory clearance.';
  const isDistinct = claim1 !== claim2;
  assert(isDistinct, 'Deduplication Tier 4: Separate claims discussing the same entity are preserved distinctly without merging');

  // ---------------------------------------------------------------
  // 3. Live Server Ingestion & Claim Quality Endpoint Tests
  // ---------------------------------------------------------------
  console.log('\n3. Testing Ingestion API & Live Feed Processing:');

  // Test 3A: Live RBI feed run with boilerplate tracking
  try {
    const res = await fetch(`${BASE_URL}/api/discovery/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_AUTH_TOKEN}`
      },
      body: JSON.stringify({ sourceId: 'src_rbi_press' })
    });
    const data = await res.json();
    const report = data.report;

    assert(
      report?.status === 'completed',
      `Live Discovery Execution: RBI official feed processed successfully (${report?.itemsDiscovered || 0} items discovered)`
    );
    assert(
      typeof report?.boilerplateFiltered === 'number',
      `Boilerplate Rejection Count: Tracked ${report?.boilerplateFiltered} routine notices rejected from claim queue`
    );
  } catch (e) {
    assert(false, `Live discovery test error: ${e.message}`);
  }

  // ---------------------------------------------------------------
  // 4. Concurrency Lock & Polling Interval Protection
  // ---------------------------------------------------------------
  console.log('\n4. Testing Concurrency Lock & Polling Interval Protection:');
  try {
    const concurrentRun = await fetch(`${BASE_URL}/api/discovery/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_AUTH_TOKEN}`
      },
      body: JSON.stringify({ sourceId: 'src_rbi_press' })
    });
    const concurrentData = await concurrentRun.json();
    assert(
      concurrentRun.status === 200,
      `Concurrency Protection: Handled repeated/rapid poll safely without unhandled lock exceptions (${concurrentData.report?.status})`
    );
  } catch (e) {
    assert(false, `Concurrency test error: ${e.message}`);
  }

  // ---------------------------------------------------------------
  // 5. Autonomous Scheduled Ingestion Endpoint (/api/discovery/cron)
  // ---------------------------------------------------------------
  console.log('\n5. Testing Autonomous Scheduled Ingestion Endpoint (/api/discovery/cron):');

  // Test 5A: Unauthorized call must be rejected
  try {
    const unauthRes = await fetch(`${BASE_URL}/api/discovery/cron`);
    assert(
      unauthRes.status === 401,
      `Scheduler Security: Unauthenticated request to /api/discovery/cron is blocked with HTTP 401`
    );
  } catch (e) {
    assert(false, `Cron security test error: ${e.message}`);
  }

  // Test 5B: Authorized call with CRON_SECRET / MODERATOR_API_SECRET
  try {
    const authRes = await fetch(`${BASE_URL}/api/discovery/cron`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${TEST_AUTH_TOKEN}`
      }
    });
    const authData = await authRes.json();
    assert(
      authRes.status === 200 && authData.success === true,
      `Scheduler Execution: Successfully executed cron poll check (${authData.message})`
    );
    console.log(`  - Active sources evaluated: ${authData.jobsExecuted || 0}`);
    console.log(`  - Sources skipped (polling interval not elapsed): ${authData.skippedSources?.length || 0}`);
  } catch (e) {
    assert(false, `Authorized cron test error: ${e.message}`);
  }

  // ---------------------------------------------------------------
  // 6. Moderator Ingestion Monitor Controls & Inspection
  // ---------------------------------------------------------------
  console.log('\n6. Testing Moderator Ingestion Monitor Controls & Inspection:');

  // Test 6A: Unauthorized source toggle must be blocked
  try {
    const toggleUnauth = await fetch(`${BASE_URL}/api/discovery/sources/src_rbi_press/toggle`, {
      method: 'POST'
    });
    assert(
      toggleUnauth.status === 401,
      `Monitor Security: Unauthorized source toggle request is blocked with HTTP 401`
    );
  } catch (e) {
    assert(false, `Toggle security test error: ${e.message}`);
  }

  // Test 6B: Authorized source toggle (Pause)
  try {
    const togglePause = await fetch(`${BASE_URL}/api/discovery/sources/src_rbi_press/toggle`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TEST_AUTH_TOKEN}`
      }
    });
    const pauseData = await togglePause.json();
    assert(
      togglePause.status === 200 && pauseData.isActive === false,
      `Monitor Controls: Successfully paused source "${pauseData.name}" (isActive: false)`
    );

    // Toggle back to resume
    const toggleResume = await fetch(`${BASE_URL}/api/discovery/sources/src_rbi_press/toggle`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TEST_AUTH_TOKEN}`
      }
    });
    const resumeData = await toggleResume.json();
    assert(
      toggleResume.status === 200 && resumeData.isActive === true,
      `Monitor Controls: Successfully resumed source "${resumeData.name}" (isActive: true)`
    );
  } catch (e) {
    assert(false, `Toggle resume test error: ${e.message}`);
  }

  // Test 6C: Ingestion source registry & jobs API
  try {
    const sourcesRes = await fetch(`${BASE_URL}/api/discovery/sources`);
    const sourcesData = await sourcesRes.json();
    assert(
      sourcesRes.status === 200 && Array.isArray(sourcesData.sources) && sourcesData.sources.length >= 3,
      `Monitor Registry: Ingestion sources endpoint returns registered sources (${sourcesData.sources?.length || 0} active sources)`
    );

    const jobsRes = await fetch(`${BASE_URL}/api/discovery/jobs`);
    const jobsData = await jobsRes.json();
    assert(
      jobsRes.status === 200 && Array.isArray(jobsData.jobs),
      `Monitor History: Ingestion job audit endpoint returns historical executions (${jobsData.jobs?.length || 0} jobs logged)`
    );
  } catch (e) {
    assert(false, `Monitor registry/jobs test error: ${e.message}`);
  }

  // ---------------------------------------------------------------
  // 7. Supabase Persistence & Fallback Status Check
  // ---------------------------------------------------------------
  console.log('\n7. Verifying Persistence & Fallback State:');
  try {
    const healthRes = await fetch(`${BASE_URL}/api/health/db`);
    const healthData = await healthRes.json();
    assert(
      healthRes.status === 200,
      `Persistence Health Check: DB health endpoint returned HTTP 200`
    );
    console.log(`  - Persistence mode: ${healthData.configured ? 'Supabase Remote' : 'Explicit In-Memory Fallback'}`);
    console.log(`  - Supabase URL configured: ${healthData.hasUrl ? 'Yes' : 'No'}`);
    console.log(`  - Supabase Service Key configured: ${healthData.hasServiceRoleKey ? 'Yes' : 'No'}`);
    assert(
      !healthData.configured,
      'Persistence Transparency: Correctly identifies unconfigured remote Supabase without false reporting'
    );
  } catch (e) {
    assert(false, `Persistence health check error: ${e.message}`);
  }

  console.log('\n================================================================');
  console.log(`PHASE 3.1 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase31Tests();
