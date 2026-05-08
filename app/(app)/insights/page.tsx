'use client';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/components/providers/StoreProvider';
import { computeBudgetSummary, computeCategorySummaries, generateInsights, formatCurrency } from '@/lib/calculations';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

const INSIGHT_STYLES = {
  warning: { bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', icon: '⚠️', text: 'text-amber-800 dark:text-amber-200' },
  success: { bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', icon: '✅', text: 'text-emerald-800 dark:text-emerald-200' },
  info: { bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800', icon: 'ℹ️', text: 'text-blue-800 dark:text-blue-200' },
};

export default function InsightsPage() {
  const { store } = useStore();
  const sym = store.settings.currencySymbol;

  const summary = useMemo(() => computeBudgetSummary(store), [store]);
  const categorySummaries = useMemo(() => computeCategorySummaries(store), [store]);
  const insights = useMemo(() => generateInsights(store, summary, categorySummaries), [store, summary, categorySummaries]);

  const overBudgetCats = categorySummaries.filter((cs) => cs.status === 'over' && cs.category.type !== 'income');
  const warningCats = categorySummaries.filter((cs) => cs.status === 'warning' && cs.category.type !== 'income');
  const goodCats = categorySummaries.filter((cs) => cs.status === 'good' && cs.category.type !== 'income');

  return (
    <div className="px-4 pt-6 pb-4 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Insights</h1>
        <p className="text-sm text-gray-500 mt-0.5">Smart analysis of your spending</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Budget Health', value: `${summary.budgetHealthScore}/100`, color: summary.budgetHealthScore >= 80 ? '#34d399' : summary.budgetHealthScore >= 50 ? '#f59e0b' : '#ef4444', icon: '❤️' },
          { label: 'Left to Spend', value: formatCurrency(summary.amountLeftToSpend, sym), color: summary.amountLeftToSpend >= 0 ? '#34d399' : '#ef4444', icon: '💵' },
          { label: 'Cash Flow', value: formatCurrency(summary.cashFlow, sym), color: summary.cashFlow >= 0 ? '#34d399' : '#ef4444', icon: '📊' },
          { label: 'Total Saved', value: formatCurrency(summary.totalSavings, sym), color: '#34d399', icon: '🏦' },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="p-3">
              <span className="text-lg">{metric.icon}</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metric.label}</p>
              <p className="font-bold tabular-nums mt-0.5" style={{ color: metric.color }}>{metric.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* All Insights */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Smart Alerts</h2>
          {insights.map((insight, i) => {
            const style = INSIGHT_STYLES[insight.type];
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl border p-4 flex items-start gap-3 ${style.bg}`}
              >
                <span className="text-xl mt-0.5">{style.icon}</span>
                <div>
                  <p className={`text-sm font-semibold ${style.text}`}>{insight.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{insight.body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Category breakdown */}
      {overBudgetCats.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-red-500">Over Budget</h2>
          {overBudgetCats.map((cs) => (
            <Card key={cs.category.id} className="p-3 border-red-100 dark:border-red-900">
              <div className="flex justify-between mb-2">
                <span className="font-medium text-sm text-gray-800 dark:text-gray-100">{cs.category.name}</span>
                <span className="text-xs font-bold text-red-500">
                  {formatCurrency(cs.actual, sym)} / {formatCurrency(cs.category.planned, sym)}
                </span>
              </div>
              <ProgressBar value={cs.progress} color="#ef4444" />
            </Card>
          ))}
        </div>
      )}

      {warningCats.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-amber-500">Approaching Limit</h2>
          {warningCats.map((cs) => (
            <Card key={cs.category.id} className="p-3 border-amber-100 dark:border-amber-900">
              <div className="flex justify-between mb-2">
                <span className="font-medium text-sm text-gray-800 dark:text-gray-100">{cs.category.name}</span>
                <span className="text-xs font-bold text-amber-500">
                  {Math.round(cs.progress * 100)}% used
                </span>
              </div>
              <ProgressBar value={cs.progress} color="#f59e0b" />
              <p className="text-xs text-gray-400 mt-1">
                {formatCurrency(cs.actual, sym)} of {formatCurrency(cs.category.planned, sym)}
              </p>
            </Card>
          ))}
        </div>
      )}

      {goodCats.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-emerald-500">On Track ✓</h2>
          <div className="grid grid-cols-2 gap-3">
            {goodCats.map((cs) => (
              <Card key={cs.category.id} className="p-3">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">{cs.category.name}</p>
                <p className="text-sm font-bold mt-1 tabular-nums" style={{ color: cs.category.color ?? '#34d399' }}>
                  {formatCurrency(cs.actual, sym)}
                </p>
                <ProgressBar value={cs.progress} color={cs.category.color ?? '#34d399'} height="h-1" className="mt-2" />
                <p className="text-[10px] text-gray-400 mt-1">{Math.round(cs.progress * 100)}% of {formatCurrency(cs.category.planned, sym)}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Goal Progress */}
      {store.goals.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Goal Progress</h2>
          {store.goals.map((g) => {
            const progress = g.type === 'savings'
              ? g.targetAmount > 0 ? Math.min(1, g.currentAmount / g.targetAmount) : 0
              : g.startingAmount > 0 ? Math.min(1, 1 - g.currentAmount / g.startingAmount) : 0;
            return (
              <Card key={g.id} className="p-3">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-sm text-gray-800 dark:text-gray-100">{g.name}</span>
                  <span className="text-xs font-bold" style={{ color: g.color ?? '#34d399' }}>{Math.round(progress * 100)}%</span>
                </div>
                <ProgressBar value={progress} color={g.color ?? '#34d399'} />
                <p className="text-xs text-gray-400 mt-1">
                  {formatCurrency(g.currentAmount, sym)} of {formatCurrency(g.type === 'savings' ? g.targetAmount : g.startingAmount, sym)}
                </p>
              </Card>
            );
          })}
        </div>
      )}

      {store.transactions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500 font-medium">No data to analyse yet</p>
          <p className="text-gray-400 text-sm mt-1">Add some transactions to see insights</p>
        </div>
      )}
    </div>
  );
}
