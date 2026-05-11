'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, DollarSign, Calendar, ChevronDown, PlusCircle, Check } from 'lucide-react';
import type { BudgetSetup, OnboardingBudgetPeriod } from '@/types/budget';
import { OnboardingStepCard } from './OnboardingStepCard';

const CURRENCIES = [
  { code: 'AUD', symbol: '$', label: 'Australian Dollar' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'NZD', symbol: '$', label: 'New Zealand Dollar' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'CAD', symbol: '$', label: 'Canadian Dollar' },
  { code: 'SGD', symbol: '$', label: 'Singapore Dollar' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', label: 'Brazilian Real' },
];

const PERIODS: { value: OnboardingBudgetPeriod; label: string; desc: string }[] = [
  { value: 'weekly', label: 'Weekly', desc: 'Every 7 days' },
  { value: 'fortnightly', label: 'Fortnightly', desc: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly', desc: 'Once a month' },
];

const inputCls =
  'w-full px-4 py-3.5 rounded-2xl text-sm focus:outline-none transition-all placeholder:text-gray-400 bg-white border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50';

interface SetupStepProps {
  setup: BudgetSetup;
  onChange: (setup: BudgetSetup) => void;
  onNext: () => void;
  onBack: () => void;
}

export function SetupStep({ setup, onChange, onNext, onBack }: SetupStepProps) {
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showRollover, setShowRollover] = useState(setup.rollover > 0);

  const set = (key: keyof BudgetSetup, value: string | number) =>
    onChange({ ...setup, [key]: value });

  function handleCurrencyChange(code: string) {
    const cur = CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
    onChange({ ...setup, currency: cur.code, currencySymbol: cur.symbol });
    setShowCurrencyPicker(false);
  }

  const selected = CURRENCIES.find((c) => c.code === setup.currency) ?? CURRENCIES[0];

  return (
    <OnboardingStepCard
      step={1}
      totalSteps={9}
      title="Let's get the basics"
      subtitle="Quick setup — takes less than a minute."
      hint="We use this to personalise your dashboard and calculate your budget accurately."
      onNext={onNext}
      onBack={onBack}
      nextDisabled={!setup.name.trim()}
    >
      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6B7280' }}>
            <Wallet className="w-3.5 h-3.5" style={{ color: '#EC4899' }} />
            What should we call you?
          </label>
          <input
            type="text"
            autoComplete="given-name"
            placeholder="e.g. Alex"
            value={setup.name}
            onChange={(e) => set('name', e.target.value)}
            className={inputCls}
            style={{ color: '#111827' }}
          />
        </div>

        {/* Currency */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6B7280' }}>
            <DollarSign className="w-3.5 h-3.5" style={{ color: '#EC4899' }} />
            Your currency
          </label>
          <button
            onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
            className="w-full px-4 py-3.5 rounded-2xl flex items-center justify-between text-left transition-all bg-white border border-gray-200 hover:border-pink-300"
          >
            <span className="flex items-center gap-2.5">
              <span className="text-sm font-bold" style={{ color: '#6B7280' }}>{selected.code}</span>
              <span className="text-sm font-semibold" style={{ color: '#111827' }}>{selected.label}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-lg font-mono" style={{ background: '#F3F4F6', color: '#6B7280' }}>{selected.symbol}</span>
            </span>
            <motion.span animate={{ rotate: showCurrencyPicker ? 180 : 0 }}>
              <ChevronDown className="w-4 h-4" style={{ color: '#9CA3AF' }} />
            </motion.span>
          </button>

          <AnimatePresence>
            {showCurrencyPicker && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-1 rounded-2xl bg-white border border-gray-200 shadow-lg"
              >
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleCurrencyChange(c.code)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-xs font-bold w-8" style={{ color: '#9CA3AF' }}>{c.code}</span>
                    <span className="text-sm font-medium flex-1" style={{ color: '#374151' }}>{c.label}</span>
                    <span className="text-xs font-mono" style={{ color: '#6B7280' }}>{c.symbol}</span>
                    {c.code === setup.currency && (
                      <Check className="w-4 h-4" style={{ color: '#EC4899' }} />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Budget period */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6B7280' }}>
            <Calendar className="w-3.5 h-3.5" style={{ color: '#EC4899' }} />
            Budget cycle
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PERIODS.map((p) => {
              const active = setup.budgetPeriod === p.value;
              return (
                <motion.button
                  key={p.value}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => set('budgetPeriod', p.value)}
                  className="py-3.5 px-2 rounded-2xl text-center transition-all"
                  style={
                    active
                      ? {
                          background: 'linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(139,92,246,0.08) 100%)',
                          border: '1.5px solid #EC4899',
                        }
                      : {
                          background: '#FFFFFF',
                          border: '1.5px solid #E5E7EB',
                        }
                  }
                >
                  <p
                    className="text-xs font-bold mb-0.5"
                    style={active ? { color: '#EC4899' } : { color: '#374151' }}
                  >
                    {p.label}
                  </p>
                  <p className="text-[10px]" style={{ color: '#9CA3AF' }}>{p.desc}</p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Start date */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6B7280' }}>
            <Calendar className="w-3.5 h-3.5" style={{ color: '#EC4899' }} />
            Budget starts on
          </label>
          <input
            type="date"
            value={setup.startDate}
            onChange={(e) => set('startDate', e.target.value)}
            className={inputCls}
            style={{ color: '#111827', colorScheme: 'light' }}
          />
          <p className="text-xs mt-1.5" style={{ color: '#9CA3AF' }}>You can always change this later.</p>
        </div>

        {/* Rollover (optional) */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid #E5E7EB', background: '#FFFFFF' }}
        >
          <button
            onClick={() => setShowRollover(!showRollover)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
          >
            <PlusCircle
              className="w-5 h-5 flex-shrink-0 transition-colors"
              style={{ color: showRollover ? '#EC4899' : '#9CA3AF' }}
            />
            <span className="text-sm font-medium flex-1" style={{ color: '#374151' }}>
              I have money left over from before
            </span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: '#F3F4F6', color: '#9CA3AF' }}
            >
              Optional
            </span>
          </button>

          <AnimatePresence>
            {showRollover && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-1 border-t border-gray-100">
                  <p className="text-xs mb-2" style={{ color: '#9CA3AF' }}>
                    Any savings that carry forward into this period.
                  </p>
                  <div className="relative">
                    <span
                      className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-sm"
                      style={{ color: '#9CA3AF' }}
                    >
                      {selected.symbol}
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={setup.rollover || ''}
                      onChange={(e) => set('rollover', parseFloat(e.target.value) || 0)}
                      className={inputCls + ' pl-9'}
                      style={{ color: '#111827' }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </OnboardingStepCard>
  );
}
