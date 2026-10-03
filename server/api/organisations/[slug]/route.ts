import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient, isSupabaseServerConfigured } from '@/lib/supabaseServer';
import { INITIAL_ENTITIES } from '@/lib/data/mockData';
import { EntityProfile } from '@/lib/types';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  if (isSupabaseServerConfigured) {
    const client = getSupabaseServerClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('organisations')
          .select(`
            *,
            notices:official_notices(*),
            sources:source_records(*),
            evidence:evidence_items(*),
            revisions:profile_revisions(*),
            claims:claims(
              *,
              versions:claim_versions(*)
            )
          `)
          .or(`slug.eq.${slug},id.eq.${slug}`)
          .maybeSingle();

        if (!error && data) {
          const formatted: EntityProfile = {
            id: data.id,
            slug: data.slug,
            name: data.name,
            category: data.category,
            aliases: data.aliases || [],
            website: data.website,
            identifiers: data.identifiers || {},
            registrationStatus: data.registration_status,
            verificationBadge: data.verification_badge,
            shortDescription: data.short_description || '',
            executiveSummary: data.executive_summary || '',
            lastUpdated: data.updated_at,
            isDemoEntity: data.is_demo_entity,
            notices: (data.notices || []).map((n: any) => ({
              id: n.id,
              entityId: data.id,
              regulator: n.regulator,
              orderNumber: n.order_number,
              noticeType: n.notice_type,
              dateIssued: n.date_issued,
              headline: n.headline,
              summary: n.summary,
              officialPdfUrl: n.official_pdf_url
            })),
            sources: (data.sources || []).map((s: any) => ({
              id: s.id,
              entityId: data.id,
              title: s.title,
              sourceName: s.source_name,
              sourceType: s.source_type,
              url: s.url,
              publicationDate: s.publication_date,
              retrievalDate: s.retrieval_date,
              tier: s.tier,
              snippet: s.snippet,
              archiveUrl: s.archive_url
            })),
            evidence: (data.evidence || []).map((e: any) => ({
              id: e.id,
              entityId: data.id,
              title: e.title,
              category: e.category,
              description: e.description,
              sourceTitle: e.source_title,
              sourceUrl: e.source_url,
              submittedBy: e.submitted_by,
              submittedAt: e.submitted_at,
              verifiedAt: e.verified_at,
              verificationState: e.verification_state
            })),
            revisions: (data.revisions || []).map((r: any) => ({
              id: r.id,
              entityId: data.id,
              versionNumber: r.version_number,
              authorName: r.author_name,
              authorRole: r.author_role,
              timestamp: r.timestamp,
              summaryOfChange: r.summary_of_change,
              moderatedBy: r.moderated_by,
              diffSnippet: r.diff_snippet
            })),
            claims: (data.claims || []).map((c: any) => ({
              id: c.id,
              organisationId: data.id,
              title: c.title,
              category: c.category,
              status: c.status,
              createdAt: c.created_at,
              updatedAt: c.updated_at,
              versions: (c.versions || []).map((v: any) => ({
                id: v.id,
                claimId: c.id,
                versionNumber: v.version_number,
                statementText: v.statement_text,
                changeSummary: v.change_summary,
                diffSnippet: v.diff_snippet,
                sourceId: v.source_id,
                sourceUrl: v.source_url,
                sourceTitle: v.source_title,
                publicationDate: v.publication_date,
                recordedAt: v.recorded_at,
                contributorName: v.contributor_name,
                reviewState: v.review_state
              }))
            })),
            timeline: []
          };

          return NextResponse.json({ data: formatted, source: 'supabase' });
        }
      } catch (err) {
        console.warn('Supabase organisation fetch failed:', err);
      }
    }
  }

  // Fallback to local memory / mock
  const fallback = INITIAL_ENTITIES.find((e) => e.slug === slug || e.id === slug);
  if (!fallback) {
    return NextResponse.json({ error: 'Organisation not found' }, { status: 404 });
  }

  return NextResponse.json({ data: fallback, source: 'fallback' });
}
