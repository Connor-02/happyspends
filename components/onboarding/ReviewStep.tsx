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

  const rows: { label: string; value: number; color: string; icon: string; note?: string }[] = [
    { label: 'Income', value: r.totalIncome, color: '#34d399', icon: '📈', note: `per ${period}` },
    { label: 'Regular Bills', value: r.totalBills, color: '#818cf8', icon: '🧾', note: `per ${period}` },
    { label: 'Subscriptions', value: r.totalSubscriptions, color: '#60a5fa', icon: '📱', note: `per ${period}` },
    { label: 'Everyday Spending', value: r.totalSpending, color: '#f472b6', icon: '🛒', note: `per ${period}` },
    { label: 'Debt Payments', value: r.totalDebt, color: '#fb923c', icon: '💳', note: `per ${period}` },
  ].filter((row) => row.value > 0);

  const totalOut = r.totalBills + r.totalSubscriptions + r.totalSpending + r.totalDebt;

  return (
    <OnboardingStepCard
      step={9}
      totalSteps={10}
      title="Here's your budget 🎉"
      subtitle="Look good? You can always fine-tune this after setup."
      onNext={onNext}
      onBack={onBack}
      nextLabel="Create My Budget 🚀"
    >
      <div className="space-y-4">
        {/* Health badge */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, type: 'spring' }}
          className="rounded-3xl p-5 text-center"
          style={{ background: `${r.healthColor}18` }}
        >
          <div className="text-4xl mb-2">{r.healthEmoji}</div>
          <p className="text-2xl font-extrabold" style={{ color: r.healthColor }}>
            {r.healthLabel}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {r.healthLabel === 'Looks healthy'
              ? "You're off to a great start!"
              : r.healthLabel === 'A little tight'
              ? "Not bad — a few small tweaks could help."
              : "Your outgoings exceed your income. Let's work on that together."}
          </p>
        </motion.div>

        {/* Summary rows */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
          {rows.map((row, i) => (
            <motion.div
              key={row.label}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.06 }}
              className={`flex items-center justify-between px-4 py-3.5 ${
                i < rows.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{row.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{row.label}</p>
                  {row.note && (
                    <p className="text-xs text-gray-400">{row.note}</p>
                  )}
                </div>
              </div>
              <p className="text-sm font-extrabold tabular-nums" style={{ color: row.color }}>
                {fmt(sym, row.value)}
              </p>
            </motion.div>
          ))}

          {/* Divider */}
          <div className="mx-4 border-t-2 border-gray-200 dark:border-gray-600 my-1" />

          {/* Amount left */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="text-lg">💵</span>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Left to Spend</p>
                <p className="text-xs text-gray-400">per {period}</p>
              </div>
            </div>
            <p
              className="text-lg font-extrabold tabular-nums"
              style={{ color: r.amountLeft >= 0 ? '#34d399' : '#ef4444' }}
            >
              {r.amountLeft < 0 ? '−' : ''}{fmt(sym, Math.abs(r.amountLeft))}
            </p>
          </div>
        </div>

        {/* Breakdown pills */}
        {rows.length === 0 && (
          <div className="text-center py-4 text-gray-400 text-sm">
            No budget data entered yet. You can add everything after setup!
          </div>
        )}

        {rows.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Counts</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Income sources', count: state.incomeSources.length, icon: '📈' },
                { label: 'Bills', count: state.bills.length, icon: '🧾' },
                { label: 'Subscriptions', count: state.subscriptions.length, icon: '📱' },
                { label: 'Savings goals', count: state.savingsGoals.length, icon: '🎯' },
                { label: 'Debts tracked', count: state.debtGoals.length, icon: '💳' },
                {
                  label: 'Spending budgeted',
                  count: state.spendingCategories.filter((c) => c.amount > 0).length,
                  icon: '🛒',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white dark:bg-gray-800 rounded-2xl px-3.5 py-3 border border-gray-100 dark:border-gray-700 flex items-center gap-2 shadow-sm"
                >
                  <span className="text-base">{item.icon}</span>
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm font-extrabold text-gray-800 dark:text-white">{item.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reassurance note */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl px-4 py-3">
          <p className="text-xs text-blue-600 dark:text-blue-300 font-medium">
            💡 Don&apos;t stress if the numbers aren&apos;t perfect — your budget is a living document. You can
            edit everything from the Budget and Goals screens anytime.
          </p>
        </div>

        {/* Income breakdown if no income entered */}
        {r.totalIncome === 0 && totalOut > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl px-4 py-3">
            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
              ⚠️ You haven&apos;t added any income yet. Add it after setup from the Budget screen.
            </p>
          </div>
        )}
      </div>
    </OnboardingStepCard>
  );
}
