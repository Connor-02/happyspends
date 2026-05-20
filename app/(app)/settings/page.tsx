'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { clearAllData } from '@/lib/store';
import {
  loadPremiumStore,
  saveNotificationPreferences,
  updateReminder,
} from '@/lib/premiumStorage';
import type { NotificationPreference, Reminder, ReminderTone } from '@/types/premium';
import { Card } from '@/components/ui/Card';
import { EnableNotificationsButton } from '@/components/notifications/EnableNotificationsButton';

function stagger(i: number) {
  return {
    initial: { y: 16, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { delay: i * 0.06 },
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<NotificationPreference | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    clearAllData();
    router.replace('/onboarding');
  };

  useEffect(() => {
    const store = loadPremiumStore();
    setPrefs(store.notificationPreferences);
    setReminders(store.reminders);
  }, []);

  const save = (updated: NotificationPreference) => {
    setPrefs(updated);
    saveNotificationPreferences(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const toggle = (key: keyof NotificationPreference) => {
    if (!prefs) return;
    save({ ...prefs, [key]: !prefs[key as keyof NotificationPreference] } as NotificationPreference);
  };

  const handleReminderToggle = (id: string) => {
    const r = reminders.find((r) => r.id === id);
    if (!r) return;
    const updated = { ...r, enabled: !r.enabled };
    updateReminder(updated);
    setReminders((prev) => prev.map((rem) => (rem.id === id ? updated : rem)));
  };

  if (!prefs) return null;

  return (
    <div className="px-4 pt-6 pb-4 space-y-6">
      {/* Header */}
      <motion.div {...stagger(0)}>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Notifications & reminders</p>
      </motion.div>

      {/* Push notification permission */}
      <motion.div {...stagger(1)}>
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-pink flex items-center justify-center text-2xl shrink-0">🔔</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white">Push Notifications</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-3">
                Get reminders even when the app is closed — bill alerts, budget nudges, and goal updates.
              </p>
              <EnableNotificationsButton />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Reminder tone */}
      <motion.div {...stagger(2)}>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Reminder Style</p>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'gentle', label: 'Gentle', emoji: '😊' },
            { value: 'direct', label: 'Direct', emoji: '💡' },
            { value: 'motivational', label: 'Motivating', emoji: '🚀' },
          ] as { value: ReminderTone; label: string; emoji: string }[]).map((t) => (
            <button
              key={t.value}
              onClick={() => save({ ...prefs, tone: t.value })}
              className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                prefs.tone === t.value
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/30'
                  : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'
              }`}
            >
              <span className="text-xl">{t.emoji}</span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{t.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notification toggles */}
      <motion.div {...stagger(3)}>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Notification Types</p>
        <Card className="divide-y divide-gray-100 dark:divide-gray-800">
          {([
            { key: 'dailyCheckin', label: 'Daily check-in', icon: '📝', desc: 'Remind me to log spending each day' },
            { key: 'weeklyReview', label: 'Weekly review', icon: '📊', desc: 'Weekly budget overview nudge' },
            { key: 'billReminders', label: 'Bill reminders', icon: '🧾', desc: 'Alert before bills are due' },
            { key: 'subscriptionReminders', label: 'Subscription alerts', icon: '📱', desc: 'Renewal reminders' },
            { key: 'goalReminders', label: 'Goal reminders', icon: '🎯', desc: 'Savings & debt goal updates' },
            { key: 'overspendingAlerts', label: 'Overspending alerts', icon: '⚠️', desc: 'When categories go over budget' },
          ] as { key: keyof NotificationPreference; label: string; icon: string; desc: string }[]).map((item) => (
            <div key={item.key} className="flex items-center gap-3 p-3">
              <span className="text-xl w-8 text-center">{item.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.label}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{item.desc}</p>
              </div>
              <Toggle
                enabled={prefs[item.key] as boolean}
                onToggle={() => toggle(item.key)}
              />
            </div>
          ))}
        </Card>
      </motion.div>

      {/* Quiet hours */}
      <motion.div {...stagger(4)}>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Quiet Hours</p>
        <Card className="p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">No notifications during these hours</p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-400 dark:text-gray-500 mb-1 block">From</label>
              <input
                type="time"
                value={prefs.quietHoursStart}
                onChange={(e) => save({ ...prefs, quietHoursStart: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 dark:text-gray-500 mb-1 block">To</label>
              <input
                type="time"
                value={prefs.quietHoursEnd}
                onChange={(e) => save({ ...prefs, quietHoursEnd: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Check-in time */}
      <motion.div {...stagger(5)}>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Daily Check-in Time</p>
        <Card className="p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Best time to remind you to log spending</p>
          <input
            type="time"
            value={prefs.checkInTime}
            onChange={(e) => save({ ...prefs, checkInTime: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
          />
        </Card>
      </motion.div>

      {/* Individual reminders */}
      <motion.div {...stagger(6)}>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Individual Reminders</p>
        <Card className="divide-y divide-gray-100 dark:divide-gray-800">
          {reminders.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{r.label}</p>
                <p className="text-xs text-gray-400 capitalize">{r.frequency} · {r.time}</p>
              </div>
              <Toggle enabled={r.enabled} onToggle={() => handleReminderToggle(r.id)} />
            </div>
          ))}
        </Card>
      </motion.div>

      {/* Danger zone */}
      <motion.div {...stagger(7)}>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Danger Zone</p>
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-base">🗑️</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Reset Account</p>
              <p className="text-xs text-gray-400 mt-0.5">Clear all data and restart the setup wizard from scratch.</p>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-xs font-semibold text-red-500 border border-red-200 dark:border-red-900 rounded-lg px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-shrink-0"
            >
              Reset
            </button>
          </div>
        </Card>
      </motion.div>

      {/* Save confirmation */}
      <AnimatedSavedBanner visible={saved} />

      {/* Reset confirmation modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm px-4 pb-8"
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl"
            >
              <div className="text-center mb-5">
                <div className="text-4xl mb-3">⚠️</div>
                <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Reset your account?</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                  This will permanently delete all your budget data, transactions, goals, and settings. This cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
                >
                  Yes, Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        enabled ? 'bg-pink-500' : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <motion.span
        animate={{ x: enabled ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow"
      />
    </button>
  );
}

function AnimatedSavedBanner({ visible }: { visible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg pointer-events-none"
    >
      ✓ Settings saved
    </motion.div>
  );
}
