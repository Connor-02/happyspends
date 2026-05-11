'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SavingsGoalDraft } from '@/types/budget';
import { OnboardingStepCard } from './OnboardingStepCard';
import { generateId } from '@/lib/utils';

const EXAMPLES = [
  { name: 'Emergency Fund', icon: 'ðŸš‘' },
  { name: 'Holiday', icon: 'âœˆï¸' },
  { name: 'New Car', icon: 'ðŸš—' },
  { name: 'House Deposit', icon: 'ðŸ ' },
  { name: 'Wedding', icon: 'ðŸ’' },
  { name: 'New Laptop', icon: 'ðŸ’»' },
  { name: 'Education', icon: 'ðŸŽ“' },
  { name: 'Other Goal', icon: 'â­' },
];

const inputCls = "w-full px-4 py-3.5 rounded-2xl text-white text-sm focus:outline-none transition-all placeholder:text-white/30 bg-white/10 border border-white/15 focus:border-[#4ADE80]/70";

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
    const target = parseFloat(form.targetAmount);
    const current = parseFloat(form.currentAmount) || 0;
    if (isNaN(target) || target <= 0) return;
    onChange([...savingsGoals, { id: generateId(), name: form.name.trim(), targetAmount: target, currentAmount: current, targetDate: form.targetDate || undefined }]);
    setForm(null);
  }

  const canSave = !!form?.name.trim() && parseFloat(form?.targetAmount ?? '') > 0;

  return (
    <OnboardingStepCard
      step={6}
      totalSteps={9}
      title="Any savings goals? ðŸŽ¯"
      subtitle="What are you working towards? We'll track your progress automatically."
      hint="Even small goals are worth tracking â€” watching the bar fill up is motivating!"
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      nextLabel={savingsGoals.length > 0 ? 'Continue â†’' : 'Skip for now'}
    >
      <div className="space-y-4">
        {/* Added goals */}
        <AnimatePresence>
          {savingsGoals.map((g, i) => {
            const pct = g.targetAmount > 0 ? Math.min(100, (g.currentAmount / g.targetAmount) * 100) : 0;
            return (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl p-4"
                style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-white">{g.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-white/50">{currencySymbol}{g.targetAmount.toLocaleString()}</p>
                    <button
                      onClick={() => onChange(savingsGoals.filter((x) => x.id !== g.id))}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/10 text-sm leading-none"
                    >Ã—</button>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#4ADE80,#22C55E)' }} />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Add form */}
        <AnimatePresence>
          {form && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              className="rounded-3xl p-4 space-y-3"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(74,222,128,0.4)' }}
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-white text-sm">New Savings Goal</p>
                <button onClick={() => setForm(null)} className="w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:bg-white/10 text-lg leading-none">Ã—</button>
              </div>
              <input
                autoFocus
                type="text"
                placeholder="e.g. Holiday Fund"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                className={inputCls}
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-white/40 mb-1.5">Target amount</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm font-semibold">{currencySymbol}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="1"
                      placeholder="5,000"
                      value={form.targetAmount}
                      onChange={(e) => setField('targetAmount', e.target.value)}
                      className={inputCls + " pl-8"}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-white/40 mb-1.5">Already saved</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm font-semibold">{currencySymbol}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="1"
                      placeholder="0"
                      value={form.currentAmount}
                      onChange={(e) => setField('currentAmount', e.target.value)}
                      className={inputCls + " pl-8"}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-white/40 mb-1.5">Target date (optional)</label>
                <input
                  type="date"
                  value={form.targetDate}
                  onChange={(e) => setField('targetDate', e.target.value)}
                  className={inputCls}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <motion.button
                whileTap={{ scale: canSave ? 0.97 : 1 }}
                onClick={save}
                disabled={!canSave}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white"
                style={canSave ? { background: 'linear-gradient(135deg,#4ADE80,#22C55E)', boxShadow: '0 3px 16px rgba(74,222,128,0.3)' } : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}
              >
                âœ“ Add Goal
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Example grid */}
        {!form && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-3">Common Goals</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {EXAMPLES.map((ex) => (
                <motion.button
                  key={ex.name}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => startAdd(ex)}
                  className="flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-left"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  <span className="text-xl">{ex.icon}</span>
                  <span className="text-sm font-semibold text-white/80 truncate">{ex.name}</span>
                </motion.button>
              ))}
            </div>
            <button
              onClick={() => startAdd()}
              className="flex items-center gap-2 text-sm font-semibold"
              style={{ color: '#4ADE80' }}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black" style={{ background: 'rgba(74,222,128,0.2)', color: '#4ADE80' }}>+</span>
              Add custom goal
            </button>
          </motion.div>
        )}
      </div>
    </OnboardingStepCard>
  );
}
