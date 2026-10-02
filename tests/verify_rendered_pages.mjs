async function verifyHtml(url, label) {
  const res = await fetch(url);
  const html = await res.text();
  console.log('\n======================================================');
  console.log('VERIFYING RENDERED HTML FOR:', label);
  console.log('URL:', url);
  console.log('HTTP Status:', res.status);
  
  // Section 1: Primary AI Evidence Assessment
  const hasAssessment = html.includes('PRIMARY AI EVIDENCE ASSESSMENT');
  console.log('Has Section 1 (PRIMARY AI EVIDENCE ASSESSMENT):', hasAssessment);
  
  // Section 2: Direct Answer
  const hasDirectAnswer = html.includes('Direct Answer');
  console.log('Has Section 2 (Direct Answer):', hasDirectAnswer);
  
  // Section 3: Why AI reached assessment
  const hasWhy = html.includes('Why the AI Reached this Assessment');
  console.log('Has Section 3 (Why AI Reached this Assessment):', hasWhy);
  
  // Section 4: Community Poll
  const hasPoll = html.includes('COMMUNITY EVIDENCE POLL');
  console.log('Has Section 4 (COMMUNITY EVIDENCE POLL):', hasPoll);
  
  // Section 5: Confirmed facts breakdown
  const hasBreakdown = html.includes('VERIFICATION BREAKDOWN');
  console.log('Has Section 5 (VERIFICATION BREAKDOWN):', hasBreakdown);
  
  // Section 6: Chronology
  const hasChronology = html.includes('CHRONOLOGICAL INCIDENT TIMELINE');
  console.log('Has Section 6 (CHRONOLOGICAL INCIDENT TIMELINE):', hasChronology);
  
  // Section 7: Sources
  const hasSources = html.includes('SOURCE REPOSITORY');
  console.log('Has Section 7 (SOURCE REPOSITORY):', hasSources);
  
  // Section 8: Archive Cross-reference
  const hasArchive = html.includes('VERITY ARCHIVE') || html.includes('CROSS-REFERENCE');
  console.log('Has Section 8 (ARCHIVE CROSS-REFERENCE):', hasArchive);

  // Extract direct answer text from rendered page
  const directMatch = html.match(/<div class="text-\[11px\] font-mono uppercase tracking-wider text-\[#0F3F2E\] font-bold flex items-center gap-1\.5">[\s\S]*?<span>Direct Answer<\/span>[\s\S]*?<\/div>\s*<p[^>]*>([\s\S]*?)<\/p>/);
  if (directMatch) {
    console.log('Rendered Direct Answer Text:\n ', directMatch[1].trim());
  }

  // Extract poll statement from rendered page
  const pollStatementMatch = html.match(/<h2 class="text-xl sm:text-2xl font-serif-headline font-bold text-\[#141A17\]">([\s\S]*?)<\/h2>/);
  if (pollStatementMatch) {
    console.log('Rendered Assessment & Poll Claim:\n ', pollStatementMatch[1].trim());
  }
}

async function run() {
  await verifyHtml('http://localhost:3000/search?q=Is+Donald+Trump%2C+president+of+US+dead%3F', 'Donald Trump Dead');
  await verifyHtml('http://localhost:3000/search?q=Smith+Dubai+airline+incident', 'Smith Dubai Incident');
  await verifyHtml('http://localhost:3000/search?q=UPI+charges+above+%E2%82%B92%2C000', 'UPI charges');
}

run();
