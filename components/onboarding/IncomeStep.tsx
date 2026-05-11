'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, X, Check } from 'lucide-react';
import type { IncomeSource, Frequency } from '@/types/budget';
import { OnboardingStepCard } from './OnboardingStepCard';
import { generateId } from '@/lib/utils';
import { freqLabel } from '@/lib/budgetCalculations';

const PRESETS = [
  { name: 'Job / Salary', freq: 'fortnightly' as Frequency },
  { name: 'Side Hustle', freq: 'monthly' as Frequency },
  { name: 'Government Benefit', freq: 'fortnightly' as Frequency },
  { name: 'Freelance Work', freq: 'monthly' as Frequency },
  { name: 'Rental Income', freq: 'monthly' as Frequency },
  { name: 'Other Income', freq: 'monthly' as Frequency },
];

const FREQS: { value: Frequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const inputCls =
  'w-full px-4 py-3.5 rounded-2xl text-sm focus:outline-none transition-all placeholder:text-gray-400 bg-white border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50';

interface IncomeStepProps {
  incomeSources: IncomeSource[];
  onChange: (sources: IncomeSource[]) => void;
  currencySymbol: string;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

interface FormState {
  name: string;
  amount: string;
  frequency: Frequency;
  nextPayDate: string;
}

const emptyForm = (): FormState => ({ name: '', amount: '', frequency: 'fortnightly', nextPayDate: '' });

export function IncomeStep({ incomeSources, onChange, currencySymbol, onNext, onBack, onSkip }: IncomeStepProps) {
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
      ...incomeSources,
      { id: generateId(), name: form.name.trim(), amount, frequency: form.frequency, nextPayDate: form.nextPayDate || undefined },
    ]);
    setForm(null);
  }

  const canSave = !!form?.name.trim() && parseFloat(form?.amount ?? '') > 0;

  return (
    <OnboardingStepCard
      step={2}
      totalSteps={9}
      title="Where does your money come from?"
      subtitle="Add your income sources so we know what you have to work with."
      hint="We'll use this to calculate what you can safely spend each period."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      nextLabel={incomeSources.length > 0 ? 'Continue' : 'Skip for now'}
    >
      <div className="space-y-3">
        {/* Added items */}
        <AnimatePresence>
          {incomeSources.map((src, i) => (
            <motion.div
              key={src.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#DCFCE7' }}
              >
                <DollarSign className="w-4 h-4" style={{ color: '#22C55E' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: '#111827' }}>{src.name}</p>
                <p className="text-xs" style={{ color: '#6B7280' }}>
                  {currencySymbol}{src.amount.toLocaleString()} · {freqLabel(src.frequency)}
                </p>
              </div>
              <button
                onClick={() => onChange(incomeSources.filter((s) => s.id !== src.id))}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-red-50"
                style={{ color: '#D1D5DB' }}
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Inline add form */}
        <AnimatePresence>
          {form && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              className="rounded-3xl p-4 space-y-3 bg-white"
              style={{ border: '1.5px solid #FBCFE8' }}
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm" style={{ color: '#111827' }}>New Income Source</p>
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
                placeholder="e.g. Salary at Woolworths"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                className={inputCls}
                style={{ color: '#111827' }}
              />

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-sm"
                    style={{ color: '#9CA3AF' }}
                  >
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setField('amount', e.target.value)}
                    className={inputCls + ' pl-8'}
                    style={{ color: '#111827' }}
                  />
                </div>
                <select
                  value={form.frequency}
                  onChange={(e) => setField('frequency', e.target.value as Frequency)}
                  className="flex-1 px-3 py-3.5 rounded-2xl text-sm focus:outline-none border border-gray-200 bg-white"
                  style={{ color: '#374151', colorScheme: 'light' }}
                >
                  {FREQS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#9CA3AF' }}>
                  Next payment date (optional)
                </label>
                <input
                  type="date"
                  value={form.nextPayDate}
                  onChange={(e) => setField('nextPayDate', e.target.value)}
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
                    ? { background: 'linear-gradient(135deg, #EC4899, #8B5CF6)', boxShadow: '0 3px 14px rgba(236,72,153,0.25)' }
                    : { background: '#F3F4F6', color: '#9CA3AF' }
                }
              >
                {canSave && <Check className="w-4 h-4" />}
                Add Income Source
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preset chips + add button */}
        {!form && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>
              Quick Add
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESETS.map((p) => (
                <motion.button
                  key={p.name}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => startAdd(p)}
                  className="px-3.5 py-2 rounded-full text-sm font-medium transition-all bg-white hover:border-pink-300"
                  style={{ border: '1px solid #E5E7EB', color: '#374151' }}
                >
                  {p.name}
                </motion.button>
              ))}
            </div>
            <button
              onClick={() => startAdd()}
              className="flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ color: '#EC4899' }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(236,72,153,0.12)', color: '#EC4899' }}
              >
                <span className="text-xs font-black leading-none">+</span>
              </span>
              Add custom income source
            </button>
          </motion.div>
        )}
      </div>
    </OnboardingStepCard>
  );
}
