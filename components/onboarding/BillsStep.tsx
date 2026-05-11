'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RecurringBill, Frequency } from '@/types/budget';
import { OnboardingStepCard } from './OnboardingStepCard';
import { generateId } from '@/lib/utils';
import { freqLabel } from '@/lib/budgetCalculations';

const PRESETS = [
  { name: 'Rent / Mortgage', icon: 'ðŸ ', freq: 'monthly' as Frequency },
  { name: 'Electricity', icon: 'âš¡', freq: 'monthly' as Frequency },
  { name: 'Water', icon: 'ðŸ’§', freq: 'monthly' as Frequency },
  { name: 'Internet', icon: 'ðŸŒ', freq: 'monthly' as Frequency },
  { name: 'Phone Plan', icon: 'ðŸ“±', freq: 'monthly' as Frequency },
  { name: 'Insurance', icon: 'ðŸ›¡ï¸', freq: 'monthly' as Frequency },
  { name: 'Car Repayment', icon: 'ðŸš—', freq: 'monthly' as Frequency },
  { name: 'Childcare', icon: 'ðŸ‘¶', freq: 'monthly' as Frequency },
  { name: 'Other Bill', icon: 'ðŸ“„', freq: 'monthly' as Frequency },
];

const FREQS: { value: Frequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const inputCls = "w-full px-4 py-3.5 rounded-2xl text-white text-sm focus:outline-none transition-all placeholder:text-white/30 bg-white/10 border border-white/15 focus:border-[#9B6DFF]/70";

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

const emptyForm = (): FormState => ({ name: '', amount: '', frequency: 'monthly', dueDate: '' });

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
    onChange([...bills, { id: generateId(), name: form.name.trim(), amount, frequency: form.frequency, dueDate: form.dueDate || undefined }]);
    setForm(null);
  }

  const canSave = !!form?.name.trim() && parseFloat(form?.amount ?? '') > 0;

  return (
    <OnboardingStepCard
      step={3}
      totalSteps={9}
      title="Your regular bills"
      subtitle="Rent, electricity, phone â€” things you pay every period."
      hint="We'll track these automatically so they never catch you off guard."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      nextLabel={bills.length > 0 ? 'Continue â†’' : 'Skip for now'}
    >
      <div className="space-y-4">
        {/* Added bills */}
        <AnimatePresence>
          {bills.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: 'rgba(155,109,255,0.1)', border: '1px solid rgba(155,109,255,0.25)' }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(155,109,255,0.2)' }}>
                <span className="text-base">ðŸ§¾</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{b.name}</p>
                <p className="text-xs text-white/50">{currencySymbol}{b.amount.toLocaleString()} Â· {freqLabel(b.frequency)}</p>
              </div>
              <button
                onClick={() => onChange(bills.filter((x) => x.id !== b.id))}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-all text-lg leading-none flex-shrink-0"
              >Ã—</button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add form */}
        <AnimatePresence>
          {form && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              className="rounded-3xl p-4 space-y-3"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(155,109,255,0.4)' }}
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-white text-sm">New Bill</p>
                <button onClick={() => setForm(null)} className="w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:bg-white/10 text-lg leading-none">Ã—</button>
              </div>
              <input
                autoFocus
                type="text"
                placeholder="e.g. Origin Energy"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                className={inputCls}
              />
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 font-semibold text-sm">{currencySymbol}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setField('amount', e.target.value)}
                    className={inputCls + " pl-8"}
                  />
                </div>
                <select
                  value={form.frequency}
                  onChange={(e) => setField('frequency', e.target.value as Frequency)}
                  className="flex-1 px-3 py-3.5 rounded-2xl text-white text-sm focus:outline-none border border-white/15 bg-white/10"
                  style={{ colorScheme: 'dark' }}
                >
                  {FREQS.map((f) => <option key={f.value} value={f.value} className="bg-[#1A0E3A]">{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-white/40 mb-1.5">Next due date (optional)</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setField('dueDate', e.target.value)}
                  className={inputCls}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <motion.button
                whileTap={{ scale: canSave ? 0.97 : 1 }}
                onClick={save}
                disabled={!canSave}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white"
                style={canSave ? { background: 'linear-gradient(135deg,#9B6DFF,#6C63FF)', boxShadow: '0 3px 16px rgba(155,109,255,0.35)' } : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}
              >
                âœ“ Add Bill
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preset chips */}
        {!form && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-3">Common Bills</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESETS.map((p) => (
                <motion.button
                  key={p.name}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => startAdd(p)}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-full text-sm font-semibold text-white/80"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}
                >
                  <span>{p.icon}</span><span>{p.name}</span>
                </motion.button>
              ))}
            </div>
            <button
              onClick={() => startAdd()}
              className="flex items-center gap-2 text-sm font-semibold"
              style={{ color: '#9B6DFF' }}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black" style={{ background: 'rgba(155,109,255,0.2)', color: '#9B6DFF' }}>+</span>
              Add another bill
            </button>
          </motion.div>
        )}
      </div>
    </OnboardingStepCard>
  );
}
