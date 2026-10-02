import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient, isSupabaseServerConfigured } from '@/lib/supabaseServer';
import { INITIAL_ENTITIES } from '@/lib/data/mockData';
import { EntityProfile } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.toLowerCase().trim() || '';
  const category = searchParams.get('category') || '';
  const status = searchParams.get('status') || '';

  if (isSupabaseServerConfigured) {
    const client = getSupabaseServerClient();
    if (client) {
      try {
        let dbQuery = client
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
          `);

        if (category && category !== 'All') {
          dbQuery = dbQuery.eq('category', category);
        }
        if (status && status !== 'All') {
          dbQuery = dbQuery.eq('registration_status', status);
        }
        if (query) {
          dbQuery = dbQuery.ilike('name', `%${query}%`);
        }

        const { data, error } = await dbQuery;

        if (!error && data && data.length > 0) {
          // Map snake_case DB columns to EntityProfile camelCase format
          const formatted: EntityProfile[] = data.map((org: any) => ({
            id: org.id,
            slug: org.slug,
            name: org.name,
            category: org.category,
            aliases: org.aliases || [],
            website: org.website,
            identifiers: org.identifiers || {},
            registrationStatus: org.registration_status,
            verificationBadge: org.verification_badge,
            shortDescription: org.short_description || '',
            executiveSummary: org.executive_summary || '',
            lastUpdated: org.updated_at,
            isDemoEntity: org.is_demo_entity,
            notices: (org.notices || []).map((n: any) => ({
              id: n.id,
              entityId: org.id,
              regulator: n.regulator,
              orderNumber: n.order_number,
              noticeType: n.notice_type,
              dateIssued: n.date_issued,
              headline: n.headline,
              summary: n.summary,
              officialPdfUrl: n.official_pdf_url
            })),
            sources: (org.sources || []).map((s: any) => ({
              id: s.id,
              entityId: org.id,
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
            evidence: (org.evidence || []).map((e: any) => ({
              id: e.id,
              entityId: org.id,
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
            revisions: (org.revisions || []).map((r: any) => ({
              id: r.id,
              entityId: org.id,
              versionNumber: r.version_number,
              authorName: r.author_name,
              authorRole: r.author_role,
              timestamp: r.timestamp,
              summaryOfChange: r.summary_of_change,
              moderatedBy: r.moderated_by,
              diffSnippet: r.diff_snippet
            })),
            timeline: []
          }));

          return NextResponse.json({
            data: formatted,
            source: 'supabase',
            count: formatted.length
          });
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to seed records:', err);
      }
    }
  }

  // Graceful fallback to initial seed entities
  let result = [...INITIAL_ENTITIES];
  if (category && category !== 'All') {
    result = result.filter((e) => e.category === category);
  }
  if (status && status !== 'All') {
    result = result.filter((e) => e.registrationStatus === status);
  }
  if (query) {
    result = result.filter(
      (e) =>
        e.name.toLowerCase().includes(query) ||
        e.aliases.some((a) => a.toLowerCase().includes(query)) ||
        e.shortDescription.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({
    data: result,
    source: 'fallback',
    count: result.length
  });
}
