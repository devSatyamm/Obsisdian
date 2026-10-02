import { NextRequest, NextResponse } from 'next/server';
import { verifyModeratorAccess } from '@/lib/auth/moderationGuard';
import { getDiscoverySources } from '@/lib/ingestion/discoveryRegistry';
import { runIngestionJobForSource, runAllActiveDiscoverySources } from '@/lib/ingestion/jobRunner';

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce strict moderator authentication
    const authResult = await verifyModeratorAccess(req, 'Automated Job Runner');
    if (!authResult.authorized) {
      return NextResponse.json(
        {
          error: authResult.error || 'Unauthorized: Moderator access required to trigger discovery jobs.',
          hint: 'Pass Authorization: Bearer <token> or valid x-moderator-key header.'
        },
        { status: authResult.statusCode || 401 }
      );
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { sourceId } = body;

    // 2. Run single source or all sources
    if (sourceId) {
      const sources = await getDiscoverySources();
      const targetSource = sources.find((s) => s.id === sourceId || s.slug === sourceId);
      if (!targetSource) {
        return NextResponse.json({ error: `Discovery source "${sourceId}" not found.` }, { status: 404 });
      }

      const report = await runIngestionJobForSource(targetSource);
      return NextResponse.json({
        success: true,
        report,
        message: `Discovery job completed for ${targetSource.name}. ${report.claimsIdentified} claims queued for review.`
      });
    }

    // Run all active sources
    const reports = await runAllActiveDiscoverySources();
    const totalClaims = reports.reduce((acc, r) => acc + r.claimsIdentified, 0);

    return NextResponse.json({
      success: true,
      reports,
      message: `Completed discovery across ${reports.length} sources. ${totalClaims} claim candidates identified and queued for review.`
    });
  } catch (err: any) {
    console.error('Discovery run error:', err);
    return NextResponse.json({ error: err.message || 'Discovery run failed' }, { status: 500 });
  }
}
