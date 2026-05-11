'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Subscription, Frequency } from '@/types/budget';
import { OnboardingStepCard } from './OnboardingStepCard';
import { generateId } from '@/lib/utils';
import { freqLabel } from '@/lib/budgetCalculations';

const POPULAR = [
  { name: 'Netflix', icon: '🎬' },
  { name: 'Spotify', icon: '🎵' },
  { name: 'Disney+', icon: '🏰' },
  { name: 'YouTube Premium', icon: '▶️' },
  { name: 'Apple / iCloud', icon: '🍎' },
  { name: 'Microsoft 365', icon: '💼' },
  { name: 'Google One', icon: '☁️' },
  { name: 'Gym Membership', icon: '🏋️' },
  { name: 'Gaming', icon: '🎮' },
  { name: 'Other Subscription', icon: '📱' },
];

const FREQS: { value: Frequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const inputCls = "w-full px-4 py-3.5 rounded-2xl text-white text-sm focus:outline-none transition-all placeholder:text-white/30 bg-white/10 border border-white/15 focus:border-[#7DD3FC]/70";

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
    onChange([...subscriptions, { id: generateId(), name: form.name.trim(), amount, frequency: form.frequency, renewalDate: form.renewalDate || undefined }]);
    setForm(null);
  }

  const canSave = !!form?.name.trim() && parseFloat(form?.amount ?? '') > 0;

  return (
    <OnboardingStepCard
      step={4}
      totalSteps={9}
      title="Subscriptions & memberships"
      subtitle="The small charges that add up. Easy to forget — we'll help track them."
      hint="Subscriptions are often the silent budget killers. Let's make them visible."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      nextLabel={subscriptions.length > 0 ? 'Continue →' : 'Skip for now'}
    >
      <div className="space-y-4">
        <AnimatePresence>
          {subscriptions.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: 'rgba(125,211,252,0.1)', border: '1px solid rgba(125,211,252,0.25)' }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(125,211,252,0.2)' }}>
                <span className="text-base">📱</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{s.name}</p>
                <p className="text-xs text-white/50">{currencySymbol}{s.amount.toLocaleString()} · {freqLabel(s.frequency)}</p>
              </div>
              <button
                onClick={() => onChange(subscriptions.filter((x) => x.id !== s.id))}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-all text-lg leading-none flex-shrink-0"
              >x</button>
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {form && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              className="rounded-3xl p-4 space-y-3"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(125,211,252,0.4)' }}
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-white text-sm">New Subscription</p>
                <button onClick={() => setForm(null)} className="w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:bg-white/10 text-lg leading-none">x</button>
              </div>
              <input
                autoFocus
                type="text"
                placeholder="e.g. Netflix"
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
                <label className="block text-[11px] font-medium text-white/40 mb-1.5">Next renewal date (optional)</label>
                <input
                  type="date"
                  value={form.renewalDate}
                  onChange={(e) => setField('renewalDate', e.target.value)}
                  className={inputCls}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <motion.button
                whileTap={{ scale: canSave ? 0.97 : 1 }}
                onClick={save}
                disabled={!canSave}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white"
                style={canSave ? { background: 'linear-gradient(135deg,#6C63FF,#7DD3FC)', boxShadow: '0 3px 16px rgba(108,99,255,0.35)' } : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}
              >
                Add Subscription
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {!form && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-3">Popular Services</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {POPULAR.map((p) => (
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
              style={{ color: '#7DD3FC' }}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black" style={{ background: 'rgba(125,211,252,0.2)', color: '#7DD3FC' }}>+</span>
              Add custom subscription
            </button>
          </motion.div>
        )}
      </div>
    </OnboardingStepCard>
  );
}
