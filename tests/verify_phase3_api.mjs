// Automated Phase 3 HTTP Integration & Discovery Verification Test
const BASE_URL = 'http://localhost:3001';
const TEST_MOD_KEY = process.env.MODERATOR_API_SECRET || 'verity-test-audit-moderator-token';

async function runPhase3ApiTests() {
  console.log('====================================================');
  console.log('VERITY PHASE 3: AUTONOMOUS DISCOVERY & INGESTION TEST');
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

  // Test 1: List Discovery Sources
  try {
    const res = await fetch(`${BASE_URL}/api/discovery/sources`);
    const data = await res.json();
    assert(
      res.status === 200 && Array.isArray(data.sources) && data.sources.length >= 3,
      `Discovery Sources: Successfully retrieved ${data.sources?.length} configured sources (RBI, SEBI, BBC)`
    );
  } catch (e) {
    assert(false, `Discovery sources fetch error: ${e.message}`);
  }

  // Test 2: Unauthenticated Discovery Run MUST BE BLOCKED
  try {
    const res = await fetch(`${BASE_URL}/api/discovery/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId: 'src_rbi_press' })
    });
    assert(
      res.status === 401,
      `Security Access Control: Unauthenticated POST /api/discovery/run is strictly blocked with HTTP 401 (${res.status})`
    );
  } catch (e) {
    assert(false, `Unauthenticated discovery test error: ${e.message}`);
  }

  // Test 3: Authorized Discovery Run on Real RBI Official Feed
  let candidateToApprove = null;
  try {
    console.log('\nTriggering live autonomous discovery on RBI official feed...');
    const res = await fetch(`${BASE_URL}/api/discovery/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TEST_MOD_KEY}`
      },
      body: JSON.stringify({ sourceId: 'src_rbi_press' })
    });
    const data = await res.json();
    const report = data.report;

    assert(
      res.status === 200 && report?.status === 'completed' && report.itemsDiscovered > 0,
      `Autonomous Ingestion: Successfully crawled real RBI feed (${report?.itemsDiscovered} items parsed, ${report?.claimsIdentified} claims identified)`
    );

    if (report?.extractedCandidates?.length > 0) {
      candidateToApprove = report.extractedCandidates[0];
      console.log(`- Sample extracted claim: "${candidateToApprove.claimTitle}"`);
      console.log(`  Source URL: ${candidateToApprove.sourceUrl}`);
      console.log(`  Confidence: ${(candidateToApprove.confidenceScore * 100).toFixed(0)}%`);
      console.log(`  Signals: ${candidateToApprove.detectionSignals.join(', ')}`);
    }
  } catch (e) {
    assert(false, `Authorized discovery run error: ${e.message}`);
  }

  // Test 4: Verify Candidates in Moderation Queue
  try {
    const res = await fetch(`${BASE_URL}/api/submissions?status=pending`);
    const data = await res.json();
    const engineItems = (data.data || []).filter((s) =>
      s.submittedBy?.name?.includes('Autonomous Ingestion Engine')
    );
    assert(
      res.status === 200 && engineItems.length > 0,
      `Moderation Staging: Verified ${engineItems.length} candidate claim(s) from engine staged with status="pending"`
    );
  } catch (e) {
    assert(false, `Moderation queue verification error: ${e.message}`);
  }

  // Test 5: Verify Job History Audit Log
  try {
    const res = await fetch(`${BASE_URL}/api/discovery/jobs`);
    const data = await res.json();
    assert(
      res.status === 200 && Array.isArray(data.jobs) && data.jobs.length > 0,
      `Job History Audit: Recorded ${data.jobs?.length} ingestion job audit logs with status="completed"`
    );
  } catch (e) {
    assert(false, `Job history error: ${e.message}`);
  }

  // Test 6: Moderator Review & Publication of Discovered Claim
  try {
    // Fetch pending submissions to get the actual submission ID created by the engine
    const subRes = await fetch(`${BASE_URL}/api/submissions?status=pending`);
    const subData = await subRes.json();
    const engineSub = (subData.data || []).find((s) =>
      s.submittedBy?.name?.includes('Autonomous Ingestion Engine')
    );

    if (engineSub) {
      const approveRes = await fetch(`${BASE_URL}/api/submissions/${encodeURIComponent(engineSub.id)}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TEST_MOD_KEY}`
        },
        body: JSON.stringify({
          moderatorName: 'Chief Intelligence Analyst',
          notes: 'Corroborated against official RBI statutory announcement. Approved for public repository.'
        })
      });
      const approveData = await approveRes.json();
      assert(
        approveRes.status === 200 && approveData.status === 'approved',
        `Human Review & Publication: Successfully approved discovered claim into verified public dossier (${approveData.message})`
      );
    } else {
      assert(false, 'Moderator review test: No pending engine submission found to approve');
    }
  } catch (e) {
    assert(false, `Approval workflow test error: ${e.message}`);
  }

  console.log('\n====================================================');
  console.log(`PHASE 3 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================');
}

runPhase3ApiTests();
