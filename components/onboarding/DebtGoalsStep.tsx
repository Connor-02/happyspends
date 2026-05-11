'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Check } from 'lucide-react';
import type { DebtGoalDraft, Frequency } from '@/types/budget';
import { OnboardingStepCard } from './OnboardingStepCard';
import { generateId } from '@/lib/utils';
import { freqLabel } from '@/lib/budgetCalculations';

const EXAMPLES = [
  { name: 'Credit Card' },
  { name: 'Personal Loan' },
  { name: 'Car Loan' },
  { name: 'HECS / HELP' },
  { name: 'Buy Now Pay Later' },
  { name: 'Other Debt' },
];

const FREQS: { value: Frequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
];

const inputCls =
  'w-full px-4 py-3.5 rounded-2xl text-sm focus:outline-none transition-all placeholder:text-gray-400 bg-white border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-50';

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

export function DebtGoalsStep({ debtGoals, onChange, currencySymbol, onNext, onBack, onSkip }: DebtGoalsStepProps) {
  const [form, setForm] = useState<FormState | null>(null);

  function startAdd(preset?: (typeof EXAMPLES)[number]) {
    setForm(preset ? { ...emptyForm(), name: preset.name } : emptyForm());
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  function save() {
    if (!form?.name.trim() || !form.currentBalance) return;
    const currentBalance = parseFloat(form.currentBalance);
    if (isNaN(currentBalance) || currentBalance < 0) return;
    const startingBalance = parseFloat(form.startingBalance) || currentBalance;
    const minimumPayment = parseFloat(form.minimumPayment) || 0;
    onChange([
      ...debtGoals,
      {
        id: generateId(),
        name: form.name.trim(),
        startingBalance,
        currentBalance,
        minimumPayment,
        paymentFrequency: form.paymentFrequency,
        dueDate: form.dueDate || undefined,
      },
    ]);
    setForm(null);
  }

  const canSave = !!form?.name.trim() && parseFloat(form?.currentBalance ?? '') >= 0 && form?.currentBalance !== '';

  return (
    <OnboardingStepCard
      step={7}
      totalSteps={9}
      title="Any debts to track?"
      subtitle="Credit cards, loans, HECS — knowing what you owe helps you pay it off faster."
      hint="We'll track your progress and factor repayments into your budget."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      nextLabel={debtGoals.length > 0 ? 'Continue' : 'Skip for now'}
    >
      <div className="space-y-3">
        <AnimatePresence>
          {debtGoals.map((debt, i) => {
            const pct =
              debt.startingBalance > 0
                ? Math.min(((debt.startingBalance - debt.currentBalance) / debt.startingBalance) * 100, 100)
                : 0;
            return (
              <motion.div
                key={debt.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl px-4 py-3"
                style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: '#FEF3C7' }}
                  >
                    <AlertCircle className="w-4 h-4" style={{ color: '#F59E0B' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#111827' }}>{debt.name}</p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>
                      {currencySymbol}{debt.currentBalance.toLocaleString()} remaining · {freqLabel(debt.paymentFrequency)}
                    </p>
                  </div>
                  <button
                    onClick={() => onChange(debtGoals.filter((d) => d.id !== debt.id))}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-red-50"
                    style={{ color: '#D1D5DB' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {pct > 0 && (
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#FDE68A' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #F59E0B, #D97706)' }}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        <AnimatePresence>
          {form && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              className="rounded-3xl p-4 space-y-3 bg-white"
              style={{ border: '1.5px solid #FDE68A' }}
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm" style={{ color: '#111827' }}>New Debt</p>
                <button
                  onClick={() => setForm(null)}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all"
                  style={{ color: '#9CA3AF' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                autoFocus
                type="text"
                placeholder="e.g. Visa Credit Card"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                className={inputCls}
                style={{ color: '#111827' }}
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1" style={{ color: '#9CA3AF' }}>Current balance</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-sm" style={{ color: '#9CA3AF' }}>
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.currentBalance}
                      onChange={(e) => setField('currentBalance', e.target.value)}
                      className={inputCls + ' pl-8'}
                      style={{ color: '#111827' }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1" style={{ color: '#9CA3AF' }}>Starting balance</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-sm" style={{ color: '#9CA3AF' }}>
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.startingBalance}
                      onChange={(e) => setField('startingBalance', e.target.value)}
                      className={inputCls + ' pl-8'}
                      style={{ color: '#111827' }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1" style={{ color: '#9CA3AF' }}>Min. repayment</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-sm" style={{ color: '#9CA3AF' }}>
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.minimumPayment}
                      onChange={(e) => setField('minimumPayment', e.target.value)}
                      className={inputCls + ' pl-8'}
                      style={{ color: '#111827' }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1" style={{ color: '#9CA3AF' }}>Frequency</label>
                  <select
                    value={form.paymentFrequency}
                    onChange={(e) => setField('paymentFrequency', e.target.value as Frequency)}
                    className="w-full px-3 py-3.5 rounded-2xl text-sm focus:outline-none border border-gray-200 bg-white"
                    style={{ color: '#374151', colorScheme: 'light' }}
                  >
                    {FREQS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: canSave ? 0.97 : 1 }}
                onClick={save}
                disabled={!canSave}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2"
                style={
                  canSave
                    ? { background: 'linear-gradient(135deg, #F59E0B, #D97706)', boxShadow: '0 3px 14px rgba(245,158,11,0.25)' }
                    : { background: '#F3F4F6', color: '#9CA3AF' }
                }
              >
                {canSave && <Check className="w-4 h-4" />}
                Add Debt
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {!form && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>
              Common Debts
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {EXAMPLES.map((e) => (
                <motion.button
                  key={e.name}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => startAdd(e)}
                  className="px-3.5 py-2 rounded-full text-sm font-medium transition-all bg-white hover:border-amber-300"
                  style={{ border: '1px solid #E5E7EB', color: '#374151' }}
                >
                  {e.name}
                </motion.button>
              ))}
            </div>
            <button
              onClick={() => startAdd()}
              className="flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ color: '#F59E0B' }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}
              >
                <span className="text-xs font-black leading-none">+</span>
              </span>
              Add another debt
            </button>
          </motion.div>
        )}
      </div>
    </OnboardingStepCard>
  );
}
