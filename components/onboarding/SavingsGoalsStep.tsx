'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, X, Check } from 'lucide-react';
import type { SavingsGoalDraft } from '@/types/budget';
import { OnboardingStepCard } from './OnboardingStepCard';
import { generateId } from '@/lib/utils';

const EXAMPLES = [
  { name: 'Emergency Fund' },
  { name: 'Holiday' },
  { name: 'New Car' },
  { name: 'House Deposit' },
  { name: 'Wedding' },
  { name: 'New Laptop' },
  { name: 'Education' },
  { name: 'Other Goal' },
];

const inputCls =
  'w-full px-4 py-3.5 rounded-2xl text-sm focus:outline-none transition-all placeholder:text-gray-400 bg-white border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50';

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

const emptyForm = (): FormState => ({ name: '', targetAmount: '', currentAmount: '0', targetDate: '' });

export function SavingsGoalsStep({ savingsGoals, onChange, currencySymbol, onNext, onBack, onSkip }: SavingsGoalsStepProps) {
  const [form, setForm] = useState<FormState | null>(null);

  function startAdd(preset?: (typeof EXAMPLES)[number]) {
    setForm(preset ? { ...emptyForm(), name: preset.name } : emptyForm());
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  function save() {
    if (!form?.name.trim() || !form.targetAmount) return;
    const targetAmount = parseFloat(form.targetAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) return;
    const currentAmount = parseFloat(form.currentAmount) || 0;
    onChange([
      ...savingsGoals,
      { id: generateId(), name: form.name.trim(), targetAmount, currentAmount, targetDate: form.targetDate || undefined },
    ]);
    setForm(null);
  }

  const canSave = !!form?.name.trim() && parseFloat(form?.targetAmount ?? '') > 0;

  return (
    <OnboardingStepCard
      step={6}
      totalSteps={9}
      title="What are you saving for?"
      subtitle="Set goals and we'll help you reach them faster."
      hint="Even a small savings goal gives you something to work towards."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      nextLabel={savingsGoals.length > 0 ? 'Continue' : 'Skip for now'}
    >
      <div className="space-y-3">
        <AnimatePresence>
          {savingsGoals.map((goal, i) => {
            const pct = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl px-4 py-3"
                style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: '#DCFCE7' }}
                  >
                    <Target className="w-4 h-4" style={{ color: '#22C55E' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#111827' }}>{goal.name}</p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>
                      {currencySymbol}{goal.currentAmount.toLocaleString()} of {currencySymbol}{goal.targetAmount.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => onChange(savingsGoals.filter((g) => g.id !== goal.id))}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-red-50"
                    style={{ color: '#D1D5DB' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#BBF7D0' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #22C55E, #16A34A)' }}
                  />
                </div>
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
              style={{ border: '1.5px solid #BBF7D0' }}
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm" style={{ color: '#111827' }}>New Savings Goal</p>
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
                placeholder="e.g. Holiday Fund"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                className={inputCls}
                style={{ color: '#111827' }}
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1" style={{ color: '#9CA3AF' }}>Target amount</label>
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
                      value={form.targetAmount}
                      onChange={(e) => setField('targetAmount', e.target.value)}
                      className={inputCls + ' pl-8'}
                      style={{ color: '#111827' }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1" style={{ color: '#9CA3AF' }}>Already saved</label>
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
                      value={form.currentAmount}
                      onChange={(e) => setField('currentAmount', e.target.value)}
                      className={inputCls + ' pl-8'}
                      style={{ color: '#111827' }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#9CA3AF' }}>
                  Target date (optional)
                </label>
                <input
                  type="date"
                  value={form.targetDate}
                  onChange={(e) => setField('targetDate', e.target.value)}
                  className={inputCls}
                  style={{ color: '#111827', colorScheme: 'light' }}
                />
              </div>
              <motion.button
                whileTap={{ scale: canSave ? 0.97 : 1 }}
                onClick={save}
                disabled={!canSave}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2"
                style={
                  canSave
                    ? { background: 'linear-gradient(135deg, #22C55E, #16A34A)', boxShadow: '0 3px 14px rgba(34,197,94,0.25)' }
                    : { background: '#F3F4F6', color: '#9CA3AF' }
                }
              >
                {canSave && <Check className="w-4 h-4" />}
                Add Goal
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {!form && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>
              Common Goals
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {EXAMPLES.map((e) => (
                <motion.button
                  key={e.name}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => startAdd(e)}
                  className="px-3.5 py-2 rounded-full text-sm font-medium transition-all bg-white hover:border-emerald-300"
                  style={{ border: '1px solid #E5E7EB', color: '#374151' }}
                >
                  {e.name}
                </motion.button>
              ))}
            </div>
            <button
              onClick={() => startAdd()}
              className="flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ color: '#22C55E' }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E' }}
              >
                <span className="text-xs font-black leading-none">+</span>
              </span>
              Add a custom goal
            </button>
          </motion.div>
        )}
      </div>
    </OnboardingStepCard>
  );
}
