import { AssessmentLabel } from '../search/types';

export interface BenchmarkClaimItem {
  id: string;
  query: string;
  category:
    | 'historical_event_well_documented'
    | 'recent_incident_well_documented'
    | 'viral_death_hoax'
    | 'science_health_debunked_hoax'
    | 'policy_financial_nuanced_claim'
    | 'fabricated_fictional_trap'
    | 'single_source_leak'
    | 'corporate_announcement';
  canonicalClaimStatement: string;
  targetEntity: string;
  predicate: string;
  groundTruthLabel: AssessmentLabel;
  expectedScoreMin: number | null;
  expectedScoreMax: number | null;
  expectedScoreBand: string;
  groundTruthCitations: Array<{
    publisher: string;
    domain: string;
    headline: string;
    url: string;
    isPrimaryOfficial?: boolean;
  }>;
  testType: 'fixture' | 'live_compatible';
  notes: string;
  // Representative fixture sources for offline regression evaluation
  fixtureSources?: Array<{
    title: string;
    url: string;
    snippet: string;
    publisher: string;
    publisherDomain: string;
    publishedAt?: string;
    isWireSyndicated?: boolean;
    wireService?: string;
  }>;
}

export const VERITY_BENCHMARK_DATASET: BenchmarkClaimItem[] = [
  // 1. Well-documented historical event
  {
    id: 'bmk_001_apollo_11',
    query: 'Did Apollo 11 land humans on the Moon in 1969?',
    category: 'historical_event_well_documented',
    canonicalClaimStatement: 'Apollo 11 landed humans on the Moon in July 1969',
    targetEntity: 'Apollo 11',
    predicate: 'landed humans on the Moon in 1969',
    groundTruthLabel: 'Supported',
    expectedScoreMin: 85,
    expectedScoreMax: 98,
    expectedScoreBand: 'Very strong supporting evidence (90–100) or Strong supporting evidence (75–89)',
    groundTruthCitations: [
      { publisher: 'NASA', domain: 'nasa.gov', headline: 'July 20, 1969: One Giant Leap For Mankind', url: 'https://www.nasa.gov/mission_pages/apollo/apollo11.html', isPrimaryOfficial: true },
      { publisher: 'Smithsonian National Air and Space Museum', domain: 'airandspace.si.edu', headline: 'Apollo 11 Mission Overview', url: 'https://airandspace.si.edu/explore/missions/apollo-11', isPrimaryOfficial: true },
      { publisher: 'BBC News', domain: 'bbc.com', headline: 'Apollo 11: The Moon Landing that Defined a Generation', url: 'https://www.bbc.com/news/science-environment-48907836' }
    ],
    testType: 'live_compatible',
    notes: 'Universal historical consensus backed by NASA flight telemetry, samples, and independent global observatories.',
    fixtureSources: [
      { title: 'July 20, 1969: Apollo 11 Lunar Landing - Official Mission Record', url: 'https://www.nasa.gov/apollo11', snippet: 'Neil Armstrong and Buzz Aldrin landed the Apollo Lunar Module Eagle on July 20, 1969. Official NASA flight logs confirm touchdown.', publisher: 'NASA', publisherDomain: 'nasa.gov', publishedAt: '2024-07-20T00:00:00Z' },
      { title: 'How Apollo 11 Changed Science Forever', url: 'https://www.bbc.com/news/apollo-11', snippet: 'Global telescopes tracked Apollo 11 journey to the Sea of Tranquility where humans first walked on lunar surface.', publisher: 'BBC News', publisherDomain: 'bbc.com', publishedAt: '2024-07-19T00:00:00Z' },
      { title: 'Lunar Module Touchdown Archive', url: 'https://www.reuters.com/apollo-anniversary', snippet: 'Reuters historical archives documenting Apollo 11 lunar landing confirmed by international radio monitoring stations.', publisher: 'Reuters', publisherDomain: 'reuters.com', publishedAt: '2024-07-20T00:00:00Z' },
      { title: 'Smithsonian Records on Apollo 11', url: 'https://airandspace.si.edu/apollo11', snippet: 'Primary artifacts and telemetry verifying Armstrong step onto the moon surface in 1969.', publisher: 'Smithsonian', publisherDomain: 'si.edu', publishedAt: '2024-07-15T00:00:00Z' }
    ]
  },

  // 2. Documented campus tragedy / incident
  {
    id: 'bmk_002_iit_bombay_suicide',
    query: 'IIT Bombay suicide case',
    category: 'recent_incident_well_documented',
    canonicalClaimStatement: 'A student suicide occurred at IIT Bombay and was investigated by police and an internal committee',
    targetEntity: 'IIT Bombay',
    predicate: 'student suicide incident occurred',
    groundTruthLabel: 'Supported',
    expectedScoreMin: 85,
    expectedScoreMax: 98,
    expectedScoreBand: 'Very strong supporting evidence (90–100)',
    groundTruthCitations: [
      { publisher: 'The Hindu', domain: 'thehindu.com', headline: 'IIT Bombay student Darshan Solanki dies by suicide; police file FIR', url: 'https://www.thehindu.com/news/national/other-states/iit-bombay-student-death/article66504000.ece' },
      { publisher: 'The Indian Express', domain: 'indianexpress.com', headline: 'IIT-Bombay student suicide: Special Investigation Team files charge sheet', url: 'https://indianexpress.com/article/cities/mumbai/iit-bombay-student-darshan-solanki-suicide-sit-chargesheet-8636700/' },
      { publisher: 'NDTV', domain: 'ndtv.com', headline: 'IIT Bombay Darshan Solanki Suicide Case: Student Arrested By Mumbai Police', url: 'https://www.ndtv.com/india-news/iit-bombay-darshan-solanki-suicide-case-student-arrested-by-mumbai-police-3932822' }
    ],
    testType: 'live_compatible',
    notes: 'Well-documented event with police FIR, SIT chargesheet, and institutional panel inquiry. Core occurrence is verified; sub-claims track motives separately.',
    fixtureSources: [
      { title: 'IIT Bombay student dies by suicide: Police register accidental death report', url: 'https://www.thehindu.com/news/cities/mumbai/iit-bombay-death', snippet: 'Mumbai Police confirmed first-year BTech student Darshan Solanki died by suicide at IIT Bombay campus. FIR and inquiry initiated.', publisher: 'The Hindu', publisherDomain: 'thehindu.com', publishedAt: '2023-02-13T10:00:00Z' },
      { title: 'IIT-Bombay student suicide: SIT files chargesheet in court', url: 'https://indianexpress.com/article/cities/mumbai/iit-bombay-sit', snippet: 'Special Investigation Team of Mumbai police submitted chargesheet before special court in connection with the suicide of IIT Bombay student.', publisher: 'The Indian Express', publisherDomain: 'indianexpress.com', publishedAt: '2023-05-30T10:00:00Z' },
      { title: 'Police arrest fellow student in IIT Bombay suicide case', url: 'https://www.ndtv.com/mumbai-news/iit-bombay-arrest', snippet: 'Mumbai police crime branch arrested a batchmate in connection with Darshan Solanki suicide case following handwriting analysis.', publisher: 'NDTV', publisherDomain: 'ndtv.com', publishedAt: '2023-04-09T10:00:00Z' },
      { title: 'IIT Bombay forms panel to probe student death', url: 'https://timesofindia.indiatimes.com/city/mumbai/iit-bombay-panel', snippet: 'IIT Bombay administration instituted a 12-member committee headed by Professor Nand Kishore to examine institutional factors.', publisher: 'The Times of India', publisherDomain: 'timesofindia.indiatimes.com', publishedAt: '2023-02-18T10:00:00Z' },
      { title: 'IIT Bombay student suicide: High Court grants bail to accused', url: 'https://www.hindustantimes.com/cities/mumbai-news/iit-bombay-bail', snippet: 'Bombay High Court granted bail to the student arrested in connection with the suicide of Darshan Solanki at IIT Bombay.', publisher: 'Hindustan Times', publisherDomain: 'hindustantimes.com', publishedAt: '2023-05-06T10:00:00Z' }
    ]
  },

  // 3. Debunked viral death hoax
  {
    id: 'bmk_003_trump_death_hoax',
    query: 'Is Donald Trump, president of US dead?',
    category: 'viral_death_hoax',
    canonicalClaimStatement: 'Donald Trump is dead',
    targetEntity: 'Donald Trump',
    predicate: 'is dead',
    groundTruthLabel: 'Unsupported',
    expectedScoreMin: 0,
    expectedScoreMax: 15,
    expectedScoreBand: 'Very little supporting evidence (0–19)',
    groundTruthCitations: [
      { publisher: 'Snopes', domain: 'snopes.com', headline: 'Donald Trump Dead Rumor Debunked', url: 'https://www.snopes.com/fact-check/donald-trump-dead-hoax/' },
      { publisher: 'Reuters Fact Check', domain: 'reuters.com', headline: 'Fact Check: False claims that Donald Trump has died', url: 'https://www.reuters.com/article/factcheck-trump-dead/' },
      { publisher: 'Associated Press', domain: 'apnews.com', headline: 'Fact focus: False claims circulate about Donald Trump health and death', url: 'https://apnews.com/article/fact-check-trump-alive' }
    ],
    testType: 'live_compatible',
    notes: 'Living public figure with continuous live public appearances, speeches, and zero official death notices. Claim of death must score near zero.',
    fixtureSources: [
      { title: 'Fact Check: False claims circulate online claiming Donald Trump has died', url: 'https://www.reuters.com/fact-check/trump-alive', snippet: 'Reuters Fact Check examined online rumors claiming Donald Trump died. Trump continues to address public rallies and press briefings. The claim is completely false.', publisher: 'Reuters', publisherDomain: 'reuters.com', publishedAt: '2024-09-15T00:00:00Z' },
      { title: 'Donald Trump speaks at live rally in North Carolina', url: 'https://www.apnews.com/article/trump-rally-nc', snippet: 'Donald Trump addressed thousands of supporters at a campaign event in North Carolina today, outlining economic and immigration policies.', publisher: 'Associated Press', publisherDomain: 'apnews.com', publishedAt: '2024-09-21T00:00:00Z' },
      { title: 'Debunking the viral hoax about Donald Trump passing away', url: 'https://www.snopes.com/trump-death-debunked', snippet: 'Social media rumors alleging Donald Trump died are unfounded hoaxes. Official statements and live broadcasts demonstrate ongoing public activities.', publisher: 'Snopes', publisherDomain: 'snopes.com', publishedAt: '2024-09-18T00:00:00Z' }
    ]
  },

  // 4. Nuanced / Clarified Policy & Financial claim
  {
    id: 'bmk_004_upi_transaction_charges',
    query: 'Will UPI charge fees for payments above Rs 2000?',
    category: 'policy_financial_nuanced_claim',
    canonicalClaimStatement: 'UPI transactions above ₹2,000 incur consumer payment fees',
    targetEntity: 'UPI',
    predicate: 'charges fees for payments above Rs 2000',
    groundTruthLabel: 'Mixed evidence',
    expectedScoreMin: 40,
    expectedScoreMax: 55,
    expectedScoreBand: 'Mixed or inconclusive evidence (40–59)',
    groundTruthCitations: [
      { publisher: 'National Payments Corporation of India (NPCI)', domain: 'npci.org.in', headline: 'NPCI Clarification on Interchange Fee on UPI Transactions', url: 'https://www.npci.org.in/press-releases/npci-clarifies-interchange-fee-on-upi', isPrimaryOfficial: true },
      { publisher: 'Reserve Bank of India', domain: 'rbi.org.in', headline: 'FAQs on Payment Systems and UPI', url: 'https://www.rbi.org.in/Scripts/FAQView.aspx?Id=137', isPrimaryOfficial: true },
      { publisher: 'LiveMint', domain: 'livemint.com', headline: 'UPI transaction charges above Rs 2,000: NPCI clarifies rules for customers and merchants', url: 'https://www.livemint.com/money/personal-finance/upi-charge-above-2000-npci-clarifies-11680070000000.html' }
    ],
    testType: 'live_compatible',
    notes: 'Critical nuance test: Bank-to-bank consumer transfers are 100% free. Interchange fee applies only to merchants receiving prepaid wallet (PPI) payments. Neither 100% True nor 100% False.',
    fixtureSources: [
      { title: 'NPCI Clarifies: No charges for normal UPI payments, bank account transfers remain free', url: 'https://www.npci.org.in/press-release-upi-charges', snippet: 'NPCI issued a formal circular stating that regular UPI transactions between bank accounts and peer-to-peer transfers are completely free for customers. Interchange fee applies only to prepaid wallet merchant transactions over ₹2,000.', publisher: 'NPCI', publisherDomain: 'npci.org.in', publishedAt: '2023-03-29T10:00:00Z' },
      { title: 'Will you have to pay for UPI payments above ₹2,000? All questions answered', url: 'https://www.thehindu.com/business/upi-transaction-fee-explainer', snippet: 'Customers using standard bank UPI will not be charged. Only merchants accepting payments through prepaid payment instruments (PPI) like Paytm wallet face interchange fee of up to 1.1%.', publisher: 'The Hindu', publisherDomain: 'thehindu.com', publishedAt: '2023-03-30T10:00:00Z' },
      { title: 'UPI payments over Rs 2000 to attract fee? NPCI clarifies consumer impact', url: 'https://economictimes.indiatimes.com/wealth/personal-finance-news/upi-charges', snippet: 'Clarifying rumors, NPCI emphasized that 99.9% of transactions are account-to-account with zero charge to consumers.', publisher: 'The Economic Times', publisherDomain: 'economictimes.com', publishedAt: '2023-03-29T12:00:00Z' }
    ]
  },

  // 5. Fabricated / Fictional incident trap
  {
    id: 'bmk_005_fictional_smith_dubai_altercation',
    query: 'Smith Dubai airline incident cockpit altercation flight 402',
    category: 'fabricated_fictional_trap',
    canonicalClaimStatement: 'A cockpit altercation occurred on Dubai flight 402 involving Smith',
    targetEntity: 'Smith',
    predicate: 'cockpit altercation on Dubai flight 402 occurred',
    groundTruthLabel: 'Insufficient evidence',
    expectedScoreMin: null,
    expectedScoreMax: null,
    expectedScoreBand: 'Insufficient evidence (Unable to assess)',
    groundTruthCitations: [],
    testType: 'live_compatible',
    notes: 'Fabricated query designed to test hallucination resistance and relevance gating. Should never return Supported or generate high confidence.',
    fixtureSources: [
      { title: 'FlyDubai reports expansion of fleet and route network to Europe', url: 'https://www.gulfnews.com/flydubai-expansion', snippet: 'FlyDubai announced 12 new routes across European destinations with Boeing 737 aircraft deliveries.', publisher: 'Gulf News', publisherDomain: 'gulfnews.com', publishedAt: '2024-05-10T00:00:00Z' },
      { title: 'Emirates President Tim Clark discusses Dubai aviation sustainability', url: 'https://www.reuters.com/business/aerospace-defense/emirates-dubai', snippet: 'Emirates president discussed sustainable aviation fuels and fleet renewal at Dubai Airshow.', publisher: 'Reuters', publisherDomain: 'reuters.com', publishedAt: '2024-04-12T00:00:00Z' },
      { title: 'Danielle Smith speaks on Alberta energy transition', url: 'https://www.cbc.ca/news/danielle-smith-energy', snippet: 'Alberta Premier Danielle Smith delivered speech addressing clean energy regulations and pipeline investments.', publisher: 'CBC News', publisherDomain: 'cbc.ca', publishedAt: '2024-03-20T00:00:00Z' }
    ]
  },

  // 6. Science / Health Debunked Hoax
  {
    id: 'bmk_006_5g_covid_conspiracy',
    query: 'Does 5G mobile technology spread coronavirus?',
    category: 'science_health_debunked_hoax',
    canonicalClaimStatement: '5G mobile networks transmit or spread COVID-19 coronavirus',
    targetEntity: '5G mobile technology',
    predicate: 'spreads coronavirus',
    groundTruthLabel: 'Unsupported',
    expectedScoreMin: 0,
    expectedScoreMax: 10,
    expectedScoreBand: 'Very little supporting evidence (0–19)',
    groundTruthCitations: [
      { publisher: 'World Health Organization (WHO)', domain: 'who.int', headline: 'Coronavirus disease (COVID-19) mythbusters: 5G mobile networks DO NOT spread COVID-19', url: 'https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters', isPrimaryOfficial: true },
      { publisher: 'Federal Communications Commission (FCC)', domain: 'fcc.gov', headline: '5G and COVID-19 Conspiracy Theories', url: 'https://www.fcc.gov/5g-covid-19', isPrimaryOfficial: true },
      { publisher: 'Full Fact', domain: 'fullfact.org', headline: '5G networks do not spread coronavirus', url: 'https://fullfact.org/health/5G-not-accelerating-coronavirus/' }
    ],
    testType: 'live_compatible',
    notes: 'Scientific conspiracy thoroughly debunked by WHO, FCC, and peer-reviewed epidemiology. Biological viruses cannot travel on electromagnetic radio frequencies.',
    fixtureSources: [
      { title: 'WHO Mythbusters: 5G mobile networks do NOT spread COVID-19', url: 'https://www.who.int/emergencies/mythbusters-5g', snippet: 'Viruses cannot travel on radio waves or mobile networks. COVID-19 spreads through respiratory droplets when an infected person coughs, sneezes or speaks.', publisher: 'WHO', publisherDomain: 'who.int', publishedAt: '2021-01-15T00:00:00Z' },
      { title: 'Fact check: No link between 5G wireless technology and coronavirus', url: 'https://www.reuters.com/fact-check/5g-coronavirus-debunked', snippet: 'Scientists and telecommunications regulators confirm 5G millimeter waves are non-ionizing radiation incapable of creating or transmitting biological viruses.', publisher: 'Reuters', publisherDomain: 'reuters.com', publishedAt: '2020-04-08T00:00:00Z' },
      { title: 'FCC debunking 5G COVID-19 conspiracy claims', url: 'https://www.fcc.gov/5g-safety', snippet: 'FCC guidelines confirm RF exposure limits are safe and independent health agencies find zero correlation with infectious disease spread.', publisher: 'FCC', publisherDomain: 'fcc.gov', publishedAt: '2020-05-01T00:00:00Z' }
    ]
  },

  // 7. Single source leak / uncorroborated developing rumor
  {
    id: 'bmk_007_single_source_leak',
    query: 'TechPortal leak claims Project X quantum chip release next week',
    category: 'single_source_leak',
    canonicalClaimStatement: 'Project X quantum chip will be released next week according to leak',
    targetEntity: 'Project X',
    predicate: 'quantum chip will be released next week',
    groundTruthLabel: 'Likely unsupported',
    expectedScoreMin: 20,
    expectedScoreMax: 38,
    expectedScoreBand: 'Limited supporting evidence (20–39)',
    groundTruthCitations: [],
    testType: 'fixture',
    notes: 'Single-source cap test: A single blog post without second-source verification must be capped at 38/100 and cannot achieve Supported.',
    fixtureSources: [
      { title: 'Exclusive leak: Anonymous insider claims Project X quantum chip launching Tuesday', url: 'https://techrumorblog.net/project-x-exclusive', snippet: 'A single unverified forum post alleges tech company will unveil secret quantum computing chip next Tuesday.', publisher: 'TechRumorBlog', publisherDomain: 'techrumorblog.net', publishedAt: '2026-09-28T00:00:00Z' }
    ]
  },

  // 8. Well-documented recent milestone: Chandrayaan-3
  {
    id: 'bmk_008_chandrayaan_3_moon_landing',
    query: 'Did Chandrayaan-3 successfully land on the Moon south pole?',
    category: 'recent_incident_well_documented',
    canonicalClaimStatement: 'ISRO Chandrayaan-3 lander Vikram touched down near the lunar south pole in August 2023',
    targetEntity: 'Chandrayaan-3',
    predicate: 'successfully landed on the Moon near the south pole',
    groundTruthLabel: 'Supported',
    expectedScoreMin: 88,
    expectedScoreMax: 98,
    expectedScoreBand: 'Very strong supporting evidence (90–100)',
    groundTruthCitations: [
      { publisher: 'ISRO', domain: 'isro.gov.in', headline: 'Chandrayaan-3 Successful Soft-landing on Lunar Surface', url: 'https://www.isro.gov.in/Chandrayaan3_landing.html', isPrimaryOfficial: true },
      { publisher: 'Nature', domain: 'nature.com', headline: 'India makes historic landing on the Moon with Chandrayaan-3', url: 'https://www.nature.com/articles/d41586-023-02690-0', isPrimaryOfficial: false },
      { publisher: 'BBC News', domain: 'bbc.com', headline: 'Chandrayaan-3: India makes historic landing near Moon south pole', url: 'https://www.bbc.com/news/world-asia-india-66594520' }
    ],
    testType: 'live_compatible',
    notes: 'Historic space achievement confirmed by Indian Space Research Organisation telemetry, NASA tracking data, and worldwide astronomy stations.',
    fixtureSources: [
      { title: 'Chandrayaan-3 soft-landing successful, Vikram lander touches down: ISRO', url: 'https://www.isro.gov.in/landing-press-release', snippet: 'ISRO Telemetry Tracking and Command Network confirmed Vikram lander achieved safe soft landing near south pole coordinates at 18:04 IST.', publisher: 'ISRO', publisherDomain: 'isro.gov.in', publishedAt: '2023-08-23T12:35:00Z' },
      { title: 'India makes history as Chandrayaan-3 lands near Moon south pole', url: 'https://www.bbc.com/news/world-asia-india', snippet: 'India became fourth country to land on Moon and first to reach rugged south polar region.', publisher: 'BBC News', publisherDomain: 'bbc.com', publishedAt: '2023-08-23T13:00:00Z' },
      { title: 'Global space agencies congratulate ISRO on Chandrayaan-3 milestone', url: 'https://www.reuters.com/science/chandrayaan-landing-success', snippet: 'NASA administrator Bill Nelson and European Space Agency congratulated ISRO after real-time telemetry confirmed touch down.', publisher: 'Reuters', publisherDomain: 'reuters.com', publishedAt: '2023-08-23T14:00:00Z' },
      { title: 'Pragyan rover rolls out from Vikram lander on lunar soil', url: 'https://www.thehindu.com/sci-tech/science/pragyan-rover-descent', snippet: 'ISRO released video footage of Pragyan rover descending the ramp and beginning surface scientific exploration.', publisher: 'The Hindu', publisherDomain: 'thehindu.com', publishedAt: '2023-08-24T06:00:00Z' }
    ]
  },

  // 9. Documented corporate mass layoffs
  {
    id: 'bmk_009_meta_layoffs_2023',
    query: 'Did Meta lay off thousands of employees in 2023?',
    category: 'corporate_announcement',
    canonicalClaimStatement: 'Meta Platforms announced thousands of employee layoffs in 2023',
    targetEntity: 'Meta',
    predicate: 'announced thousands of employee layoffs in 2023',
    groundTruthLabel: 'Supported',
    expectedScoreMin: 80,
    expectedScoreMax: 92,
    expectedScoreBand: 'Strong supporting evidence (75–89) or Very strong supporting evidence (90–100)',
    groundTruthCitations: [
      { publisher: 'Meta Newsroom', domain: 'about.fb.com', headline: 'Mark Zuckerberg: An Update on Our Year of Efficiency', url: 'https://about.fb.com/news/2023/03/mark-zuckerberg-meta-year-of-efficiency/', isPrimaryOfficial: true },
      { publisher: 'CNBC', domain: 'cnbc.com', headline: 'Meta to lay off 10,000 more workers, Zuckerberg announces', url: 'https://www.cnbc.com/2023/03/14/meta-to-lay-off-10000-more-workers.html' },
      { publisher: 'The Wall Street Journal', domain: 'wsj.com', headline: 'Meta Cuts Another 10,000 Jobs in Tech Retrenchment', url: 'https://www.wsj.com/articles/meta-to-lay-off-10-000-workers-in-second-round-of-job-cuts-11678799427' }
    ],
    testType: 'live_compatible',
    notes: 'Confirmed by CEO memo on Meta corporate newsroom, SEC Form 8-K filings, and global business media.',
    fixtureSources: [
      { title: 'Mark Zuckerberg memo on Meta Year of Efficiency: 10,000 job cuts', url: 'https://about.fb.com/news/year-of-efficiency', snippet: 'Meta CEO Mark Zuckerberg announced reduction of team size by about 10,000 people and closing 5,000 open roles.', publisher: 'Meta Newsroom', publisherDomain: 'about.fb.com', publishedAt: '2023-03-14T10:00:00Z' },
      { title: 'Meta begins cutting 10,000 jobs across engineering and business teams', url: 'https://www.reuters.com/technology/meta-layoffs-march-2023', snippet: 'Reuters reports Meta commenced second major round of redundancies as part of restructuring program.', publisher: 'Reuters', publisherDomain: 'reuters.com', publishedAt: '2023-03-14T11:00:00Z' },
      { title: 'Tech downsizing continues with Meta job cuts', url: 'https://www.bloomberg.com/news/articles/meta-cuts-workers', snippet: 'Bloomberg reports on Meta corporate filing confirming 10,000 workforce reduction plan.', publisher: 'Bloomberg', publisherDomain: 'bloomberg.com', publishedAt: '2023-03-14T12:00:00Z' }
    ]
  },

  // 10. Completely fictional submarine sinking
  {
    id: 'bmk_010_fictional_atlantis_submarine',
    query: 'Did Atlantis nuclear submarine 998877 sink in Atlantic Ocean yesterday?',
    category: 'fabricated_fictional_trap',
    canonicalClaimStatement: 'Atlantis nuclear submarine 998877 sank in Atlantic Ocean',
    targetEntity: 'Atlantis nuclear submarine 998877',
    predicate: 'sank in Atlantic Ocean',
    groundTruthLabel: 'Insufficient evidence',
    expectedScoreMin: null,
    expectedScoreMax: null,
    expectedScoreBand: 'Insufficient evidence (Unable to assess)',
    groundTruthCitations: [],
    testType: 'live_compatible',
    notes: 'Non-existent submarine and fabricated casualty. Must be rejected as Insufficient Evidence without fabricating casualties or assigning positive support score.',
    fixtureSources: [
      { title: 'Ocean scientists discover deep sea coral reefs in North Atlantic', url: 'https://www.nationalgeographic.com/atlantic-coral', snippet: 'Marine biologists catalog cold-water coral formations during NOAA oceanographic survey.', publisher: 'National Geographic', publisherDomain: 'nationalgeographic.com', publishedAt: '2024-06-11T00:00:00Z' },
      { title: 'US Navy concludes joint anti-submarine warfare exercise in Mediterranean', url: 'https://www.defensenews.com/naval-exercise', snippet: 'Allied navies conducted routine sonar drills and communications tests.', publisher: 'Defense News', publisherDomain: 'defensenews.com', publishedAt: '2024-06-10T00:00:00Z' }
    ]
  }
];
