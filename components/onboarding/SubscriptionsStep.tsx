'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Subscription, Frequency } from '@/types/budget';
import { OnboardingStepCard } from './OnboardingStepCard';
import { generateId } from '@/lib/utils';
import { freqLabel } from '@/lib/budgetCalculations';

const POPULAR = [
  { name: 'Netflix', icon: '🎬', defaultAmount: '' },
  { name: 'Spotify', icon: '🎵', defaultAmount: '' },
  { name: 'Disney+', icon: '🏰', defaultAmount: '' },
  { name: 'YouTube Premium', icon: '▶️', defaultAmount: '' },
  { name: 'Apple / iCloud', icon: '🍎', defaultAmount: '' },
  { name: 'Microsoft 365', icon: '💼', defaultAmount: '' },
  { name: 'Google One', icon: '☁️', defaultAmount: '' },
  { name: 'Gym Membership', icon: '🏋️', defaultAmount: '' },
  { name: 'Gaming', icon: '🎮', defaultAmount: '' },
  { name: 'Other Subscription', icon: '📱', defaultAmount: '' },
];

const FREQS: { value: Frequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

interface SubscriptionsStepProps {
  subscriptions: Subscription[];
  onChange: (subs: Subscription[]) => void;
  currencySymbol: string;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

interface FormState {
  name: string;
  amount: string;
  frequency: Frequency;
  renewalDate: string;
}

const emptyForm = (): FormState => ({
  name: '',
  amount: '',
  frequency: 'monthly',
  renewalDate: '',
});

export function SubscriptionsStep({
  subscriptions,
  onChange,
  currencySymbol,
  onNext,
  onBack,
  onSkip,
}: SubscriptionsStepProps) {
  const [form, setForm] = useState<FormState | null>(null);

  const addedNames = new Set(subscriptions.map((s) => s.name));

  function startAdd(preset?: (typeof POPULAR)[number]) {
    setForm(preset ? { ...emptyForm(), name: preset.name } : emptyForm());
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  function save() {
    if (!form?.name.trim() || !form.amount) return;
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) return;
    onChange([
      ...subscriptions,
      {
        id: generateId(),
        name: form.name.trim(),
        amount,
        frequency: form.frequency,
        renewalDate: form.renewalDate || undefined,
      },
    ]);
    setForm(null);
  }

  function remove(id: string) {
    onChange(subscriptions.filter((s) => s.id !== id));
  }

  const canSave = !!form?.name.trim() && parseFloat(form?.amount ?? '') > 0;

  return (
    <OnboardingStepCard
      step={5}
      totalSteps={10}
      title="Any subscriptions?"
      subtitle="These little charges add up fast! Tick off what you pay for."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      nextLabel={subscriptions.length > 0 ? 'Continue →' : 'Skip for now'}
    >
      <div className="space-y-4">
        {/* Popular services grid */}
        {!form && (
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              Popular Services
            </p>
            <div className="grid grid-cols-2 gap-2">
              {POPULAR.map((p) => {
                const isAdded = addedNames.has(p.name);
                return (
                  <button
                    key={p.name}
                    onClick={() => !isAdded && startAdd(p)}
                    className={`flex items-center gap-2.5 px-3.5 py-3 rounded-2xl border-2 text-left transition-all active:scale-95 ${
                      isAdded
                        ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <span className="text-xl">{p.icon}</span>
                    <span
                      className={`text-sm font-semibold truncate ${
                        isAdded ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {p.name}
                    </span>
                    {isAdded && <span className="ml-auto text-emerald-500 text-xs">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Inline form */}
        <AnimatePresence>
          {form && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-blue-300 dark:border-blue-700 p-4 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-800 dark:text-white">New Subscription</p>
                <button
                  onClick={() => setForm(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 text-lg font-bold leading-none"
                >
                  ×
                </button>
              </div>

              <input
                autoFocus
                type="text"
                placeholder="Service name"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 transition-colors"
              />

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    placeholder="Amount"
                    value={form.amount}
                    onChange={(e) => setField('amount', e.target.value)}
                    className="w-full pl-8 pr-3 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
                <select
                  value={form.frequency}
                  onChange={(e) => setField('frequency', e.target.value as Frequency)}
                  className="flex-1 px-3 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 transition-colors text-sm"
                >
                  {FREQS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Renewal date (optional)
                </label>
                <input
                  type="date"
                  value={form.renewalDate}
                  onChange={(e) => setField('renewalDate', e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>

              <button
                onClick={save}
                disabled={!canSave}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                  canSave
                    ? 'bg-blue-500 text-white shadow-sm active:scale-95'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                Add Subscription ✓
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom add */}
        {!form && (
          <button
            onClick={() => startAdd()}
            className="w-full py-3.5 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-sm font-semibold active:scale-95 transition-transform"
          >
            + Add Custom Subscription
          </button>
        )}

        {/* Added subscriptions list */}
        {subscriptions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Added ({subscriptions.length})
            </p>
            {subscriptions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl px-4 py-3.5 border border-gray-100 dark:border-gray-700 shadow-sm"
              >
                <div>
                  <p className="font-bold text-gray-800 dark:text-white text-sm">{s.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {currencySymbol}{s.amount.toFixed(2)} · {freqLabel(s.frequency)}
                  </p>
                </div>
                <button
                  onClick={() => remove(s.id)}
                  className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-400 font-bold text-lg leading-none active:scale-90 transition-transform"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </OnboardingStepCard>
  );
}
