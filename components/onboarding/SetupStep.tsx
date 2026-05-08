'use client';
import { useState } from 'react';
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

const PERIODS: { value: OnboardingBudgetPeriod; label: string; desc: string; icon: string }[] = [
  { value: 'weekly', label: 'Weekly', desc: 'Every 7 days', icon: '📅' },
  { value: 'fortnightly', label: 'Fortnightly', desc: 'Every 2 weeks', icon: '🗓️' },
  { value: 'monthly', label: 'Monthly', desc: 'Once a month', icon: '📆' },
];

interface SetupStepProps {
  setup: BudgetSetup;
  onChange: (setup: BudgetSetup) => void;
  onNext: () => void;
  onBack: () => void;
}

export function SetupStep({ setup, onChange, onNext, onBack }: SetupStepProps) {
  const [showRollover, setShowRollover] = useState(setup.rollover > 0);

  const set = (key: keyof BudgetSetup, value: string | number) =>
    onChange({ ...setup, [key]: value });

  function handleCurrencyChange(code: string) {
    const cur = CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
    onChange({ ...setup, currency: cur.code, currencySymbol: cur.symbol });
  }

  const sym = CURRENCIES.find((c) => c.code === setup.currency)?.symbol ?? '$';

  return (
    <OnboardingStepCard
      step={2}
      totalSteps={10}
      title="The basics"
      subtitle="Quick setup — takes less than a minute."
      onNext={onNext}
      onBack={onBack}
      nextDisabled={!setup.name.trim()}
    >
      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
            What should we call you? 👋
          </label>
          <input
            type="text"
            autoComplete="given-name"
            placeholder="e.g. Alex"
            value={setup.name}
            onChange={(e) => set('name', e.target.value)}
            className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base focus:outline-none focus:border-pink-400 transition-colors"
          />
          <p className="text-xs text-gray-400 mt-1.5">We&apos;ll personalise your dashboard with this.</p>
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
            Your currency 💱
          </label>
          <select
            value={setup.currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base focus:outline-none focus:border-pink-400"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} — {c.label} ({c.code})
              </option>
            ))}
          </select>
        </div>

        {/* Budget period */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">
            Budget cycle 📅
          </label>
          <p className="text-xs text-gray-400 mb-3">
            How often do you want to track your budget? Most people use monthly.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {PERIODS.map((p) => {
              const active = setup.budgetPeriod === p.value;
              return (
                <button
                  key={p.value}
                  onClick={() => set('budgetPeriod', p.value)}
                  className={`py-3.5 px-2 rounded-2xl border-2 text-center transition-all ${
                    active
                      ? 'border-pink-400 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="text-xl mb-0.5">{p.icon}</div>
                  <p
                    className={`text-sm font-bold ${
                      active ? 'text-pink-600 dark:text-pink-400' : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {p.label}
                  </p>
                  <p className="text-xs text-gray-400">{p.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start date */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
            Budget starts on 🗓️
          </label>
          <input
            type="date"
            value={setup.startDate}
            onChange={(e) => set('startDate', e.target.value)}
            className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base focus:outline-none focus:border-pink-400"
          />
          <p className="text-xs text-gray-400 mt-1.5">You can always change this later.</p>
        </div>

        {/* Rollover */}
        <div>
          <button
            onClick={() => setShowRollover(!showRollover)}
            className="flex items-center gap-2 text-sm text-pink-500 font-semibold"
          >
            <span
              className={`w-5 h-5 rounded-full border-2 border-pink-400 flex items-center justify-center text-pink-500 text-xs transition-all ${
                showRollover ? 'bg-pink-400 text-white' : ''
              }`}
            >
              {showRollover ? '−' : '+'}
            </span>
            <span>I have money left over from before (optional)</span>
          </button>
          {showRollover && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-2">
                Any money you already have available to spend this period — like savings that carry forward.
              </p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                  {sym}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={setup.rollover || ''}
                  onChange={(e) => set('rollover', parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-pink-400"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </OnboardingStepCard>
  );
}
