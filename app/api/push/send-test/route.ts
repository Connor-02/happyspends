import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

export async function POST(req: NextRequest) {
  // Read keys inside the handler so build-time evaluation never crashes.
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL ?? 'mailto:admin@example.com';

  if (!publicKey || !privateKey) {
    return NextResponse.json(
      { error: 'VAPID keys not configured. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in Vercel environment variables.' },
      { status: 500 },
    );
  }

  // Configure inside the handler so it only runs at request time.
  webpush.setVapidDetails(email, publicKey, privateKey);

  try {
    const body = await req.json();

    // The client passes the subscription directly in the request body.
    // This avoids needing server-side subscription storage for the test case.
    const subscription = body.subscription as webpush.PushSubscription | undefined;

    if (!subscription?.endpoint) {
      return NextResponse.json({ error: 'subscription.endpoint is required' }, { status: 400 });
    }

    const payload = JSON.stringify({
      title: (body.title as string | undefined) ?? 'Otter Money',
      body: (body.body as string | undefined) ?? "Your budget reminders are now working! \uD83C\uDF89",
      url: (body.url as string | undefined) ?? '/dashboard',
      tag: 'otter-money-test',
    });

    await webpush.sendNotification(subscription, payload);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Push] send-test failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TODO: Scheduled reminders via Vercel Cron Jobs
//
// 1. Create /api/push/send-reminders/route.ts  (GET handler, secured by CRON_SECRET)
// 2. In that handler: read all subscriptions from your DB, check each user's
//    notification preferences, send relevant pushes (bill due, overspending, etc.)
// 3. Add to vercel.json:
//    { "crons": [{ "path": "/api/push/send-reminders", "schedule": "0 9 * * *" }] }
// ─────────────────────────────────────────────────────────────────────────────
