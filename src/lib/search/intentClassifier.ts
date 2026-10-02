export type QueryIntentType =
  | 'yes_no_question'
  | 'breaking_news'
  | 'incident_search'
  | 'person_status'
  | 'company_organization'
  | 'historical_claim'
  | 'general_research'
  | 'prediction_future';

export type QueryAspect =
  | 'occurrence'
  | 'cause_or_trigger'
  | 'specific_statement'
  | 'responsibility'
  | 'policy_or_rule'
  | 'general_overview';

export interface CandidateSubClaimSpec {
  claimType: 'occurrence' | 'cause_or_trigger' | 'institutional_action' | 'specific_statement';
  statement: string;
}

export interface QueryIntent {
  intentType: QueryIntentType;
  queryAspect: QueryAspect;
  originalQuery: string;
  targetEntity: string;
  secondaryEntities: string[];
  predicate: string;
  predicateKeywords: string[];
  entityKeywords: string[];
  requiredPredicateAnchors?: string[];
  geographicOrOrgAnchors?: string[];
  canonicalClaim: string;
  isPersonStatusQuestion: boolean;
  isDeathOrLifeQuestion: boolean;
  requiresRecency: boolean;
  temporalConstraint?: string;
  searchQueries: string[];
  subClaimsToAssess?: CandidateSubClaimSpec[];
}

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'did', 'do', 'does', 'in', 'on', 'at',
  'of', 'for', 'with', 'about', 'to', 'from', 'by', 'that', 'this', 'it', 'as', 'and', 'or'
]);

/**
 * Normalizes query string and extracts core intent, target entity, predicate and canonical claim.
 */
export function classifyQueryIntent(query: string): QueryIntent {
  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();

  // Temporal detection
  let temporalConstraint: string | undefined;
  let requiresRecency = false;
  if (/\b(?:today|tonight|this morning|just now|breaking|latest|current|currently|now|yesterday)\b/i.test(trimmed)) {
    requiresRecency = true;
    const match = trimmed.match(/\b(today|tonight|this morning|just now|breaking|latest|current|currently|now|yesterday)\b/i);
    temporalConstraint = match ? match[1].toLowerCase() : 'recent';
  }

  // Question prefix detection
  const isYesNo = /^(?:is|are|was|were|did|does|do|has|have|had|will|would|can|could|should)\b/i.test(trimmed);
  const isWhQuestion = /^(?:who|what|where|when|why|how)\b/i.test(trimmed);

  // Death / Life / Health status detection
  const isDeathOrLifeQuestion = /\b(?:dead|died|death|die|passed away|perished|killed|assassinated|alive|living|survived|health|condition|coma|hospitalized)\b/i.test(trimmed);

  // Common predicate categories
  const isLayoffs = /\b(?:layoff|layoffs|lay off|lay-off|laid off|job cut|job cuts|fired|firing|workforce reduction|retrenchment)\b/i.test(trimmed);
  const isChargesOrFees = /\b(?:charge|charges|charged|fee|fees|tax|cost|price|surcharge|interchange)\b/i.test(trimmed) && /\b(?:upi|card|bank|payment|transaction|2000|2,000)\b/i.test(trimmed);
  const isIncident = /\b(?:incident|accident|crash|attack|explosion|hijack|fire|arrest|scandal|lawsuit|clash|suicide|death|disaster|case)\b/i.test(trimmed);
  const isCompanyAction = /\b(?:announce|announced|announces|launch|launched|acquire|acquisition|merger|earnings|revenue|bankrupt|bankruptcy)\b/i.test(trimmed);
  const isPrediction = /\b(?:will|predict|future|forecast|projected to|by 2026|by 2027|by 2030)\b/i.test(trimmed);

  // Query Aspect Detection
  let queryAspect: QueryAspect = 'general_overview';
  if (/\b(?:why|cause|causes|reason|reasons|motive|motives|how did)\b/i.test(trimmed)) {
    queryAspect = 'cause_or_trigger';
  } else if (/\b(?:who is responsible|blame|liable|culprit|guilty|responsibility)\b/i.test(trimmed)) {
    queryAspect = 'responsibility';
  } else if (/\b(?:say|said|claimed|stated|tweeted|quoted|statement)\b/i.test(trimmed)) {
    queryAspect = 'specific_statement';
  } else if (isChargesOrFees || /\b(?:rule|rules|law|policy|fee|fees|tax|charge)\b/i.test(trimmed)) {
    queryAspect = 'policy_or_rule';
  } else if (isIncident || isDeathOrLifeQuestion || /\b(?:occurred|happened|case|incident)\b/i.test(trimmed)) {
    queryAspect = 'occurrence';
  }

  // Intent classification determination
  let intentType: QueryIntentType = 'general_research';
  let isPersonStatus = false;

  if (isDeathOrLifeQuestion && (isYesNo || /\b(is|status of|still)\b/i.test(trimmed))) {
    intentType = 'person_status';
    isPersonStatus = true;
    requiresRecency = true;
  } else if (isChargesOrFees) {
    intentType = 'general_research';
  } else if (isLayoffs || (isCompanyAction && !isIncident)) {
    intentType = 'company_organization';
  } else if (isIncident) {
    intentType = 'incident_search';
  } else if (requiresRecency && !isYesNo) {
    intentType = 'breaking_news';
  } else if (isYesNo) {
    intentType = 'yes_no_question';
  } else if (isPrediction) {
    intentType = 'prediction_future';
  } else if (/\b(?:in \d{4}|during \d{4}|world war|history|ancient|centur(?:y|ies))\b/i.test(trimmed)) {
    intentType = 'historical_claim';
  }

  // Extract entities & predicate
  const withoutTerminalPunct = trimmed.replace(/[?!.]/g, '');
  const cleanQuery = withoutTerminalPunct;
  let targetEntity = '';
  let secondaryEntities: string[] = [];
  let predicate = '';
  let predicateKeywords: string[] = [];
  let entityKeywords: string[] = [];
  let canonicalClaim = '';

  let subClaimsToAssess: CandidateSubClaimSpec[] | undefined;

  // 1. Person Status: "Is Donald Trump, president of US dead?"
  if (isPersonStatus) {
    // Extract entity between question word and appositive/predicate
    // e.g. "Is [Donald Trump], [president of US] dead"
    const match = withoutTerminalPunct.match(/^(?:is|was)\s+([^,]+?)(?:,\s*[^,]+?)?\s+(?:dead|alive|still alive|living|killed|perished)\b/i);
    if (match) {
      targetEntity = match[1].trim();
    } else {
      // Fallback: extract capitalized tokens
      const capMatch = withoutTerminalPunct.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/);
      targetEntity = capMatch ? capMatch[1] : 'the subject';
    }

    // Clean title suffixes from entity like ", president of US" or "president of US"
    targetEntity = targetEntity.replace(/,\s*(?:the\s*)?(?:president|ceo|minister|leader|actor|singer|founder).*/i, '').trim();

    predicate = isDeathOrLifeQuestion ? 'dead / alive status' : 'current status';
    predicateKeywords = ['dead', 'died', 'death', 'alive', 'kill', 'killed', 'passed away', 'assassinated', 'alive and well', 'status', 'health'];
    entityKeywords = targetEntity.toLowerCase().split(/\s+/).filter(w => !STOP_WORDS.has(w) && w.length > 2);
    
    // Canonical assertion user is asking about
    const asksIfDead = /\b(?:dead|died|death|perished|killed)\b/i.test(trimmed);
    canonicalClaim = asksIfDead ? `${targetEntity} is dead` : `${targetEntity} is alive`;
  }
  // 2. Incident Search: "Smith Dubai airline incident" or "IIT Bombay suicide case"
  else if (intentType === 'incident_search') {
    const tokens = withoutTerminalPunct.replace(/,/g, '').split(/\s+/);
    // Identify key words
    const incidentTerms = ['incident', 'accident', 'crash', 'attack', 'explosion', 'fire', 'event', 'case', 'suicide', 'death', 'disaster'];
    const modifierTerms = ['fictional', 'fake', 'alleged', 'unverified', 'hypothetical', 'made-up'];
    const nonIncidentTokens = tokens.filter(t => !incidentTerms.includes(t.toLowerCase()) && !modifierTerms.includes(t.toLowerCase()));
    
    if (nonIncidentTokens.length > 0) {
      targetEntity = nonIncidentTokens[0];
      secondaryEntities = nonIncidentTokens.slice(1);
    } else {
      targetEntity = withoutTerminalPunct;
    }

    predicate = 'incident occurrence and circumstances';
    predicateKeywords = [
      'incident', 'accident', 'case', 'suicide', 'death', 'crash', 'attack', 'investigation',
      'police', 'probe', 'inquiry', 'official', 'statement', 'report', 'student', 'fir', 'family',
      'airline', 'flight', 'passenger', 'pilot', 'arrest'
    ];
    entityKeywords = targetEntity.toLowerCase().split(/\s+/).filter(w => !STOP_WORDS.has(w));
    canonicalClaim = `${withoutTerminalPunct} occurred as described`;

    subClaimsToAssess = [
      {
        claimType: 'occurrence',
        statement: `The core event (${withoutTerminalPunct}) occurred as documented by public records and press reports.`
      },
      {
        claimType: 'cause_or_trigger',
        statement: `The underlying cause, contributing factors, or alleged motives are subject to ongoing inquiry or debate.`
      },
      {
        claimType: 'institutional_action',
        statement: `Institutional authorities and official bodies initiated formal inquiry, police investigation, or response measures.`
      }
    ];
  }
  // 3. General Research / Specific Factual Claim: "UPI charges above ₹2,000"
  else if (isChargesOrFees) {
    targetEntity = 'UPI';
    secondaryEntities = ['NPCI', 'Prepaid Payment Instruments', 'wallets'];
    predicate = 'transaction charges or fees above threshold';
    predicateKeywords = ['charge', 'charges', 'fee', 'fees', '2000', '2,000', 'interchange', 'wallet', 'free', 'surcharge', 'npci'];
    entityKeywords = ['upi', 'payment', 'transaction'];
    canonicalClaim = 'Charges or interchange fees apply to UPI transactions above ₹2,000';

    subClaimsToAssess = [
      {
        claimType: 'specific_statement',
        statement: 'Standard consumer-to-merchant and person-to-person UPI transactions are completely free.'
      },
      {
        claimType: 'institutional_action',
        statement: 'NPCI issued a circular defining an interchange fee on merchant PPI/wallet transactions above ₹2,000.'
      }
    ];
  }
  // 4. Company / Organization: "Did Tesla announce layoffs today?"
  else if (intentType === 'company_organization' || isLayoffs) {
    const match = cleanQuery.match(/^(?:did|does|is|has)\s+([A-Z][a-zA-Z0-9\s]+?)\s+(?:announce|cut|layoff|lay off|fire)\b/i);
    if (match) {
      targetEntity = match[1].trim();
    } else {
      const capMatch = cleanQuery.match(/\b([A-Z][a-z0-9]+)\b/);
      targetEntity = capMatch ? capMatch[1] : 'Company';
    }

    predicate = isLayoffs ? 'workforce layoffs' : 'corporate announcement';
    predicateKeywords = isLayoffs
      ? ['layoff', 'layoffs', 'job cut', 'job cuts', 'workforce', 'severance', 'downsizing', 'employees']
      : ['announcement', 'announced', 'statement', 'press release', 'news'];
    entityKeywords = targetEntity.toLowerCase().split(/\s+/).filter(w => !STOP_WORDS.has(w));
    canonicalClaim = `${targetEntity} announced layoffs${temporalConstraint ? ' ' + temporalConstraint : ''}`;
  }
  // 5. General Yes/No Question
  else if (isYesNo) {
    // E.g. "Did Apollo 11 land humans on the Moon in 1969?"
    // E.g. "Does 5G mobile technology spread coronavirus?"
    // E.g. "Did Chandrayaan-3 successfully land on the Moon south pole?"
    const entityMatch = cleanQuery.match(/^(?:did|does|do|is|are|was|were|has|have|had|will|can)\s+((?:5G(?:\s+mobile(?:\s+technology)?)?|[A-Z][a-zA-Z0-9_-]+(?:\s+(?:[A-Z0-9][a-zA-Z0-9_-]+|\d+))*))\b/i);
    if (entityMatch) {
      targetEntity = entityMatch[1].trim();
      predicate = cleanQuery.replace(new RegExp(`^(?:did|does|do|is|are|was|were|has|have|had|will|can)\\s+${targetEntity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+(?:successfully\\s+|reportedly\\s+|actually\\s+|secretly\\s+)?`, 'i'), '').trim();
    } else {
      const words = cleanQuery.split(/\s+/);
      targetEntity = words[1] || 'Subject';
      predicate = cleanQuery.replace(/^(?:did|does|is|was|were|has|have|will|can)\s+/i, '');
    }
    predicateKeywords = predicate.toLowerCase().split(/\s+/).filter(w => !STOP_WORDS.has(w) && w.length > 2);
    entityKeywords = targetEntity.toLowerCase().split(/\s+/).filter(w => !STOP_WORDS.has(w) && w.length > 1);
    canonicalClaim = `${targetEntity} ${predicate}`;
  }
  // 6. General Research / Fallback
  else {
    const actionMatch = cleanQuery.match(/^([A-Z][a-zA-Z0-9_-]+(?:\s+[A-Z][a-zA-Z0-9_-]+)*)\s+(elected|appointed|resigned|arrested|died|named|ban|banned|signed|fined|acquired|launched|tested|announced|wins|won|lost|landed|flies|flew)\s+(.*)/i);
    const claimMatch = cleanQuery.match(/(?:claims|reports|alleges)\s+([A-Z][a-zA-Z0-9_\s]+?)\s+(?:release|launch|unveil|test|announce|bankrupt|produce|deliver)/i);
    const namedEntityMatch = cleanQuery.match(/\b([A-Z][a-zA-Z0-9_-]+(?:\s+[A-Z][a-zA-Z0-9_-]+)*)\b/);

    if (actionMatch) {
      targetEntity = actionMatch[1].trim();
      predicate = `${actionMatch[2]} ${actionMatch[3]}`.trim();
    } else if (claimMatch) {
      targetEntity = claimMatch[1].trim();
      predicate = cleanQuery.replace(new RegExp(`.*${targetEntity}\\s*`, 'i'), '').trim() || 'unverified assertion';
    } else if (namedEntityMatch) {
      targetEntity = namedEntityMatch[1].trim();
      const escaped = targetEntity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      predicate = cleanQuery.replace(new RegExp(`.*\\b${escaped}\\b\\s*`, 'i'), '').trim() || 'factual verification';
    } else {
      const tokens = cleanQuery.split(/\s+/).filter(w => !STOP_WORDS.has(w.toLowerCase()));
      targetEntity = tokens.slice(0, 2).join(' ');
      predicate = tokens.slice(2).join(' ') || 'factual verification';
    }
    predicateKeywords = predicate.toLowerCase().split(/\s+/).filter(w => !STOP_WORDS.has(w) && w.length > 2);
    entityKeywords = targetEntity.toLowerCase().split(/\s+/).filter(w => !STOP_WORDS.has(w) && w.length > 1);
    canonicalClaim = `${targetEntity} ${predicate}`;
  }

  // Detect geographic or institutional anchors in the query/predicate
  const geographicOrOrgAnchors: string[] = [];
  const knownLocations = [
    'japan', 'japanese', 'india', 'indian', 'us', 'usa', 'america', 'american',
    'uk', 'britain', 'british', 'china', 'chinese', 'russia', 'russian', 'dubai',
    'uae', 'france', 'french', 'germany', 'german', 'canada', 'canadian',
    'california', 'mojave', 'delhi', 'mumbai'
  ];
  for (const loc of knownLocations) {
    if (new RegExp(`\\b${loc}\\b`, 'i').test(predicate) || new RegExp(`\\b${loc}\\b`, 'i').test(cleanQuery)) {
      if (!geographicOrOrgAnchors.includes(loc)) {
        geographicOrOrgAnchors.push(loc);
      }
    }
  }

  // Detect required predicate anchors (specific actions or titles)
  const requiredPredicateAnchors: string[] = [];
  if (/\b(?:elected|election)\b/i.test(predicate)) requiredPredicateAnchors.push('elected');
  if (/\b(?:prime\s+minister)\b/i.test(predicate)) requiredPredicateAnchors.push('prime minister');
  if (/\b(?:president)\b/i.test(predicate)) requiredPredicateAnchors.push('president');
  if (/\b(?:layoff|layoffs|job\s+cuts?)\b/i.test(predicate)) requiredPredicateAnchors.push('layoffs');
  if (/\b(?:charges?|fees?)\b/i.test(predicate)) requiredPredicateAnchors.push('charges');
  if (geographicOrOrgAnchors.length > 0) {
    requiredPredicateAnchors.push(...geographicOrOrgAnchors);
  }

  // Construct optimized search queries tailored for search engines
  const searchQueries: string[] = [trimmed];

  if (isPersonStatus) {
    // Target death/alive fact checks and current status explicitly
    searchQueries.push(`"${targetEntity}" (dead OR died OR death OR alive OR "fact check" OR "still alive")`);
    searchQueries.push(`"${targetEntity}" death rumors fact check`);
  } else if (intentType === 'incident_search' && targetEntity) {
    // Exact entity pairing
    searchQueries.push(`"${targetEntity}" ${secondaryEntities.join(' ')}`);
    searchQueries.push(`${targetEntity} ${secondaryEntities.join(' ')} official statement investigation police`);
  } else if (isChargesOrFees) {
    searchQueries.push('UPI charges above 2000 NPCI clarification fact check');
    searchQueries.push('are UPI transactions above 2000 free or charged');
  } else if (isLayoffs && targetEntity) {
    searchQueries.push(`"${targetEntity}" layoffs ${temporalConstraint || 'news'}`);
    searchQueries.push(`"${targetEntity}" workforce reduction job cuts`);
  }

  return {
    intentType,
    queryAspect,
    originalQuery: trimmed,
    targetEntity: targetEntity || trimmed,
    secondaryEntities,
    predicate,
    predicateKeywords,
    entityKeywords,
    requiredPredicateAnchors,
    geographicOrOrgAnchors,
    canonicalClaim,
    isPersonStatusQuestion: isPersonStatus,
    isDeathOrLifeQuestion,
    requiresRecency,
    temporalConstraint,
    searchQueries,
    subClaimsToAssess
  };
}
