'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SavingsGoalDraft } from '@/types/budget';
import { OnboardingStepCard } from './OnboardingStepCard';
import { generateId } from '@/lib/utils';

const EXAMPLES = [
  { name: 'Emergency Fund', icon: '🚑' },
  { name: 'Holiday', icon: '✈️' },
  { name: 'New Car', icon: '🚗' },
  { name: 'House Deposit', icon: '🏠' },
  { name: 'Wedding', icon: '💍' },
  { name: 'New Laptop', icon: '💻' },
  { name: 'Education', icon: '🎓' },
  { name: 'Other Goal', icon: '⭐' },
];

interface SavingsGoalsStepProps {
  savingsGoals: SavingsGoalDraft[];
  onChange: (goals: SavingsGoalDraft[]) => void;
  currencySymbol: string;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

interface FormState {
  name: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string;
}

const emptyForm = (): FormState => ({
  name: '',
  targetAmount: '',
  currentAmount: '0',
  targetDate: '',
});

export function SavingsGoalsStep({
  savingsGoals,
  onChange,
  currencySymbol,
  onNext,
  onBack,
  onSkip,
}: SavingsGoalsStepProps) {
  const [form, setForm] = useState<FormState | null>(null);

  function startAdd(preset?: (typeof EXAMPLES)[number]) {
    setForm(preset ? { ...emptyForm(), name: preset.name } : emptyForm());
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  function save() {
    if (!form?.name.trim() || !form.targetAmount) return;
    const target = parseFloat(form.targetAmount);
    const current = parseFloat(form.currentAmount) || 0;
    if (isNaN(target) || target <= 0) return;
    onChange([
      ...savingsGoals,
      {
        id: generateId(),
        name: form.name.trim(),
        targetAmount: target,
        currentAmount: current,
        targetDate: form.targetDate || undefined,
      },
    ]);
    setForm(null);
  }

  function remove(id: string) {
    onChange(savingsGoals.filter((g) => g.id !== id));
  }

  const canSave = !!form?.name.trim() && parseFloat(form?.targetAmount ?? '') > 0;

  return (
    <OnboardingStepCard
      step={7}
      totalSteps={10}
      title="Any savings goals? 🎯"
      subtitle="What are you saving towards? We'll track your progress as you go."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      nextLabel={savingsGoals.length > 0 ? 'Continue →' : 'Skip for now'}
    >
      <div className="space-y-4">
        {/* Example goals grid */}
        {!form && (
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              Common Goals
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
              className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-emerald-300 dark:border-emerald-700 p-4 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-800 dark:text-white">New Savings Goal</p>
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
                placeholder="Goal name (e.g. Holiday Fund)"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-400 transition-colors"
              />

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Target amount (what you want to reach)
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
                    placeholder="e.g. 5000"
                    value={form.targetAmount}
                    onChange={(e) => setField('targetAmount', e.target.value)}
                    className="w-full pl-8 pr-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Already saved (optional — put 0 if starting fresh)
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
                    placeholder="0"
                    value={form.currentAmount}
                    onChange={(e) => setField('currentAmount', e.target.value)}
                    className="w-full pl-8 pr-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Target date (optional)
                </label>
                <input
                  type="date"
                  value={form.targetDate}
                  onChange={(e) => setField('targetDate', e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              <button
                onClick={save}
                disabled={!canSave}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                  canSave
                    ? 'bg-emerald-500 text-white shadow-sm active:scale-95'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                Add Goal ✓
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
            + Add Custom Goal
          </button>
        )}

        {/* Goals list */}
        {savingsGoals.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Added ({savingsGoals.length})
            </p>
            {savingsGoals.map((g) => {
              const pct = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
              return (
                <div
                  key={g.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3.5 border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-gray-800 dark:text-white text-sm">{g.name}</p>
                    <button
                      onClick={() => remove(g.id)}
                      className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-400 font-bold text-lg leading-none active:scale-90 transition-transform"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">
                    {currencySymbol}{g.currentAmount.toFixed(0)} saved of {currencySymbol}{g.targetAmount.toFixed(0)} target
                    {' '}({pct}%)
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {savingsGoals.length === 0 && !form && (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm">No savings goals yet.</p>
            <p className="text-gray-400 text-xs mt-1">You can always add goals later — just tap Skip.</p>
          </div>
        )}
      </div>
    </OnboardingStepCard>
  );
}
