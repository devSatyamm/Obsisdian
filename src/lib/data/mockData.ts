import { EntityProfile, CommunitySubmission, UserPersona } from '../types';

export const DEMO_PERSONAS: Record<'guest' | 'contributor' | 'moderator', UserPersona> = {
  guest: {
    id: 'usr_guest',
    name: 'Anonymous Visitor',
    email: 'guest@verity.network',
    role: 'guest',
    avatarInitials: 'AV'
  },
  contributor: {
    id: 'usr_priya_sharma',
    name: 'Priya Sharma',
    email: 'priya.research@financialwatch.org',
    role: 'contributor',
    avatarInitials: 'PS'
  },
  moderator: {
    id: 'usr_vikram_rao',
    name: 'Vikram Rao, CFA',
    email: 'v.rao@verity-moderation.org',
    role: 'moderator',
    avatarInitials: 'VR'
  }
};

export const INITIAL_ENTITIES: EntityProfile[] = [
  {
    id: 'ent_tradegenius_ai',
    slug: 'tradegenius-ai-algorithms',
    name: 'TradeGenius AI Algorithms',
    category: 'Algorithmic Trading',
    aliases: ['TG Wealth Bot', 'TradeGenius Global Pvt Ltd (Alleged)', 'AlphaPulse VIP'],
    website: 'https://tradegenius-algo.demo-invest.in',
    identifiers: {
      telegramHandles: ['@TradeGeniusOfficial', '@VIP_AlphaReturns'],
      domainAge: 'Registered July 2024 (NameCheap privacy masked)',
      pan: 'Unverified / Not provided in marketing disclosures'
    },
    registrationStatus: 'Caution Listed by Regulator',
    verificationBadge: 'Official Regulatory Caution',
    shortDescription:
      'High-frequency algorithmic trading subscription promising guaranteed 22% monthly returns on retail demat accounts via Telegram integration.',
    executiveSummary:
      'TradeGenius AI claims to provide automated algo-trading signals through an automated API bridge. As of August 2024, the Securities and Exchange Board of India (SEBI) issued an official public advisory identifying the platform as an unregistered investment adviser operating without mandatory SEBI registration [1]. Multiple community contributors have corroborated evidence of withdrawal fee surcharges and unfulfilled settlement requests [2].',
    lastUpdated: '2024-11-15T14:30:00Z',
    isDemoEntity: true,
    notices: [
      {
        id: 'not_sebi_tg_01',
        entityId: 'ent_tradegenius_ai',
        regulator: 'SEBI',
        orderNumber: 'WTM/MB/IVD/ID1/2024-25/1109',
        noticeType: 'Caution Notice',
        dateIssued: '2024-08-24',
        headline: 'Public Advisory regarding Unregistered Algorithmic Investment Schemes',
        summary:
          'SEBI alerted investors that TradeGenius AI is neither registered as an Investment Adviser (IA) nor as a Research Analyst (RA) under SEBI regulations. Promising guaranteed returns on capital is strictly prohibited under the SEBI (Prohibition of Fraudulent and Unfair Trade Practices) Regulations, 2003.',
        officialPdfUrl: 'https://www.sebi.gov.in/enforcement/orders/aug-2024/advisory-sample.pdf'
      }
    ],
    sources: [
      {
        id: 'src_tg_01',
        entityId: 'ent_tradegenius_ai',
        title: 'SEBI Public Cautionary Notice on Unregistered Algo Platforms',
        sourceName: 'Securities and Exchange Board of India (SEBI)',
        sourceType: 'Regulator (SEBI/RBI/MCA)',
        url: 'https://www.sebi.gov.in/public-notices/caution-unregistered-algo-services.html',
        publicationDate: '2024-08-24',
        retrievalDate: '2024-08-25',
        tier: 1,
        snippet:
          'Investors are cautioned against dealing with entities offering assured/guaranteed returns through algorithmic software or automated bots. Notice identifies TradeGenius among 14 unapproved entities.'
      },
      {
        id: 'src_tg_02',
        entityId: 'ent_tradegenius_ai',
        title: 'Investigation into Automated Trading Bots in Telegram Groups',
        sourceName: 'The Economic Times — BFSI Desk',
        sourceType: 'Investigative Press',
        url: 'https://economictimes.indiatimes.com/markets/stocks/news/retail-investors-lured-by-telegram-algo-bots/articleshow/99824102.cms',
        publicationDate: '2024-09-12',
        retrievalDate: '2024-09-15',
        tier: 3,
        snippet:
          'Retail investors reported being prompted to deposit capital into mule bank accounts rather than regulated broker clearing accounts after subscribing to TradeGenius bot channels.'
      }
    ],
    evidence: [
      {
        id: 'ev_tg_01',
        entityId: 'ent_tradegenius_ai',
        title: 'Marketing Promise of 22% Guaranteed Monthly ROI',
        category: 'Deceptive Marketing Screenshot',
        description:
          'Promotional banner posted across Telegram channels guaranteeing capital safety and fixed 22% monthly compounding yield.',
        sourceTitle: 'Telegram Channel Broadcast @TradeGeniusOfficial',
        sourceUrl: 'https://t.me/TradeGeniusOfficial/sample-proof-archive',
        submittedBy: 'Priya Sharma (Verified Contributor)',
        submittedAt: '2024-09-02T10:15:00Z',
        verifiedAt: '2024-09-03T16:20:00Z',
        verificationState: 'Official Record Verified'
      },
      {
        id: 'ev_tg_02',
        entityId: 'ent_tradegenius_ai',
        title: '25% "Tax Release Surcharge" Imposed Before Withdrawal',
        category: 'Withdrawal Refusal Evidence',
        description:
          'Customer chat screenshot where administrators refused capital redemption unless an additional 25% "advance TDS release fee" was transferred to a personal UPI ID.',
        submittedBy: 'Anonymous Retail Investor',
        submittedAt: '2024-10-18T18:40:00Z',
        verifiedAt: '2024-10-19T09:10:00Z',
        verificationState: 'Community Corroborated'
      }
    ],
    timeline: [
      {
        date: 'July 2024',
        title: 'Domain and Telegram Infrastructure Activated',
        description: 'TradeGenius AI began marketing algorithmic trading bot licenses for Rs 15,000/quarter.',
        type: 'incorporation'
      },
      {
        date: 'August 24, 2024',
        title: 'SEBI Issues Public Caution Advisory',
        description: 'Designated as an unregistered investment advisory operating in violation of SEBI IA Regulations.',
        type: 'regulatory'
      },
      {
        date: 'September 2024',
        title: 'First Withdrawal Gating Reports Documented',
        description: 'Community members reported arbitrary settlement lock-outs and secondary deposit demands.',
        type: 'evidence'
      }
    ],
    claims: [
      {
        id: 'claim_tg_algo_yield',
        organisationId: 'ent_tradegenius_ai',
        organisationSlug: 'tradegenius-ai-algorithms',
        organisationName: 'TradeGenius AI Algorithms',
        title: 'TradeGenius AI Algorithms guarantees 22% monthly compounding returns with 100% principal safety',
        category: 'Investment Yield Representation',
        status: 'Active',
        createdAt: '2024-07-15T00:00:00Z',
        updatedAt: '2024-08-24T00:00:00Z',
        versions: [
          {
            id: 'v1_tg_algo',
            claimId: 'claim_tg_algo_yield',
            versionNumber: 1,
            statementText: 'TradeGenius AI Algorithms guarantees 22% monthly compounding returns with 100% principal safety',
            changeSummary: 'Initial marketing baseline across Telegram channels',
            sourceUrl: 'https://t.me/TradeGeniusOfficial',
            sourceTitle: 'Telegram Marketing Post',
            recordedAt: '2024-07-15T00:00:00Z',
            reviewState: 'published'
          }
        ]
      }
    ],
    revisions: [
      {
        id: 'rev_tg_01',
        entityId: 'ent_tradegenius_ai',
        versionNumber: 2,
        authorName: 'Vikram Rao, CFA',
        authorRole: 'Senior Moderator',
        timestamp: '2024-10-20T11:00:00Z',
        summaryOfChange: 'Added secondary withdrawal restriction evidence and SEBI cautionary notice citation.',
        moderatedBy: 'Vikram Rao, CFA',
        diffSnippet: '+ Added Evidence Item: 25% Tax Surcharge demand screenshot corroborated against banking receipts.'
      },
      {
        id: 'rev_tg_02',
        entityId: 'ent_tradegenius_ai',
        versionNumber: 1,
        authorName: 'Priya Sharma',
        authorRole: 'Verified Contributor',
        timestamp: '2024-08-26T09:00:00Z',
        summaryOfChange: 'Initial entity profile created following SEBI Public Caution circular.',
        moderatedBy: 'Vikram Rao, CFA'
      }
    ]
  },
  {
    id: 'ent_octafx',
    slug: 'octafx-octa-markets',
    name: 'OctaFX (Octa Markets Incorporated)',
    category: 'Forex & CFD Broker',
    aliases: ['Octa', 'Octa Markets India', 'Octa Trading Platform'],
    website: 'https://octafx.com',
    identifiers: {
      cin: 'Unregistered in India (Offshore entity incorporated in Saint Vincent and the Grenadines / Cyprus)',
      sebiRegNo: 'None (Unregistered)',
      rbiRef: 'RBI Alert List Entry #34'
    },
    registrationStatus: 'Caution Listed by Regulator',
    verificationBadge: 'Official Regulatory Caution',
    shortDescription:
      'Offshore retail forex and CFD broker actively marketed in India for currency derivatives trading.',
    executiveSummary:
      'OctaFX is an international retail forex platform. Under the Foreign Exchange Management Act (FEMA), 1999, resident Indians are strictly prohibited from undertaking forex trading on unauthorized electronic trading platforms (ETPs) [1]. The Reserve Bank of India (RBI) placed OctaFX on its updated official "Alert List" of entities neither authorized to deal in forex nor authorized to operate electronic trading platforms [2].',
    lastUpdated: '2024-12-01T10:00:00Z',
    notices: [
      {
        id: 'not_rbi_octa_01',
        entityId: 'ent_octafx',
        regulator: 'RBI',
        noticeType: 'Caution Notice',
        dateIssued: '2022-09-07',
        headline: 'RBI Alert List of Unauthorized Forex Trading Platforms',
        summary:
          'RBI reiterates that resident persons are cautioned not to undertake forex transactions on unauthorized ETPs or remit funds for such purposes. OctaFX / Octa is explicitly cataloged under the unauthorized entities list.',
        officialPdfUrl: 'https://rbi.org.in/scripts/BS_PressReleaseDisplay.aspx?prid=54343'
      }
    ],
    sources: [
      {
        id: 'src_octa_01',
        entityId: 'ent_octafx',
        title: 'Reserve Bank of India Press Release: Updated Alert List',
        sourceName: 'Reserve Bank of India (RBI)',
        sourceType: 'Regulator (SEBI/RBI/MCA)',
        url: 'https://rbi.org.in/scripts/BS_PressReleaseDisplay.aspx?prid=54343',
        publicationDate: '2022-09-07',
        retrievalDate: '2024-01-10',
        tier: 1,
        snippet:
          'RBI publishes list of entities that are neither authorised to deal in forex under FEMA, 1999 nor authorised to operate Electronic Trading Platforms (ETP).'
      },
      {
        id: 'src_octa_02',
        entityId: 'ent_octafx',
        title: 'Enforcement Directorate Freezes Bank Accounts in OctaFX Forex Scam Probe',
        sourceName: 'The Hindu',
        sourceType: 'Investigative Press',
        url: 'https://www.thehindu.com/news/national/ed-attaches-assets-in-illegal-forex-trading-case/article67358291.ece',
        publicationDate: '2023-09-28',
        retrievalDate: '2024-02-01',
        tier: 3,
        snippet:
          'ED provisionally attached bank balances and assets under PMLA, alleging fund collection through complex networks of shell accounts for unauthorized overseas remittances.'
      }
    ],
    evidence: [
      {
        id: 'ev_octa_01',
        entityId: 'ent_octafx',
        title: 'RBI FEMA Notification Prohibiting Margin Remittances',
        category: 'Official Regulatory Order',
        description:
          'RBI circular A.P. (DIR Series) Circular No. 38 detailing that remittances under Liberalised Remittance Scheme (LRS) are impermissible for margins on overseas forex trading.',
        sourceTitle: 'RBI Circular No. 38/2010-11',
        sourceUrl: 'https://rbi.org.in/scripts/NotificationUser.aspx?Id=5909',
        submittedBy: 'Vikram Rao, CFA',
        submittedAt: '2024-01-15T12:00:00Z',
        verificationState: 'Official Record Verified'
      }
    ],
    timeline: [
      {
        date: 'September 2022',
        title: 'RBI Publishes Formal Alert List',
        description: 'OctaFX included on official repository of unauthorized entities operating outside FEMA provisions.',
        type: 'regulatory'
      },
      {
        date: 'September 2023',
        title: 'Enforcement Directorate Asset Attachment',
        description: 'Central investigating agency attached Rs 35+ Crore in connection with illegal forex remissions.',
        type: 'regulatory'
      }
    ],
    revisions: [
      {
        id: 'rev_octa_01',
        entityId: 'ent_octafx',
        versionNumber: 3,
        authorName: 'Vikram Rao, CFA',
        authorRole: 'Senior Moderator',
        timestamp: '2024-03-10T16:00:00Z',
        summaryOfChange: 'Updated ED asset attachment references and latest RBI alert list citations.',
        moderatedBy: 'Vikram Rao, CFA'
      }
    ]
  },
  {
    id: 'ent_groww',
    slug: 'groww-nextbillion-technology',
    name: 'Groww (Nextbillion Technology Pvt Ltd)',
    category: 'Regulated Depository & Broker',
    aliases: ['Groww Invest Tech', 'Nextbillion Technology'],
    website: 'https://groww.in',
    identifiers: {
      cin: 'U65100KA2016PTC092879',
      sebiRegNo: 'INZ000301838 (Trading & Depository Member)',
      rbiRef: 'Partner with authorized Indian Scheduled Commercial Banks'
    },
    registrationStatus: 'SEBI Registered',
    verificationBadge: 'Verified Regulatory Record',
    shortDescription:
      'SEBI-registered stock broker, mutual fund distributor, and depository participant in India.',
    executiveSummary:
      'Nextbillion Technology Private Limited (operating as Groww) is a SEBI-registered stock broker (INZ000301838), member of NSE (90070), BSE (6699), and CDSL (IN-DP-417-2019) [1]. Regulated under the SEBI (Stock Brokers) Regulations, 1992. The company maintains audited public statutory filings with the Ministry of Corporate Affairs [2]. This profile serves as a verified benchmark of a regulated Indian intermediary.',
    lastUpdated: '2025-01-10T08:00:00Z',
    notices: [],
    sources: [
      {
        id: 'src_gw_01',
        entityId: 'ent_groww',
        title: 'SEBI Directory of Registered Stock Brokers',
        sourceName: 'SEBI Intermediary Registry',
        sourceType: 'Regulator (SEBI/RBI/MCA)',
        url: 'https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=13',
        publicationDate: '2024-01-01',
        retrievalDate: '2025-01-05',
        tier: 1,
        snippet: 'Nextbillion Technology Pvt Ltd registered under registration code INZ000301838.'
      },
      {
        id: 'src_gw_02',
        entityId: 'ent_groww',
        title: 'Ministry of Corporate Affairs (MCA) Company Master Data',
        sourceName: 'Ministry of Corporate Affairs (MCA21)',
        sourceType: 'Corporate Filing',
        url: 'https://www.mca.gov.in/mcafoportal/companyLLPMasterData.do',
        publicationDate: '2024-03-31',
        retrievalDate: '2025-01-02',
        tier: 2,
        snippet: 'Active status. Incorporated May 2016 in Bangalore, Karnataka. CIN: U65100KA2016PTC092879.'
      }
    ],
    evidence: [
      {
        id: 'ev_gw_01',
        entityId: 'ent_groww',
        title: 'National Stock Exchange (NSE) Active Membership Listing',
        category: 'Official Regulatory Order',
        description: 'NSE active member status verified under member ID 90070 with active trading terminals.',
        sourceTitle: 'NSE India Member Directory',
        sourceUrl: 'https://www.nseindia.com/products-services/equity-market-members',
        submittedBy: 'Vikram Rao, CFA',
        submittedAt: '2024-05-10T11:00:00Z',
        verificationState: 'Official Record Verified'
      }
    ],
    timeline: [
      {
        date: 'May 2016',
        title: 'Incorporation under Companies Act',
        description: 'Nextbillion Technology Private Limited registered with MCA in Bengaluru.',
        type: 'incorporation'
      },
      {
        date: '2019',
        title: 'SEBI Stock Brokerage Registration Granted',
        description: 'Granted full depository and retail broking permissions.',
        type: 'regulatory'
      }
    ],
    revisions: [
      {
        id: 'rev_gw_01',
        entityId: 'ent_groww',
        versionNumber: 1,
        authorName: 'Vikram Rao, CFA',
        authorRole: 'Senior Moderator',
        timestamp: '2024-06-01T10:00:00Z',
        summaryOfChange: 'Verified regulatory profile added to directory benchmark registry.',
        moderatedBy: 'Vikram Rao, CFA'
      }
    ]
  },
  {
    id: 'ent_solaris_crypto',
    slug: 'solaris-yield-vault',
    name: 'Solaris Yield Vault (Solaris Defi LTD)',
    category: 'Crypto Yield & Staking',
    aliases: ['Solaris APY', 'Solaris Global Staking Club'],
    website: 'https://solaris-yield.demo-chain.io',
    identifiers: {
      telegramHandles: ['@SolarisYieldVIP', '@SolarisSupportTeam'],
      domainAge: 'Registered April 2024 (Iceland registry, private)',
      pan: 'None'
    },
    registrationStatus: 'Unregistered',
    verificationBadge: 'Community Watchlist',
    shortDescription:
      'High-yield cryptocurrency staking protocol advertising 18% weekly returns backed by "sovereign algorithmic arbitrage".',
    executiveSummary:
      'Solaris Yield Vault targets retail cryptocurrency investors in India through sponsored influencer campaigns. Financial Intelligence Unit - India (FIU-IND) requires all virtual digital asset (VDA) service providers catering to Indian residents to register as reporting entities under PMLA [1]. Solaris operates with no FIU-IND compliance, maintains no registered physical presence in India, and enforces a mandatory 6-month capital lock-in [2].',
    lastUpdated: '2024-11-28T17:00:00Z',
    isDemoEntity: true,
    notices: [
      {
        id: 'not_fiu_solaris_01',
        entityId: 'ent_solaris_crypto',
        regulator: 'SEBI',
        noticeType: 'Advisory Warning',
        dateIssued: '2024-07-15',
        headline: 'FIU-IND Guidance on Unregistered Offshore VDA Intermediaries',
        summary:
          'Under the Prevention of Money Laundering Act (PMLA), 2002, offshore crypto platforms operating in India must be registered with FIU-IND. Unregistered entities are subject to URL blocking under Section 69A of the IT Act.',
        officialPdfUrl: 'https://fiuindia.gov.in/vda-guidance-sample.pdf'
      }
    ],
    sources: [
      {
        id: 'src_sol_01',
        entityId: 'ent_solaris_crypto',
        title: 'Ministry of Finance Press Release: FIU-IND Compliance for VDA Providers',
        sourceName: 'Press Information Bureau (PIB)',
        sourceType: 'Regulator (SEBI/RBI/MCA)',
        url: 'https://pib.gov.in/PressReleasePage.aspx?PRID=1991372',
        publicationDate: '2023-12-28',
        retrievalDate: '2024-08-01',
        tier: 1,
        snippet: 'Show cause notices issued to non-compliant offshore digital asset entities operating in India.'
      }
    ],
    evidence: [
      {
        id: 'ev_sol_01',
        entityId: 'ent_solaris_crypto',
        title: 'Promotional Ad Promising 18% Weekly Capital Compounding',
        category: 'Deceptive Marketing Screenshot',
        description: 'Social media advertisement claiming zero market downside and guaranteed weekly payouts in USDT.',
        submittedBy: 'Priya Sharma (Verified Contributor)',
        submittedAt: '2024-09-14T14:00:00Z',
        verificationState: 'Community Corroborated'
      }
    ],
    timeline: [
      {
        date: 'April 2024',
        title: 'Social Media Campaign Launch',
        description: 'Aggressive promotion via Instagram finance influencers.',
        type: 'incorporation'
      },
      {
        date: 'July 2024',
        title: 'Community Watchlist Listing',
        description: 'Cataloged following verification of non-compliance with FIU-IND VDA reporting standards.',
        type: 'evidence'
      }
    ],
    revisions: [
      {
        id: 'rev_sol_01',
        entityId: 'ent_solaris_crypto',
        versionNumber: 1,
        authorName: 'Priya Sharma',
        authorRole: 'Verified Contributor',
        timestamp: '2024-09-16T12:00:00Z',
        summaryOfChange: 'Created community watch profile with marketing screenshots.',
        moderatedBy: 'Vikram Rao, CFA'
      }
    ]
  }
];

export const INITIAL_SUBMISSIONS: CommunitySubmission[] = [
  {
    id: 'sub_001',
    entityId: 'ent_tradegenius_ai',
    entityName: 'TradeGenius AI Algorithms',
    category: 'Algorithmic Trading',
    evidenceCategory: 'Withdrawal Refusal Evidence',
    title: 'Bank Statement Showing Secondary Demands for Capital Release',
    factualDescription:
      'Bank statement extract confirming that after requesting a principal redemption of Rs 85,000, administrators requested an additional Rs 18,500 transfer citing "SEBI Anti-Laundering Clearance Fee". SEBI does not collect individual clearance fees through UPI.',
    primarySourceUrl: 'https://imgur.com/evidence-sample-receipt-tg.png',
    sourcePublicationDate: '2024-10-18',
    submittedBy: {
      id: 'usr_priya_sharma',
      name: 'Priya Sharma',
      role: 'Contributor'
    },
    submittedAt: '2024-11-12T10:30:00Z',
    status: 'pending'
  },
  {
    id: 'sub_002',
    entityName: 'QuantWealth Prime Advisory',
    category: 'Advisory & Telegram Tipster',
    evidenceCategory: 'Deceptive Marketing Screenshot',
    title: 'Forged SEBI Registration Certificate Circulated in WhatsApp Groups',
    factualDescription:
      'Attached screenshot shows a registration certificate using the SEBI Bhavan logo with registration number INA000999888. Cross-verification with SEBI database indicates this registration number does not exist.',
    primarySourceUrl: 'https://t.me/QuantWealthProof/cert-fake.jpg',
    sourcePublicationDate: '2024-11-04',
    submittedBy: {
      id: 'usr_priya_sharma',
      name: 'Priya Sharma',
      role: 'Contributor'
    },
    submittedAt: '2024-11-14T15:20:00Z',
    status: 'pending'
  },
  {
    id: 'sub_003',
    entityId: 'ent_octafx',
    entityName: 'OctaFX',
    category: 'Forex & CFD Broker',
    evidenceCategory: 'Reputable News Investigation',
    title: 'Cyber Crime Police Advisory on Payment Aggregators Used by Octa',
    factualDescription:
      'Formal press release from state cyber crime cell warning that payment gateways facilitating rupee deposits for OctaFX are being scrutinized for aiding unauthorized overseas remittances.',
    primarySourceUrl: 'https://timesofindia.indiatimes.com/city/mumbai/cyber-police-probe-forex-aggregators/articleshow/sample.cms',
    sourcePublicationDate: '2024-10-25',
    submittedBy: {
      id: 'usr_vikram_rao',
      name: 'Vikram Rao, CFA',
      role: 'Researcher'
    },
    submittedAt: '2024-10-26T09:15:00Z',
    status: 'approved',
    reviewedBy: 'Vikram Rao, CFA',
    reviewedAt: '2024-10-26T14:00:00Z',
    moderationNotes: 'Corroborated against state police press dispatch. Approved for profile timeline integration.'
  }
];
