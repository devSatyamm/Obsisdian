import { SearchResultItem } from './types';
import { QueryIntent } from './intentClassifier';

export interface SourceValidationResult {
  sourceId: string;
  title: string;
  url: string;
  publisher: string;
  relevanceScore: number; // 0 to 100
  supportsPart: string;
  directlyAnswers: boolean;
  correctEntity: boolean;
  correctPredicate: boolean;
  recentEnough: boolean;
  sharesOnlyKeywords: boolean;
  relevanceRationale: string;
  isValid: boolean;
}

export interface ValidationSummary {
  intent: QueryIntent;
  totalCandidateSources: number;
  validSourcesCount: number;
  rejectedSourcesCount: number;
  validSources: SearchResultItem[];
  validations: SourceValidationResult[];
  hasDirectEvidence: boolean;
  hasSufficientEvidence: boolean;
  rejectionReason?: string;
}

/**
 * Validates a single search result against the query intent.
 */
export function validateSourceAgainstIntent(
  source: SearchResultItem,
  intent: QueryIntent
): SourceValidationResult {
  const combinedText = `${source.title} ${source.snippet} ${source.extractedBody || ''}`.toLowerCase();
  const titleLower = source.title.toLowerCase();

  // 1. Entity Matching
  // For person or specific entity, check if target entity is present
  const entityWords = intent.entityKeywords;
  let entityMatchCount = 0;
  for (const w of entityWords) {
    if (combinedText.includes(w)) entityMatchCount++;
  }

  // Strong entity match:
  // For multi-word entities (e.g. "Justin Bieber", "Donald Trump"), require the full phrase OR all essential entity tokens
  const fullEntityInText = combinedText.includes(intent.targetEntity.toLowerCase());
  const allEntityWordsInText = entityWords.length > 1 && entityWords.every((w) => combinedText.includes(w));
  const primaryEntityKeyword = entityWords.find((w) => w.length >= 2 && !['technology', 'company', 'organization', 'incident', 'mobile', 'case'].includes(w)) || entityWords[0];
  const hasPrimaryEntity = primaryEntityKeyword ? combinedText.includes(primaryEntityKeyword) : true;
  
  const correctEntity =
    fullEntityInText ||
    allEntityWordsInText ||
    (entityWords.length === 1 && combinedText.includes(entityWords[0])) ||
    (entityWords.length > 0 && entityMatchCount >= Math.ceil(entityWords.length * 0.7) && hasPrimaryEntity);

  // 2. Predicate Matching
  let predicateMatchCount = 0;
  const matchedPredicateKeywords: string[] = [];

  // Metaphorical usage filter for death queries (e.g. "dead cat", "movement dead", "deal is dead")
  const isMetaphoricalDead =
    intent.isDeathOrLifeQuestion &&
    /\b(?:dead cat|dead heat|dead end|dead on arrival|movement\s+(?:is\s+)?['"]?dead|career\s+(?:is\s+)?['"]?dead|deal\s+(?:is\s+)?['"]?dead|bill\s+(?:is\s+)?['"]?dead)\b/i.test(combinedText) &&
    !/\b(?:died|passes away|killed|assassinated|hospital|funeral|obituary|autopsy)\b/i.test(combinedText);

  for (const kw of intent.predicateKeywords) {
    const isMatched =
      combinedText.includes(kw) ||
      (kw === 'coronavirus' && (combinedText.includes('covid') || combinedText.includes('covid-19'))) ||
      (kw === 'covid' && (combinedText.includes('coronavirus') || combinedText.includes('covid-19')));

    if (isMatched) {
      if (kw === 'dead' && isMetaphoricalDead) {
        // Skip treating metaphorical "dead" as actual human death
        continue;
      }
      predicateMatchCount++;
      matchedPredicateKeywords.push(kw);
    }
  }

  // Check if live activity / speaking event is mentioned for person status queries (proves alive)
  const indicatesAlive =
    intent.isPersonStatusQuestion &&
    /\b(?:speaks at|addresses|attends|rally|press conference|interviewed|meets with|signs|signs bill|announces|alive and well|active|today)\b/i.test(combinedText);

  // Check if death debunking / fact-check / mythbuster is mentioned
  const indicatesFactCheck =
    /\b(?:fact check|mythbuster|mythbusters|debunk|debunked|hoax|false claim|rumor debunked|did not die|not dead|alive|alive and well|falsely claimed|no evidence|no link|does not spread|not spread)\b/i.test(combinedText);

  // Geographic or institutional anchor check (e.g. "Japan" for "prime minister of Japan")
  const geoAnchors = intent.geographicOrOrgAnchors || [];
  const matchesGeoAnchor =
    geoAnchors.length === 0 ||
    geoAnchors.some(a => combinedText.includes(a.toLowerCase()) || (a.length > 4 && combinedText.includes(a.slice(0, 4).toLowerCase())));

  // Required predicate threshold:
  // For claims with 3+ predicate keywords, matching 1 generic keyword is NEVER enough.
  const minRequiredKeywords =
    intent.predicateKeywords.length >= 4 ? 2 :
    intent.predicateKeywords.length >= 2 ? Math.min(2, intent.predicateKeywords.length) :
    1;

  const hasSufficientPredicateKeywords = matchedPredicateKeywords.length >= minRequiredKeywords;

  // Secondary context check for incident search (e.g. "Dubai airline" for "Smith")
  const secondaryWords = (intent.secondaryEntities || []).map((e) => e.toLowerCase()).filter((w) => w.length > 2);
  const matchesSecondaryContext =
    intent.intentType !== 'incident_search' ||
    secondaryWords.length === 0 ||
    secondaryWords.some((w) => combinedText.includes(w));

  const correctPredicate =
    matchesSecondaryContext &&
    (
      (indicatesFactCheck && (matchedPredicateKeywords.length >= 1 || combinedText.includes(intent.targetEntity.toLowerCase()))) ||
      (intent.isPersonStatusQuestion && (indicatesAlive || indicatesFactCheck || matchedPredicateKeywords.length >= 1)) ||
      (hasSufficientPredicateKeywords && matchesGeoAnchor)
    );

  // 3. Recency Check
  let recentEnough = true;
  if (intent.requiresRecency && source.publishedAt) {
    try {
      const pubTime = new Date(source.publishedAt).getTime();
      const now = Date.now();
      const daysOld = (now - pubTime) / (1000 * 60 * 60 * 24);
      if (daysOld > 60 && !indicatesFactCheck) {
        recentEnough = false;
      }
    } catch {
      recentEnough = true;
    }
  }

  // 4. Keyword-only trap detection
  // If source contains entity word (e.g. "Justin Bieber" or "Trump") but zero or insufficient predicate terms
  const sharesOnlyKeywords = correctEntity && !correctPredicate;

  // 5. Direct Answer assessment: only if strict predicate matches and not a keyword trap
  const directlyAnswers =
    correctEntity &&
    correctPredicate &&
    matchesSecondaryContext &&
    !sharesOnlyKeywords &&
    (
      indicatesFactCheck ||
      indicatesAlive ||
      matchedPredicateKeywords.length >= Math.max(2, Math.ceil(intent.predicateKeywords.length * 0.5)) ||
      (titleLower.includes(intent.targetEntity.toLowerCase()) && hasSufficientPredicateKeywords && matchesGeoAnchor)
    );

  // 6. Score calculation
  let score = 0;
  if (correctEntity) score += 35;
  if (correctPredicate) score += 35;
  if (directlyAnswers) score += 20;
  if (recentEnough) score += 10;
  if (sharesOnlyKeywords) score = Math.min(25, score);

  // Strict validity threshold:
  // Must match the core entity (if specified) AND the predicate (or status/alive evidence)
  let isValid = false;
  let supportsPart = '';
  let relevanceRationale = '';

  if (!correctEntity) {
    isValid = false;
    supportsPart = 'None (Missing primary target entity)';
    relevanceRationale = `Article does not mention or identify "${intent.targetEntity}".`;
  } else if (!matchesSecondaryContext) {
    isValid = false;
    supportsPart = `Entity background ("${intent.targetEntity}")`;
    relevanceRationale = `Article mentions "${intent.targetEntity}", but does not relate to "${intent.secondaryEntities.join(', ')}".`;
  } else if (source.contentType === 'satire' || /\b(?:satire|parody|showerthought|what if|hypothetical)\b/i.test(combinedText)) {
    isValid = false;
    supportsPart = 'Satire / Hypothetical discussion';
    relevanceRationale = 'Satire, parody, or hypothetical forum discussion does not provide empirical evidence for factual claims.';
  } else if (isMetaphoricalDead) {
    isValid = false;
    supportsPart = 'Political commentary';
    relevanceRationale = `Article uses "dead" in a metaphorical political context (e.g., dead cat or movement dead) rather than human death.`;
  } else if (sharesOnlyKeywords) {
    isValid = false;
    supportsPart = `Entity background ("${intent.targetEntity}")`;
    relevanceRationale = `Article mentions "${intent.targetEntity}", but does not address the question regarding "${intent.predicate}". Shares keywords without evidentiary relevance.`;
  } else if (!correctPredicate) {
    isValid = false;
    supportsPart = 'Unrelated context';
    relevanceRationale = `Article does not contain evidence regarding "${intent.predicate}".`;
  } else {
    isValid = true;
    supportsPart = `Factual reporting regarding ${intent.targetEntity} and ${intent.predicate}`;
    if (indicatesFactCheck) {
      relevanceRationale = `Direct fact-check investigating claims and public reporting on ${intent.targetEntity}.`;
    } else if (indicatesAlive) {
      relevanceRationale = `Documents active public presence and verifiable current status of ${intent.targetEntity}.`;
    } else {
      relevanceRationale = `Directly addresses ${intent.targetEntity} and provides reporting on ${matchedPredicateKeywords.slice(0, 3).join(', ')}.`;
    }
  }

  return {
    sourceId: source.id,
    title: source.title,
    url: source.url,
    publisher: source.publisher,
    relevanceScore: score,
    supportsPart,
    directlyAnswers,
    correctEntity,
    correctPredicate,
    recentEnough,
    sharesOnlyKeywords,
    relevanceRationale,
    isValid
  };
}

/**
 * Filters a pool of retrieved search items, validating and scoring each one.
 */
export function validateAndRankEvidence(
  sources: SearchResultItem[],
  intent: QueryIntent
): ValidationSummary {
  const validations: SourceValidationResult[] = [];
  const validSources: SearchResultItem[] = [];

  for (const s of sources) {
    const v = validateSourceAgainstIntent(s, intent);
    validations.push(v);

    if (v.isValid) {
      validSources.push({
        ...s,
        relevanceScore: v.relevanceScore,
        relevanceRationale: v.relevanceRationale,
        entityMatched: v.correctEntity,
        predicateMatched: v.correctPredicate
      });
    }
  }

  // Sort valid sources by relevance score descending
  validSources.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

  const hasDirectEvidence = validations.some(v => v.isValid && v.directlyAnswers);
  const hasSufficientEvidence = validSources.length >= 1 && hasDirectEvidence;

  let rejectionReason: string | undefined;
  if (validSources.length === 0) {
    if (sources.length === 0) {
      rejectionReason = `No public internet sources found for query.`;
    } else if (validations.every(v => !v.correctEntity)) {
      rejectionReason = `Retrieved ${sources.length} source(s), but none contained the target entity "${intent.targetEntity}".`;
    } else if (validations.every(v => v.sharesOnlyKeywords)) {
      rejectionReason = `Retrieved sources mention "${intent.targetEntity}" in unrelated contexts, but none contain evidence answering whether "${intent.canonicalClaim}".`;
    } else {
      rejectionReason = `Retrieved sources failed query relevance and predicate matching checks.`;
    }
  }

  return {
    intent,
    totalCandidateSources: sources.length,
    validSourcesCount: validSources.length,
    rejectedSourcesCount: sources.length - validSources.length,
    validSources,
    validations,
    hasDirectEvidence,
    hasSufficientEvidence,
    rejectionReason
  };
}
