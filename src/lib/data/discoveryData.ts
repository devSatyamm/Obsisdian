import { DiscoverySource, IngestionJobReport, ExtractedClaimCandidate } from '../ingestion/types';

export const STATIC_DISCOVERY_SOURCES: DiscoverySource[] = [
  {
    id: 'src_rbi_press',
    slug: 'rbi-press-releases',
    name: 'Reserve Bank of India (RBI) Press Releases',
    sourceType: 'rss_feed',
    url: 'https://www.rbi.org.in/pressreleases_rss.xml',
    targetRegulator: 'RBI',
    pollIntervalMinutes: 60,
    lastPolledAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    isActive: true,
    errorCount: 0,
    createdAt: '2026-10-01T00:00:00Z'
  },
  {
    id: 'src_sebi_alerts',
    slug: 'sebi-caution-alerts',
    name: 'SEBI Public Caution & Regulatory Notices Feed',
    sourceType: 'rss_feed',
    url: 'https://news.google.com/rss/search?q=SEBI+caution+notice+when:7d&hl=en-IN&gl=IN&ceid=IN:en',
    targetRegulator: 'SEBI',
    pollIntervalMinutes: 30,
    lastPolledAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    isActive: true,
    errorCount: 0,
    createdAt: '2026-10-01T00:00:00Z'
  },
  {
    id: 'src_pib_factcheck',
    slug: 'pib-factcheck-alerts',
    name: 'PIB Fact Check Unit Official Feed',
    sourceType: 'rss_feed',
    url: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1',
    targetRegulator: 'General Market',
    pollIntervalMinutes: 45,
    lastPolledAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    isActive: true,
    errorCount: 0,
    createdAt: '2026-10-01T00:00:00Z'
  },
  {
    id: 'src_bbc_business',
    slug: 'bbc-business-markets',
    name: 'BBC Global Business & Financial Markets',
    sourceType: 'rss_feed',
    url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    targetRegulator: 'General Market',
    pollIntervalMinutes: 120,
    lastPolledAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    isActive: true,
    errorCount: 0,
    createdAt: '2026-10-01T00:00:00Z'
  }
];

export const STATIC_INGESTION_JOBS: IngestionJobReport[] = [
  {
    id: 'job_sebi_cycle_20261003',
    sourceId: 'src_sebi_alerts',
    sourceName: 'SEBI Public Caution & Regulatory Notices Feed',
    status: 'completed',
    startedAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
    durationMs: 2150,
    itemsDiscovered: 12,
    itemsIngested: 12,
    itemsExtracted: 12,
    duplicatesSkipped: 3,
    boilerplateFiltered: 4,
    claimsIdentified: 3,
    updatesMatched: 1,
    errorsLogged: 0,
    extractedCandidates: [
      {
        id: 'cand_tg_01',
        feedItemId: 'feed_item_tg_01',
        sourceUrl: 'https://www.sebi.gov.in/public-notices/caution-unregistered-algo-services.html',
        publisher: 'Securities and Exchange Board of India (SEBI)',
        publicationDate: '2024-08-24',
        originalHeadline: 'Public Advisory regarding Unregistered Algorithmic Investment Schemes',
        relevantExcerpt: 'Investors are cautioned against dealing with TradeGenius AI Algorithms promising guaranteed 22% monthly returns.',
        extractionRationale: 'Regulatory statutory caution notice naming unregistered platform entity.',
        speakerOrSource: 'SEBI Enforcement Directorate',
        targetEntitySlug: 'tradegenius-ai-algorithms',
        targetEntityName: 'TradeGenius AI Algorithms',
        claimTitle: 'TradeGenius Algorithmic Yield Promissory Note',
        factualStatement: 'TradeGenius AI was issued an official SEBI caution notice for promising guaranteed 22% monthly returns without regulatory license.',
        contextExcerpt: 'SEBI issued notice WTM/MB/IVD/ID1/2024-25/1109 prohibiting unapproved algo bots.',
        confidenceScore: 0.96,
        detectionSignals: ['Statutory Order', 'Caution Notice', 'Zero Guarantee Compliance'],
        isPotentialUpdate: false,
        isDuplicate: false,
        isContradiction: true,
        contradictionNote: 'Directly contradicts TradeGenius marketing banner claiming SEBI registration approval.',
        status: 'pending_review'
      }
    ]
  },
  {
    id: 'job_rbi_cycle_20261003',
    sourceId: 'src_rbi_press',
    sourceName: 'Reserve Bank of India (RBI) Press Releases',
    status: 'completed',
    startedAt: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 83).toISOString(),
    durationMs: 1840,
    itemsDiscovered: 8,
    itemsIngested: 8,
    itemsExtracted: 8,
    duplicatesSkipped: 0,
    boilerplateFiltered: 2,
    claimsIdentified: 2,
    updatesMatched: 1,
    errorsLogged: 0,
    extractedCandidates: [
      {
        id: 'cand_rbi_02',
        feedItemId: 'feed_item_rbi_02',
        sourceUrl: 'https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx',
        publisher: 'Reserve Bank of India',
        publicationDate: '2024-09-05',
        originalHeadline: 'RBI Updates Alert List of Unauthorized Forex Trading Platforms',
        relevantExcerpt: 'The Reserve Bank of India has added 12 new unauthorized entities offering illegal forex trading derivative instruments.',
        extractionRationale: 'Central banking alert list disclosure.',
        speakerOrSource: 'Chief General Manager, RBI Communications',
        targetEntitySlug: 'aurum-global-ventures',
        targetEntityName: 'Aurum Global Ventures',
        claimTitle: 'Unauthorized Forex Dealing Alert Update',
        factualStatement: 'RBI added Aurum Global Ventures to its statutory Alert List of unauthorized electronic trading platforms for foreign exchange transactions.',
        contextExcerpt: 'Entities on the Alert List are neither authorized to deal in forex under FEMA 1999 nor authorized to operate electronic trading platforms.',
        confidenceScore: 0.94,
        detectionSignals: ['Central Bank Alert List', 'FEMA 1999 Jurisdiction', 'Unauthorized ETP Notice'],
        isPotentialUpdate: true,
        isDuplicate: false,
        status: 'pending_review'
      }
    ]
  }
];
