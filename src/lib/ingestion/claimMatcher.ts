import { repository } from '../db/repository';
import { EntityProfile, Claim } from '../types';

export interface ClaimMatchResult {
  matchType: 'exact_duplicate' | 'syndication' | 'potential_update' | 'potential_contradiction' | 'distinct_claim';
  matchedEntity?: EntityProfile;
  matchedClaim?: Claim;
  similarityScore: number;
  diffSnippet?: string;
  contradictionNote?: string;
}

/**
 * Tokenizes text into normalized word set.
 */
function getWordTokens(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s%]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
  return new Set(words);
}

/**
 * Computes Jaccard word similarity between two statements (0.0 to 1.0).
 */
export function calculateStatementSimilarity(statement1: string, statement2: string): number {
  const set1 = getWordTokens(statement1);
  const set2 = getWordTokens(statement2);

  if (set1.size === 0 || set2.size === 0) return 0;

  let intersection = 0;
  for (const word of set1) {
    if (set2.has(word)) intersection++;
  }

  const union = new Set([...set1, ...set2]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Generates an audit diff snippet between two statements.
 */
export function generateDiffSnippet(oldStatement: string, newStatement: string): string {
  const oldWords = oldStatement.split(/\s+/);
  const newWords = newStatement.split(/\s+/);

  const oldSet = new Set(oldWords.map((w) => w.toLowerCase()));
  const newSet = new Set(newWords.map((w) => w.toLowerCase()));

  const removed = oldWords.filter((w) => !newSet.has(w.toLowerCase()));
  const added = newWords.filter((w) => !oldSet.has(w.toLowerCase()));

  const lines: string[] = [];
  if (removed.length > 0) {
    lines.push(`- ${removed.join(' ')}`);
  }
  if (added.length > 0) {
    lines.push(`+ ${added.join(' ')}`);
  }

  return lines.join('\n') || `~ Revised statement text (${newStatement.substring(0, 80)}...)`;
}

/**
 * Tests for direct factual or regulatory contradiction between statements.
 */
function evaluateContradiction(
  existingStatement: string,
  newStatement: string
): { isContradiction: boolean; note?: string } {
  const sOld = existingStatement.toLowerCase();
  const sNew = newStatement.toLowerCase();

  // Pattern A: Guaranteed vs Unregistered / Prohibited / Risk
  if (
    (sOld.includes('guarantee') || sOld.includes('100% safety') || sOld.includes('fixed return')) &&
    (sNew.includes('caution') || sNew.includes('unregistered') || sNew.includes('prohibited') || sNew.includes('penalty') || sNew.includes('warning'))
  ) {
    return {
      isContradiction: true,
      note: 'Potential discrepancy: Prior marketing claimed guaranteed yields/safety, while new official finding issues cautionary or enforcement action.'
    };
  }

  // Pattern B: Claim of authorization vs Cancellation / Alert List
  if (
    (sOld.includes('registered') || sOld.includes('authorized') || sOld.includes('licensed')) &&
    (sNew.includes('alert list') || sNew.includes('unauthorized') || sNew.includes('cancelled') || sNew.includes('suspended'))
  ) {
    return {
      isContradiction: true,
      note: 'Potential regulatory discrepancy: Prior record stated authorized status, while new notice lists entity under unauthorized alert or cancellation.'
    };
  }

  return { isContradiction: false };
}

/**
 * Matches an extracted factual statement against existing claims in the VERITY registry.
 * Distinguishes identical duplicates, syndicated coverage, revisions, contradictions, and distinct claims.
 */
export function matchClaimAgainstRegistry(
  factualStatement: string,
  targetEntitySlug?: string,
  sourceUrl?: string,
  publisher?: string
): ClaimMatchResult {
  const entities = repository.getEntities();

  // Find target entity
  let matchedEntity: EntityProfile | undefined;
  if (targetEntitySlug) {
    matchedEntity = entities.find((e) => e.slug === targetEntitySlug || e.id === targetEntitySlug);
  }

  if (!matchedEntity) {
    // Attempt text match
    for (const ent of entities) {
      if (
        factualStatement.toLowerCase().includes(ent.name.toLowerCase()) ||
        ent.aliases?.some((a) => factualStatement.toLowerCase().includes(a.toLowerCase()))
      ) {
        matchedEntity = ent;
        break;
      }
    }
  }

  if (!matchedEntity) {
    return { matchType: 'distinct_claim', similarityScore: 0 };
  }

  // Search entity claims
  let highestSimilarity = 0;
  let mostSimilarClaim: Claim | undefined;
  let mostSimilarVersionStatement = '';

  for (const claim of matchedEntity.claims || []) {
    // Check against root claim title
    const titleSim = calculateStatementSimilarity(factualStatement, claim.title);
    if (titleSim > highestSimilarity) {
      highestSimilarity = titleSim;
      mostSimilarClaim = claim;
    }

    // Check against claim version statements
    for (const ver of claim.versions || []) {
      const verSim = calculateStatementSimilarity(factualStatement, ver.statementText);
      if (verSim > highestSimilarity) {
        highestSimilarity = verSim;
        mostSimilarClaim = claim;
        mostSimilarVersionStatement = ver.statementText;
      }
    }
  }

  // 1. Exact Duplicate (similarity >= 0.85)
  if (highestSimilarity >= 0.85) {
    // Check if syndicated by a different publisher
    return {
      matchType: publisher ? 'syndication' : 'exact_duplicate',
      matchedEntity,
      matchedClaim: mostSimilarClaim,
      similarityScore: highestSimilarity
    };
  }

  // 2. Potential Contradiction (opposing regulatory / risk assertions for the same entity)
  if (mostSimilarVersionStatement || mostSimilarClaim) {
    const baseline = mostSimilarVersionStatement || mostSimilarClaim?.title || '';
    const contradiction = evaluateContradiction(baseline, factualStatement);
    if (contradiction.isContradiction) {
      return {
        matchType: 'potential_contradiction',
        matchedEntity,
        matchedClaim: mostSimilarClaim,
        similarityScore: highestSimilarity,
        diffSnippet: generateDiffSnippet(baseline, factualStatement),
        contradictionNote: contradiction.note
      };
    }
  }

  // 3. Potential Update / Revised Statement
  const sharesMetricOrReturn =
    (/\d+(?:\.\d+)?%/i.test(factualStatement) && /\d+(?:\.\d+)?%/i.test(mostSimilarVersionStatement || mostSimilarClaim?.title || '')) ||
    (factualStatement.toLowerCase().includes('return') && (mostSimilarVersionStatement || mostSimilarClaim?.title || '').toLowerCase().includes('return'));

  if ((highestSimilarity >= 0.40 || (highestSimilarity >= 0.15 && sharesMetricOrReturn)) && mostSimilarClaim) {
    const baseline = mostSimilarVersionStatement || mostSimilarClaim.title;
    return {
      matchType: 'potential_update',
      matchedEntity,
      matchedClaim: mostSimilarClaim,
      similarityScore: highestSimilarity,
      diffSnippet: generateDiffSnippet(baseline, factualStatement)
    };
  }

  // 4. Distinct Claim
  return {
    matchType: 'distinct_claim',
    matchedEntity,
    matchedClaim: mostSimilarClaim,
    similarityScore: highestSimilarity
  };
}
