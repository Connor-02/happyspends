'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RecurringBill, Frequency } from '@/types/budget';
import { OnboardingStepCard } from './OnboardingStepCard';
import { generateId } from '@/lib/utils';
import { freqLabel } from '@/lib/budgetCalculations';

const PRESETS = [
  { name: 'Rent / Mortgage', icon: '🏠', freq: 'monthly' as Frequency },
  { name: 'Electricity', icon: '⚡', freq: 'monthly' as Frequency },
  { name: 'Water', icon: '💧', freq: 'monthly' as Frequency },
  { name: 'Internet', icon: '🌐', freq: 'monthly' as Frequency },
  { name: 'Phone Plan', icon: '📱', freq: 'monthly' as Frequency },
  { name: 'Insurance', icon: '🛡️', freq: 'monthly' as Frequency },
  { name: 'Car Repayment', icon: '🚗', freq: 'monthly' as Frequency },
  { name: 'Loan Repayment', icon: '💳', freq: 'monthly' as Frequency },
  { name: 'Childcare', icon: '👶', freq: 'monthly' as Frequency },
  { name: 'Other Bill', icon: '📄', freq: 'monthly' as Frequency },
];

const FREQS: { value: Frequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

interface BillsStepProps {
  bills: RecurringBill[];
  onChange: (bills: RecurringBill[]) => void;
  currencySymbol: string;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

interface FormState {
  name: string;
  amount: string;
  frequency: Frequency;
  dueDate: string;
}

const emptyForm = (): FormState => ({
  name: '',
  amount: '',
  frequency: 'monthly',
  dueDate: '',
});

export function BillsStep({ bills, onChange, currencySymbol, onNext, onBack, onSkip }: BillsStepProps) {
  const [form, setForm] = useState<FormState | null>(null);

  function startAdd(preset?: (typeof PRESETS)[number]) {
    setForm(preset ? { ...emptyForm(), name: preset.name, frequency: preset.freq } : emptyForm());
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  function save() {
    if (!form?.name.trim() || !form.amount) return;
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) return;
    onChange([
      ...bills,
      {
        id: generateId(),
        name: form.name.trim(),
        amount,
        frequency: form.frequency,
        dueDate: form.dueDate || undefined,
      },
    ]);
    setForm(null);
  }

  function remove(id: string) {
    onChange(bills.filter((b) => b.id !== id));
  }

  const canSave = !!form?.name.trim() && parseFloat(form?.amount ?? '') > 0;

  return (
    <OnboardingStepCard
      step={4}
      totalSteps={10}
      title="Your regular bills"
      subtitle="Things you pay every week, fortnight, or month — rent, power, phone, etc."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      nextLabel={bills.length > 0 ? 'Continue →' : 'Skip for now'}
    >
      <div className="space-y-4">
        {/* Quick-add chips */}
        {!form && (
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              Common Bills
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => startAdd(p)}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 active:scale-95 transition-transform shadow-sm"
                >
                  <span>{p.icon}</span>
                  <span>{p.name}</span>
                </button>
              ))}
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
              className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-purple-300 dark:border-purple-700 p-4 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-800 dark:text-white">New Bill</p>
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
                placeholder="Bill name (e.g. Origin Energy)"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-purple-400 transition-colors"
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
                    className="w-full pl-8 pr-3 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-purple-400 transition-colors"
                  />
                </div>
                <select
                  value={form.frequency}
                  onChange={(e) => setField('frequency', e.target.value as Frequency)}
                  className="flex-1 px-3 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-purple-400 transition-colors text-sm"
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
                  Next due date (optional)
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setField('dueDate', e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-purple-400 transition-colors"
                />
              </div>

              <button
                onClick={save}
                disabled={!canSave}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                  canSave
                    ? 'bg-purple-500 text-white shadow-sm active:scale-95'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                Add Bill ✓
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
            + Add Custom Bill
          </button>
        )}

        {/* Bill list */}
        {bills.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Added ({bills.length})
            </p>
            {bills.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl px-4 py-3.5 border border-gray-100 dark:border-gray-700 shadow-sm"
              >
                <div>
                  <p className="font-bold text-gray-800 dark:text-white text-sm">{b.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {currencySymbol}{b.amount.toFixed(2)} · {freqLabel(b.frequency)}
                  </p>
                </div>
                <button
                  onClick={() => remove(b.id)}
                  className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-400 font-bold text-lg leading-none active:scale-90 transition-transform"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {bills.length === 0 && !form && (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm">No bills added yet.</p>
            <p className="text-gray-400 text-xs mt-1">Tap a quick-add button or skip this step.</p>
          </div>
        )}
      </div>
    </OnboardingStepCard>
  );
}
