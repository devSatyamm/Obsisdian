import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient, isSupabaseServerConfigured } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('organisation_id');

  if (isSupabaseServerConfigured) {
    const client = getSupabaseServerClient();
    if (client) {
      try {
        let query = client
          .from('claims')
          .select(`
            *,
            versions:claim_versions(*)
          `)
          .order('created_at', { ascending: false });

        if (orgId) {
          query = query.eq('organisation_id', orgId);
        }

        const { data, error } = await query;
        if (!error && data) {
          return NextResponse.json({ data, source: 'supabase' });
        }
      } catch (err) {
        console.warn('Claims fetch failed:', err);
      }
    }
  }

  // Fallback demo claims
  const fallbackClaims = [
    {
      id: 'claim_byjus_users',
      organisation_id: 'byjus',
      title: "Byju's user count and marketing claims",
      status: 'Under review',
      created_at: '2024-01-15T00:00:00Z',
      versions: [
        {
          id: 'v1_byjus',
          claim_id: 'claim_byjus_users',
          version_number: 1,
          statement_text: "Over 100 million registered learners trust Byju's for personalized K-12 learning.",
          change_summary: "Initial marketing baseline",
          recorded_at: "2022-01-10T00:00:00Z",
          source_title: "Wayback Snapshot #2022",
          source_url: "https://web.archive.org",
          review_state: "published"
        },
        {
          id: 'v2_byjus',
          claim_id: 'claim_byjus_users',
          version_number: 2,
          statement_text: "Over 150 million registered learners trust Byju's for personalized K-12 learning worldwide.",
          change_summary: "Revised user count representation from 100M to 150M",
          recorded_at: "2024-09-01T00:00:00Z",
          source_title: "Corporate Press Release 2024",
          source_url: "https://web.archive.org",
          review_state: "published"
        }
      ]
    },
    {
      id: 'claim_paytm_kyc',
      organisation_id: 'paytm',
      title: 'Paytm KYC and payments bank operations',
      status: 'Verified',
      created_at: '2024-02-01T00:00:00Z',
      versions: [
        {
          id: 'v1_paytm',
          claim_id: 'claim_paytm_kyc',
          version_number: 1,
          statement_text: "Paytm Payments Bank account services operate seamlessly with instant onboarding.",
          change_summary: "Initial product guarantee",
          recorded_at: "2023-05-01T00:00:00Z",
          source_title: "Paytm App disclosures",
          source_url: "https://paytm.com",
          review_state: "published"
        },
        {
          id: 'v2_paytm',
          claim_id: 'claim_paytm_kyc',
          version_number: 2,
          statement_text: "Paytm wallet and UPI services transition to partner banks under RBI transition guidelines.",
          change_summary: "Updated statutory compliance disclosure following Reserve Bank circular",
          recorded_at: "2024-03-15T00:00:00Z",
          source_title: "BSE Regulatory Filing",
          source_url: "https://bseindia.com",
          review_state: "published"
        }
      ]
    }
  ];

  return NextResponse.json({ data: fallbackClaims, source: 'fallback' });
}
