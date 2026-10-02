import { IngestedFeedItem, ExtractedClaimCandidate } from './types';
import { repository } from '../db/repository';
import { matchClaimAgainstRegistry } from './claimMatcher';

interface EntityMatch {
  slug?: string;
  name: string;
}

// 1. Generic administrative, operational, or calendar boilerplate patterns
// These are routine notices and MUST NOT become factual claims about organisations.
export const BOILERPLATE_OR_CALENDAR_PATTERNS = [
  /\b(?:auction\s+of\s+state\s+government\s+securities|market\s+borrowings?\s+calendar)\b/i,
  /\b(?:processing\s+of\s+applications\s+received\s+under\s+(?:the\s+)?citizen'?s?\s+charter)\b/i,
  /\b(?:overnight\s+variable\s+rate\s+reverse\s+repo|vrrr\s+auction|laf\s+on)\b/i,
  /\b(?:floating\s+rate\s+bond\s+\d{4}|rate\s+of\s+interest\s+on\s+government)\b/i,
  /\b(?:indicative\s+calendar|schedule\s+of\s+meetings?|minutes\s+of\s+the\s+monetary\s+policy)\b/i,
  /\b(?:weekly\s+statistical\s+supplement|bank\s+holidays?\s+list)\b/i,
  /\b(?:terms\s+and\s+conditions|privacy\s+policy|cookie\s+settings|all\s+rights\s+reserved)\b/i,
  /\b(?:click\s+here\s+to\s+subscribe|newsletter\s+signup|advertisement|sponsored\s+content)\b/i,
  /^["']?sebi\s+caution\s+notice\s+when:\d+d["']?\s*-\s*google\s+news$/i,
  /^google\s+news$/i
];

// 2. Opinion and subjective commentary patterns (to filter out non-factual content)
const OPINION_COMMENTARY_PATTERNS = [
  /\b(?:in\s+my\s+opinion|in\s+our\s+view|we\s+believe|analysts\s+speculate|it\s+seems\s+likely)\b/i,
  /\b(?:we\s+hope|editorial\s+board|guest\s+columnist|op-ed|personal\s+reflection)\b/i,
  /\b(?:could\s+potentially\s+reach|sky\s+is\s+the\s+limit|to\s+the\s+moon|hot\s+stock\s+tip)\b/i
];

// 3. Actionable regulatory and enforcement action patterns
export const ACTIONABLE_REGULATORY_PATTERNS = [
  /\b(?:issues?|issued)\s+(?:a\s+)?(?:warning|caution\s+notice|interim\s+order|penalty|advisory)\s+(?:to|against|on)\b/i,
  /\b(?:warns?|warned|penalizes?|penalized|cautions?|cautioned|bars?|barred|restrains?|restrained)\s+[A-Z][a-zA-Z0-9\s]{2,40}\s+(?:for|over|in|regarding|against)\b/i,
  /\b(?:unregistered|unauthorized|illegal)\s+(?:investment\s+adviser|broker|platform|trading\s+app|fintech|scheme)\b/i,
  /\b(?:insider\s+trading|market\s+manipulation|disclosure\s+violations?|repatriation\s+before\s+lock-in)\b/i,
  /\b(?:enforcement\s+action|sebi\s+warning|rbi\s+caution\s+list|ed\s+attaches\s+assets)\b/i,
  /\b(?:prohibits?|prohibited|revokes?|revoked\s+license|cancelled\s+registration)\b/i
];

// 4. Quantitative and corporate yield/claim representation patterns
export const ACTIONABLE_PRODUCT_PATTERNS = [
  /\b(?:guarantees?|guaranteed|promises?|assures?)\s+(?:up\s+to\s+)?\d+(?:\.\d+)?%\s*(?:monthly|annual|daily|returns?|roi)\b/i,
  /\b\d+(?:\.\d+)?%\s*(?:monthly|compounding)\s*(?:returns?|profit|yield)\s*(?:with\s+100%\s+safety|risk-free)?\b/i,
  /\b(?:over|exceeding)\s+\d+\s*(?:million|crore|lakh)\s*(?:users|learners|active\s+traders)\b/i,
  /\b(?:penalty\s+of|fined)\s+(?:₹|rs\.?|inr)?\s*\d+(?:,\d+)*(?:\s*(?:crore|lakh))?\b/i
];

/**
 * Extracts speaker or authoritative attribution from text.
 */
function extractSpeakerOrAuthority(text: string): string | undefined {
  if (/\b(?:sebi|securities\s+and\s+exchange\s+board\s+of\s+india)\b/i.test(text)) {
    return 'Securities and Exchange Board of India (SEBI)';
  }
  if (/\b(?:rbi|reserve\s+bank\s+of\s+india)\b/i.test(text)) {
    return 'Reserve Bank of India (RBI)';
  }
  if (/\b(?:mca|ministry\s+of\s+corporate\s+affairs)\b/i.test(text)) {
    return 'Ministry of Corporate Affairs (MCA)';
  }
  if (/\b(?:ed|enforcement\s+directorate)\b/i.test(text)) {
    return 'Enforcement Directorate (ED)';
  }

  const quoteSpeakerMatch = text.match(/(?:said|stated|announced|claimed|confirmed)\s+([A-Z][a-zA-Z\s]{2,30}?)(?:,\s|\.\s|\s+in\s+a\s+statement)/i);
  if (quoteSpeakerMatch) {
    return quoteSpeakerMatch[1].trim();
  }

  return undefined;
}

/**
 * Evaluates an ingested feed item, strictly filters out administrative boilerplate,
 * and extracts attributable, evidence-backed claim candidates.
 */
export function extractClaimsFromFeedItem(item: IngestedFeedItem): ExtractedClaimCandidate[] {
  const candidates: ExtractedClaimCandidate[] = [];
  const title = item.title.trim();
  const text = `${title}. ${item.cleanText}`;

  // STEP 1: Strict Boilerplate & Routine Announcement Filter
  for (const bp of BOILERPLATE_OR_CALENDAR_PATTERNS) {
    if (bp.test(title) || bp.test(item.rawExcerpt)) {
      // Correctly reject routine operational/calendar notices
      return [];
    }
  }

  // STEP 2: Filter Subjective Opinion / Non-Factual Commentary
  let isOpinion = false;
  for (const op of OPINION_COMMENTARY_PATTERNS) {
    if (op.test(title)) {
      isOpinion = true;
      break;
    }
  }

  // STEP 3: Identify Actionable Signals
  const detectionSignals: string[] = [];
  let rationale = '';

  for (const p of ACTIONABLE_REGULATORY_PATTERNS) {
    if (p.test(text)) {
      detectionSignals.push('Regulatory Enforcement / Statutory Warning');
      rationale = 'Specific regulatory authority action or statutory violation notice identified.';
      break;
    }
  }

  for (const p of ACTIONABLE_PRODUCT_PATTERNS) {
    if (p.test(text)) {
      detectionSignals.push('Quantitative Yield / Performance Representation');
      rationale = rationale
        ? `${rationale} Includes specific numerical performance representation.`
        : 'Specific commercial yield or scale assertion identified.';
      break;
    }
  }

  // Quotation detection
  const quoteMatch = text.match(/(?:“|")([^”"]{15,250})(?:”|")/);
  if (quoteMatch) {
    detectionSignals.push('Attributable Direct Quotation');
  }

  // If no actionable signal found, this is an ordinary article or headline
  if (detectionSignals.length === 0) {
    return [];
  }

  // STEP 4: Identify Speaker or Authority
  const speakerOrSource = extractSpeakerOrAuthority(text) || item.publisher;

  // STEP 5: Identify Target Entity
  const existingEntities = repository.getEntities();
  let matchedEntity: EntityMatch | null = null;

  for (const ent of existingEntities) {
    const nameMatch = text.toLowerCase().includes(ent.name.toLowerCase());
    const aliasMatch = ent.aliases?.some((a) => text.toLowerCase().includes(a.toLowerCase()));
    if (nameMatch || aliasMatch) {
      matchedEntity = { slug: ent.slug, name: ent.name };
      break;
    }
  }

  // If no repository entity matches, extract named corporate / institutional subject
  if (!matchedEntity) {
    const orgPatterns = [
      /\b(?:SEBI\s+(?:Warns|Issues\s+Warning\s+to|Penalizes))\s+([A-Z][a-zA-Z0-9\s]{2,30}?)(?:\s+(?:for|over|officials|and|\-))/i,
      /\b([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)*\s+(?:Bank|Technologies|Advisors|Capital|Securities|Fertilisers|Enterprises|Pvt|Ltd))\b/
    ];

    for (const pat of orgPatterns) {
      const match = text.match(pat);
      if (match && match[1]) {
        matchedEntity = { name: match[1].trim() };
        break;
      }
    }
  }

  if (!matchedEntity) {
    matchedEntity = { name: 'Identified Corporate / Institutional Subject' };
  }

  // STEP 6: Formulate Factual Statement and Exact Supporting Excerpt
  let factualStatement = title;
  let relevantExcerpt = item.cleanText.substring(0, 300);

  if (quoteMatch) {
    factualStatement = quoteMatch[1].trim();
    relevantExcerpt = quoteMatch[0];
  } else {
    // Locate the sentence matching the primary signal
    const sentences = item.cleanText.split(/(?<=[.?!])\s+/);
    for (const sent of sentences) {
      const isSignalSentence =
        ACTIONABLE_REGULATORY_PATTERNS.some((p) => p.test(sent)) ||
        ACTIONABLE_PRODUCT_PATTERNS.some((p) => p.test(sent));
      if (isSignalSentence && sent.length > 25) {
        factualStatement = sent.trim();
        relevantExcerpt = sent.trim();
        break;
      }
    }
  }

  // STEP 7: Claim Matching and Change Detection via Claim Matcher
  const matchResult = matchClaimAgainstRegistry(
    factualStatement,
    matchedEntity.slug,
    item.url,
    item.publisher
  );

  const isDuplicate = matchResult.matchType === 'exact_duplicate';
  const isSyndication = matchResult.matchType === 'syndication';
  const isPotentialUpdate = matchResult.matchType === 'potential_update';
  const isContradiction = matchResult.matchType === 'potential_contradiction';
  const diffSnippet = matchResult.diffSnippet;
  const contradictionNote = matchResult.contradictionNote;
  const targetClaimId = matchResult.matchedClaim?.id;

  // STEP 8: Determine Review Status
  let status: 'pending_review' | 'needs_review' | 'rejected_as_boilerplate' = 'pending_review';
  if (isOpinion || item.cleanText.length < 50) {
    status = 'needs_review';
  }

  // STEP 9: Internal Heuristic Confidence Score (NEVER displayed as proof of truth)
  let confidenceScore = 0.6;
  if (detectionSignals.includes('Regulatory Enforcement / Statutory Warning')) confidenceScore += 0.2;
  if (detectionSignals.includes('Quantitative Yield / Performance Representation')) confidenceScore += 0.1;
  if (matchedEntity.slug) confidenceScore += 0.08;
  if (isOpinion) confidenceScore -= 0.25;
  confidenceScore = Math.max(0.2, Math.min(0.95, confidenceScore));

  candidates.push({
    id: `cand_${item.contentHash.substring(0, 12)}`,
    feedItemId: item.id,
    sourceUrl: item.url,
    publisher: item.publisher,
    publicationDate: item.publicationDate,
    originalHeadline: title,
    relevantExcerpt,
    extractionRationale: rationale || 'Attributable factual assertion matched against regulatory or product criteria.',
    speakerOrSource,
    targetEntitySlug: matchedEntity.slug,
    targetEntityName: matchedEntity.name,
    targetClaimId,
    claimTitle: title.length > 90 ? `${title.substring(0, 87)}...` : title,
    factualStatement,
    contextExcerpt: item.cleanText.substring(0, 400),
    confidenceScore,
    detectionSignals,
    isPotentialUpdate,
    isDuplicate,
    isSyndication,
    isContradiction,
    contradictionNote,
    similarityToExistingClaim: matchResult.similarityScore > 0 ? matchResult.similarityScore : undefined,
    diffSnippet,
    status
  });

  return candidates;
}
