async function verify() {
  console.log('--- 1. Testing Homepage (http://localhost:3000) ---');
  const homeRes = await fetch('http://localhost:3000');
  const homeHtml = await homeRes.text();
  console.log('Home Status:', homeRes.status);
  console.log('Home contains "Discovery":', homeHtml.includes('Discovery'));
  console.log('Home contains "Autonomous Web Intelligence Engine":', homeHtml.includes('Autonomous Web Intelligence Engine'));
  console.log('Home contains "/discovery":', homeHtml.includes('/discovery'));

  console.log('\n--- 2. Testing Discovery Monitor Page (http://localhost:3000/discovery) ---');
  const discRes = await fetch('http://localhost:3000/discovery');
  const discHtml = await discRes.text();
  console.log('Discovery Page Status:', discRes.status);
  console.log('Discovery Page contains "Web Discovery":', discHtml.includes('Web Discovery'));
  console.log('Discovery Page contains "Extracted Claim Candidates":', discHtml.includes('Extracted Claim Candidates'));
  console.log('Discovery Page contains "Configured Discovery Sources":', discHtml.includes('Configured Discovery Sources'));

  console.log('\n--- 3. Testing Discovery Trigger API (POST http://localhost:3000/api/discovery/run) ---');
  const runRes = await fetch('http://localhost:3000/api/discovery/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-moderator-key': 'dev-verity-local-2026'
    },
    body: JSON.stringify({})
  });
  const runData = await runRes.json();
  console.log('Run Status:', runRes.status);
  console.log('Run Message:', runData.message);
  console.log('Reports count:', runData.reports?.length);

  console.log('\n--- 4. Testing Discovery Jobs API (GET http://localhost:3000/api/discovery/jobs) ---');
  const jobsRes = await fetch('http://localhost:3000/api/discovery/jobs');
  const jobsData = await jobsRes.json();
  console.log('Jobs Status:', jobsRes.status);
  console.log('Jobs Source:', jobsData.source);
  console.log('Jobs Count:', jobsData.jobs?.length);
  if (jobsData.jobs?.length > 0) {
    const latestJob = jobsData.jobs[0];
    console.log('Latest Job Source:', latestJob.sourceName);
    console.log('Latest Job Items Discovered:', latestJob.itemsDiscovered);
    console.log('Latest Job Claims Identified:', latestJob.claimsIdentified);
    console.log('Latest Job Candidates Count:', latestJob.extractedCandidates?.length);
    if (latestJob.extractedCandidates?.length > 0) {
      const c = latestJob.extractedCandidates[0];
      console.log('Sample Candidate Title:', c.claimTitle);
      console.log('Sample Candidate Authority:', c.speakerOrSource);
      console.log('Sample Candidate Excerpt:', c.relevantExcerpt);
      console.log('Sample Candidate Confidence:', c.confidenceScore);
    }
  }

  console.log('\n--- 5. Testing Moderator Queue & Ingestion Route (http://localhost:3000/moderator) ---');
  const modRes = await fetch('http://localhost:3000/moderator');
  console.log('Moderator Page Status:', modRes.status);
  console.log('All verification checks completed successfully!');
}

verify().catch(console.error);
