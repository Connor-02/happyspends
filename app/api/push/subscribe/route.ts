import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────────────────────
// TODO: Replace this in-memory store with a real database.
//
//   - Prisma + PostgreSQL:  await prisma.pushSubscription.upsert({ where: { endpoint }, ... })
//   - Supabase:             await supabase.from('push_subscriptions').upsert({ endpoint, sub })
//   - Vercel KV:            await kv.set(`sub:${endpoint}`, JSON.stringify(sub))
//
// For multi-user apps, associate each subscription with a userId extracted
// from a session/JWT. This implementation targets a single-user PWA.
// ─────────────────────────────────────────────────────────────────────────────

// Module-level store — persists within a single serverless function instance.
// Subscriptions survive warm re-uses but reset on cold starts.
const subscriptions = new Map<string, PushSubscriptionJSON>();

export async function POST(req: NextRequest) {
  try {
    const sub = (await req.json()) as PushSubscriptionJSON;

    if (!sub?.endpoint || typeof sub.endpoint !== 'string') {
      return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
    }

    subscriptions.set(sub.endpoint, sub);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
