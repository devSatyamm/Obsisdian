import {
  LiveIntelligenceReport,
  SearchResultItem,
  TimelineEvent,
  EvidenceLinkedClaim,
  DiscrepancyItem,
  FactVerificationBreakdown,
  AIEvidenceAssessment,
  ClaimPollData,
  AssessmentRevision
} from '../search/types';

export const SAMPLE_DOSSIERS: Record<string, any> = {
  'smith-dubai': {
    query: 'Smith Dubai airline incident',
    durationMs: 412,
    sources: [
      {
        id: 'src_uae_gcaa',
        title: 'UAE General Civil Aviation Authority (GCAA) Safety & Incident Register',
        url: 'https://www.gcaa.gov.ae/en/pages/accidentinvestigation.aspx',
        snippet: 'Official UAE GCAA aviation safety database reports zero mandatory occurrence reports or emergency squawk records corresponding to the alleged flight sector.',
        publisher: 'UAE General Civil Aviation Authority',
        publisherDomain: 'gcaa.gov.ae',
        sourceProvider: 'official',
        platform: 'official',
        sourceCategory: 'official',
        relevanceScore: 0.94,
        relevanceRationale: 'Primary national civil aviation regulatory registry for UAE air transport sector.'
      },
      {
        id: 'src_icao_safety',
        title: 'ICAO Accident/Incident Data Reporting (ADREP) Global Database',
        url: 'https://www.icao.int/safety/iStars/Pages/Accident-Statistics.aspx',
        snippet: 'International Civil Aviation Organization official safety statistics show no record of cockpit altercation or diversion on Dubai scheduled international flights for the queried entity.',
        publisher: 'International Civil Aviation Organization (ICAO)',
        publisherDomain: 'icao.int',
        sourceProvider: 'official',
        platform: 'official',
        sourceCategory: 'official',
        relevanceScore: 0.91,
        relevanceRationale: 'United Nations specialized agency global aviation occurrence registry.'
      },
      {
        id: 'src_reuters_aviation',
        title: 'Reuters Aviation Intelligence: Verification of Viral Air Sector Claims',
        url: 'https://www.reuters.com/business/aerospace-defense/',
        snippet: 'Aviation desk verification determined that viral social media accounts alleging a mid-flight physical altercation involving pilot personnel lack corroboration from carrier flight logs, civil aviation authorities, or airport police.',
        publisher: 'Reuters Aerospace & Transport',
        publisherDomain: 'reuters.com',
        sourceProvider: 'google_news',
        platform: 'news',
        sourceCategory: 'news',
        relevanceScore: 0.88,
        relevanceRationale: 'Investigative business newsroom fact-checking viral transport rumors.'
      }
    ],
    timeline: [
      {
        id: 'evt_smith_01',
        date: 'Recent Viral Circulation',
        event: 'Uncorroborated social media post alleging cockpit altercation on Dubai scheduled flight begins circulating online.',
        source: 'Social Intelligence Monitor',
        sourceUrl: 'https://x.com'
      },
      {
        id: 'evt_smith_02',
        date: 'Regulatory Audit',
        event: 'UAE General Civil Aviation Authority mandatory occurrence registry audited: Zero incident filings recorded.',
        source: 'UAE GCAA Safety Registry',
        sourceUrl: 'https://www.gcaa.gov.ae'
      },
      {
        id: 'evt_smith_03',
        date: 'Carrier Manifest Check',
        event: 'Commercial carrier flight operations audit confirms no diverted sectors, emergency squawks, or crew suspensions.',
        source: 'Aviation Herald & ICAO ADREP',
        sourceUrl: 'https://www.icao.int'
      }
    ],
    keyClaims: [
      {
        id: 'clm_smith_01',
        statement: 'A mid-flight physical altercation occurred in the cockpit of a Dubai international passenger flight.',
        speakerOrSource: 'Unverified Social Media Posts',
        category: 'unverified_rumor',
        supportingExcerpt: 'Circulating online claims allege a physical altercation between flight crew members on a Dubai international sector.',
        sourceUrl: 'https://www.gcaa.gov.ae'
      },
      {
        id: 'clm_smith_02',
        statement: 'UAE General Civil Aviation Authority and carrier safety logs contain zero record of any cockpit incident or emergency diversion.',
        speakerOrSource: 'UAE GCAA Official Records',
        category: 'confirmed_fact',
        supportingExcerpt: 'The GCAA Air Accident Investigation Sector confirms that no accident, serious incident, or mandatory occurrence was filed.',
        sourceUrl: 'https://www.gcaa.gov.ae'
      }
    ],
    discrepancies: [
      {
        id: 'disc_smith_01',
        statementA: 'Viral posts claim a serious in-flight crew altercation occurred over Dubai airspace.',
        statementB: 'Statutory civil aviation authority registers report zero emergency squawks, diversions, or incident filings.',
        sourceA: 'Social Media Rumors',
        sourceB: 'UAE GCAA & ICAO Official Database',
        severity: 'critical',
        explanation: 'Direct contradiction between viral internet claims and statutory civil aviation regulatory safety records.'
      }
    ],
    factBreakdown: {
      factualStatementsCount: 2,
      opinionOrSpeculationCount: 3,
      contradictedStatementsCount: 1,
      totalClaimsEvaluated: 6
    },
    aiAssessment: {
      assessmentLabel: 'Insufficient evidence',
      score: null,
      scoreBand: 'Insufficient evidence (Unable to assess)',
      confidenceScore: 0.94,
      directAnswer: 'There is zero verifiable evidence from aviation authorities or airline logs supporting the claim of a cockpit altercation on a Dubai flight. Statutory regulatory filings indicate this is a fabricated or uncorroborated rumor.',
      summaryExplanation: 'The claim originated as an unverified social media rumor. A cross-audit of official occurrence records from the UAE General Civil Aviation Authority (GCAA) and ICAO confirms that no incident, diversion, or disciplinary action was registered.',
      independentOriginsCount: 3,
      corroboratingSourcesCount: 0,
      contradictingSourcesCount: 2,
      primaryAuthoritiesCount: 2,
      keyEvidentiaryFactors: [
        { factor: 'Statutory Regulatory Records', impact: 'negative', description: 'UAE GCAA mandatory occurrence database contains zero matching incident filings.' },
        { factor: 'Carrier Operations Telemetry', impact: 'negative', description: 'Flight radar logs and carrier operational rosters show normal flight completions.' },
        { factor: 'Source Attribution Gap', impact: 'negative', description: 'Initial circulation lacks eyewitness accounts, carrier identification, or primary documentation.' }
      ],
      methodologyNote: 'Evaluated against VERITY Evidentiary Standard Tier 1 (Statutory Aviation Records) and Tier 2 (Carrier Operations Disclosures).'
    },
    claimPoll: {
      pollId: 'poll_smith_dubai_v1',
      claimId: 'clm_smith_dubai',
      claimVersion: 1,
      claimStatement: 'A cockpit altercation occurred on a Dubai international flight involving flight personnel.',
      totalVotes: 48,
      options: {
        true: { count: 3, percentage: 6.3 },
        false: { count: 37, percentage: 77.1 },
        partially_true: { count: 2, percentage: 4.2 },
        insufficient_evidence: { count: 6, percentage: 12.5 }
      },
      userVote: null,
      status: 'active',
      policyNote: 'Community voting reflects public sentiment. Crowd consensus does NOT override primary statutory evidence.'
    },
    assessmentRevisions: [
      {
        revisionId: 'rev_smith_v1',
        claimId: 'clm_smith_dubai',
        versionNumber: 1,
        timestamp: new Date().toISOString(),
        previousAssessmentLabel: null,
        newAssessmentLabel: 'Insufficient evidence',
        previousScore: null,
        newScore: null,
        previousIndependentOrigins: 0,
        newIndependentOrigins: 3,
        sourcesAddedCount: 3,
        whatChangedRationale: 'Initial evidentiary baseline established: Zero official aviation safety occurrence filings located across statutory registries.',
        triggerEvent: 'initial_synthesis'
      }
    ],
    evidenceAudit: {
      generatedAt: new Date().toISOString(),
      pipelineVersion: 'VERITY v2.4 (Frontend Archive)',
      totalRetrieved: 8,
      totalValidated: 3,
      diversityScore: 0.88,
      wireSyndicationDetected: false
    },
    healthMonitoring: {
      status: 'healthy',
      lastEvaluatedAt: new Date().toISOString(),
      latencyMs: 412,
      activeSources: 3
    }
  },

  'ola-subsidy': {
    query: 'Ola Electric subsidy charger notice',
    durationMs: 388,
    sources: [
      {
        id: 'src_mhi_ola',
        title: 'Ministry of Heavy Industries Clarification on FAME-II and EMPS Charger Pricing',
        url: 'https://mhi.gov.in/en/schemes/emps-2024',
        snippet: 'Ministry directed original equipment manufacturers (OEMs) that off-board portable chargers cannot be bundled as mandatory accessories to circumvent ex-factory vehicle price caps for subsidy eligibility.',
        publisher: 'Ministry of Heavy Industries (Govt. of India)',
        publisherDomain: 'mhi.gov.in',
        sourceProvider: 'official',
        platform: 'official',
        sourceCategory: 'official',
        relevanceScore: 0.98,
        relevanceRationale: 'Primary statutory government department administering electric vehicle subsidies in India.'
      },
      {
        id: 'src_bse_ola',
        title: 'Ola Electric Mobility Limited — Corporate Exchange Filing on Charger Reimbursement',
        url: 'https://www.bseindia.com/corporates/',
        snippet: 'Ola Electric confirmed voluntary reimbursement program amounting to approx. ₹130 crore to customers who purchased off-board chargers separately, resolving inquiry from Heavy Industries Ministry.',
        publisher: 'Bombay Stock Exchange (BSE)',
        publisherDomain: 'bseindia.com',
        sourceProvider: 'official',
        platform: 'official',
        sourceCategory: 'official',
        relevanceScore: 0.95,
        relevanceRationale: 'Statutory public exchange filing submitted by the listed corporate entity.'
      },
      {
        id: 'src_et_ola',
        title: 'The Economic Times: Electric Two-Wheeler Makers Refund Charger Costs Following Ministry Probe',
        url: 'https://economictimes.indiatimes.com/industry/renewables/ev-makers-refund-charger-costs/articleshow/99912000.cms',
        snippet: 'Four leading EV manufacturers including Ola Electric, Ather Energy, and TVS Motor resolved Ministry notices by refunding amounts charged separately for EV chargers under FAME-II subsidy rules.',
        publisher: 'The Economic Times',
        publisherDomain: 'economictimes.com',
        sourceProvider: 'google_news',
        platform: 'news',
        sourceCategory: 'news',
        relevanceScore: 0.91,
        relevanceRationale: 'Accredited investigative financial press reporting corroborated settlement details.'
      }
    ],
    timeline: [
      {
        id: 'evt_ola_01',
        date: 'March 2023',
        event: 'Ministry of Heavy Industries initiates audit into electric two-wheeler billing practices regarding optional charger surcharges.',
        source: 'Ministry of Heavy Industries Notice',
        sourceUrl: 'https://mhi.gov.in'
      },
      {
        id: 'evt_ola_02',
        date: 'May 2023',
        event: 'Ola Electric files statutory notification outlining voluntary customer refund program for charger charges.',
        source: 'Corporate Filing & BSE Disclosure',
        sourceUrl: 'https://bseindia.com'
      },
      {
        id: 'evt_ola_03',
        date: 'August 2024',
        event: 'EMPS 2024 framework clarifies mandatory inclusion of basic charging equipment within subsidized retail invoice pricing.',
        source: 'Ministry EMPS Regulatory Circular',
        sourceUrl: 'https://mhi.gov.in'
      }
    ],
    keyClaims: [
      {
        id: 'clm_ola_01',
        statement: 'Ola Electric adjusted its pricing disclosures and issued customer refunds following Ministry of Heavy Industries notices regarding off-board charger billing under EV subsidy frameworks.',
        speakerOrSource: 'Ministry of Heavy Industries & Corporate Regulatory Filings',
        category: 'confirmed_fact',
        supportingExcerpt: 'Statutory filings and ministerial press releases confirm the implementation of a customer refund program of approximately ₹130 crore.',
        sourceUrl: 'https://mhi.gov.in'
      }
    ],
    discrepancies: [
      {
        id: 'disc_ola_01',
        statementA: 'Initial promotional marketing listed vehicle pricing excluding off-board charger as an unbundled optional accessory.',
        statementB: 'Ministry statutory guidelines required basic functional charging hardware to be integrated in certified subsidized price caps.',
        sourceA: 'Early Ola Marketing Catalogs',
        sourceB: 'Ministry of Heavy Industries FAME-II Guidelines',
        severity: 'moderate',
        explanation: 'Regulatory determination clarified that EV chargers cannot be billed as an optional add-on to stay beneath subsidy price caps.'
      }
    ],
    factBreakdown: {
      factualStatementsCount: 4,
      opinionOrSpeculationCount: 1,
      contradictedStatementsCount: 0,
      totalClaimsEvaluated: 5
    },
    aiAssessment: {
      assessmentLabel: 'Supported',
      score: 93,
      scoreBand: 'Very strong supporting evidence (90–100)',
      confidenceScore: 0.96,
      directAnswer: 'Verified by primary government and exchange records: Ola Electric updated pricing disclosures and refunded customers following a Ministry of Heavy Industries regulatory review regarding separate charger billing.',
      summaryExplanation: 'The regulatory inquiry, company settlement response, and subsequent customer refund program are comprehensively verified through Ministry of Heavy Industries circulars, parliamentary session disclosures, and BSE corporate filings.',
      independentOriginsCount: 4,
      corroboratingSourcesCount: 4,
      contradictingSourcesCount: 0,
      primaryAuthoritiesCount: 2,
      keyEvidentiaryFactors: [
        { factor: 'Ministry Gazette Orders', impact: 'positive', description: 'Statutory guidelines from Ministry of Heavy Industries confirm regulatory framework requirements.' },
        { factor: 'Public Exchange Disclosures', impact: 'positive', description: 'BSE corporate disclosures confirm execution of refund program.' },
        { factor: 'Accredited Media Corroboration', impact: 'positive', description: 'Major business newsrooms corroborated payment disbursements.' }
      ],
      methodologyNote: 'Verified against Tier 1 (Statutory Ministerial Filings) and Tier 2 (Stock Exchange Disclosures).'
    },
    claimPoll: {
      pollId: 'poll_ola_subsidy_v1',
      claimId: 'clm_ola_subsidy',
      claimVersion: 1,
      claimStatement: 'Ola Electric adjusted charger billing and refunded customers under government EV subsidy directives.',
      totalVotes: 62,
      options: {
        true: { count: 54, percentage: 87.1 },
        false: { count: 2, percentage: 3.2 },
        partially_true: { count: 4, percentage: 6.5 },
        insufficient_evidence: { count: 2, percentage: 3.2 }
      },
      userVote: null,
      status: 'active',
      policyNote: 'Community voting reflects public awareness. Primary proof is grounded in BSE corporate filings.'
    },
    assessmentRevisions: [
      {
        revisionId: 'rev_ola_v1',
        claimId: 'clm_ola_subsidy',
        versionNumber: 1,
        timestamp: new Date().toISOString(),
        previousAssessmentLabel: null,
        newAssessmentLabel: 'Supported',
        previousScore: null,
        newScore: 93,
        previousIndependentOrigins: 0,
        newIndependentOrigins: 4,
        sourcesAddedCount: 3,
        whatChangedRationale: 'Initial evidentiary baseline established with Tier 1 Ministerial filings and Tier 2 BSE corporate disclosures.',
        triggerEvent: 'initial_synthesis'
      }
    ],
    evidenceAudit: {
      generatedAt: new Date().toISOString(),
      pipelineVersion: 'VERITY v2.4 (Frontend Archive)',
      totalRetrieved: 10,
      totalValidated: 4,
      diversityScore: 0.94,
      wireSyndicationDetected: false
    },
    healthMonitoring: {
      status: 'healthy',
      lastEvaluatedAt: new Date().toISOString(),
      latencyMs: 388,
      activeSources: 3
    }
  },

  'sebi-algo': {
    query: 'SEBI algorithmic trading advisory',
    durationMs: 345,
    sources: [
      {
        id: 'src_sebi_order',
        title: 'SEBI Public Advisory on Unregistered Algorithmic Investment Schemes and Assured Returns',
        url: 'https://www.sebi.gov.in/public-notices/caution-unregistered-algo-services.html',
        snippet: 'Securities and Exchange Board of India cautions investors against dealing with entities offering automated algo-trading schemes promising guaranteed yields or capital protection without mandatory SEBI registration.',
        publisher: 'Securities and Exchange Board of India (SEBI)',
        publisherDomain: 'sebi.gov.in',
        sourceProvider: 'official',
        platform: 'official',
        sourceCategory: 'official',
        relevanceScore: 0.99,
        relevanceRationale: 'Primary capital market regulator order under SEBI Act 1992.'
      },
      {
        id: 'src_nse_circular',
        title: 'NSE Circular: Code of Conduct and Surveillance on Algorithmic API Bridges',
        url: 'https://www.nseindia.com/resources/exchange-communication-circulars',
        snippet: 'National Stock Exchange directed registered brokers to terminate third-party API integration with unapproved automation platforms claiming guaranteed returns.',
        publisher: 'National Stock Exchange of India (NSE)',
        publisherDomain: 'nseindia.com',
        sourceProvider: 'official',
        platform: 'official',
        sourceCategory: 'official',
        relevanceScore: 0.94,
        relevanceRationale: 'Recognized stock exchange supervisory directive.'
      },
      {
        id: 'src_livemint_algo',
        title: 'LiveMint: SEBI Tightens Scrutiny on Telegram-Based Algorithmic Trading Bots',
        url: 'https://www.livemint.com/market/stock-market-news/sebi-cracks-down-on-telegram-algo-bots-11698000000000.html',
        snippet: 'Regulatory crackdown targets entities using social messaging groups to harvest trading credentials and promising unrealistic fixed monthly returns.',
        publisher: 'LiveMint Financial News',
        publisherDomain: 'livemint.com',
        sourceProvider: 'google_news',
        platform: 'news',
        sourceCategory: 'news',
        relevanceScore: 0.90,
        relevanceRationale: 'Accredited financial reporting on market enforcement actions.'
      }
    ],
    timeline: [
      {
        id: 'evt_algo_01',
        date: 'June 2022',
        event: 'SEBI issues initial consultation paper on regulatory framework for algorithmic trading by retail investors.',
        source: 'SEBI Consultation Directorate',
        sourceUrl: 'https://www.sebi.gov.in'
      },
      {
        id: 'evt_algo_02',
        date: 'September 2023',
        event: 'SEBI issues public advisory and orders stock brokers to prevent API bridges to unauthorized automated yield bots.',
        source: 'SEBI Public Advisory Circular',
        sourceUrl: 'https://www.sebi.gov.in'
      },
      {
        id: 'evt_algo_03',
        date: 'August 2024',
        event: 'Enforcement orders WTM/MB/IVD/ID1/2024-25/1109 identify multiple unauthorized bot platforms guaranteeing monthly returns.',
        source: 'SEBI Whole Time Member Adjudication',
        sourceUrl: 'https://www.sebi.gov.in'
      }
    ],
    keyClaims: [
      {
        id: 'clm_algo_01',
        statement: 'SEBI prohibits any entity from offering algorithmic trading services with promises of guaranteed or assured returns, and cautions that automated bot services require explicit regulatory registration.',
        speakerOrSource: 'SEBI Public Advisory Orders',
        category: 'confirmed_fact',
        supportingExcerpt: 'Under SEBI (Prohibition of Fraudulent and Unfair Trade Practices) Regulations, guaranteeing returns on securities transactions is prohibited.',
        sourceUrl: 'https://www.sebi.gov.in'
      }
    ],
    discrepancies: [
      {
        id: 'disc_algo_01',
        statementA: 'Promotional channels market automated algo bots guaranteeing 15%–25% monthly risk-free returns.',
        statementB: 'SEBI statutory advisories state all guaranteed return representations in securities markets are unlawful and fraudulent.',
        sourceA: 'Promotional Telegram Channels',
        sourceB: 'SEBI Adjudication Orders',
        severity: 'critical',
        explanation: 'Statutory prohibition of guaranteed yields under securities regulations.'
      }
    ],
    factBreakdown: {
      factualStatementsCount: 5,
      opinionOrSpeculationCount: 0,
      contradictedStatementsCount: 0,
      totalClaimsEvaluated: 5
    },
    aiAssessment: {
      assessmentLabel: 'Supported',
      score: 97,
      scoreBand: 'Very strong supporting evidence (90–100)',
      confidenceScore: 0.98,
      directAnswer: 'Verified through statutory orders: SEBI has explicitly issued public advisories and directives prohibiting unregistered entities from providing algo-trading services that promise assured or guaranteed returns.',
      summaryExplanation: 'Official orders published by SEBI and circulars from national exchanges (NSE/BSE) establish that offering algorithmic trading with promised yields violates capital market regulations.',
      independentOriginsCount: 4,
      corroboratingSourcesCount: 4,
      contradictingSourcesCount: 0,
      primaryAuthoritiesCount: 2,
      keyEvidentiaryFactors: [
        { factor: 'Statutory Regulator Orders', impact: 'positive', description: 'SEBI gazette orders provide clear regulatory prohibition.' },
        { factor: 'Stock Exchange Circulars', impact: 'positive', description: 'NSE & BSE enforcement directives mandate broker compliance.' }
      ],
      methodologyNote: 'Verified against Tier 1 (Statutory SEBI & Exchange Adjudication Records).'
    },
    claimPoll: {
      pollId: 'poll_sebi_algo_v1',
      claimId: 'clm_sebi_algo',
      claimVersion: 1,
      claimStatement: 'SEBI prohibits retail algorithmic schemes with guaranteed return promises.',
      totalVotes: 85,
      options: {
        true: { count: 81, percentage: 95.3 },
        false: { count: 1, percentage: 1.2 },
        partially_true: { count: 2, percentage: 2.3 },
        insufficient_evidence: { count: 1, percentage: 1.2 }
      },
      userVote: null,
      status: 'active',
      policyNote: 'Community voting reflects consensus on official regulatory warnings.'
    },
    assessmentRevisions: [
      {
        revisionId: 'rev_sebi_algo_v1',
        claimId: 'clm_sebi_algo',
        versionNumber: 1,
        timestamp: new Date().toISOString(),
        previousAssessmentLabel: null,
        newAssessmentLabel: 'Supported',
        previousScore: null,
        newScore: 97,
        previousIndependentOrigins: 0,
        newIndependentOrigins: 4,
        sourcesAddedCount: 3,
        whatChangedRationale: 'Baseline verification established from SEBI statutory regulatory orders.',
        triggerEvent: 'initial_synthesis'
      }
    ],
    evidenceAudit: {
      generatedAt: new Date().toISOString(),
      pipelineVersion: 'VERITY v2.4 (Frontend Archive)',
      totalRetrieved: 12,
      totalValidated: 4,
      diversityScore: 0.95,
      wireSyndicationDetected: false
    },
    healthMonitoring: {
      status: 'healthy',
      lastEvaluatedAt: new Date().toISOString(),
      latencyMs: 345,
      activeSources: 3
    }
  },

  'byju-users': {
    query: 'Byju user count',
    durationMs: 395,
    sources: [
      {
        id: 'src_byju_pr',
        title: "Byju's Corporate Press Release & Archive Snapshot",
        url: 'https://web.archive.org/web/byjus-announcement',
        snippet: "Byju's stated in promotional press releases that its registered student user base grew from 100 million to over 150 million globally.",
        publisher: 'Wayback Machine & Press Release Archives',
        publisherDomain: 'web.archive.org',
        sourceProvider: 'official',
        platform: 'public_records',
        sourceCategory: 'public_records',
        relevanceScore: 0.92,
        relevanceRationale: 'Permanent web archive record capturing historical corporate statement changes.'
      },
      {
        id: 'src_nclt_byju',
        title: 'National Company Law Tribunal (NCLT) Bengaluru Insolvency Proceedings Record',
        url: 'https://nclt.gov.in/order-records',
        snippet: 'Court filings in insolvency proceedings note that reported user metrics and revenue recognition were subject to qualified audit remarks by statutory auditors (Deloitte / BDO).',
        publisher: 'National Company Law Tribunal (NCLT)',
        publisherDomain: 'nclt.gov.in',
        sourceProvider: 'official',
        platform: 'official',
        sourceCategory: 'official',
        relevanceScore: 0.94,
        relevanceRationale: 'Statutory judicial insolvency proceedings record.'
      },
      {
        id: 'src_reuters_byju',
        title: "Reuters: Byju's Auditor Resignations Highlight Metric Scrutiny",
        url: 'https://www.reuters.com/world/india/byjus-auditor-resignation/',
        snippet: 'Statutory auditors resigned citing delayed financial statements and lack of verification for reported user subscription retention data.',
        publisher: 'Reuters Technology & Business',
        publisherDomain: 'reuters.com',
        sourceProvider: 'google_news',
        platform: 'news',
        sourceCategory: 'news',
        relevanceScore: 0.89,
        relevanceRationale: 'Accredited international financial press investigation.'
      }
    ],
    timeline: [
      {
        id: 'evt_byju_01',
        date: '2021',
        event: "Byju's markets corporate statement citing 100 million registered learners.",
        source: 'Corporate Press Disclosures',
        sourceUrl: 'https://web.archive.org'
      },
      {
        id: 'evt_byju_02',
        date: '2023',
        event: "Marketing statements updated claiming user base expanded to 150 million worldwide.",
        source: 'Wayback Machine Snapshot #202309',
        sourceUrl: 'https://web.archive.org'
      },
      {
        id: 'evt_byju_03',
        date: '2024',
        event: "Statutory auditors BDO / Deloitte resign citing unverified financial metrics and delayed filings.",
        source: 'NCLT & Ministry of Corporate Affairs Filings',
        sourceUrl: 'https://nclt.gov.in'
      }
    ],
    keyClaims: [
      {
        id: 'clm_byju_01',
        statement: "Byju's updated its claimed user base from 100 million to 150 million, but the metric lacks independent audited verification amid corporate resolution.",
        speakerOrSource: 'Corporate Statements vs Statutory Audit Disclosures',
        category: 'disputed_claim',
        supportingExcerpt: 'While promotional materials advertised 150 million learners, insolvency court filings confirm that metric retention lacked audited statutory validation.',
        sourceUrl: 'https://nclt.gov.in'
      }
    ],
    discrepancies: [
      {
        id: 'disc_byju_01',
        statementA: "Marketing claims advertised 150M active learners globally.",
        statementB: "Statutory auditors qualified financial disclosures citing absence of underlying verification.",
        sourceA: "Corporate Marketing Releases",
        sourceB: "Auditor Resignation Disclosures (MCA)",
        severity: 'critical',
        explanation: 'Conflict between self-reported corporate marketing user metrics and statutory auditor qualified opinions.'
      }
    ],
    factBreakdown: {
      factualStatementsCount: 2,
      opinionOrSpeculationCount: 1,
      contradictedStatementsCount: 2,
      totalClaimsEvaluated: 5
    },
    aiAssessment: {
      assessmentLabel: 'Disputed',
      score: 38,
      scoreBand: 'Limited supporting evidence (20–39)',
      confidenceScore: 0.91,
      directAnswer: "Byju's self-reported marketing metric of 150 million users is disputed and uncorroborated by independent statutory audits, with regulatory filings documenting qualified audit objections.",
      summaryExplanation: 'VERITY tracked the revision of user counts from 100M to 150M across historical web snapshots. However, judicial insolvency filings and auditor resignations confirm that registered user metrics lacked independent verification.',
      independentOriginsCount: 3,
      corroboratingSourcesCount: 1,
      contradictingSourcesCount: 2,
      primaryAuthoritiesCount: 1,
      keyEvidentiaryFactors: [
        { factor: 'Auditor Disclosures', impact: 'negative', description: 'Statutory auditors resigned citing lack of underlying financial metric corroboration.' },
        { factor: 'Judicial NCLT Records', impact: 'negative', description: 'Court records document ongoing dispute over asset and user base valuation.' }
      ],
      methodologyNote: 'Evaluated against Tier 2 (MCA Corporate Filings) and Tier 3 (Accredited Financial Press).'
    },
    claimPoll: {
      pollId: 'poll_byju_users_v1',
      claimId: 'clm_byju_users',
      claimVersion: 1,
      claimStatement: "Byju's 150M user metric is verified by independent audit.",
      totalVotes: 52,
      options: {
        true: { count: 4, percentage: 7.7 },
        false: { count: 39, percentage: 75.0 },
        partially_true: { count: 6, percentage: 11.5 },
        insufficient_evidence: { count: 3, percentage: 5.8 }
      },
      userVote: null,
      status: 'active',
      policyNote: 'Community voting reflects consensus on unverified corporate metrics.'
    },
    assessmentRevisions: [
      {
        revisionId: 'rev_byju_v1',
        claimId: 'clm_byju_users',
        versionNumber: 1,
        timestamp: new Date().toISOString(),
        previousAssessmentLabel: null,
        newAssessmentLabel: 'Disputed',
        previousScore: null,
        newScore: 38,
        previousIndependentOrigins: 0,
        newIndependentOrigins: 3,
        sourcesAddedCount: 3,
        whatChangedRationale: 'Historical claim revision recorded: 100M to 150M transition documented without audited corroboration.',
        triggerEvent: 'initial_synthesis'
      }
    ],
    evidenceAudit: {
      generatedAt: new Date().toISOString(),
      pipelineVersion: 'VERITY v2.4 (Frontend Archive)',
      totalRetrieved: 9,
      totalValidated: 3,
      diversityScore: 0.89,
      wireSyndicationDetected: false
    },
    healthMonitoring: {
      status: 'healthy',
      lastEvaluatedAt: new Date().toISOString(),
      latencyMs: 395,
      activeSources: 3
    }
  },

  'rbi-rupee': {
    query: 'RBI digital rupee pilot',
    durationMs: 360,
    sources: [
      {
        id: 'src_rbi_cbdc',
        title: 'Reserve Bank of India — Operational Framework for Central Bank Digital Currency (e₹-R)',
        url: 'https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx',
        snippet: 'Reserve Bank of India Department of Payment and Settlement Systems details retail CBDC (e₹-R) interoperability enabling seamless transactions via existing UPI QR codes across participating commercial banks.',
        publisher: 'Reserve Bank of India',
        publisherDomain: 'rbi.org.in',
        sourceProvider: 'official',
        platform: 'official',
        sourceCategory: 'official',
        relevanceScore: 0.98,
        relevanceRationale: 'Central banking statutory issuer of the sovereign currency.'
      },
      {
        id: 'src_npci_cbdc',
        title: 'NPCI Circular: Technical Interoperability between UPI QR Network and CBDC Wallets',
        url: 'https://www.npci.org.in/press-releases',
        snippet: 'NPCI confirmed technical integration allowing any customer holding a participating bank CBDC wallet to scan standard merchant UPI QR codes.',
        publisher: 'National Payments Corporation of India (NPCI)',
        publisherDomain: 'npci.org.in',
        sourceProvider: 'official',
        platform: 'official',
        sourceCategory: 'official',
        relevanceScore: 0.95,
        relevanceRationale: 'Umbrella organization for retail payment systems in India.'
      },
      {
        id: 'src_mint_cbdc',
        title: 'Mint: How UPI Interoperability Boosted Retail Digital Rupee Adoption',
        url: 'https://www.livemint.com/banking/digital-rupee-upi-qr-code-interoperability-11693000000000.html',
        snippet: 'Commercial banks including SBI, HDFC Bank, ICICI Bank, and Punjab National Bank successfully rolled out unified QR code support for the digital rupee pilot.',
        publisher: 'LiveMint',
        publisherDomain: 'livemint.com',
        sourceProvider: 'google_news',
        platform: 'news',
        sourceCategory: 'news',
        relevanceScore: 0.91,
        relevanceRationale: 'Accredited banking sector coverage corroborating nationwide pilot deployment.'
      }
    ],
    timeline: [
      {
        id: 'evt_cbdc_01',
        date: 'December 2022',
        event: 'RBI launches retail Central Bank Digital Currency (e₹-R) pilot with closed user group in four cities.',
        source: 'RBI Operational Circular',
        sourceUrl: 'https://rbi.org.in'
      },
      {
        id: 'evt_cbdc_02',
        date: 'July 2023',
        event: 'RBI announces policy decision to enable QR code interoperability between UPI and digital rupee.',
        source: 'RBI Monetary Policy Statement',
        sourceUrl: 'https://rbi.org.in'
      },
      {
        id: 'evt_cbdc_03',
        date: 'September 2023',
        event: 'Major commercial banks complete rollout of single QR code scanning for both UPI and digital rupee wallets.',
        source: 'NPCI & Banking Federation Disclosures',
        sourceUrl: 'https://npci.org.in'
      }
    ],
    keyClaims: [
      {
        id: 'clm_cbdc_01',
        statement: 'The Reserve Bank of India retail digital rupee (e₹-R) pilot is interoperable with existing merchant UPI QR codes across participating banks.',
        speakerOrSource: 'RBI Department of Payment & Settlement Systems',
        category: 'confirmed_fact',
        supportingExcerpt: 'Official circulars confirm that retail CBDC users can scan standard merchant UPI QR codes without requiring separate merchant onboarding.',
        sourceUrl: 'https://rbi.org.in'
      }
    ],
    discrepancies: [],
    factBreakdown: {
      factualStatementsCount: 4,
      opinionOrSpeculationCount: 0,
      contradictedStatementsCount: 0,
      totalClaimsEvaluated: 4
    },
    aiAssessment: {
      assessmentLabel: 'Supported',
      score: 96,
      scoreBand: 'Very strong supporting evidence (90–100)',
      confidenceScore: 0.97,
      directAnswer: 'Verified accurate: The Reserve Bank of India retail digital rupee (e₹-R) is officially interoperable with existing merchant UPI QR codes across participating commercial banks.',
      summaryExplanation: 'Central bank documentation, NPCI technical specifications, and commercial bank rollouts verify that e₹-R wallets can scan any standard UPI QR code to complete payments.',
      independentOriginsCount: 4,
      corroboratingSourcesCount: 4,
      contradictingSourcesCount: 0,
      primaryAuthoritiesCount: 2,
      keyEvidentiaryFactors: [
        { factor: 'Central Bank Statutory Policy', impact: 'positive', description: 'RBI press releases establish sovereign regulatory framework.' },
        { factor: 'NPCI Architecture Specifications', impact: 'positive', description: 'National payment rails verify technical interoperability.' }
      ],
      methodologyNote: 'Verified against Tier 1 (Central Bank & Payment Rails Statutory Records).'
    },
    claimPoll: {
      pollId: 'poll_rbi_rupee_v1',
      claimId: 'clm_rbi_rupee',
      claimVersion: 1,
      claimStatement: 'RBI retail digital rupee is interoperable with existing UPI QR codes.',
      totalVotes: 73,
      options: {
        true: { count: 68, percentage: 93.2 },
        false: { count: 1, percentage: 1.4 },
        partially_true: { count: 3, percentage: 4.1 },
        insufficient_evidence: { count: 1, percentage: 1.4 }
      },
      userVote: null,
      status: 'active',
      policyNote: 'Community voting reflects high public awareness of official central bank releases.'
    },
    assessmentRevisions: [
      {
        revisionId: 'rev_rbi_v1',
        claimId: 'clm_rbi_rupee',
        versionNumber: 1,
        timestamp: new Date().toISOString(),
        previousAssessmentLabel: null,
        newAssessmentLabel: 'Supported',
        previousScore: null,
        newScore: 96,
        previousIndependentOrigins: 0,
        newIndependentOrigins: 4,
        sourcesAddedCount: 3,
        whatChangedRationale: 'Initial evidentiary baseline established from RBI monetary policy framework.',
        triggerEvent: 'initial_synthesis'
      }
    ],
    evidenceAudit: {
      generatedAt: new Date().toISOString(),
      pipelineVersion: 'VERITY v2.4 (Frontend Archive)',
      totalRetrieved: 11,
      totalValidated: 4,
      diversityScore: 0.96,
      wireSyndicationDetected: false
    },
    healthMonitoring: {
      status: 'healthy',
      lastEvaluatedAt: new Date().toISOString(),
      latencyMs: 360,
      activeSources: 3
    }
  },

  'apollo-11': {
    query: 'Apollo 11 moon landing July 1969',
    durationMs: 310,
    sources: [
      {
        id: 'src_nasa_apollo',
        title: 'NASA Apollo 11 Mission Overview & Flight Telemetry Logs',
        url: 'https://www.nasa.gov/mission_pages/apollo/apollo11.html',
        snippet: 'Official NASA mission logs confirm Lunar Module Eagle touched down at the Sea of Tranquility on July 20, 1969, with Neil Armstrong and Buzz Aldrin completing the first crewed lunar surface EVA.',
        publisher: 'National Aeronautics and Space Administration (NASA)',
        publisherDomain: 'nasa.gov',
        sourceProvider: 'official',
        platform: 'official',
        sourceCategory: 'official',
        relevanceScore: 0.99,
        relevanceRationale: 'Primary government space flight agency records and flight telemetry.'
      },
      {
        id: 'src_smithsonian_apollo',
        title: 'Smithsonian National Air and Space Museum — Apollo 11 Artifact Records',
        url: 'https://airandspace.si.edu/explore/missions/apollo-11',
        snippet: 'Permanent national repository preserving lunar sample returns, command module Columbia, and independent international radio monitoring transcripts.',
        publisher: 'Smithsonian Institution',
        publisherDomain: 'airandspace.si.edu',
        sourceProvider: 'official',
        platform: 'official',
        sourceCategory: 'official',
        relevanceScore: 0.96,
        relevanceRationale: 'Curatorial and physical evidentiary archives.'
      },
      {
        id: 'src_bbc_apollo',
        title: 'BBC News: Historical Archives on Apollo 11 Global Observatories Tracking',
        url: 'https://www.bbc.com/news/science-environment-48907836',
        snippet: 'Independent radio observatories including Jodrell Bank (UK) and Parkes (Australia) tracked Apollo 11 radio signals directly from lunar coordinates.',
        publisher: 'BBC News Science',
        publisherDomain: 'bbc.com',
        sourceProvider: 'google_news',
        platform: 'news',
        sourceCategory: 'news',
        relevanceScore: 0.94,
        relevanceRationale: 'International third-party verification of trajectory and lunar descent.'
      }
    ],
    timeline: [
      {
        id: 'evt_ap_01',
        date: 'July 16, 1969',
        event: 'Apollo 11 launches from Kennedy Space Center via Saturn V rocket.',
        source: 'NASA Flight Operations',
        sourceUrl: 'https://www.nasa.gov'
      },
      {
        id: 'evt_ap_02',
        date: 'July 20, 1969',
        event: 'Lunar Module Eagle lands at Mare Tranquillitatis (Sea of Tranquility).',
        source: 'NASA Mission Log & Jodrell Bank Observatory Tracking',
        sourceUrl: 'https://www.nasa.gov'
      },
      {
        id: 'evt_ap_03',
        date: 'July 24, 1969',
        event: 'Command module Columbia splashes down safely in the Pacific Ocean.',
        source: 'US Navy Recovery Records',
        sourceUrl: 'https://airandspace.si.edu'
      }
    ],
    keyClaims: [
      {
        id: 'clm_ap_01',
        statement: 'Apollo 11 landed humans on the Moon on July 20, 1969, verified by flight telemetry, lunar sample returns, and independent international tracking stations.',
        speakerOrSource: 'NASA, Smithsonian, and Independent Global Observatories',
        category: 'confirmed_fact',
        supportingExcerpt: 'Universal scientific consensus corroborated by telemetry, retroreflector lasers, and physical lunar regolith samples.',
        sourceUrl: 'https://www.nasa.gov'
      }
    ],
    discrepancies: [],
    factBreakdown: {
      factualStatementsCount: 5,
      opinionOrSpeculationCount: 0,
      contradictedStatementsCount: 0,
      totalClaimsEvaluated: 5
    },
    aiAssessment: {
      assessmentLabel: 'Supported',
      score: 98,
      scoreBand: 'Very strong supporting evidence (90–100)',
      confidenceScore: 0.99,
      directAnswer: 'Verified historical fact: Apollo 11 successfully landed humans on the Moon in July 1969, verified by multi-agency flight telemetry, physical lunar regolith samples, and independent global observatories.',
      summaryExplanation: 'The historical occurrence of the Apollo 11 crewed lunar landing is verified across multiple independent astronomical observatories, space agencies, and physical laser retroreflectors still measured today.',
      independentOriginsCount: 5,
      corroboratingSourcesCount: 5,
      contradictingSourcesCount: 0,
      primaryAuthoritiesCount: 3,
      keyEvidentiaryFactors: [
        { factor: 'Physical Laser Ranging Retrorreflector Data', impact: 'positive', description: 'Laser ranging to Apollo 11 lunar retroreflectors continues to provide millimeter-accuracy position data.' },
        { factor: 'Independent Observatories Telemetry', impact: 'positive', description: 'Independent observatories in Australia and UK tracked signals directly from lunar coordinates.' }
      ],
      methodologyNote: 'Verified against Tier 1 (Statutory Flight Telemetry & Curatorial Physical Archives).'
    },
    claimPoll: {
      pollId: 'poll_apollo_11_v1',
      claimId: 'clm_apollo_11',
      claimVersion: 1,
      claimStatement: 'Apollo 11 landed humans on the Moon in July 1969.',
      totalVotes: 142,
      options: {
        true: { count: 139, percentage: 97.9 },
        false: { count: 1, percentage: 0.7 },
        partially_true: { count: 1, percentage: 0.7 },
        insufficient_evidence: { count: 1, percentage: 0.7 }
      },
      userVote: null,
      status: 'active',
      policyNote: 'Community voting reflects overwhelming consensus on established historical records.'
    },
    assessmentRevisions: [
      {
        revisionId: 'rev_apollo_v1',
        claimId: 'clm_apollo_11',
        versionNumber: 1,
        timestamp: new Date().toISOString(),
        previousAssessmentLabel: null,
        newAssessmentLabel: 'Supported',
        previousScore: null,
        newScore: 98,
        previousIndependentOrigins: 0,
        newIndependentOrigins: 5,
        sourcesAddedCount: 3,
        whatChangedRationale: 'Historical baseline established with universal scientific and physical telemetry corroboration.',
        triggerEvent: 'initial_synthesis'
      }
    ],
    evidenceAudit: {
      generatedAt: new Date().toISOString(),
      pipelineVersion: 'VERITY v2.4 (Frontend Archive)',
      totalRetrieved: 14,
      totalValidated: 5,
      diversityScore: 0.98,
      wireSyndicationDetected: false
    },
    healthMonitoring: {
      status: 'healthy',
      lastEvaluatedAt: new Date().toISOString(),
      latencyMs: 310,
      activeSources: 3
    }
  },

  'iit-bombay': {
    query: 'IIT Bombay suicide case',
    durationMs: 350,
    sources: [
      {
        id: 'src_thehindu_iit',
        title: 'The Hindu: IIT Bombay Student Death — Police Register Accidental Death Report and Launch SIT',
        url: 'https://www.thehindu.com/news/national/other-states/iit-bombay-student-death/article66504000.ece',
        snippet: 'Mumbai Police confirmed first-year BTech student Darshan Solanki died by suicide at IIT Bombay campus in Powai. Special Investigation Team (SIT) initiated inquiry.',
        publisher: 'The Hindu',
        publisherDomain: 'thehindu.com',
        sourceProvider: 'google_news',
        platform: 'news',
        sourceCategory: 'news',
        relevanceScore: 0.96,
        relevanceRationale: 'Primary investigative national press reporting police FIR filings.'
      },
      {
        id: 'src_ie_iit',
        title: 'The Indian Express: SIT Submits Chargesheet in Court Regarding IIT Bombay Student Death',
        url: 'https://indianexpress.com/article/cities/mumbai/iit-bombay-student-darshan-solanki-suicide-sit-chargesheet-8636700/',
        snippet: 'Special Investigation Team submitted chargesheet detailing findings, suicide note handwriting analysis, and witness statements from campus residents.',
        publisher: 'The Indian Express',
        publisherDomain: 'indianexpress.com',
        sourceProvider: 'google_news',
        platform: 'news',
        sourceCategory: 'news',
        relevanceScore: 0.94,
        relevanceRationale: 'Court chargesheet reporting with judicial attribution.'
      },
      {
        id: 'src_ndtv_iit',
        title: 'NDTV: IIT Bombay Constitutes Internal Inquiry Committee to Review Campus Student Welfare',
        url: 'https://www.ndtv.com/india-news/iit-bombay-darshan-solanki-suicide-case-student-arrested-by-mumbai-police-3932822',
        snippet: 'IIT Bombay administration established a 12-member internal panel to investigate circumstances and recommend mental health and anti-discrimination reforms.',
        publisher: 'NDTV News Desk',
        publisherDomain: 'ndtv.com',
        sourceProvider: 'google_news',
        platform: 'news',
        sourceCategory: 'news',
        relevanceScore: 0.91,
        relevanceRationale: 'Institutional administrative response coverage.'
      }
    ],
    timeline: [
      {
        id: 'evt_iit_01',
        date: 'February 12, 2023',
        event: 'First-year BTech student Darshan Solanki dies by suicide at IIT Bombay campus in Powai, Mumbai.',
        source: 'Mumbai Police Initial Report',
        sourceUrl: 'https://www.thehindu.com'
      },
      {
        id: 'evt_iit_02',
        date: 'February 2023',
        event: 'IIT Bombay institutes 12-member internal inquiry committee to examine campus welfare and peer dynamics.',
        source: 'IIT Bombay Administrative Notice',
        sourceUrl: 'https://timesofindia.indiatimes.com'
      },
      {
        id: 'evt_iit_03',
        date: 'May 2023',
        event: 'Mumbai Police Special Investigation Team (SIT) submits comprehensive chargesheet to special court.',
        source: 'SIT Court Filings & Indian Express',
        sourceUrl: 'https://indianexpress.com'
      }
    ],
    keyClaims: [
      {
        id: 'clm_iit_01',
        statement: 'A student suicide incident occurred at IIT Bombay in February 2023, resulting in a Mumbai Police SIT investigation and institutional review committee.',
        speakerOrSource: 'Mumbai Police FIR & SIT Chargesheet',
        category: 'confirmed_fact',
        supportingExcerpt: 'Official police FIR, SIT chargesheet, and institutional administration records confirm the occurrence and ongoing judicial proceedings.',
        sourceUrl: 'https://www.thehindu.com'
      }
    ],
    discrepancies: [
      {
        id: 'disc_iit_01',
        statementA: 'Student groups allege institutional caste discrimination was a primary contributing factor.',
        statementB: 'Internal institutional committee interim report found no direct proof of academic or institutional caste bias.',
        sourceA: 'Student Group Representations',
        sourceB: 'IIT Bombay Internal Panel Interim Report',
        severity: 'moderate',
        explanation: 'Contested findings between community student group representations and institutional internal committee conclusions regarding underlying contributing factors.'
      }
    ],
    factBreakdown: {
      factualStatementsCount: 4,
      opinionOrSpeculationCount: 1,
      contradictedStatementsCount: 0,
      totalClaimsEvaluated: 5
    },
    aiAssessment: {
      assessmentLabel: 'Supported',
      score: 92,
      scoreBand: 'Very strong supporting evidence (90–100)',
      confidenceScore: 0.95,
      directAnswer: 'Verified occurrence: Official police records, the Special Investigation Team chargesheet, and IIT Bombay administration confirm that a student suicide occurred on campus in February 2023.',
      summaryExplanation: 'The core incident is corroborated by Mumbai Police FIR, an SIT chargesheet submitted to court, and administration statements. Associated allegations regarding specific contributing factors remain actively contested between student groups and institutional reports.',
      independentOriginsCount: 4,
      corroboratingSourcesCount: 4,
      contradictingSourcesCount: 0,
      primaryAuthoritiesCount: 2,
      keyEvidentiaryFactors: [
        { factor: 'SIT Chargesheet & Police FIR', impact: 'positive', description: 'Statutory criminal justice system documents verify the incident and investigation.' },
        { factor: 'Institutional Administration Disclosures', impact: 'positive', description: 'IIT Bombay official statements confirm campus occurrence and internal committee formation.' }
      ],
      methodologyNote: 'Verified against Tier 1 (Police FIR & Court Chargesheet) and Tier 3 (Accredited National Press).'
    },
    claimPoll: {
      pollId: 'poll_iit_bombay_v1',
      claimId: 'clm_iit_bombay',
      claimVersion: 1,
      claimStatement: 'A student suicide occurred at IIT Bombay and was formally investigated by police and an internal committee.',
      totalVotes: 64,
      options: {
        true: { count: 59, percentage: 92.2 },
        false: { count: 1, percentage: 1.6 },
        partially_true: { count: 3, percentage: 4.7 },
        insufficient_evidence: { count: 1, percentage: 1.6 }
      },
      userVote: null,
      status: 'active',
      policyNote: 'Community voting reflects awareness of verified incident records.'
    },
    assessmentRevisions: [
      {
        revisionId: 'rev_iit_v1',
        claimId: 'clm_iit_bombay',
        versionNumber: 1,
        timestamp: new Date().toISOString(),
        previousAssessmentLabel: null,
        newAssessmentLabel: 'Supported',
        previousScore: null,
        newScore: 92,
        previousIndependentOrigins: 0,
        newIndependentOrigins: 4,
        sourcesAddedCount: 3,
        whatChangedRationale: 'Initial evidentiary baseline established from Mumbai Police SIT filings and institutional disclosures.',
        triggerEvent: 'initial_synthesis'
      }
    ],
    evidenceAudit: {
      generatedAt: new Date().toISOString(),
      pipelineVersion: 'VERITY v2.4 (Frontend Archive)',
      totalRetrieved: 10,
      totalValidated: 4,
      diversityScore: 0.93,
      wireSyndicationDetected: false
    },
    healthMonitoring: {
      status: 'healthy',
      lastEvaluatedAt: new Date().toISOString(),
      latencyMs: 350,
      activeSources: 3
    }
  }
};

function normalizeDossier(raw: any): LiveIntelligenceReport {
  return {
    query: raw.query,
    searchedAt: raw.searchedAt || new Date().toISOString(),
    isArchivedDemonstration: true,
    topicSummary: raw.topicSummary || raw.aiAssessment?.directAnswer || raw.query,
    incidentStatus: raw.incidentStatus || 'reported',
    evidenceStrength: raw.evidenceStrength || 'Moderate (Reputable Media Reports)',
    sourceDiversityScore: raw.sourceDiversityScore || 85,
    searchDurationMs: raw.searchDurationMs || raw.durationMs || 350,
    databaseComparison: raw.databaseComparison || {
      isNewIncident: false,
      matchedClaims: [],
      comparisonNotes: 'Archived statutory cross-reference on file.'
    },
    sources: (raw.sources || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      url: s.url,
      snippet: s.snippet,
      publisher: s.publisher,
      publisherDomain: s.publisherDomain,
      sourceProvider: s.sourceProvider || 'official',
      platform: s.platform || 'official',
      sourceCategory: s.sourceCategory || 'official',
      relevanceScore: s.relevanceScore || 0.9,
      relevanceRationale: s.relevanceRationale || ''
    })),
    timeline: (raw.timeline || []).map((t: any) => ({
      id: t.id,
      date: t.date,
      time: t.time,
      event: t.event,
      source: t.source,
      sourceUrl: t.sourceUrl
    })),
    keyClaims: (raw.keyClaims || []).map((c: any) => ({
      id: c.id,
      statement: c.statement,
      speakerOrSource: c.speakerOrSource || 'Verified Source',
      category: c.category || 'confirmed_fact',
      supportingExcerpt: c.supportingExcerpt || '',
      sourceUrl: c.sourceUrl || '',
      publisher: c.publisher || 'Official Record',
      confidenceScore: c.confidenceScore || 0.95
    })),
    discrepancies: (raw.discrepancies || []).map((d: any) => ({
      id: d.id,
      topic: d.topic || 'Claim vs Official Record',
      claimA: d.claimA || d.statementA || '',
      sourceA: d.sourceA || '',
      claimB: d.claimB || d.statementB || '',
      sourceB: d.sourceB || '',
      analysis: d.analysis || d.explanation || ''
    })),
    breakdown: raw.breakdown || {
      confirmed: (raw.keyClaims || []).filter((k: any) => k.category === 'confirmed_fact').map((k: any) => k.statement),
      reported: (raw.keyClaims || []).filter((k: any) => k.category === 'reported_statement').map((k: any) => k.statement),
      disputed: (raw.keyClaims || []).filter((k: any) => k.category === 'disputed_claim' || k.category === 'unverified_rumor').map((k: any) => k.statement),
      unknown: ['Historical statutory records audited', 'Temporal updates monitored']
    },
    aiAssessment: {
      assessmentLabel: raw.aiAssessment?.assessmentLabel === 'Disputed' ? 'Mixed evidence' : (raw.aiAssessment?.assessmentLabel || 'Supported'),
      evidenceSupportScore: raw.aiAssessment?.evidenceSupportScore ?? raw.aiAssessment?.score ?? 80,
      evidenceSupportBand: raw.aiAssessment?.scoreBand || raw.aiAssessment?.evidenceSupportBand || 'Strong supporting evidence (75–89)',
      aiConfidenceIndicator: raw.aiAssessment?.aiConfidenceIndicator || {
        score: Math.round((raw.aiAssessment?.confidenceScore || 0.92) * 100),
        rating: 'High',
        rationale: 'Multiple authoritative primary records and domain corroboration verified.'
      },
      directAnswer: raw.aiAssessment?.directAnswer || '',
      conciseExplanation: raw.aiAssessment?.conciseExplanation || raw.aiAssessment?.summaryExplanation || '',
      strongestSupportingEvidence: raw.aiAssessment?.strongestSupportingEvidence || [],
      strongestContradictingEvidence: raw.aiAssessment?.strongestContradictingEvidence || [],
      unknownsAndLimitations: raw.aiAssessment?.unknownsAndLimitations || [],
      sourceCount: (raw.sources || []).length,
      independentSourceCount: raw.aiAssessment?.independentOriginsCount || 3,
      lastAnalysisTimestamp: raw.searchedAt || new Date().toISOString(),
      methodologyNotes: raw.aiAssessment?.methodologyNote || raw.aiAssessment?.methodologyNotes || 'Standard VERITY evidentiary methodology applied.',
      auditTrail: raw.aiAssessment?.auditTrail || {
        scoringFactors: (raw.aiAssessment?.keyEvidentiaryFactors || []).map((f: any) => ({
          factorName: f.factor,
          maxPoints: 100,
          rationale: f.description
        })),
        totalRawScore: raw.aiAssessment?.score ?? 85,
        finalScore: raw.aiAssessment?.score ?? 85,
        scoringFormulaExplanation: 'Multi-factor verification model evaluated across statutory and news sources.'
      },
      revisionHistory: raw.assessmentRevisions || raw.aiAssessment?.revisionHistory || []
    },
    claimPoll: raw.claimPoll || {
      pollId: `poll_${raw.query.replace(/\s+/g, '_')}`,
      claimId: `clm_${raw.query.replace(/\s+/g, '_')}`,
      claimVersion: 1,
      claimStatement: raw.query,
      totalVotes: 35,
      options: {
        true: { count: 20, percentage: 57.1 },
        false: { count: 10, percentage: 28.6 },
        partially_true: { count: 3, percentage: 8.6 },
        insufficient_evidence: { count: 2, percentage: 5.7 }
      },
      status: 'active',
      policyNote: 'Community voting reflects public sentiment. Crowd consensus does NOT override primary statutory evidence.'
    },
    healthMonitoring: {
      status: 'healthy',
      warnings: [],
      staleSourceCount: 0,
      providerFailures: [],
      missingEvidenceDimensions: [],
      attributionConfidence: 95
    }
  };
}

/**
 * Matches a query against our curated demonstration dossier archive.
 * Supports exact terms, normalized tokens, and entity references.
 */
export function findSampleDossier(rawQuery: string): LiveIntelligenceReport | null {
  if (!rawQuery) return null;
  const q = rawQuery.toLowerCase().trim();

  let raw: any = null;
  if (q.includes('smith') || q.includes('dubai') || q.includes('flight 402') || q.includes('altercation')) {
    raw = SAMPLE_DOSSIERS['smith-dubai'];
  } else if (q.includes('ola') || q.includes('subsidy') || q.includes('charger') || q.includes('fame') || q.includes('emps')) {
    raw = SAMPLE_DOSSIERS['ola-subsidy'];
  } else if (q.includes('sebi') || q.includes('algo') || q.includes('tradegenius') || q.includes('algorithmic')) {
    raw = SAMPLE_DOSSIERS['sebi-algo'];
  } else if (q.includes('byju') || q.includes('user count') || q.includes('150 million') || q.includes('learners')) {
    raw = SAMPLE_DOSSIERS['byju-users'];
  } else if (q.includes('rbi') || q.includes('rupee') || q.includes('digital rupee') || q.includes('cbdc') || q.includes('upi')) {
    raw = SAMPLE_DOSSIERS['rbi-rupee'];
  } else if (q.includes('apollo') || q.includes('moon') || q.includes('lunar') || q.includes('armstrong') || q.includes('1969')) {
    raw = SAMPLE_DOSSIERS['apollo-11'];
  } else if (q.includes('iit') || q.includes('bombay') || q.includes('solanki') || q.includes('suicide')) {
    raw = SAMPLE_DOSSIERS['iit-bombay'];
  }

  return raw ? normalizeDossier(raw) : null;
}
