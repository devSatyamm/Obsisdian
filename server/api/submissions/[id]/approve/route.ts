import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient, isSupabaseServerConfigured } from '@/lib/supabaseServer';
import { verifyModeratorAccess } from '@/lib/auth/moderationGuard';
import { repository } from '@/lib/db/repository';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const {
      moderatorName = 'Senior Moderator',
      notes = 'Verified against primary filings.',
      claimId,
      proposedStatementText
    } = body;

    // 1. Enforce strict server-side moderation authorization
    const authResult = await verifyModeratorAccess(req, moderatorName);
    if (!authResult.authorized) {
      return NextResponse.json(
        {
          error: authResult.error || 'Unauthorized: Moderator privileges required.',
          hint: 'Moderator operations require Authorization: Bearer <token> or valid x-moderator-key header.'
        },
        { status: authResult.statusCode || 401 }
      );
    }

    const effectiveModeratorName = authResult.reviewerName;
    const effectiveModeratorRole = authResult.reviewerRole;

    if (isSupabaseServerConfigured) {
      const client = getSupabaseServerClient();
      if (client) {
        // 2. Fetch submission details
        const { data: sub, error: subError } = await client
          .from('community_submissions')
          .select('*')
          .eq('id', id)
          .single();

        if (subError || !sub) {
          return NextResponse.json({ error: 'Submission not found in database' }, { status: 404 });
        }

        if (sub.status === 'approved') {
          return NextResponse.json(
            { error: 'Conflict: Submission has already been approved.' },
            { status: 409 }
          );
        }

        const now = new Date().toISOString();

        // 3. Update submission status to approved
        const { error: updateSubError } = await client
          .from('community_submissions')
          .update({
            status: 'approved',
            reviewed_by: effectiveModeratorName,
            reviewed_at: now,
            moderation_notes: notes
          })
          .eq('id', id);

        if (updateSubError) {
          throw updateSubError;
        }

        let newRevisionId: string | null = null;
        let newEvidenceId: string | null = null;
        let newClaimVersionId: string | null = null;

        // 4. If tied to an organisation, create evidence and profile revision
        if (sub.organisation_id) {
          // 4.1 Insert evidence item
          const { data: evData } = await client
            .from('evidence_items')
            .insert({
              organisation_id: sub.organisation_id,
              claim_id: sub.claim_id || claimId || null,
              title: sub.title,
              category: sub.evidence_category,
              description: sub.factual_description,
              source_url: sub.primary_source_url,
              submitted_by: `${sub.submitted_by_name} (${sub.submitted_by_role})`,
              verification_state: 'Community Corroborated',
              verified_at: now
            })
            .select()
            .single();

          if (evData) {
            newEvidenceId = evData.id;
          }

          // 4.2 Determine next revision number
          const { count: revCount } = await client
            .from('profile_revisions')
            .select('id', { count: 'exact', head: true })
            .eq('organisation_id', sub.organisation_id);

          const nextRevNumber = (revCount ?? 0) + 1;

          // 4.3 Insert traceable profile revision
          const { data: revData } = await client
            .from('profile_revisions')
            .insert({
              organisation_id: sub.organisation_id,
              version_number: nextRevNumber,
              author_name: sub.submitted_by_name,
              author_role: 'Verified Contributor',
              timestamp: now,
              summary_of_change: `Approved community finding: ${sub.title}`,
              moderated_by: effectiveModeratorName,
              diff_snippet: `+ Added [${sub.evidence_category}] exhibit: ${sub.title} (Source: ${sub.primary_source_url})`
            })
            .select()
            .single();

          if (revData) {
            newRevisionId = revData.id;
          }
        }

        // 5. If this submission proposes a claim update or correction
        const targetClaimId = sub.claim_id || claimId;
        const statementText = sub.proposed_statement_text || proposedStatementText;

        if (targetClaimId && statementText) {
          // 5.1 Fetch highest version number for this claim
          const { data: latestVersions } = await client
            .from('claim_versions')
            .select('version_number')
            .eq('claim_id', targetClaimId)
            .order('version_number', { ascending: false })
            .limit(1);

          const currentMaxVersion = latestVersions && latestVersions.length > 0 ? latestVersions[0].version_number : 1;
          const nextVersionNumber = currentMaxVersion + 1;

          // 5.2 Insert new immutable claim version
          const { data: newVersion, error: verError } = await client
            .from('claim_versions')
            .insert({
              claim_id: targetClaimId,
              version_number: nextVersionNumber,
              statement_text: statementText,
              change_summary: `Approved community revision: ${sub.title}`,
              diff_snippet: `+ ${statementText}`,
              source_url: sub.primary_source_url,
              publication_date: sub.source_publication_date || null,
              recorded_at: now,
              contributor_name: sub.submitted_by_name,
              contributor_role: 'Verified Contributor',
              moderated_by: effectiveModeratorName,
              review_state: 'published'
            })
            .select()
            .single();

          if (!verError && newVersion) {
            newClaimVersionId = newVersion.id;

            // Update root claim status to Updated
            await client
              .from('claims')
              .update({
                status: 'Updated',
                updated_at: now
              })
              .eq('id', targetClaimId);
          }
        }

        // 6. Create permanent Moderation Audit record
        await client
          .from('moderation_audits')
          .insert({
            submission_id: id,
            action: 'approve',
            reviewer_name: effectiveModeratorName,
            reviewer_role: effectiveModeratorRole,
            notes,
            resulting_revision_id: newRevisionId,
            resulting_claim_version_id: newClaimVersionId,
            timestamp: now
          });

        return NextResponse.json({
          success: true,
          status: 'approved',
          message: 'Submission approved and immutable audit record created.',
          evidenceId: newEvidenceId,
          revisionId: newRevisionId,
          claimVersionId: newClaimVersionId,
          reviewer: effectiveModeratorName,
          source: 'supabase'
        });
      }
    }

    // Local fallback response
    try {
      repository.approveSubmission(id, effectiveModeratorName, notes);
    } catch (e) {
      console.debug('Fallback local repository approval update note:', e);
    }

    return NextResponse.json({
      success: true,
      status: 'approved',
      message: 'Submission approved and logged to local dossier cache.',
      reviewer: effectiveModeratorName,
      source: 'fallback'
    });
  } catch (err: any) {
    console.error('Approve submission error:', err);
    return NextResponse.json({ error: err.message || 'Approval failed' }, { status: 500 });
  }
}
