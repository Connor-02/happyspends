'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Check, X } from 'lucide-react';
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
    >
      <div className="space-y-4">
        {/* Running total */}
        {totalSet > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between rounded-2xl px-4 py-3"
            style={{ background: 'rgba(236,72,153,0.07)', border: '1px solid rgba(236,72,153,0.18)' }}
          >
            <p className="text-sm font-semibold" style={{ color: '#6B7280' }}>Total estimated spending</p>
            <p className="text-sm font-extrabold tabular-nums" style={{ color: '#EC4899' }}>
              {currencySymbol}{totalSet.toLocaleString('en-AU', { minimumFractionDigits: 0 })}
              <span className="font-normal text-xs" style={{ color: '#9CA3AF' }}>/{period[0]}</span>
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
              className="rounded-2xl p-4 bg-white"
              style={
                cat.amount > 0
                  ? { border: '1.5px solid #FBCFE8' }
                  : { border: '1px solid #E5E7EB' }
              }
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: cat.amount > 0 ? 'rgba(236,72,153,0.12)' : '#F9FAFB' }}
                  >
                    <ShoppingCart className="w-4 h-4" style={{ color: cat.amount > 0 ? '#EC4899' : '#9CA3AF' }} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#111827' }}>{cat.name}</span>
                </div>
                {cat.amount > 0 && (
                  <span className="text-sm font-extrabold tabular-nums" style={{ color: '#EC4899' }}>
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
                      <span
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold"
                        style={{ color: '#9CA3AF' }}
                      >
                        {currencySymbol}
                      </span>
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
                        className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all bg-white border border-pink-300 focus:ring-2 focus:ring-pink-50 placeholder:text-gray-300"
                        style={{ color: '#111827' }}
                      />
                    </div>
                    <button
                      onClick={() => saveCustom(cat.id)}
                      className="px-4 py-2.5 rounded-xl font-bold text-sm text-white flex items-center"
                      style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)' }}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setCustomEdit(null); setCustomValue(''); }}
                      className="px-3 py-2.5 rounded-xl text-sm font-bold flex items-center"
                      style={{ background: '#F3F4F6', color: '#9CA3AF' }}
                    >
                      <X className="w-4 h-4" />
                    </button>
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
                            ? { background: 'linear-gradient(135deg, #EC4899, #8B5CF6)', color: 'white' }
                            : { background: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB' }
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
                          ? { background: 'linear-gradient(135deg, #EC4899, #8B5CF6)', color: 'white' }
                          : { background: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB' }
                      }
                    >
                      {cat.amount > 0 && !PRESET_AMOUNTS.includes(cat.amount) ? `${currencySymbol}${cat.amount}` : 'Custom'}
                    </button>
                    {cat.amount > 0 && (
                      <button
                        onClick={() => setAmount(cat.id, 0)}
                        className="px-2.5 py-1.5 rounded-full text-[10px] font-semibold"
                        style={{ color: '#9CA3AF' }}
                      >
                        Clear
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </OnboardingStepCard>
  );
}
