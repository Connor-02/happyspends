// Client-side Web Push utilities for Otter Money

const SUBSCRIPTION_KEY = 'otter_push_sub';

// ── Environment ───────────────────────────────────────────────────────────────

export function getVapidPublicKey(): string {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';
}

/** Convert URL-safe base64 string to Uint8Array (required by pushManager.subscribe) */
export function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const buffer = new ArrayBuffer(raw.length);
  const arr = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

// ── Feature detection ─────────────────────────────────────────────────────────

export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/** Returns true when running as a standalone PWA on iOS (added to Home Screen) */
export function isIOSStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return isIOS() && (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

// ── Local subscription cache ──────────────────────────────────────────────────

export function storeSubscription(sub: PushSubscription): void {
  try {
    localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(sub.toJSON()));
  } catch { /* ignore */ }
}

export function getStoredSubscription(): PushSubscriptionJSON | null {
  try {
    const raw = localStorage.getItem(SUBSCRIPTION_KEY);
    return raw ? (JSON.parse(raw) as PushSubscriptionJSON) : null;
  } catch {
    return null;
  }
}

export function clearStoredSubscription(): void {
  localStorage.removeItem(SUBSCRIPTION_KEY);
}

// ── Core subscribe flow ───────────────────────────────────────────────────────

/**
 * Requests browser notification permission (must be called from a user gesture),
 * then subscribes to push via the service worker.
 * Returns the subscription or null on failure.
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    console.error('[Push] NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set');
    return null;
  }

  try {
    // Ensure SW is ready
    const reg = await navigator.serviceWorker.ready;

    // Reuse an existing subscription if present
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey).buffer as ArrayBuffer,
      });
    }

    storeSubscription(sub);
    return sub;
  } catch (err) {
    console.error('[Push] subscribeToPush failed:', err);
    return null;
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
      clearStoredSubscription();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ── Server sync ───────────────────────────────────────────────────────────────

/** POST the subscription to /api/push/subscribe so the server can send pushes later. */
export async function syncSubscriptionWithServer(sub: PushSubscription): Promise<boolean> {
  try {
    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Send a test push notification — passes the subscription directly so no server DB is needed. */
export async function sendTestPush(sub: PushSubscriptionJSON): Promise<boolean> {
  try {
    const res = await fetch('/api/push/send-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: sub,
        title: 'Otter Money',
        body: 'Your budget reminders are working! 🎉',
        url: '/dashboard',
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
