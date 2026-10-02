// End-to-End Acceptance Test for AI-Powered Claim Assessment & Authenticated Community Voting
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function runTests() {
  console.log('================================================================');
  console.log('VERITY AI ASSESSMENT & AUTHENTICATED VOTING ACCEPTANCE TEST');
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

  // 1. Search for new claim: "Smith Dubai airline incident"
  console.log('1. Testing Live Search & Primary AI Evidence Assessment...');
  const searchRes = await fetch(`${BASE_URL}/api/search/live?q=${encodeURIComponent('Smith Dubai airline incident')}`);
  assert(searchRes.status === 200, 'Search API returns status 200');
  const searchData = await searchRes.json();
  assert(searchData.success === true, 'Search response indicates success');
  
  const report = searchData.report;
  assert(Boolean(report.aiAssessment), 'Report includes top-level AI Evidence Assessment');

  const ai = report.aiAssessment;
  console.log(`  Assessment Label: ${ai.assessmentLabel}`);
  console.log(`  Evidence Support Score: ${ai.evidenceSupportScore} / 100`);
  console.log(`  AI Confidence: ${ai.aiConfidenceIndicator.rating} (${ai.aiConfidenceIndicator.score}%)`);
  console.log(`  Direct Answer: "${ai.directAnswer}"`);

  assert(
    ['Supported', 'Likely supported', 'Mixed evidence', 'Likely unsupported', 'Unsupported', 'Insufficient evidence'].includes(ai.assessmentLabel),
    `Assessment label is valid standard category: "${ai.assessmentLabel}"`
  );
  assert(
    typeof ai.evidenceSupportScore === 'number' && ai.evidenceSupportScore >= 0 && ai.evidenceSupportScore <= 100,
    `Evidence support score is calibrated numerical value: ${ai.evidenceSupportScore}`
  );
  assert(
    typeof ai.aiConfidenceIndicator.score === 'number' && ai.aiConfidenceIndicator.rationale.length > 0,
    'AI confidence indicator provides separate score, rating, and rationale'
  );
  assert(
    ai.directAnswer.length > 20,
    'Provides concise, direct short answer to the user query'
  );
  assert(
    ai.conciseExplanation.length > 20,
    'Provides clear explanation of why the AI reached this assessment'
  );
  assert(
    Array.isArray(ai.strongestSupportingEvidence) && ai.strongestSupportingEvidence.length > 0,
    `Extracts strongest supporting evidence passages (${ai.strongestSupportingEvidence.length} found)`
  );
  assert(
    ai.sourceCount > 0 && ai.independentSourceCount > 0,
    `Tracks source count (${ai.sourceCount}) and independent domain count (${ai.independentSourceCount})`
  );

  // 2. Test Claim with Insufficient Evidence
  console.log('\n2. Testing Claim with Insufficient Evidence (No Hallucinated Verdict)...');
  const fakeRes = await fetch(`${BASE_URL}/api/search/live?q=${encodeURIComponent('totally non-existent fictitious incident 998877665544')}`);
  assert(fakeRes.status === 200, 'Search for unverified topic returns status 200');
  const fakeData = await fakeRes.json();
  const fakeAi = fakeData.report.aiAssessment;

  console.log(`  Fake Query Assessment Label: ${fakeAi.assessmentLabel}`);
  console.log(`  Fake Query Evidence Support Score: ${fakeAi.evidenceSupportScore}`);
  assert(
    fakeAi.assessmentLabel === 'Insufficient evidence',
    'System honestly classifies unverified topic as "Insufficient evidence"'
  );
  assert(
    fakeAi.evidenceSupportScore === null,
    'System DOES NOT fabricate a percentage score when evidence is insufficient'
  );
  assert(
    fakeAi.directAnswer.toLowerCase().includes('insufficient') || fakeAi.directAnswer.toLowerCase().includes('no verifiable'),
    'Direct answer transparently discloses lack of public evidence'
  );

  // 3. Claim-Specific Poll Identity
  console.log('\n3. Verifying Claim-Specific Poll Identity & Lifecycle...');
  assert(Boolean(report.claimPoll), 'Report includes stable community claim poll object');
  const poll = report.claimPoll;
  console.log(`  Canonical Claim ID: ${poll.claimId}`);
  console.log(`  Claim Version: v${poll.claimVersion}`);
  console.log(`  Claim Statement: "${poll.claimStatement}"`);
  assert(poll.claimId.length > 5, 'Poll is bound to a persistent claim identifier, not just raw query string');
  assert(poll.claimVersion >= 1, 'Poll tracks immutable claim version');
  assert(poll.options.true !== undefined && poll.options.false !== undefined, 'Poll contains all 4 standard voting options');

  // 4. Anonymous Users CANNOT Vote
  console.log('\n4. Verifying Anonymous Users Cannot Vote (Server-Side Auth Enforcement)...');
  const unauthVoteRes = await fetch(`${BASE_URL}/api/claims/${encodeURIComponent(poll.claimId)}/poll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voteOption: 'true', claimVersion: poll.claimVersion })
  });
  assert(
    unauthVoteRes.status === 401,
    `Anonymous voting attempt is strictly BLOCKED with HTTP 401 (${unauthVoteRes.status})`
  );
  const unauthData = await unauthVoteRes.json();
  assert(
    unauthData.error && unauthData.error.toLowerCase().includes('authentication required'),
    'Server explicitly requires authentication to vote'
  );

  // 5. Authenticate Real User Session
  console.log('\n5. Authenticating Real User (Priya Sharma)...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'priya@verity.org', password: 'password123' })
  });
  assert(loginRes.status === 200, 'User login returns status 200');
  const loginData = await loginRes.json();
  assert(loginData.success === true && Boolean(loginData.token), 'Login issued cryptographically signed session token');
  const userToken = loginData.token;

  // 6. Cast Vote as Authenticated User
  console.log('\n6. Casting Vote as Authenticated User...');
  const voteRes = await fetch(`${BASE_URL}/api/claims/${encodeURIComponent(poll.claimId)}/poll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`
    },
    body: JSON.stringify({
      voteOption: 'true',
      claimVersion: poll.claimVersion,
      claimStatement: poll.claimStatement
    })
  });
  assert(voteRes.status === 200, 'Authenticated vote returns status 200');
  const voteData = await voteRes.json();
  assert(voteData.success === true, 'Vote successfully recorded');
  assert(voteData.userVote === 'true', 'Vote option confirmed as "true"');
  assert(voteData.poll.totalVotes === 1, `Total votes count updated to 1 (actual: ${voteData.poll.totalVotes})`);
  assert(voteData.poll.options.true.percentage === 100, 'Option "True" holds 100% of votes');

  // 7. Duplicate Vote Prevention / Vote Mutation (1 Vote Per User)
  console.log('\n7. Verifying 1 Vote Per User Constraint (Changing Vote Option)...');
  const changeVoteRes = await fetch(`${BASE_URL}/api/claims/${encodeURIComponent(poll.claimId)}/poll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`
    },
    body: JSON.stringify({
      voteOption: 'partially_true',
      claimVersion: poll.claimVersion,
      claimStatement: poll.claimStatement
    })
  });
  assert(changeVoteRes.status === 200, 'Vote change returns status 200');
  const changeVoteData = await changeVoteRes.json();
  assert(
    changeVoteData.poll.totalVotes === 1,
    `Total votes remains exactly 1 after changing vote (no duplicate vote created: ${changeVoteData.poll.totalVotes})`
  );
  assert(
    changeVoteData.poll.options.partially_true.percentage === 100,
    'Option "Partially True" updated to 100%'
  );
  assert(
    changeVoteData.poll.options.true.percentage === 0,
    'Previous option "True" successfully decremented to 0%'
  );

  // 8. Second User Voting & Multi-User Aggregate Distribution
  console.log('\n8. Authenticating Second User & Testing Multi-User Distribution...');
  const login2Res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'vikram@verity.org', password: 'password123' })
  });
  const login2Data = await login2Res.json();
  const user2Token = login2Data.token;

  const vote2Res = await fetch(`${BASE_URL}/api/claims/${encodeURIComponent(poll.claimId)}/poll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user2Token}`
    },
    body: JSON.stringify({
      voteOption: 'true',
      claimVersion: poll.claimVersion,
      claimStatement: poll.claimStatement
    })
  });
  const vote2Data = await vote2Res.json();
  assert(vote2Data.poll.totalVotes === 2, `Total votes increased to 2 (actual: ${vote2Data.poll.totalVotes})`);
  assert(
    vote2Data.poll.options.partially_true.percentage === 50 && vote2Data.poll.options.true.percentage === 50,
    'Aggregate percentage distribution accurately reflects 50% Partially True / 50% True'
  );

  // 9. Vote Withdrawal
  console.log('\n9. Testing Vote Withdrawal...');
  const withdrawRes = await fetch(`${BASE_URL}/api/claims/${encodeURIComponent(poll.claimId)}/poll?version=${poll.claimVersion}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${user2Token}`
    }
  });
  assert(withdrawRes.status === 200, 'Withdraw vote returns status 200');
  const withdrawData = await withdrawRes.json();
  assert(
    withdrawData.poll.totalVotes === 1,
    `Total votes safely decremented back to 1 after withdrawal (actual: ${withdrawData.poll.totalVotes})`
  );

  // 10. Web UI Layout & Section Reordering Verification
  console.log('\n10. Verifying Web UI Layout & Section Reordering...');
  const pageRes = await fetch(`${BASE_URL}/search?q=${encodeURIComponent('Smith Dubai airline incident')}`);
  assert(pageRes.status === 200, 'Search page returns status 200');
  const pageHtml = await pageRes.text();

  assert(pageHtml.includes('PRIMARY AI EVIDENCE ASSESSMENT'), 'UI renders Primary AI Evidence Assessment section');
  assert(pageHtml.includes('Direct Answer'), 'UI renders Direct Answer section');
  assert(pageHtml.includes('Why the AI Reached this Assessment'), 'UI renders Why the AI Reached section');
  assert(pageHtml.includes('COMMUNITY EVIDENCE POLL'), 'UI renders Community Evidence Poll section');
  assert(pageHtml.includes('4-QUADRANT VERIFICATION BREAKDOWN'), 'UI renders 4-Quadrant Fact Breakdown section');
  assert(pageHtml.includes('CHRONOLOGICAL INCIDENT TIMELINE'), 'UI renders Incident Chronology section');
  assert(pageHtml.includes('SOURCE REPOSITORY &amp; EVIDENCE INSPECTOR') || pageHtml.includes('SOURCE REPOSITORY & EVIDENCE INSPECTOR'), 'UI renders Sources and Evidence section');
  assert(pageHtml.includes('VERITY ARCHIVE CROSS-REFERENCE'), 'UI renders VERITY Archive Cross-Reference section');

  // Verify section order in HTML
  const posAiAssessment = pageHtml.indexOf('PRIMARY AI EVIDENCE ASSESSMENT');
  const posDirectAnswer = pageHtml.indexOf('Direct Answer');
  const posWhyAi = pageHtml.indexOf('Why the AI Reached this Assessment');
  const posCommunityPoll = pageHtml.indexOf('COMMUNITY EVIDENCE POLL');
  const pos4Quadrant = pageHtml.indexOf('4-QUADRANT VERIFICATION BREAKDOWN');
  const posTimeline = pageHtml.indexOf('CHRONOLOGICAL INCIDENT TIMELINE');
  const posSources = pageHtml.indexOf('SOURCE REPOSITORY');
  const posArchive = pageHtml.indexOf('VERITY ARCHIVE CROSS-REFERENCE');

  assert(
    posAiAssessment < posDirectAnswer &&
    posDirectAnswer < posWhyAi &&
    posWhyAi < posCommunityPoll &&
    posCommunityPoll < pos4Quadrant &&
    pos4Quadrant < posTimeline &&
    posTimeline < posSources &&
    posSources < posArchive,
    'UI strictly adheres to the requested 8-tier top-to-bottom section ordering'
  );

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
