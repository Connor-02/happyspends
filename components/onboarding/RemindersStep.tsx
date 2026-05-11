'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { OnboardingStepCard } from './OnboardingStepCard';
import { loadPremiumStore, updateReminder } from '@/lib/premiumStorage';
import type { ReminderType } from '@/types/premium';

interface ReminderOption {
  id: string;
  type: ReminderType;
  icon: string;
  title: string;
  desc: string;
  defaultOn: boolean;
}

const OPTIONS: ReminderOption[] = [
  { id: 'reminder-daily-spending', type: 'daily-spending', icon: '🌅', title: 'Daily Check-in', desc: "A gentle nudge to log today's spending", defaultOn: true },
  { id: 'reminder-weekly-review', type: 'weekly-review', icon: '📊', title: 'Weekly Budget Review', desc: "See how you're tracking against your budget", defaultOn: true },
  { id: 'reminder-upcoming-bill', type: 'upcoming-bill', icon: '🧾', title: 'Bill Due Alerts', desc: 'Know before a bill is about to hit', defaultOn: true },
  { id: 'reminder-upcoming-subscription', type: 'upcoming-subscription', icon: '📱', title: 'Subscription Renewals', desc: 'Never be surprised by a renewal charge', defaultOn: false },
  { id: 'reminder-savings-checkin', type: 'savings-checkin', icon: '🎯', title: 'Savings Goal Nudges', desc: 'Celebrate progress towards your goals', defaultOn: false },
  { id: 'reminder-low-balance', type: 'low-balance', icon: '⚠️', title: 'Low Balance Warning', desc: 'Alert when your available budget runs low', defaultOn: true },
];

interface RemindersStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function RemindersStep({ onNext, onBack }: RemindersStepProps) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() => {
    const store = loadPremiumStore();
    const map: Record<string, boolean> = {};
    OPTIONS.forEach((opt) => {
      const stored = store.reminders.find((r) => r.id === opt.id);
      map[opt.id] = stored ? stored.enabled : opt.defaultOn;
    });
    return map;
  });

  function toggle(id: string) {
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleNext() {
    const store = loadPremiumStore();
    OPTIONS.forEach((opt) => {
      const reminder = store.reminders.find((r) => r.id === opt.id);
      if (reminder) {
        updateReminder({ ...reminder, enabled: enabled[opt.id] });
      }
    });
    onNext();
  }

  const enabledCount = Object.values(enabled).filter(Boolean).length;

  return (
    <OnboardingStepCard
      step={8}
      totalSteps={9}
      title="Stay on track effortlessly"
      subtitle="Choose which reminders you'd like. You can change these anytime in Settings."
      hint="Reminders help you stay consistent without needing to think about it."
      onNext={handleNext}
      onBack={onBack}
      nextLabel="Continue →"
    >
      <div className="space-y-3">
        {OPTIONS.map((opt, i) => {
          const on = enabled[opt.id];
          return (
            <motion.button
              key={opt.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggle(opt.id)}
              className="w-full flex items-center gap-4 rounded-2xl px-4 py-4 text-left transition-all"
              style={
                on
                  ? { background: 'rgba(108,99,255,0.12)', border: '1.5px solid rgba(108,99,255,0.35)' }
                  : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }
              }
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl transition-all"
                style={on ? { background: 'rgba(108,99,255,0.25)' } : { background: 'rgba(255,255,255,0.08)' }}
              >
                {opt.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold transition-colors ${on ? 'text-white' : 'text-white/60'}`}>
                  {opt.title}
                </p>
                <p className="text-xs text-white/35 mt-0.5 leading-snug">{opt.desc}</p>
              </div>

              {/* Toggle pill */}
              <div
                className="relative w-12 h-6 rounded-full flex-shrink-0 transition-all duration-300"
                style={on ? { background: 'linear-gradient(135deg,#6C63FF,#9B6DFF)' } : { background: 'rgba(255,255,255,0.15)' }}
              >
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
                  style={{ left: on ? '1.375rem' : '0.125rem' }}
                />
              </div>
            </motion.button>
          );
        })}

        {/* Summary chip */}
        <motion.p
          key={enabledCount}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-white/40 pt-1"
        >
          {enabledCount === 0
            ? 'No reminders selected — you can add them later in Settings.'
            : `${enabledCount} reminder${enabledCount > 1 ? 's' : ''} enabled`}
        </motion.p>
      </div>
    </OnboardingStepCard>
  );
}
