'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BudgetSetup, OnboardingBudgetPeriod } from '@/types/budget';
import { OnboardingStepCard } from './OnboardingStepCard';

const CURRENCIES = [
  { code: 'AUD', symbol: '$', flag: 'ðŸ‡¦ðŸ‡º', label: 'Australian Dollar' },
  { code: 'USD', symbol: '$', flag: 'ðŸ‡ºðŸ‡¸', label: 'US Dollar' },
  { code: 'NZD', symbol: '$', flag: 'ðŸ‡³ðŸ‡¿', label: 'New Zealand Dollar' },
  { code: 'GBP', symbol: 'Â£', flag: 'ðŸ‡¬ðŸ‡§', label: 'British Pound' },
  { code: 'EUR', symbol: 'â‚¬', flag: 'ðŸ‡ªðŸ‡º', label: 'Euro' },
  { code: 'CAD', symbol: '$', flag: 'ðŸ‡¨ðŸ‡¦', label: 'Canadian Dollar' },
  { code: 'SGD', symbol: '$', flag: 'ðŸ‡¸ðŸ‡¬', label: 'Singapore Dollar' },
  { code: 'JPY', symbol: 'Â¥', flag: 'ðŸ‡¯ðŸ‡µ', label: 'Japanese Yen' },
  { code: 'INR', symbol: 'â‚¹', flag: 'ðŸ‡®ðŸ‡³', label: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', flag: 'ðŸ‡§ðŸ‡·', label: 'Brazilian Real' },
];

const PERIODS: { value: OnboardingBudgetPeriod; label: string; desc: string; icon: string }[] = [
  { value: 'weekly', label: 'Weekly', desc: 'Every 7 days', icon: '7' },
  { value: 'fortnightly', label: 'Fortnightly', desc: 'Every 2 weeks', icon: '14' },
  { value: 'monthly', label: 'Monthly', desc: 'Once a month', icon: '30' },
];

// Styled input class
const inputCls = "w-full px-4 py-4 rounded-2xl text-white text-base focus:outline-none transition-all placeholder:text-white/30"
  + " bg-white/10 border border-white/15 focus:border-[#FF5FA2]/70 focus:bg-white/[0.12]";

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
      subtitle="Quick setup â€” takes less than a minute."
      hint="We use this to personalise your dashboard and calculate your budget accurately."
      onNext={onNext}
      onBack={onBack}
      nextDisabled={!setup.name.trim()}
    >
      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-white/55 uppercase tracking-wider mb-2">
            What should we call you?
          </label>
          <input
            type="text"
            autoComplete="given-name"
            placeholder="e.g. Alex"
            value={setup.name}
            onChange={(e) => set('name', e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Currency */}
        <div>
          <label className="block text-xs font-semibold text-white/55 uppercase tracking-wider mb-2">
            Your currency
          </label>
          <button
            onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
            className="w-full px-4 py-4 rounded-2xl flex items-center justify-between text-left transition-all"
            style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <span className="flex items-center gap-3">
              <span className="text-xl">{selected.flag}</span>
              <span className="text-white font-semibold">{selected.label}</span>
              <span className="text-white/40 text-sm">{selected.symbol}</span>
            </span>
            <motion.span
              animate={{ rotate: showCurrencyPicker ? 180 : 0 }}
              className="text-white/40 text-lg"
            >
              â–¾
            </motion.span>
          </button>

          <AnimatePresence>
            {showCurrencyPicker && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden mt-1 rounded-2xl"
                style={{ background: 'rgba(26,14,58,0.95)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleCurrencyChange(c.code)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="text-lg">{c.flag}</span>
                    <span className="text-white/90 text-sm font-medium flex-1">{c.label}</span>
                    <span className="text-white/40 text-xs">{c.code}</span>
                    {c.code === setup.currency && <span className="text-[#FF5FA2] text-sm">âœ“</span>}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Budget period */}
        <div>
          <label className="block text-xs font-semibold text-white/55 uppercase tracking-wider mb-2">
            Budget cycle
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PERIODS.map((p) => {
              const active = setup.budgetPeriod === p.value;
              return (
                <motion.button
                  key={p.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => set('budgetPeriod', p.value)}
                  className="py-4 px-2 rounded-2xl text-center transition-all"
                  style={
                    active
                      ? { background: 'linear-gradient(135deg,rgba(255,95,162,0.25) 0%,rgba(155,109,255,0.25) 100%)', border: '1.5px solid rgba(255,95,162,0.55)' }
                      : { background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.12)' }
                  }
                >
                  <p className="text-2xl font-black mb-0.5" style={active ? { background: 'linear-gradient(90deg,#FF5FA2,#9B6DFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } : { color: 'rgba(255,255,255,0.7)' }}>
                    {p.icon}
                  </p>
                  <p className={`text-xs font-bold ${active ? 'text-white' : 'text-white/60'}`}>{p.label}</p>
                  <p className="text-[10px] text-white/35 mt-0.5">{p.desc}</p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Start date */}
        <div>
          <label className="block text-xs font-semibold text-white/55 uppercase tracking-wider mb-2">
            Budget starts on
          </label>
          <input
            type="date"
            value={setup.startDate}
            onChange={(e) => set('startDate', e.target.value)}
            className={inputCls}
            style={{ colorScheme: 'dark' }}
          />
          <p className="text-[11px] text-white/35 mt-1.5">You can always change this later.</p>
        </div>

        {/* Rollover (optional) */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <button
            onClick={() => setShowRollover(!showRollover)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all text-xs font-bold"
              style={showRollover ? { background: 'linear-gradient(135deg,#FF5FA2,#9B6DFF)', color: 'white' } : { border: '1.5px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.5)' }}
            >
              {showRollover ? 'âœ“' : '+'}
            </div>
            <span className="text-sm text-white/65 font-medium">I have money left over from before</span>
            <span className="text-[10px] text-white/35 ml-auto">optional</span>
          </button>

          <AnimatePresence>
            {showRollover && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-2">
                  <p className="text-xs text-white/40 mb-2">Any savings that carry forward into this period.</p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-semibold text-sm">{selected.symbol}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={setup.rollover || ''}
                      onChange={(e) => set('rollover', parseFloat(e.target.value) || 0)}
                      className={inputCls + " pl-10"}
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
