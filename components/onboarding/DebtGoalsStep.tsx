'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DebtGoalDraft, Frequency } from '@/types/budget';
import { OnboardingStepCard } from './OnboardingStepCard';
import { generateId } from '@/lib/utils';
import { freqLabel } from '@/lib/budgetCalculations';

const EXAMPLES = [
  { name: 'Credit Card', icon: '💳' },
  { name: 'Personal Loan', icon: '🏦' },
  { name: 'Car Loan', icon: '🚗' },
  { name: 'HECS / HELP', icon: '🎓' },
  { name: 'Buy Now Pay Later', icon: '📦' },
  { name: 'Other Debt', icon: '💰' },
];

const FREQS: { value: Frequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
];

interface DebtGoalsStepProps {
  debtGoals: DebtGoalDraft[];
  onChange: (goals: DebtGoalDraft[]) => void;
  currencySymbol: string;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

interface FormState {
  name: string;
  startingBalance: string;
  currentBalance: string;
  minimumPayment: string;
  paymentFrequency: Frequency;
  dueDate: string;
}

const emptyForm = (): FormState => ({
  name: '',
  startingBalance: '',
  currentBalance: '',
  minimumPayment: '',
  paymentFrequency: 'monthly',
  dueDate: '',
});

export function DebtGoalsStep({
  debtGoals,
  onChange,
  currencySymbol,
  onNext,
  onBack,
  onSkip,
}: DebtGoalsStepProps) {
  const [form, setForm] = useState<FormState | null>(null);

  function startAdd(preset?: (typeof EXAMPLES)[number]) {
    setForm(preset ? { ...emptyForm(), name: preset.name } : emptyForm());
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  function save() {
    if (!form?.name.trim() || !form.currentBalance) return;
    const current = parseFloat(form.currentBalance);
    if (isNaN(current) || current < 0) return;
    const starting = parseFloat(form.startingBalance) || current;
    const payment = parseFloat(form.minimumPayment) || 0;
    onChange([
      ...debtGoals,
      {
        id: generateId(),
        name: form.name.trim(),
        startingBalance: starting,
        currentBalance: current,
        minimumPayment: payment,
        paymentFrequency: form.paymentFrequency,
        dueDate: form.dueDate || undefined,
      },
    ]);
    setForm(null);
  }

  function remove(id: string) {
    onChange(debtGoals.filter((g) => g.id !== id));
  }

  const canSave = !!form?.name.trim() && parseFloat(form?.currentBalance ?? '') >= 0;

  return (
    <OnboardingStepCard
      step={8}
      totalSteps={10}
      title="Any debts to track? 💳"
      subtitle="We'll help you keep on top of repayments — no judgement here."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      nextLabel={debtGoals.length > 0 ? 'Continue →' : 'Skip for now'}
    >
      <div className="space-y-4">
        {/* Examples grid */}
        {!form && (
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              Common Debts
            </p>
            <div className="grid grid-cols-2 gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.name}
                  onClick={() => startAdd(ex)}
                  className="flex items-center gap-2.5 px-3.5 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-left active:scale-95 transition-transform shadow-sm"
                >
                  <span className="text-xl">{ex.icon}</span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">
                    {ex.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <AnimatePresence>
          {form && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-orange-300 dark:border-orange-700 p-4 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-800 dark:text-white">New Debt</p>
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
                placeholder="Debt name (e.g. ANZ Credit Card)"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-orange-400 transition-colors"
              />

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Current balance (how much you owe now)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 3500"
                    value={form.currentBalance}
                    onChange={(e) => setField('currentBalance', e.target.value)}
                    className="w-full pl-8 pr-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-orange-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Original balance (optional — what you started with)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    placeholder="Leave blank if unsure"
                    value={form.startingBalance}
                    onChange={(e) => setField('startingBalance', e.target.value)}
                    className="w-full pl-8 pr-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-orange-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Minimum payment amount
                </label>
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
                      placeholder="Min payment"
                      value={form.minimumPayment}
                      onChange={(e) => setField('minimumPayment', e.target.value)}
                      className="w-full pl-8 pr-3 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-orange-400 transition-colors"
                    />
                  </div>
                  <select
                    value={form.paymentFrequency}
                    onChange={(e) => setField('paymentFrequency', e.target.value as Frequency)}
                    className="flex-1 px-3 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-orange-400 transition-colors text-sm"
                  >
                    {FREQS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Next payment / payoff date (optional)
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setField('dueDate', e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-orange-400 transition-colors"
                />
              </div>

              <button
                onClick={save}
                disabled={!canSave}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                  canSave
                    ? 'bg-orange-500 text-white shadow-sm active:scale-95'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                Add Debt ✓
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
            + Add Custom Debt
          </button>
        )}

        {/* Debt list */}
        {debtGoals.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Added ({debtGoals.length})
            </p>
            {debtGoals.map((d) => (
              <div
                key={d.id}
                className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3.5 border border-gray-100 dark:border-gray-700 shadow-sm"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-gray-800 dark:text-white text-sm">{d.name}</p>
                  <button
                    onClick={() => remove(d.id)}
                    className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-400 font-bold text-lg leading-none active:scale-90 transition-transform"
                  >
                    ×
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Owe {currencySymbol}{d.currentBalance.toFixed(0)}
                  {d.minimumPayment > 0 && ` · Min. payment ${currencySymbol}${d.minimumPayment.toFixed(0)} ${freqLabel(d.paymentFrequency)}`}
                </p>
              </div>
            ))}
          </div>
        )}

        {debtGoals.length === 0 && !form && (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm">No debts added.</p>
            <p className="text-gray-400 text-xs mt-1">Completely fine — just tap Skip if this doesn&apos;t apply.</p>
          </div>
        )}
      </div>
    </OnboardingStepCard>
  );
}
