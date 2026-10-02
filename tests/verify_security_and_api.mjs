const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log('VERITY SECURITY & API VERIFICATION SUITE');
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

  // Test 1: Database Health Check
  try {
    const res = await fetch(`${BASE_URL}/api/health/db`);
    const data = await res.json();
    assert(
      res.status === 200 && data.status === 'unconfigured' && data.connected === false,
      'Health check: Correctly reports unconfigured without crashing or throwing 500'
    );
  } catch (err) {
    assert(false, `Health check error: ${err.message}`);
  }

  // Test 2: Fetch Organisations
  try {
    const res = await fetch(`${BASE_URL}/api/organisations`);
    const data = await res.json();
    assert(
      res.status === 200 && Array.isArray(data.data) && data.data.length > 0,
      `Organisations: Returns list of entities (${data.data?.length} records found)`
    );
  } catch (err) {
    assert(false, `Organisations fetch error: ${err.message}`);
  }

  // Test 3: Fetch Single Dossier
  try {
    const res = await fetch(`${BASE_URL}/api/organisations/tradegenius-ai-algorithms`);
    const data = await res.json();
    assert(
      res.status === 200 && data.data?.slug === 'tradegenius-ai-algorithms',
      'Organisation dossier: Successfully resolves entity by slug'
    );
  } catch (err) {
    assert(false, `Dossier fetch error: ${err.message}`);
  }

  // Test 4: Fetch Claims
  try {
    const res = await fetch(`${BASE_URL}/api/claims`);
    const data = await res.json();
    assert(
      res.status === 200 && Array.isArray(data.data) && data.data.length > 0,
      `Claims: Successfully retrieves claim records (${data.data?.length} claims found)`
    );
  } catch (err) {
    assert(false, `Claims fetch error: ${err.message}`);
  }

  // Test 5: Abuse Prevention - Missing Required Fields
  try {
    const res = await fetch(`${BASE_URL}/api/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entityName: 'Test Corp' }) // missing required fields
    });
    assert(
      res.status === 400,
      'Input Validation: Rejects submission missing required fields with HTTP 400'
    );
  } catch (err) {
    assert(false, `Input validation test error: ${err.message}`);
  }

  // Test 6: Abuse Prevention - Malformed / Non-HTTP Protocol
  try {
    const res = await fetch(`${BASE_URL}/api/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityName: 'Test Corp',
        title: 'Valid Investigation Title Here',
        factualDescription: 'This is a sufficiently long description that satisfies the twenty character minimum check.',
        primarySourceUrl: 'javascript:alert(1)' // Dangerous scheme
      })
    });
    assert(
      res.status === 400,
      'URL Sanitization: Rejects dangerous non-http protocols (javascript:...) with HTTP 400'
    );
  } catch (err) {
    assert(false, `URL sanitization test error: ${err.message}`);
  }

  // Test 7: Abuse Prevention - Bot Honeypot
  try {
    const res = await fetch(`${BASE_URL}/api/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityName: 'Test Corp',
        title: 'Bot spam title with enough characters',
        factualDescription: 'This is a bot spam description that meets the length requirements.',
        primarySourceUrl: 'https://example.com/source',
        website_hp: 'https://spam-bot-trap.com' // Honeypot filled
      })
    });
    const data = await res.json();
    assert(
      res.status === 201 && data.submission === undefined,
      'Honeypot Trap: Intercepts bot filling hidden honeypot without persisting'
    );
  } catch (err) {
    assert(false, `Honeypot test error: ${err.message}`);
  }

  // Test 8: Valid Submission Creation
  let createdSubId = '';
  try {
    const res = await fetch(`${BASE_URL}/api/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityName: 'Apex Wealth Advisors',
        entityId: 'apex-wealth-advisors',
        category: 'Advisory & Telegram Tipster',
        evidenceCategory: 'Deceptive Marketing Screenshot',
        title: 'Guaranteed 40% Monthly Return Claim on Telegram',
        factualDescription: 'Promotional channel distributed marketing material assuring 40% non-callable monthly yield.',
        primarySourceUrl: 'https://t.me/apex_wealth_channel/1042',
        submittedBy: {
          id: 'usr_sec_test',
          name: 'Security Test Contributor',
          role: 'Contributor'
        }
      })
    });
    const data = await res.json();
    createdSubId = data.submission?.id;
    assert(
      res.status === 201 && data.submission?.status === 'pending',
      `Community Submissions: Successfully creates pending submission (${createdSubId})`
    );
  } catch (err) {
    assert(false, `Valid submission test error: ${err.message}`);
  }

  // Test 9: PRIVILEGED SECURITY TEST - Unauthenticated Approval MUST BE REJECTED
  try {
    const res = await fetch(`${BASE_URL}/api/submissions/${encodeURIComponent(createdSubId || 'test-123')}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moderatorName: 'Malicious Actor Posing As Senior Moderator',
        notes: 'Unauthenticated attempt'
      })
    });
    assert(
      res.status === 401,
      `Privileged Access Control: Direct unauthenticated /approve is strictly BLOCKED with HTTP 401 (${res.status})`
    );
  } catch (err) {
    assert(false, `Unauthenticated approval test error: ${err.message}`);
  }

  // Test 10: PRIVILEGED SECURITY TEST - Unauthenticated Rejection MUST BE REJECTED
  try {
    const res = await fetch(`${BASE_URL}/api/submissions/${encodeURIComponent(createdSubId || 'test-123')}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moderatorName: 'Unauthenticated Actor',
        notes: 'Unauthenticated reject attempt'
      })
    });
    assert(
      res.status === 401,
      `Privileged Access Control: Direct unauthenticated /reject is strictly BLOCKED with HTTP 401 (${res.status})`
    );
  } catch (err) {
    assert(false, `Unauthenticated rejection test error: ${err.message}`);
  }

  // Test 11: PRIVILEGED SECURITY TEST - Authorized Approval with Dev Moderator Token
  try {
    const res = await fetch(`${BASE_URL}/api/submissions/${encodeURIComponent(createdSubId || 'test-123')}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer dev-verity-local-2026'
      },
      body: JSON.stringify({
        moderatorName: 'Authorized Chief Auditor',
        notes: 'Corroborated by verified moderator review.'
      })
    });
    const data = await res.json();
    assert(
      res.status === 200 && data.status === 'approved',
      `Authorized Moderation: Approved successfully with valid moderator credentials (${data.message})`
    );
  } catch (err) {
    assert(false, `Authorized approval test error: ${err.message}`);
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================');
}

runTests();
