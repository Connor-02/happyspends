'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DebtGoalDraft, Frequency } from '@/types/budget';
import { OnboardingStepCard } from './OnboardingStepCard';
import { generateId } from '@/lib/utils';
import { freqLabel } from '@/lib/budgetCalculations';

const EXAMPLES = [
  { name: 'Credit Card', icon: 'ðŸ’³' },
  { name: 'Personal Loan', icon: 'ðŸ¦' },
  { name: 'Car Loan', icon: 'ðŸš—' },
  { name: 'HECS / HELP', icon: 'ðŸŽ“' },
  { name: 'Buy Now Pay Later', icon: 'ðŸ“¦' },
  { name: 'Other Debt', icon: 'ðŸ’°' },
];

const FREQS: { value: Frequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
];

const inputCls = "w-full px-4 py-3.5 rounded-2xl text-white text-sm focus:outline-none transition-all placeholder:text-white/30 bg-white/10 border border-white/15 focus:border-[#FCD34D]/70";

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

const emptyForm = (): FormState => ({ name: '', startingBalance: '', currentBalance: '', minimumPayment: '', paymentFrequency: 'monthly', dueDate: '' });

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
    const current = parseFloat(form.currentBalance);
    if (isNaN(current) || current < 0) return;
    const starting = parseFloat(form.startingBalance) || current;
    const payment = parseFloat(form.minimumPayment) || 0;
    onChange([...debtGoals, { id: generateId(), name: form.name.trim(), startingBalance: starting, currentBalance: current, minimumPayment: payment, paymentFrequency: form.paymentFrequency, dueDate: form.dueDate || undefined }]);
    setForm(null);
  }

  const canSave = !!form?.name.trim() && parseFloat(form?.currentBalance ?? '') >= 0 && form?.currentBalance !== '';

  return (
    <OnboardingStepCard
      step={7}
      totalSteps={9}
      title="Any debts to track? ðŸ’³"
      subtitle="We'll help you keep on top of repayments â€” no judgement here."
      hint="Track what you owe and watch the balance drop as you pay it down."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      nextLabel={debtGoals.length > 0 ? 'Continue â†’' : 'Skip for now'}
    >
      <div className="space-y-4">
        {/* Added debts */}
        <AnimatePresence>
          {debtGoals.map((d, i) => {
            const pct = d.startingBalance > 0 ? Math.min(100, ((d.startingBalance - d.currentBalance) / d.startingBalance) * 100) : 0;
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl p-4"
                style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-white">{d.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-white/50">{currencySymbol}{d.currentBalance.toLocaleString()}</p>
                    {d.minimumPayment > 0 && <p className="text-[10px] text-white/35">Â· {currencySymbol}{d.minimumPayment}/{freqLabel(d.paymentFrequency).charAt(0)}</p>}
                    <button
                      onClick={() => onChange(debtGoals.filter((x) => x.id !== d.id))}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/10 text-sm leading-none"
                    >Ã—</button>
                  </div>
                </div>
                {pct > 0 && (
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#FCD34D,#F59E0B)' }} />
                  </div>
                )}
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
              style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(251,191,36,0.4)' }}
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-white text-sm">New Debt</p>
                <button onClick={() => setForm(null)} className="w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:bg-white/10 text-lg leading-none">Ã—</button>
              </div>
              <input
                autoFocus
                type="text"
                placeholder="e.g. ANZ Credit Card"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                className={inputCls}
              />
              <div>
                <label className="block text-[11px] font-medium text-white/40 mb-1.5">Current balance (how much you owe now)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm font-semibold">{currencySymbol}</span>
                  <input type="number" inputMode="decimal" min="0" step="0.01" placeholder="e.g. 3,500" value={form.currentBalance} onChange={(e) => setField('currentBalance', e.target.value)} className={inputCls + " pl-8"} />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-white/40 mb-1.5">Original balance (optional)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm font-semibold">{currencySymbol}</span>
                  <input type="number" inputMode="decimal" min="0" step="0.01" placeholder="Leave blank if unsure" value={form.startingBalance} onChange={(e) => setField('startingBalance', e.target.value)} className={inputCls + " pl-8"} />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-white/40 mb-1.5">Minimum repayment</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm font-semibold">{currencySymbol}</span>
                    <input type="number" inputMode="decimal" min="0" step="0.01" placeholder="Min. payment" value={form.minimumPayment} onChange={(e) => setField('minimumPayment', e.target.value)} className={inputCls + " pl-8"} />
                  </div>
                  <select
                    value={form.paymentFrequency}
                    onChange={(e) => setField('paymentFrequency', e.target.value as Frequency)}
                    className="flex-1 px-3 py-3.5 rounded-2xl text-white text-sm focus:outline-none border border-white/15 bg-white/10"
                    style={{ colorScheme: 'dark' }}
                  >
                    {FREQS.map((f) => <option key={f.value} value={f.value} className="bg-[#1A0E3A]">{f.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-white/40 mb-1.5">Next payment date (optional)</label>
                <input type="date" value={form.dueDate} onChange={(e) => setField('dueDate', e.target.value)} className={inputCls} style={{ colorScheme: 'dark' }} />
              </div>
              <motion.button
                whileTap={{ scale: canSave ? 0.97 : 1 }}
                onClick={save}
                disabled={!canSave}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white"
                style={canSave ? { background: 'linear-gradient(135deg,#FCD34D,#F59E0B)', boxShadow: '0 3px 16px rgba(251,191,36,0.3)', color: '#1a1a1a' } : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}
              >
                âœ“ Add Debt
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Example grid */}
        {!form && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-3">Common Debt Types</p>
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
              style={{ color: '#FCD34D' }}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black" style={{ background: 'rgba(251,191,36,0.2)', color: '#FCD34D' }}>+</span>
              Add custom debt
            </button>
          </motion.div>
        )}
      </div>
    </OnboardingStepCard>
  );
}
