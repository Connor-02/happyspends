'use client';
import { useState } from 'react';
import type { SpendingCategoryItem } from '@/types/budget';
import type { OnboardingBudgetPeriod } from '@/types/budget';
import { OnboardingStepCard } from './OnboardingStepCard';
import { periodLabel } from '@/lib/budgetCalculations';

const PRESET_AMOUNTS = [25, 50, 100, 200];

interface SpendingStepProps {
  spendingCategories: SpendingCategoryItem[];
  onChange: (cats: SpendingCategoryItem[]) => void;
  currencySymbol: string;
  budgetPeriod: OnboardingBudgetPeriod;
  onNext: () => void;
  onBack: () => void;
}

export function SpendingStep({
  spendingCategories,
  onChange,
  currencySymbol,
  budgetPeriod,
  onNext,
  onBack,
}: SpendingStepProps) {
  const [customEdit, setCustomEdit] = useState<string | null>(null);
  const [customValue, setCustomValue] = useState('');

  function setAmount(id: string, amount: number) {
    onChange(spendingCategories.map((c) => (c.id === id ? { ...c, amount } : c)));
  }

  function openCustom(cat: SpendingCategoryItem) {
    setCustomEdit(cat.id);
    setCustomValue(cat.amount > 0 ? cat.amount.toString() : '');
  }

  function saveCustom(id: string) {
    const val = parseFloat(customValue);
    if (!isNaN(val) && val >= 0) {
      setAmount(id, val);
    }
    setCustomEdit(null);
    setCustomValue('');
  }

  const totalSet = spendingCategories.reduce((s, c) => s + c.amount, 0);
  const period = periodLabel(budgetPeriod);

  return (
    <OnboardingStepCard
      step={6}
      totalSteps={10}
      title="Everyday spending"
      subtitle={`How much do you roughly spend per ${period} in each area? Tap a quick amount or enter your own.`}
      onNext={onNext}
      onBack={onBack}
      nextLabel="Continue →"
    >
      <div className="space-y-4">
        {totalSet > 0 && (
          <div className="bg-pink-50 dark:bg-pink-900/20 rounded-2xl px-4 py-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-pink-700 dark:text-pink-300">
              Total estimated spending
            </p>
            <p className="text-sm font-extrabold text-pink-600 dark:text-pink-400 tabular-nums">
              {currencySymbol}{totalSet.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/{period}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {spendingCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="font-bold text-sm text-gray-800 dark:text-white">{cat.name}</span>
                </div>
                {cat.amount > 0 && (
                  <span className="text-sm font-extrabold text-pink-600 dark:text-pink-400 tabular-nums">
                    {currencySymbol}{cat.amount}/{period[0]}
                  </span>
                )}
              </div>

              {customEdit === cat.id ? (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">
                      {currencySymbol}
                    </span>
                    <input
                      autoFocus
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="1"
                      placeholder="Enter amount"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveCustom(cat.id)}
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl border-2 border-pink-400 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none text-sm"
                    />
                  </div>
                  <button
                    onClick={() => saveCustom(cat.id)}
                    className="px-4 py-2.5 rounded-xl bg-pink-500 text-white font-bold text-sm active:scale-95 transition-transform"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => { setCustomEdit(null); setCustomValue(''); }}
                    className="px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold text-sm"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(cat.id, amt)}
                      className={`px-3.5 py-2 rounded-full text-sm font-bold transition-all active:scale-95 ${
                        cat.amount === amt
                          ? 'bg-pink-500 text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {currencySymbol}{amt}
                    </button>
                  ))}
                  <button
                    onClick={() => openCustom(cat)}
                    className={`px-3.5 py-2 rounded-full text-sm font-bold transition-all active:scale-95 ${
                      cat.amount > 0 && !PRESET_AMOUNTS.includes(cat.amount)
                        ? 'bg-pink-500 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {cat.amount > 0 && !PRESET_AMOUNTS.includes(cat.amount)
                      ? `${currencySymbol}${cat.amount}`
                      : 'Custom'}
                  </button>
                  {cat.amount > 0 && (
                    <button
                      onClick={() => setAmount(cat.id, 0)}
                      className="px-3 py-2 rounded-full text-xs font-semibold bg-gray-50 dark:bg-gray-700 text-gray-400 active:scale-95 transition-transform"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center px-4">
          Don&apos;t worry about being exact — you can update these anytime. Leave categories at $0 to skip them.
        </p>
      </div>
    </OnboardingStepCard>
  );
}
