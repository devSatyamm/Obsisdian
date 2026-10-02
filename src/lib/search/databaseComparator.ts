import { repository } from '../db/repository';
import { DatabaseCrossReference } from './types';

/**
 * Checks the local VERITY repository (and Supabase if configured) for matching entities or claims.
 * If new, creates a staged submission candidate so the finding is preserved for review.
 */
export async function compareQueryWithDatabase(
  query: string,
  topHeadline?: string,
  primaryUrl?: string,
  publisher?: string
): Promise<DatabaseCrossReference> {
  const entities = repository.getEntities();
  // Collect all claims from all known entities
  const claims = entities.flatMap((e) => (e.claims || []).map((c) => ({ ...c, entityName: e.name })));

  const qLower = query.toLowerCase();

  // 1. Check for entity match
  let matchedEntity: DatabaseCrossReference['matchedEntity'] | undefined;
  for (const ent of entities) {
    if (
      qLower.includes(ent.name.toLowerCase()) ||
      qLower.includes(ent.slug.toLowerCase()) ||
      (ent.aliases && ent.aliases.some((a) => qLower.includes(a.toLowerCase())))
    ) {
      matchedEntity = {
        id: ent.id,
        name: ent.name,
        slug: ent.slug,
        category: ent.category
      };
      break;
    }
  }

  // 2. Check for claim statement similarity
  const matchedClaims: DatabaseCrossReference['matchedClaims'] = [];
  const words = qLower.split(/\s+/).filter((w) => w.length > 3);

  for (const c of claims) {
    const statementText = c.currentVersion?.statementText || c.title || '';
    const cLower = statementText.toLowerCase();
    const matchCount = words.filter((w) => cLower.includes(w)).length;
    const similarity = words.length > 0 ? matchCount / words.length : 0;

    if (similarity >= 0.3) {
      matchedClaims.push({
        id: c.id,
        statement: statementText,
        version: c.currentVersion ? `v${c.currentVersion.versionNumber}.0` : 'v1.0',
        similarity: Math.round(similarity * 100) / 100
      });
    }
  }

  const isNewIncident = !matchedEntity && matchedClaims.length === 0;

  let comparisonNotes = '';
  if (matchedEntity) {
    comparisonNotes = `Matches known indexed entity "${matchedEntity.name}" (${matchedEntity.category}). ${matchedClaims.length} previously tracked claim statement(s) cross-referenced.`;
  } else if (matchedClaims.length > 0) {
    comparisonNotes = `Cross-referenced against ${matchedClaims.length} existing claim statement(s) in VERITY archive.`;
  } else {
    comparisonNotes = `Zero pre-existing database records found for this query. This is a newly discovered external incident staged for public intelligence review.`;
  }

  // 3. Stage the finding in community/moderation queue if it's new and has a headline
  let stagedCandidateId: string | undefined;
  if (isNewIncident && topHeadline && primaryUrl) {
    try {
      const sub = repository.createSubmission({
        entityName: query.length > 40 ? query.substring(0, 40) : query,
        category: 'Other',
        evidenceCategory: 'Reputable News Investigation',
        title: topHeadline,
        factualDescription: `Autonomously discovered via real-time search for "${query}". Source: ${publisher || 'Public Web'}.`,
        primarySourceUrl: primaryUrl,
        submittedBy: {
          id: 'usr_live_engine',
          name: 'VERITY Live Intelligence Engine',
          role: 'Researcher'
        }
      });
      stagedCandidateId = sub.id;
    } catch (e) {
      // Continue without breaking search
    }
  }

  return {
    isNewIncident,
    matchedEntity,
    matchedClaims,
    comparisonNotes,
    stagedCandidateId
  };
}
