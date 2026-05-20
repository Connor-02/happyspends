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
  clearStoredSubscription,
} from '@/lib/pushService';
import {
  requestNotificationPermission,
  getNotificationPermission,
} from '@/lib/notificationService';
import { saveNotificationPreferences, getNotificationPreferences } from '@/lib/premiumStorage';

type PushState = 'idle' | 'requesting' | 'subscribed' | 'denied' | 'unsupported' | 'ios-not-installed';

export function EnableNotificationsButton() {
  const [state, setState] = useState<PushState>('idle');
  const [testSending, setTestSending] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine initial state on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!isPushSupported()) {
      // iOS Safari without PWA install — explain requirement
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

    // Check if already subscribed (localStorage cache)
    const stored = getStoredSubscription();
    if (stored && permission === 'granted') {
      setState('subscribed');
    }
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
    const sub = await subscribeToPush();
    if (!sub) {
      setError('Could not subscribe to push notifications. Make sure the app is installed and try again.');
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
    </div>
  );
}
