'use client';
import { motion } from 'framer-motion';
import { TrendingUp, FileText, CreditCard, ShoppingCart, AlertCircle, Wallet } from 'lucide-react';
import type { OnboardingState } from '@/types/budget';
import { computeOnboardingReview, periodLabel } from '@/lib/budgetCalculations';
import { OnboardingStepCard } from './OnboardingStepCard';
import type { LucideIcon } from 'lucide-react';

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

  const rows: { label: string; value: number; color: string; Icon: LucideIcon }[] = [
    { label: 'Income', value: r.totalIncome, color: '#22C55E', Icon: TrendingUp },
    { label: 'Regular Bills', value: r.totalBills, color: '#8B5CF6', Icon: FileText },
    { label: 'Subscriptions', value: r.totalSubscriptions, color: '#60A5FA', Icon: CreditCard },
    { label: 'Everyday Spending', value: r.totalSpending, color: '#EC4899', Icon: ShoppingCart },
    { label: 'Debt Repayments', value: r.totalDebt, color: '#F59E0B', Icon: AlertCircle },
  ].filter((row) => row.value > 0);

  const counts = [
    { label: 'Income sources', count: state.incomeSources.length },
    { label: 'Bills tracked', count: state.bills.length },
    { label: 'Subscriptions', count: state.subscriptions.length },
    { label: 'Savings goals', count: state.savingsGoals.length },
    { label: 'Debts tracked', count: state.debtGoals.length },
    { label: 'Budgeted areas', count: state.spendingCategories.filter((c) => c.amount > 0).length },
  ].filter((c) => c.count > 0);

  const healthDescription =
    r.healthLabel === 'Looks healthy'
      ? 'Great work — your budget has breathing room.'
      : r.healthLabel === 'A little tight'
      ? "You're close to the edge. A few tweaks could help."
      : "Your outgoings exceed your income — let's work on that together.";

  return (
    <OnboardingStepCard
      step={9}
      totalSteps={9}
      title="Your budget snapshot"
      subtitle="Look good? You can fine-tune everything from the Budget screen at any time."
      onNext={onNext}
      onBack={onBack}
      nextLabel="Create My Budget"
    >
      <div className="space-y-4">
        {/* Health badge */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
          className="rounded-3xl p-5 text-center bg-white"
          style={{ border: `1.5px solid ${r.healthColor}40` }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: `${r.healthColor}14` }}
          >
            <span className="text-2xl">{r.healthEmoji}</span>
          </div>
          <p className="text-xl font-extrabold tracking-tight" style={{ color: r.healthColor }}>
            {r.healthLabel}
          </p>
          <p className="text-sm mt-1.5" style={{ color: '#6B7280' }}>{healthDescription}</p>
        </motion.div>

        {/* Summary rows */}
        <div className="rounded-3xl overflow-hidden bg-white" style={{ border: '1px solid #E5E7EB' }}>
          {rows.map((row, i) => (
            <motion.div
              key={row.label}
              initial={{ x: 16, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="flex items-center justify-between px-4 py-3.5"
              style={i < rows.length - 1 ? { borderBottom: '1px solid #F3F4F6' } : {}}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${row.color}14` }}
                >
                  <row.Icon className="w-4 h-4" style={{ color: row.color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#374151' }}>{row.label}</p>
                  <p className="text-[11px]" style={{ color: '#9CA3AF' }}>per {period}</p>
                </div>
              </div>
              <p className="text-sm font-extrabold tabular-nums" style={{ color: row.color }}>
                {fmt(sym, row.value)}
              </p>
            </motion.div>
          ))}

          {/* Divider */}
          <div style={{ height: '1px', background: '#E5E7EB', margin: '0 16px' }} />

          {/* Left to spend */}
          <motion.div
            initial={{ x: 16, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 + rows.length * 0.06 + 0.06 }}
            className="flex items-center justify-between px-4 py-4"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: r.amountLeft >= 0 ? '#DCFCE7' : '#FEE2E2' }}
              >
                <Wallet className="w-4 h-4" style={{ color: r.amountLeft >= 0 ? '#22C55E' : '#EF4444' }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#111827' }}>Left to Spend</p>
                <p className="text-[11px]" style={{ color: '#9CA3AF' }}>per {period}</p>
              </div>
            </div>
            <p className="text-lg font-extrabold tabular-nums" style={{ color: r.amountLeft >= 0 ? '#22C55E' : '#EF4444' }}>
              {r.amountLeft < 0 ? '-' : ''}{fmt(sym, Math.abs(r.amountLeft))}
            </p>
          </motion.div>
        </div>

        {/* Counts grid */}
        {counts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: '#9CA3AF' }}>
              What you've set up
            </p>
            <div className="grid grid-cols-3 gap-2">
              {counts.map((c) => (
                <div
                  key={c.label}
                  className="rounded-2xl p-3 text-center bg-white"
                  style={{ border: '1px solid #E5E7EB' }}
                >
                  <p className="text-lg font-extrabold" style={{ color: '#111827' }}>{c.count}</p>
                  <p className="text-[10px] leading-tight mt-0.5" style={{ color: '#9CA3AF' }}>{c.label}</p>
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
          style={{ background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.15)' }}
        >
          <p className="text-xs font-medium" style={{ color: '#BE185D' }}>
            Your budget is a living document — edit everything from the Budget and Goals screens anytime.
          </p>
        </motion.div>
      </div>
    </OnboardingStepCard>
  );
}
