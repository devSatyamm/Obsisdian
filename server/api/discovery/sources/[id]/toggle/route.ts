import { NextRequest, NextResponse } from 'next/server';
import { verifyModeratorAccess } from '@/lib/auth/moderationGuard';
import { getDiscoverySources, updateDiscoverySourceStatus } from '@/lib/ingestion/discoveryRegistry';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyModeratorAccess(req, 'Moderation Desk');
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized: Moderator access required to toggle source status.' },
        { status: authResult.statusCode || 401 }
      );
    }

    const { id } = await context.params;
    const sources = await getDiscoverySources();
    const target = sources.find((s) => s.id === id || s.slug === id);

    if (!target) {
      return NextResponse.json({ error: `Discovery source "${id}" not found.` }, { status: 404 });
    }

    const newActiveState = !target.isActive;
    await updateDiscoverySourceStatus(target.id, { isActive: newActiveState });

    return NextResponse.json({
      success: true,
      sourceId: target.id,
      name: target.name,
      isActive: newActiveState,
      message: `Source "${target.name}" is now ${newActiveState ? 'active' : 'paused'}.`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Toggle source error' }, { status: 500 });
  }
}
