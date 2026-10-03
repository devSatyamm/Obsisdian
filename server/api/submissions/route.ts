import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient, isSupabaseServerConfigured } from '@/lib/supabaseServer';
import { INITIAL_SUBMISSIONS } from '@/lib/data/mockData';
import { CommunitySubmission } from '@/lib/types';
import { repository } from '@/lib/db/repository';

// In-memory rate limiting map for submission abuse prevention: IP -> timestamps
const ipSubmissionTracker = new Map<string, number[]>();

function checkRateLimit(ip: string, limit = 15, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const timestamps = ipSubmissionTracker.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (validTimestamps.length >= limit) {
    ipSubmissionTracker.set(ip, validTimestamps);
    return false;
  }

  validTimestamps.push(now);
  ipSubmissionTracker.set(ip, validTimestamps);
  return true;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  if (isSupabaseServerConfigured) {
    const client = getSupabaseServerClient();
    if (client) {
      try {
        let query = client
          .from('community_submissions')
          .select('*')
          .order('created_at', { ascending: false });

        if (status && status !== 'all') {
          query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (!error && data) {
          const formatted: CommunitySubmission[] = data.map((s: any) => ({
            id: s.id,
            entityId: s.organisation_id,
            claimId: s.claim_id,
            entityName: s.organisation_name,
            category: s.category,
            evidenceCategory: s.evidence_category,
            title: s.title,
            factualDescription: s.factual_description,
            proposedStatementText: s.proposed_statement_text,
            diffSnippet: s.diff_snippet,
            primarySourceUrl: s.primary_source_url,
            sourcePublicationDate: s.source_publication_date,
            submittedBy: {
              id: s.submitted_by_id || 'usr_anonymous',
              name: s.submitted_by_name,
              role: s.submitted_by_role || 'Contributor'
            },
            submittedAt: s.created_at,
            status: s.status,
            moderationNotes: s.moderation_notes,
            reviewedBy: s.reviewed_by,
            reviewedAt: s.reviewed_at
          }));

          return NextResponse.json({ data: formatted, source: 'supabase' });
        }
      } catch (err) {
        console.warn('Submissions query failed:', err);
      }
    }
  }

  let list = repository.getSubmissions();
  if (status && status !== 'all') {
    list = list.filter((s) => s.status === status);
  }

  return NextResponse.json({ data: list, source: 'fallback' });
}

export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting Check
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded: Maximum 15 submissions per 10 minutes. Please slow down.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      entityId,
      claimId,
      entityName,
      category,
      evidenceCategory,
      title,
      factualDescription,
      proposedStatementText,
      diffSnippet,
      primarySourceUrl,
      sourcePublicationDate,
      submittedBy,
      website_hp // Honeypot field for bot detection
    } = body;

    // 2. Honeypot Bot Check
    if (website_hp) {
      // Silently accept bot submission without persisting
      return NextResponse.json({ success: true, message: 'Submission received.' }, { status: 201 });
    }

    // 3. Strict Server-Side Validation
    if (!entityName || !title || !factualDescription || !primarySourceUrl) {
      return NextResponse.json(
        { error: 'Missing required submission fields (entityName, title, factualDescription, primarySourceUrl)' },
        { status: 400 }
      );
    }

    if (title.length < 5 || title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be between 5 and 200 characters in length.' },
        { status: 400 }
      );
    }

    if (factualDescription.length < 20 || factualDescription.length > 5000) {
      return NextResponse.json(
        { error: 'Factual description must be between 20 and 5000 characters in length.' },
        { status: 400 }
      );
    }

    if (entityName.length < 2 || entityName.length > 120) {
      return NextResponse.json(
        { error: 'Entity name must be between 2 and 120 characters in length.' },
        { status: 400 }
      );
    }

    // URL validation
    try {
      const parsedUrl = new URL(primarySourceUrl);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return NextResponse.json(
          { error: 'Primary source URL must use http: or https: protocol.' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Primary source URL must be a valid, well-formed web address.' },
        { status: 400 }
      );
    }

    if (isSupabaseServerConfigured) {
      const client = getSupabaseServerClient();
      if (client) {
        let resolvedOrgId: string | null = null;
        if (entityId) {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entityId);
          if (isUuid) {
            resolvedOrgId = entityId;
          } else {
            const { data: orgData } = await client
              .from('organisations')
              .select('id')
              .eq('slug', entityId)
              .maybeSingle();
            if (orgData?.id) resolvedOrgId = orgData.id;
          }
        }

        let resolvedClaimId: string | null = null;
        if (claimId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(claimId)) {
          resolvedClaimId = claimId;
        }

        const { data, error } = await client
          .from('community_submissions')
          .insert({
            organisation_id: resolvedOrgId,
            claim_id: resolvedClaimId,
            organisation_name: entityName,
            category: category || 'Financial services',
            evidence_category: evidenceCategory || 'Corporate Registry Record',
            title: title.trim(),
            factual_description: factualDescription.trim(),
            proposed_statement_text: proposedStatementText ? proposedStatementText.trim() : null,
            diff_snippet: diffSnippet || null,
            primary_source_url: primarySourceUrl.trim(),
            source_publication_date: sourcePublicationDate || null,
            submitted_by_id: submittedBy?.id || null,
            submitted_by_name: submittedBy?.name || 'Anonymous Contributor',
            submitted_by_role: submittedBy?.role || 'Contributor',
            status: 'pending'
          })
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({
            success: true,
            submission: {
              id: data.id,
              entityId: data.organisation_id,
              claimId: data.claim_id,
              entityName: data.organisation_name,
              category: data.category,
              evidenceCategory: data.evidence_category,
              title: data.title,
              factualDescription: data.factual_description,
              proposedStatementText: data.proposed_statement_text,
              diffSnippet: data.diff_snippet,
              primarySourceUrl: data.primary_source_url,
              submittedBy: {
                id: data.submitted_by_id,
                name: data.submitted_by_name,
                role: data.submitted_by_role
              },
              submittedAt: data.created_at,
              status: data.status
            },
            source: 'supabase'
          }, { status: 201 });
        } else if (error) {
          console.warn('Supabase submission insert error:', error);
        }
      }
    }

    // Local fallback record creation
    const fallbackRecord: CommunitySubmission = {
      id: `sub_${Date.now()}`,
      entityId,
      claimId,
      entityName,
      category: category || 'Financial services',
      evidenceCategory: evidenceCategory || 'Corporate Registry Record',
      title: title.trim(),
      factualDescription: factualDescription.trim(),
      proposedStatementText,
      diffSnippet,
      primarySourceUrl: primarySourceUrl.trim(),
      sourcePublicationDate,
      submittedBy: submittedBy || { id: 'usr_guest', name: 'Anonymous Contributor', role: 'Contributor' },
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    repository.createSubmission(fallbackRecord);

    return NextResponse.json({
      success: true,
      submission: fallbackRecord,
      source: 'fallback'
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Submission error' }, { status: 500 });
  }
}
