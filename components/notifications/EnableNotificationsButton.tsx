'use client';
import { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle, Loader2, Smartphone } from 'lucide-react';
import {
  isPushSupported,
  isIOS,
  isIOSStandalone,
  subscribeToPush,
  unsubscribeFromPush,
  syncSubscriptionWithServer,
  sendTestPush,
  getStoredSubscription,
  storeSubscription,
  clearStoredSubscription,
} from '@/lib/pushService';
import {
  requestNotificationPermission,
  getNotificationPermission,
} from '@/lib/notificationService';
import { saveNotificationPreferences, getNotificationPreferences } from '@/lib/premiumStorage';

type PushState = 'checking' | 'idle' | 'requesting' | 'subscribed' | 'denied' | 'unsupported' | 'ios-not-installed';

export function EnableNotificationsButton() {
  const [state, setState] = useState<PushState>('checking');
  const [testSending, setTestSending] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine initial state on mount — always ask the SW (source of truth).
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!isPushSupported()) {
      if (isIOS() && !isIOSStandalone()) {
        setState('ios-not-installed');
      } else {
        setState('unsupported');
      }
      return;
    }

    const permission = getNotificationPermission();
    if (permission === 'denied') {
      setState('denied');
      return;
    }

    // Ask the SW for a live subscription — this is the ground truth.
    // Falls back to localStorage if the SW isn't ready yet.
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((liveSub) => {
        if (liveSub) {
          storeSubscription(liveSub); // keep localStorage in sync
          setState('subscribed');
        } else {
          setState('idle');
        }
      })
      .catch(() => {
        // SW not available — fall back to localStorage cache
        const stored = getStoredSubscription();
        setState(stored && permission === 'granted' ? 'subscribed' : 'idle');
      });
  }, []);

  const handleEnable = async () => {
    setError(null);
    setState('requesting');

    // Step 1 — request browser notification permission
    const permission = await requestNotificationPermission();
    if (permission === 'denied') {
      setState('denied');
      return;
    }
    if (permission !== 'granted') {
      setState('idle');
      return;
    }

    // Step 2 — subscribe to Web Push via service worker
    let sub: PushSubscription;
    try {
      sub = await subscribeToPush();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe to push notifications.');
      setState('idle');
      return;
    }

    // Step 3 — sync subscription with server (best-effort)
    await syncSubscriptionWithServer(sub);

    // Step 4 — persist preference
    const prefs = getNotificationPreferences();
    saveNotificationPreferences({ ...prefs, pushEnabled: true });

    setState('subscribed');
  };

  const handleDisable = async () => {
    await unsubscribeFromPush();
    clearStoredSubscription();
    const prefs = getNotificationPreferences();
    saveNotificationPreferences({ ...prefs, pushEnabled: false });
    setState('idle');
  };

  // Force test: get subscription directly from the SW (bypasses localStorage).
  // Useful to verify push is working even when state is unclear.
  const handleForceSendTest = async () => {
    setTestSending(true);
    setTestSent(false);
    setError(null);
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Service worker not ready. Try refreshing the page.')), 12000)
      );
      const reg = await Promise.race([navigator.serviceWorker.ready, timeout]);
      const liveSub = await reg.pushManager.getSubscription();
      if (!liveSub) {
        setError('No active push subscription found in browser. Enable notifications first.');
        return;
      }
      storeSubscription(liveSub);
      setState('subscribed');
      const ok = await sendTestPush(liveSub.toJSON());
      if (ok) {
        setTestSent(true);
        setTimeout(() => setTestSent(false), 4000);
      } else {
        setError('Server failed to send the test push. Check Vercel function logs.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Force test failed.');
    } finally {
      setTestSending(false);
    }
  };

  const handleSendTest = async () => {
    const sub = getStoredSubscription();
    if (!sub) {
      setError('No active subscription found. Try re-enabling notifications.');
      return;
    }
    setTestSending(true);
    setTestSent(false);
    const ok = await sendTestPush(sub);
    setTestSending(false);
    if (ok) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 4000);
    } else {
      setError('Test notification failed. Check that the app is open and notifications are allowed.');
    }
  };

  // ── Render states ────────────────────────────────────────────────────────────
  if (state === 'checking') {
    return (
      <div className="flex items-center gap-2 py-2 text-xs text-gray-400">
        <Loader2 size={14} className="animate-spin" />
        <span>Checking notification status…</span>
      </div>
    );
  }
  if (state === 'unsupported') {
    return (
      <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-200">
        <BellOff size={18} className="text-gray-400 mt-0.5 shrink-0" />
        <p className="text-xs text-gray-500">
          Push notifications are not supported in this browser.
        </p>
      </div>
    );
  }

  if (state === 'ios-not-installed') {
    return (
      <div className="flex items-start gap-3 p-3 rounded-2xl border border-amber-200 bg-amber-50">
        <Smartphone size={18} className="text-amber-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-amber-700">Add to Home Screen first</p>
          <p className="text-xs text-amber-600 mt-0.5">
            On iPhone/iPad, tap the Share button then &ldquo;Add to Home Screen&rdquo;. Open the app from
            there and enable notifications in Settings.
          </p>
        </div>
      </div>
    );
  }

  if (state === 'denied') {
    return (
      <div className="flex items-start gap-3 p-3 rounded-2xl border border-red-200 bg-red-50">
        <BellOff size={18} className="text-red-400 mt-0.5 shrink-0" />
        <p className="text-xs text-red-600">
          Notifications are blocked. Open your browser settings and allow notifications for this
          site, then return here to enable them.
        </p>
      </div>
    );
  }

  if (state === 'subscribed') {
    return (
      <div className="space-y-2">
        {/* Subscribed badge */}
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-500 shrink-0" />
          <p className="text-xs font-semibold text-emerald-600">Push notifications enabled</p>
        </div>

        {/* Test button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSendTest}
            disabled={testSending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-pink-200 bg-pink-50 text-pink-600 hover:bg-pink-100 active:scale-95 transition-all disabled:opacity-60"
          >
            {testSending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Bell size={12} />
            )}
            {testSending ? 'Sending…' : testSent ? 'Sent ✓' : 'Send test notification'}
          </button>

          <button
            onClick={handleDisable}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400 hover:text-red-400 border border-gray-200 hover:border-red-200 transition-all"
          >
            Disable
          </button>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  // idle / requesting
  return (
    <div className="space-y-2">
      <button
        onClick={handleEnable}
        disabled={state === 'requesting'}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)', minHeight: 44 }}
      >
        {state === 'requesting' ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Bell size={14} />
        )}
        {state === 'requesting' ? 'Requesting permission…' : 'Enable Notifications'}
      </button>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Force test — always visible for debugging */}
      <button
        onClick={handleForceSendTest}
        disabled={testSending}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-gray-200 text-gray-400 hover:text-pink-600 hover:border-pink-200 transition-all disabled:opacity-60 cursor-pointer"
      >
        {testSending ? <Loader2 size={12} className="animate-spin" /> : <Bell size={12} />}
        {testSending ? 'Sending…' : testSent ? 'Sent ✓' : 'Force send test notification'}
      </button>
    </div>
  );
}
