'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, BarChart2, FileText, CreditCard, Target, AlertTriangle } from 'lucide-react';
import { OnboardingStepCard } from './OnboardingStepCard';
import { loadPremiumStore, updateReminder } from '@/lib/premiumStorage';
import type { ReminderType } from '@/types/premium';
import type { LucideIcon } from 'lucide-react';

interface ReminderOption {
  id: string;
  type: ReminderType;
  Icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  title: string;
  desc: string;
  defaultOn: boolean;
}

const OPTIONS: ReminderOption[] = [
  {
    id: 'reminder-daily-spending',
    type: 'daily-spending',
    Icon: Bell,
    iconColor: '#8B5CF6',
    iconBg: '#EDE9FE',
    title: 'Daily Check-in',
    desc: "A gentle nudge to log today's spending",
    defaultOn: true,
  },
  {
    id: 'reminder-weekly-review',
    type: 'weekly-review',
    Icon: BarChart2,
    iconColor: '#60A5FA',
    iconBg: '#DBEAFE',
    title: 'Weekly Budget Review',
    desc: "See how you're tracking against your budget",
    defaultOn: true,
  },
  {
    id: 'reminder-upcoming-bill',
    type: 'upcoming-bill',
    Icon: FileText,
    iconColor: '#8B5CF6',
    iconBg: '#EDE9FE',
    title: 'Bill Due Alerts',
    desc: 'Know before a bill is about to hit',
    defaultOn: true,
  },
  {
    id: 'reminder-upcoming-subscription',
    type: 'upcoming-subscription',
    Icon: CreditCard,
    iconColor: '#60A5FA',
    iconBg: '#DBEAFE',
    title: 'Subscription Renewals',
    desc: 'Never be surprised by a renewal charge',
    defaultOn: false,
  },
  {
    id: 'reminder-savings-checkin',
    type: 'savings-checkin',
    Icon: Target,
    iconColor: '#22C55E',
    iconBg: '#DCFCE7',
    title: 'Savings Goal Nudges',
    desc: 'Celebrate progress towards your goals',
    defaultOn: false,
  },
  {
    id: 'reminder-low-balance',
    type: 'low-balance',
    Icon: AlertTriangle,
    iconColor: '#F59E0B',
    iconBg: '#FEF3C7',
    title: 'Low Balance Warning',
    desc: 'Alert when your available budget runs low',
    defaultOn: true,
  },
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
      nextLabel="Continue"
    >
      <div className="space-y-2.5">
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
              className="w-full flex items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-all bg-white"
              style={
                on
                  ? { border: '1.5px solid #DDD6FE' }
                  : { border: '1px solid #E5E7EB' }
              }
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: on ? opt.iconBg : '#F9FAFB' }}
              >
                <opt.Icon className="w-5 h-5" style={{ color: on ? opt.iconColor : '#9CA3AF' }} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold transition-colors" style={{ color: on ? '#111827' : '#6B7280' }}>
                  {opt.title}
                </p>
                <p className="text-xs mt-0.5 leading-snug" style={{ color: '#9CA3AF' }}>{opt.desc}</p>
              </div>

              {/* Toggle pill */}
              <div
                className="relative w-11 h-6 rounded-full flex-shrink-0 transition-all duration-300"
                style={on ? { background: '#8B5CF6' } : { background: '#E5E7EB' }}
              >
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
                  style={{ left: on ? '1.25rem' : '0.125rem' }}
                />
              </div>
            </motion.button>
          );
        })}

        <motion.p
          key={enabledCount}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs pt-1"
          style={{ color: '#9CA3AF' }}
        >
          {enabledCount === 0
            ? 'No reminders selected — you can add them later in Settings.'
            : `${enabledCount} reminder${enabledCount > 1 ? 's' : ''} enabled`}
        </motion.p>
      </div>
    </OnboardingStepCard>
  );
}
