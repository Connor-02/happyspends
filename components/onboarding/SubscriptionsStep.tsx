'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, X, Check } from 'lucide-react';
import type { Subscription, Frequency } from '@/types/budget';
import { OnboardingStepCard } from './OnboardingStepCard';
import { generateId } from '@/lib/utils';
import { freqLabel } from '@/lib/budgetCalculations';

const POPULAR = [
  { name: 'Netflix' },
  { name: 'Spotify' },
  { name: 'Disney+' },
  { name: 'YouTube Premium' },
  { name: 'Apple / iCloud' },
  { name: 'Microsoft 365' },
  { name: 'Google One' },
  { name: 'Gym Membership' },
  { name: 'Gaming' },
  { name: 'Other Subscription' },
];

const FREQS: { value: Frequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const inputCls =
  'w-full px-4 py-3.5 rounded-2xl text-sm focus:outline-none transition-all placeholder:text-gray-400 bg-white border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-50';

interface SubscriptionsStepProps {
  subscriptions: Subscription[];
  onChange: (subs: Subscription[]) => void;
  currencySymbol: string;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

interface FormState {
  name: string;
  amount: string;
  frequency: Frequency;
  renewalDate: string;
}

const emptyForm = (): FormState => ({ name: '', amount: '', frequency: 'monthly', renewalDate: '' });

export function SubscriptionsStep({ subscriptions, onChange, currencySymbol, onNext, onBack, onSkip }: SubscriptionsStepProps) {
  const [form, setForm] = useState<FormState | null>(null);

  function startAdd(preset?: (typeof POPULAR)[number]) {
    setForm(preset ? { ...emptyForm(), name: preset.name } : emptyForm());
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  function save() {
    if (!form?.name.trim() || !form.amount) return;
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) return;
    onChange([
      ...subscriptions,
      { id: generateId(), name: form.name.trim(), amount, frequency: form.frequency, renewalDate: form.renewalDate || undefined },
    ]);
    setForm(null);
  }

  const canSave = !!form?.name.trim() && parseFloat(form?.amount ?? '') > 0;

  return (
    <OnboardingStepCard
      step={4}
      totalSteps={9}
      title="Subscriptions & memberships"
      subtitle="Streaming services, apps, gym — the things that quietly drain your account."
      hint="These renewals are easy to forget. We'll remind you before they hit."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      nextLabel={subscriptions.length > 0 ? 'Continue' : 'Skip for now'}
    >
      <div className="space-y-3">
        <AnimatePresence>
          {subscriptions.map((sub, i) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#DBEAFE' }}
              >
                <CreditCard className="w-4 h-4" style={{ color: '#60A5FA' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: '#111827' }}>{sub.name}</p>
                <p className="text-xs" style={{ color: '#6B7280' }}>
                  {currencySymbol}{sub.amount.toLocaleString()} · {freqLabel(sub.frequency)}
                </p>
              </div>
              <button
                onClick={() => onChange(subscriptions.filter((s) => s.id !== sub.id))}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-red-50"
                style={{ color: '#D1D5DB' }}
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {form && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              className="rounded-3xl p-4 space-y-3 bg-white"
              style={{ border: '1.5px solid #BFDBFE' }}
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm" style={{ color: '#111827' }}>New Subscription</p>
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
                placeholder="e.g. Netflix"
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
                  Renewal date (optional)
                </label>
                <input
                  type="date"
                  value={form.renewalDate}
                  onChange={(e) => setField('renewalDate', e.target.value)}
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
                    ? { background: 'linear-gradient(135deg, #60A5FA, #3B82F6)', boxShadow: '0 3px 14px rgba(96,165,250,0.25)' }
                    : { background: '#F3F4F6', color: '#9CA3AF' }
                }
              >
                {canSave && <Check className="w-4 h-4" />}
                Add Subscription
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {!form && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>
              Popular Services
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {POPULAR.map((p) => (
                <motion.button
                  key={p.name}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => startAdd(p)}
                  className="px-3.5 py-2 rounded-full text-sm font-medium transition-all bg-white hover:border-blue-300"
                  style={{ border: '1px solid #E5E7EB', color: '#374151' }}
                >
                  {p.name}
                </motion.button>
              ))}
            </div>
            <button
              onClick={() => startAdd()}
              className="flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ color: '#60A5FA' }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(96,165,250,0.12)', color: '#60A5FA' }}
              >
                <span className="text-xs font-black leading-none">+</span>
              </span>
              Add another subscription
            </button>
          </motion.div>
        )}
      </div>
    </OnboardingStepCard>
  );
}
