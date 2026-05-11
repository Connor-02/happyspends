'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SpendingCategoryItem } from '@/types/budget';
import type { OnboardingBudgetPeriod } from '@/types/budget';
import { OnboardingStepCard } from './OnboardingStepCard';
import { periodLabel } from '@/lib/budgetCalculations';

const PRESET_AMOUNTS = [50, 100, 200, 300];

interface SpendingStepProps {
  spendingCategories: SpendingCategoryItem[];
  onChange: (cats: SpendingCategoryItem[]) => void;
  currencySymbol: string;
  budgetPeriod: OnboardingBudgetPeriod;
  onNext: () => void;
  onBack: () => void;
}

export function SpendingStep({ spendingCategories, onChange, currencySymbol, budgetPeriod, onNext, onBack }: SpendingStepProps) {
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
    if (!isNaN(val) && val >= 0) setAmount(id, val);
    setCustomEdit(null);
    setCustomValue('');
  }

  const totalSet = spendingCategories.reduce((s, c) => s + c.amount, 0);
  const period = periodLabel(budgetPeriod);

  return (
    <OnboardingStepCard
      step={5}
      totalSteps={9}
      title="Everyday spending"
      subtitle={`How much do you roughly spend per ${period} in each area?`}
      hint="Your dashboard will update automatically as you add transactions. Just give us rough estimates for now."
      onNext={onNext}
      onBack={onBack}
      nextLabel="Continue â†’"
    >
      <div className="space-y-4">
        {/* Running total */}
        {totalSet > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between rounded-2xl px-4 py-3"
            style={{ background: 'rgba(255,95,162,0.12)', border: '1px solid rgba(255,95,162,0.25)' }}
          >
            <p className="text-sm font-semibold text-white/80">Total estimated spending</p>
            <p className="text-sm font-extrabold tabular-nums" style={{ color: '#FF5FA2' }}>
              {currencySymbol}{totalSet.toLocaleString('en-AU', { minimumFractionDigits: 0 })}<span className="text-white/40 font-normal text-xs">/{period[0]}</span>
            </p>
          </motion.div>
        )}

        {/* Category cards */}
        <div className="space-y-2.5">
          {spendingCategories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-2xl p-4"
              style={
                cat.amount > 0
                  ? { background: 'rgba(255,95,162,0.08)', border: '1px solid rgba(255,95,162,0.2)' }
                  : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: cat.amount > 0 ? 'rgba(255,95,162,0.2)' : 'rgba(255,255,255,0.08)' }}>
                    <span className="text-base">{cat.icon}</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{cat.name}</span>
                </div>
                {cat.amount > 0 && (
                  <span className="text-sm font-extrabold tabular-nums" style={{ color: '#FF5FA2' }}>
                    {currencySymbol}{cat.amount}/{period[0]}
                  </span>
                )}
              </div>

              <AnimatePresence mode="wait">
                {customEdit === cat.id ? (
                  <motion.div
                    key="custom"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-2"
                  >
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm font-semibold">{currencySymbol}</span>
                      <input
                        autoFocus
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="1"
                        placeholder="Amount"
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveCustom(cat.id)}
                        className="w-full pl-8 pr-3 py-2.5 rounded-xl text-white text-sm focus:outline-none transition-all bg-white/10 border border-[#FF5FA2]/50 placeholder:text-white/30"
                      />
                    </div>
                    <button
                      onClick={() => saveCustom(cat.id)}
                      className="px-4 py-2.5 rounded-xl font-bold text-sm text-white"
                      style={{ background: 'linear-gradient(135deg,#FF5FA2,#9B6DFF)' }}
                    >âœ“</button>
                    <button
                      onClick={() => { setCustomEdit(null); setCustomValue(''); }}
                      className="px-3 py-2.5 rounded-xl text-white/50 text-sm font-bold"
                      style={{ background: 'rgba(255,255,255,0.08)' }}
                    >Ã—</button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="chips"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-1.5 flex-wrap"
                  >
                    {PRESET_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setAmount(cat.id, cat.amount === amt ? 0 : amt)}
                        className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                        style={
                          cat.amount === amt
                            ? { background: 'linear-gradient(135deg,#FF5FA2,#9B6DFF)', color: 'white' }
                            : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }
                        }
                      >
                        {currencySymbol}{amt}
                      </button>
                    ))}
                    <button
                      onClick={() => openCustom(cat)}
                      className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                      style={
                        cat.amount > 0 && !PRESET_AMOUNTS.includes(cat.amount)
                          ? { background: 'linear-gradient(135deg,#FF5FA2,#9B6DFF)', color: 'white' }
                          : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }
                      }
                    >
                      {cat.amount > 0 && !PRESET_AMOUNTS.includes(cat.amount) ? `${currencySymbol}${cat.amount}` : 'Custom'}
                    </button>
                    {cat.amount > 0 && (
                      <button
                        onClick={() => setAmount(cat.id, 0)}
                        className="px-2.5 py-1.5 rounded-full text-[10px] font-semibold text-white/30"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      >Clear</button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-white/30 text-center px-4">
          Estimates only â€” you can update these anytime from the Budget screen.
        </p>
      </div>
    </OnboardingStepCard>
  );
}
