'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, Check } from 'lucide-react';
import type { RecurringBill, Frequency } from '@/types/budget';
import { OnboardingStepCard } from './OnboardingStepCard';
import { generateId } from '@/lib/utils';
import { freqLabel } from '@/lib/budgetCalculations';

const PRESETS = [
  { name: 'Rent / Mortgage', freq: 'monthly' as Frequency },
  { name: 'Electricity', freq: 'monthly' as Frequency },
  { name: 'Water', freq: 'monthly' as Frequency },
  { name: 'Internet', freq: 'monthly' as Frequency },
  { name: 'Phone Plan', freq: 'monthly' as Frequency },
  { name: 'Insurance', freq: 'monthly' as Frequency },
  { name: 'Car Repayment', freq: 'monthly' as Frequency },
  { name: 'Childcare', freq: 'monthly' as Frequency },
  { name: 'Other Bill', freq: 'monthly' as Frequency },
];

const FREQS: { value: Frequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const inputCls =
  'w-full px-4 py-3.5 rounded-2xl text-sm focus:outline-none transition-all placeholder:text-gray-400 bg-white border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-50';

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
    onChange([
      ...bills,
      { id: generateId(), name: form.name.trim(), amount, frequency: form.frequency, dueDate: form.dueDate || undefined },
    ]);
    setForm(null);
  }

  const canSave = !!form?.name.trim() && parseFloat(form?.amount ?? '') > 0;

  return (
    <OnboardingStepCard
      step={3}
      totalSteps={9}
      title="Your regular bills"
      subtitle="Rent, electricity, phone — things you pay every period."
      hint="We'll track these automatically so they never catch you off guard."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      nextLabel={bills.length > 0 ? 'Continue' : 'Skip for now'}
    >
      <div className="space-y-3">
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
              style={{ background: '#F5F3FF', border: '1px solid #DDD6FE' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#EDE9FE' }}
              >
                <FileText className="w-4 h-4" style={{ color: '#8B5CF6' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: '#111827' }}>{b.name}</p>
                <p className="text-xs" style={{ color: '#6B7280' }}>
                  {currencySymbol}{b.amount.toLocaleString()} · {freqLabel(b.frequency)}
                </p>
              </div>
              <button
                onClick={() => onChange(bills.filter((x) => x.id !== b.id))}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-red-50"
                style={{ color: '#D1D5DB' }}
              >
                <X className="w-4 h-4" />
              </button>
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
              className="rounded-3xl p-4 space-y-3 bg-white"
              style={{ border: '1.5px solid #DDD6FE' }}
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm" style={{ color: '#111827' }}>New Bill</p>
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
                placeholder="e.g. Origin Energy"
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
                  Next due date (optional)
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setField('dueDate', e.target.value)}
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
                    ? { background: 'linear-gradient(135deg, #8B5CF6, #6C63FF)', boxShadow: '0 3px 14px rgba(139,92,246,0.25)' }
                    : { background: '#F3F4F6', color: '#9CA3AF' }
                }
              >
                {canSave && <Check className="w-4 h-4" />}
                Add Bill
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preset chips */}
        {!form && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>
              Common Bills
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESETS.map((p) => (
                <motion.button
                  key={p.name}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => startAdd(p)}
                  className="px-3.5 py-2 rounded-full text-sm font-medium transition-all bg-white hover:border-purple-300"
                  style={{ border: '1px solid #E5E7EB', color: '#374151' }}
                >
                  {p.name}
                </motion.button>
              ))}
            </div>
            <button
              onClick={() => startAdd()}
              className="flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ color: '#8B5CF6' }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6' }}
              >
                <span className="text-xs font-black leading-none">+</span>
              </span>
              Add another bill
            </button>
          </motion.div>
        )}
      </div>
    </OnboardingStepCard>
  );
}
