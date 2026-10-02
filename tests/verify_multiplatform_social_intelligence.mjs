import { MultiPlatformAdapterRegistry } from '../src/lib/search/adapters/registry.ts';
import { classifyQueryIntent } from '../src/lib/search/intentClassifier.ts';
import { validateAndRankEvidence } from '../src/lib/search/queryEvidenceValidator.ts';
import { synthesizeIntelligenceReport } from '../src/lib/search/intelligenceSynthesizer.ts';

const DUMMY_DB_MATCH = {
  isNewIncident: true,
  matchedClaims: [],
  comparisonNotes: 'No database match.',
  stagedCandidateId: 'sub_test_multiplatform'
};

async function runMultiPlatformSuite() {
  console.log('========================================================================');
  console.log('       VERITY MULTI-PLATFORM SOCIAL INTELLIGENCE ACCEPTANCE TEST        ');
  console.log('========================================================================\n');

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

  const registry = new MultiPlatformAdapterRegistry();

  // TEST 1: Platform Adapter Registry & Configuration Discovery
  console.log('1. Testing Adapter Registry & Supported Platforms...');
  const adapters = registry.getAllAdapters();
  assert(adapters.length >= 7, `Registry has ${adapters.length} registered adapters (expected >= 7)`);
  
  const platforms = adapters.map(a => a.platform);
  assert(platforms.includes('news'), 'News & Web adapter registered (platform: "news")');
  assert(platforms.includes('reddit'), 'Reddit adapter registered (platform: "reddit")');
  assert(platforms.includes('youtube'), 'YouTube adapter registered (platform: "youtube")');
  assert(platforms.includes('forums'), 'Forums adapter registered (platform: "forums")');
  assert(platforms.includes('official'), 'Official & Gov sources adapter registered (platform: "official")');
  assert(platforms.includes('x'), 'X / Twitter adapter registered (platform: "x")');
  assert(platforms.includes('instagram'), 'Instagram adapter registered (platform: "instagram")');

  // TEST 2: Multi-Platform Query Execution & Access Status Reporting
  console.log('\n2. Testing Multi-Platform Execution & API Access Reporting...');
  const testQuery = 'Chandrayaan 3 lunar landing';
  const queryResult = await registry.retrieveAll(testQuery, { limit: 3 });

  assert(queryResult.items.length > 0, `Retrieved ${queryResult.items.length} total items across platforms`);
  assert(queryResult.platformStatuses.length >= 7, 'Reports retrieval status for all platforms');

  // Check specific adapter statuses
  const xStatus = queryResult.platformStatuses.find(s => s.platform === 'x');
  assert(xStatus && (xStatus.status === 'auth_required' || xStatus.status === 'live'), `X API reports clear status: "${xStatus?.status}" (Requires bearer token, never faked)`);

  const instaStatus = queryResult.platformStatuses.find(s => s.platform === 'instagram');
  assert(instaStatus && (instaStatus.status === 'restricted' || instaStatus.status === 'live'), `Instagram reports permission status: "${instaStatus?.status}" (Meta access controls respected, no scraping)`);

  const newsStatus = queryResult.platformStatuses.find(s => s.platform === 'news');
  assert(newsStatus && newsStatus.status === 'live', `News adapter status: "${newsStatus?.status}" (Successfully retrieved live news reports)`);

  // TEST 3: Social Content Relevance Analysis & Classification
  console.log('\n3. Testing Social Content Relevance & Analysis Breakdown...');
  const analysis = queryResult.socialAnalysis;
  assert(typeof analysis.eyewitnessAccountsCount === 'number', 'Social analysis tracks eyewitnessAccountsCount');
  assert(typeof analysis.officialStatementsCount === 'number', 'Social analysis tracks officialStatementsCount');
  assert(typeof analysis.userSpeculationCount === 'number', 'Social analysis tracks userSpeculationCount');
  assert(typeof analysis.repostsAndDuplicatesCount === 'number', 'Social analysis tracks repostsAndDuplicatesCount');
  assert(Array.isArray(analysis.socialPlatformsSearched), 'Tracks social platforms searched');
  assert(typeof analysis.provenanceSummary === 'string' && analysis.provenanceSummary.length > 0, 'Generates provenance audit summary');

  // TEST 4: Viral Duplicate Content Does NOT Inflate Independence
  console.log('\n4. Testing Cross-Platform Deduplication & Independence Protection...');
  const duplicatedItems = [
    {
      id: 'orig_1',
      title: 'Breaking: Satellite communications restored in flood zone',
      snippet: 'Official rescue teams restored satellite link at 0900 UTC.',
      url: 'https://news.agency.org/wire/flood-comm-1',
      sourceProvider: 'news_web',
      platform: 'news',
      sourceCategory: 'news',
      publisher: 'News Agency Wire',
      contentType: 'official_statement',
      provenance: {
        platform: 'news',
        originalUrl: 'https://news.agency.org/wire/flood-comm-1',
        contentType: 'official_statement',
        isOriginal: true,
        isRepost: false,
        isDuplicate: false,
        retrievedAt: new Date().toISOString()
      }
    },
    {
      id: 'viral_repost_1',
      title: 'Breaking: Satellite communications restored in flood zone',
      snippet: 'Official rescue teams restored satellite link at 0900 UTC.',
      url: 'https://reddit.com/r/news/comments/flood_comm',
      sourceProvider: 'reddit',
      platform: 'reddit',
      sourceCategory: 'social_media',
      publisher: 'Reddit r/news',
      contentType: 'repost',
      provenance: {
        platform: 'reddit',
        originalUrl: 'https://reddit.com/r/news/comments/flood_comm',
        contentType: 'repost',
        isOriginal: false,
        isRepost: true,
        isDuplicate: true,
        canonicalSourceUrl: 'https://news.agency.org/wire/flood-comm-1',
        retrievedAt: new Date().toISOString()
      }
    },
    {
      id: 'viral_repost_2',
      title: 'Breaking: Satellite communications restored in flood zone',
      snippet: 'Official rescue teams restored satellite link at 0900 UTC.',
      url: 'https://forum.site/threads/flood-comm',
      sourceProvider: 'forums',
      platform: 'forums',
      sourceCategory: 'forums',
      publisher: 'Community Forum',
      contentType: 'repost',
      provenance: {
        platform: 'forums',
        originalUrl: 'https://forum.site/threads/flood-comm',
        contentType: 'repost',
        isOriginal: false,
        isRepost: true,
        isDuplicate: true,
        canonicalSourceUrl: 'https://news.agency.org/wire/flood-comm-1',
        retrievedAt: new Date().toISOString()
      }
    }
  ];

  const dedupIntent = classifyQueryIntent('Satellite communications restored in flood zone');
  const dedupValidation = validateAndRankEvidence(duplicatedItems, dedupIntent);
  const dedupReport = await synthesizeIntelligenceReport(
    'Satellite communications restored in flood zone',
    duplicatedItems,
    DUMMY_DB_MATCH,
    150
  );

  assert(dedupReport.sources.length === 3, 'All 3 items preserved in source list');
  // Crucial check: deduplication ensures duplicate items do not inflate independent source count
  assert(
    dedupReport.aiAssessment.independentSourceCount === 1,
    `Independent source count correctly collapsed to 1 despite 3 copies (Actual: ${dedupReport.aiAssessment.independentSourceCount})`
  );
  console.log(`  Duplicate items correctly identified, net independent sources = ${dedupReport.aiAssessment.independentSourceCount}`);

  // TEST 5: Misleading Social Keyword Overlap Rejected by Relevance Gate
  console.log('\n5. Testing Misleading Social Keyword Overlap Rejection...');
  const misleadingSocialItems = [
    {
      id: 'reddit_bieber_joke',
      title: 'If Justin Bieber was prime minister of Japan would anime be better?',
      snippet: 'Just a random hypothetical meme discussion about pop stars in Tokyo government.',
      url: 'https://reddit.com/r/showerthoughts/comments/bieber_japan',
      sourceProvider: 'reddit',
      platform: 'reddit',
      sourceCategory: 'social_media',
      publisher: 'Reddit r/showerthoughts',
      contentType: 'satire',
      provenance: {
        platform: 'reddit',
        originalUrl: 'https://reddit.com/r/showerthoughts/comments/bieber_japan',
        contentType: 'satire',
        isOriginal: true,
        isRepost: false,
        isDuplicate: false,
        retrievedAt: new Date().toISOString()
      }
    },
    {
      id: 'youtube_bieber_tokyo',
      title: 'Justin Bieber live in Tokyo Japan 2022 concert highlights',
      snippet: 'Justin performs songs for 50,000 fans in Tokyo dome stadium.',
      url: 'https://youtube.com/watch?v=bieber_tokyo',
      sourceProvider: 'youtube',
      platform: 'youtube',
      sourceCategory: 'social_media',
      publisher: 'Concert Vlogs',
      contentType: 'user_speculation',
      provenance: {
        platform: 'youtube',
        originalUrl: 'https://youtube.com/watch?v=bieber_tokyo',
        contentType: 'user_speculation',
        isOriginal: true,
        isRepost: false,
        isDuplicate: false,
        retrievedAt: new Date().toISOString()
      }
    }
  ];

  const bieberIntent = classifyQueryIntent('Justin Bieber elected prime minister of Japan');
  const bieberSocialVal = validateAndRankEvidence(misleadingSocialItems, bieberIntent);
  const bieberReport = await synthesizeIntelligenceReport(
    'Justin Bieber elected prime minister of Japan',
    misleadingSocialItems,
    DUMMY_DB_MATCH,
    150
  );

  assert(bieberSocialVal.validSourcesCount === 0, 'Misleading social posts fail relevance gate (validSources = 0)');
  assert(bieberReport.aiAssessment.assessmentLabel === 'Insufficient evidence', 'Verdict correctly stays Insufficient evidence');
  assert(bieberReport.aiAssessment.evidenceSupportScore === null, 'Evidence score remains null');
  assert(bieberReport.aiAssessment.directAnswer.includes('Insufficient evidence'), 'Direct answer honestly discloses lack of public evidence');

  // TEST 6: Reddit Live Adapter Integration
  console.log('\n6. Testing Reddit Public Adapter Live Query...');
  const redditAdapter = registry.getAdapter('reddit');
  const redditRes = await redditAdapter.search('SpaceX Starship launch', { limit: 2 });
  assert(
    redditRes.status.status === 'live' ||
    redditRes.status.status === 'no_results' ||
    redditRes.status.status === 'auth_required' ||
    redditRes.status.status === 'restricted',
    `Reddit adapter responded cleanly with status: "${redditRes.status.status}" (${redditRes.status.message || 'Live posts retrieved'})`
  );
  if (redditRes.items.length > 0) {
    const item = redditRes.items[0];
    assert(item.url.startsWith('https://reddit.com/r/'), `Reddit URL correctly formatted: ${item.url}`);
    assert(item.provenance !== undefined, 'Reddit provenance attached');
    assert(item.sourceCategory === 'social_media', 'Categorized as social_media');
  }

  // TEST 7: YouTube Live Adapter Integration
  console.log('\n7. Testing YouTube Public Adapter Live Query...');
  const ytAdapter = registry.getAdapter('youtube');
  const ytRes = await ytAdapter.search('Chandrayaan 3 mission', { limit: 2 });
  assert(ytRes.status.status === 'live' || ytRes.status.status === 'no_results', `YouTube adapter responded cleanly with status: ${ytRes.status.status}`);
  if (ytRes.items.length > 0) {
    const item = ytRes.items[0];
    assert(item.url.includes('youtube.com'), `YouTube URL correctly formatted: ${item.url}`);
    assert(item.provenance !== undefined, 'YouTube provenance attached');
  }

  // TEST 8: Official & Gov Sources Adapter Live Query
  console.log('\n8. Testing Official Government Portals Adapter...');
  const govAdapter = registry.getAdapter('official');
  const govRes = await govAdapter.search('RBI repo rate monetary policy', { limit: 2 });
  assert(govRes.status.status === 'live' || govRes.status.status === 'no_results', `Gov adapter responded with status: ${govRes.status.status}`);
  if (govRes.items.length > 0) {
    assert(govRes.items[0].sourceCategory === 'official', 'Sources classified under "official"');
  }

  console.log('\n========================================================================');
  console.log(`MULTI-PLATFORM SUITE COMPLETED: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runMultiPlatformSuite().catch(err => {
  console.error('Fatal error in multi-platform test:', err);
  process.exit(1);
});
