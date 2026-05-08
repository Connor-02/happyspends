'use client';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useStore } from '@/components/providers/StoreProvider';
import { computeBudgetSummary, computeAllocation, computeMonthlyCashFlow, formatCurrency, generateInsights, computeCategorySummaries } from '@/lib/calculations';
import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Badge } from '@/components/ui/Badge';
import { AllocationChart } from '@/components/charts/AllocationChart';
import { CashFlowChart } from '@/components/charts/CashFlowChart';

function stagger(i: number) {
  return { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: i * 0.06, duration: 0.35 } };
}

export default function DashboardPage() {
  const { store } = useStore();
  const sym = store.settings.currencySymbol;

  const summary = useMemo(() => computeBudgetSummary(store), [store]);
  const allocation = useMemo(() => computeAllocation(summary), [summary]);
  const cashFlowData = useMemo(() => computeMonthlyCashFlow(store.transactions), [store.transactions]);
  const categorySummaries = useMemo(() => computeCategorySummaries(store), [store]);
  const insights = useMemo(() => generateInsights(store, summary, categorySummaries), [store, summary, categorySummaries]);

  const spendingRatio = summary.plannedIncome > 0
    ? (summary.totalExpenses + summary.totalBills) / (summary.plannedIncome || 1)
    : 0;

  const healthColor = summary.budgetHealthScore >= 80 ? '#34d399' : summary.budgetHealthScore >= 50 ? '#f59e0b' : '#ef4444';

  const summaryCards = [
    { label: 'Income', value: summary.totalIncome, planned: summary.plannedIncome, color: '#34d399', icon: '📈' },
    { label: 'Expenses', value: summary.totalExpenses, planned: summary.plannedExpenses, color: '#f472b6', icon: '🛍️' },
    { label: 'Bills', value: summary.totalBills, planned: summary.plannedBills, color: '#818cf8', icon: '🧾' },
    { label: 'Savings', value: summary.totalSavings, planned: summary.plannedSavings, color: '#34d399', icon: '🏦' },
    { label: 'Debt', value: summary.totalDebt, planned: summary.plannedDebt, color: '#fb923c', icon: '💳' },
    { label: 'Cash Flow', value: summary.cashFlow, planned: null, color: summary.cashFlow >= 0 ? '#34d399' : '#ef4444', icon: '💵' },
  ];

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      {/* Header */}
      <motion.div {...stagger(0)} className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">Good morning,</p>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {store.settings.name} 👋
          </h1>
        </div>
        <Link href="/reports" className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </Link>
      </motion.div>

      {/* Hero card */}
      <motion.div {...stagger(1)}>
        <Card className="gradient-pink text-white p-5">
          <p className="text-pink-100 text-sm font-medium mb-1">Amount Left to Spend</p>
          <p className="text-4xl font-extrabold tabular-nums mb-3">
            {formatCurrency(summary.amountLeftToSpend, sym)}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-xs">Spending This Period</p>
              <p className="text-lg font-bold tabular-nums">
                {formatCurrency(summary.totalExpenses + summary.totalBills, sym)}
                <span className="text-pink-200 text-sm font-normal ml-1">
                  of {formatCurrency(summary.plannedExpenses + summary.plannedBills, sym)}
                </span>
              </p>
            </div>
            <ProgressRing value={spendingRatio} size={72} strokeWidth={7} color="white" trackColor="rgba(255,255,255,0.25)">
              <span className="text-sm font-bold">{Math.round(spendingRatio * 100)}%</span>
            </ProgressRing>
          </div>
        </Card>
      </motion.div>

      {/* Budget Health */}
      <motion.div {...stagger(2)}>
        <Card className="flex items-center gap-4 p-4">
          <ProgressRing value={summary.budgetHealthScore / 100} size={64} strokeWidth={6} color={healthColor}>
            <span className="text-xs font-bold" style={{ color: healthColor }}>{summary.budgetHealthScore}</span>
          </ProgressRing>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Budget Health Score</p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xl font-bold text-gray-900 dark:text-white">{summary.budgetHealthScore}/100</p>
              <Badge variant={summary.budgetHealthScore >= 80 ? 'good' : summary.budgetHealthScore >= 50 ? 'warning' : 'over'}>
                {summary.budgetHealthScore >= 80 ? 'Great' : summary.budgetHealthScore >= 50 ? 'Watch Out' : 'Off Track'}
              </Badge>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {summary.budgetHealthScore >= 80 ? "You're crushing it!" : "Review your spending categories"}
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Summary grid */}
      <motion.div {...stagger(3)}>
        <div className="grid grid-cols-3 gap-3">
          {summaryCards.map((card) => (
            <Card key={card.label} className="p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-base">{card.icon}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{card.label}</span>
              </div>
              <p className="text-sm font-bold tabular-nums" style={{ color: card.color }}>
                {formatCurrency(card.value, sym)}
              </p>
              {card.planned !== null && (
                <p className="text-xs text-gray-400 tabular-nums">
                  / {formatCurrency(card.planned, sym)}
                </p>
              )}
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Allocation chart */}
      {allocation.length > 0 && (
        <motion.div {...stagger(4)}>
          <Card>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Spending Allocation</p>
            <AllocationChart data={allocation} symbol={sym} />
          </Card>
        </motion.div>
      )}

      {/* Cash flow chart */}
      {cashFlowData.length > 0 && (
        <motion.div {...stagger(5)}>
          <Card>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Cash Flow</p>
            <CashFlowChart data={cashFlowData} symbol={sym} />
          </Card>
        </motion.div>
      )}

      {/* Smart Insights */}
      {insights.length > 0 && (
        <motion.div {...stagger(6)} className="space-y-2">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Smart Insights</p>
          {insights.slice(0, 4).map((insight) => (
            <div key={insight.id} className={`card p-3 flex items-start gap-3 ${
              insight.type === 'warning' ? 'border-amber-200 dark:border-amber-900' :
              insight.type === 'success' ? 'border-emerald-200 dark:border-emerald-900' :
              'border-blue-200 dark:border-blue-900'
            }`}>
              <span className="text-xl mt-0.5">
                {insight.type === 'warning' ? '⚠️' : insight.type === 'success' ? '✅' : 'ℹ️'}
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{insight.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{insight.body}</p>
              </div>
            </div>
          ))}
          <Link href="/insights" className="block text-center text-xs text-pink-500 font-medium py-1">
            View all insights →
          </Link>
        </motion.div>
      )}

      {/* Quick actions */}
      <motion.div {...stagger(7)}>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/transactions" className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
              <span className="text-xl">+</span>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Add Transaction</span>
          </Link>
          <Link href="/goals" className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <span className="text-xl">🎯</span>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">View Goals</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
