'use client';
import { motion } from 'framer-motion';
import type { OnboardingState } from '@/types/budget';
import { computeOnboardingReview, periodLabel } from '@/lib/budgetCalculations';
import { OnboardingStepCard } from './OnboardingStepCard';

interface ReviewStepProps {
  state: OnboardingState;
  onNext: () => void;
  onBack: () => void;
}

function fmt(sym: string, amount: number): string {
  return `${sym}${amount.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ReviewStep({ state, onNext, onBack }: ReviewStepProps) {
  const sym = state.setup.currencySymbol;
  const period = periodLabel(state.setup.budgetPeriod);
  const r = computeOnboardingReview(state);

  const rows: { label: string; value: number; color: string; icon: string }[] = [
    { label: 'Income', value: r.totalIncome, color: '#4ADE80', icon: 'ðŸ“ˆ' },
    { label: 'Regular Bills', value: r.totalBills, color: '#9B6DFF', icon: 'ðŸ§¾' },
    { label: 'Subscriptions', value: r.totalSubscriptions, color: '#7DD3FC', icon: 'ðŸ“±' },
    { label: 'Everyday Spending', value: r.totalSpending, color: '#FF5FA2', icon: 'ðŸ›’' },
    { label: 'Debt Repayments', value: r.totalDebt, color: '#FCD34D', icon: 'ðŸ’³' },
  ].filter((row) => row.value > 0);

  const counts = [
    { label: 'Income sources', count: state.incomeSources.length, icon: 'ðŸ“ˆ' },
    { label: 'Bills tracked', count: state.bills.length, icon: 'ðŸ§¾' },
    { label: 'Subscriptions', count: state.subscriptions.length, icon: 'ðŸ“±' },
    { label: 'Savings goals', count: state.savingsGoals.length, icon: 'ðŸŽ¯' },
    { label: 'Debts tracked', count: state.debtGoals.length, icon: 'ðŸ’³' },
    { label: 'Budgeted areas', count: state.spendingCategories.filter((c) => c.amount > 0).length, icon: 'ðŸ›’' },
  ].filter((c) => c.count > 0);

  const healthDescription =
    r.healthLabel === 'Looks healthy'
      ? "Great work â€” your budget has breathing room."
      : r.healthLabel === 'A little tight'
      ? "You're close to the edge. A few tweaks could help."
      : "Your outgoings exceed your income â€” let's work on that together.";

  return (
    <OnboardingStepCard
      step={9}
      totalSteps={9}
      title="Your budget snapshot ðŸŽ‰"
      subtitle="Look good? You can fine-tune everything from the Budget screen at any time."
      onNext={onNext}
      onBack={onBack}
      nextLabel="Create My Budget ðŸš€"
    >
      <div className="space-y-4">
        {/* Health badge */}
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, type: 'spring', bounce: 0.3 }}
          className="rounded-3xl p-5 text-center"
          style={{ background: `${r.healthColor}18`, border: `1px solid ${r.healthColor}35` }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 250, damping: 18 }}
            className="text-5xl mb-2.5"
          >
            {r.healthEmoji}
          </motion.div>
          <p className="text-2xl font-extrabold tracking-tight" style={{ color: r.healthColor }}>
            {r.healthLabel}
          </p>
          <p className="text-sm mt-1.5 text-white/50">{healthDescription}</p>
        </motion.div>

        {/* Summary rows */}
        <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
          {rows.map((row, i) => (
            <motion.div
              key={row.label}
              initial={{ x: 16, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="flex items-center justify-between px-4 py-3.5"
              style={i < rows.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.06)' } : {}}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ background: `${row.color}20` }}>
                  {row.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/80">{row.label}</p>
                  <p className="text-[11px] text-white/35">per {period}</p>
                </div>
              </div>
              <p className="text-sm font-extrabold tabular-nums" style={{ color: row.color }}>
                {fmt(sym, row.value)}
              </p>
            </motion.div>
          ))}

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.12)', margin: '0 16px' }} />

          {/* Left to spend */}
          <motion.div
            initial={{ x: 16, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 + rows.length * 0.06 + 0.06 }}
            className="flex items-center justify-between px-4 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ background: r.amountLeft >= 0 ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)' }}>
                ðŸ’µ
              </div>
              <div>
                <p className="text-sm font-bold text-white">Left to Spend</p>
                <p className="text-[11px] text-white/35">per {period}</p>
              </div>
            </div>
            <p className="text-lg font-extrabold tabular-nums" style={{ color: r.amountLeft >= 0 ? '#4ADE80' : '#ef4444' }}>
              {r.amountLeft < 0 ? 'âˆ’' : ''}{fmt(sym, Math.abs(r.amountLeft))}
            </p>
          </motion.div>
        </div>

        {/* Counts grid */}
        {counts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2.5">What you've set up</p>
            <div className="grid grid-cols-3 gap-2">
              {counts.map((c) => (
                <div
                  key={c.label}
                  className="rounded-2xl p-3 text-center"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="text-xl mb-1">{c.icon}</div>
                  <p className="text-lg font-extrabold text-white">{c.count}</p>
                  <p className="text-[10px] text-white/35 leading-tight mt-0.5">{c.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reassurance note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl px-4 py-3"
          style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)' }}
        >
          <p className="text-xs font-medium" style={{ color: 'rgba(167,157,255,0.85)' }}>
            ðŸ’¡ Your budget is a living document â€” edit everything from the Budget and Goals screens anytime.
          </p>
        </motion.div>

        {r.totalIncome === 0 && (
          <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <p className="text-xs font-medium" style={{ color: 'rgba(252,211,77,0.85)' }}>
              âš ï¸ No income added yet â€” you can add it from the Budget screen after setup.
            </p>
          </div>
        )}
      </div>
    </OnboardingStepCard>
  );
}
