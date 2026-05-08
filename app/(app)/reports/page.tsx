'use client';
import { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/components/providers/StoreProvider';
import { computeBudgetSummary, computeCategorySummaries, formatCurrency } from '@/lib/calculations';
import { exportJSON, loadStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

function exportCSV(store: ReturnType<typeof loadStore>, sym: string) {
  const rows = [
    ['Date', 'Type', 'Category', 'Amount', 'Notes'],
    ...store.transactions.map((t) => [
      t.date,
      t.type,
      t.categoryName,
      t.amount.toFixed(2),
      t.notes ?? '',
    ]),
  ];
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
  downloadFile('happyspends-transactions.csv', csv, 'text/csv');
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const { store, saveSettings } = useStore();
  const sym = store.settings.currencySymbol;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const summary = useMemo(() => computeBudgetSummary(store), [store]);
  const categorySummaries = useMemo(() => computeCategorySummaries(store), [store]);

  const expenseSummaries = categorySummaries.filter((cs) => cs.category.type === 'expense');
  const incomeSummaries = categorySummaries.filter((cs) => cs.category.type === 'income');

  const reportCards = [
    {
      label: 'Total Income',
      planned: summary.plannedIncome,
      actual: summary.totalIncome,
      color: '#34d399',
    },
    {
      label: 'Total Expenses',
      planned: summary.plannedExpenses,
      actual: summary.totalExpenses,
      color: '#f472b6',
    },
    {
      label: 'Total Bills',
      planned: summary.plannedBills,
      actual: summary.totalBills,
      color: '#818cf8',
    },
    {
      label: 'Total Savings',
      planned: summary.plannedSavings,
      actual: summary.totalSavings,
      color: '#34d399',
    },
    {
      label: 'Total Debt Payments',
      planned: summary.plannedDebt,
      actual: summary.totalDebt,
      color: '#fb923c',
    },
  ];

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = ev.target?.result as string;
        const data = JSON.parse(json);
        // Basic validation
        if (data.settings && data.transactions) {
          localStorage.setItem('happyspends_store', json);
          window.location.reload();
        } else {
          alert('Invalid backup file');
        }
      } catch {
        alert('Failed to parse backup file');
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Period summary & exports</p>
      </div>

      {/* Monthly Summary */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Period Summary</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Net Cash Flow', value: summary.cashFlow, color: summary.cashFlow >= 0 ? '#34d399' : '#ef4444' },
            { label: 'Left to Spend', value: summary.amountLeftToSpend, color: summary.amountLeftToSpend >= 0 ? '#34d399' : '#ef4444' },
            { label: 'Transactions', value: store.transactions.length, color: '#6366f1', isCurrency: false },
            { label: 'Budget Health', value: summary.budgetHealthScore, color: summary.budgetHealthScore >= 80 ? '#34d399' : '#f59e0b', isCurrency: false, suffix: '/100' },
          ].map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                <p className="text-lg font-extrabold tabular-nums mt-0.5" style={{ color: item.color }}>
                  {(item as {isCurrency?: boolean}).isCurrency === false
                    ? `${item.value}${(item as {suffix?: string}).suffix ?? ''}`
                    : formatCurrency(item.value as number, sym)}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Planned vs Actual */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Planned vs Actual</h2>
        {reportCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{card.label}</span>
                <span className="text-xs text-gray-400">
                  {formatCurrency(card.actual, sym)} / {formatCurrency(card.planned, sym)}
                </span>
              </div>
              <ProgressBar value={card.planned > 0 ? card.actual / card.planned : 0} color={card.color} />
              <div className="flex justify-between mt-1.5 text-xs text-gray-400">
                <span>Actual: <span className="font-semibold" style={{ color: card.color }}>{formatCurrency(card.actual, sym)}</span></span>
                <span>Planned: {formatCurrency(card.planned, sym)}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Category Breakdown */}
      {expenseSummaries.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Expense Breakdown</h2>
          {expenseSummaries.map((cs) => (
            <Card key={cs.category.id} className="p-3">
              <div className="flex justify-between mb-1.5">
                <span className="text-sm text-gray-700 dark:text-gray-200">{cs.category.name}</span>
                <span className="text-xs font-medium" style={{ color: cs.category.color ?? '#f472b6' }}>
                  {formatCurrency(cs.actual, sym)}
                </span>
              </div>
              <ProgressBar value={cs.progress} color={cs.category.color ?? '#f472b6'} height="h-1.5" />
            </Card>
          ))}
        </div>
      )}

      {/* Goal Progress */}
      {store.goals.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Goals Progress</h2>
          {store.goals.map((g) => {
            const progress = g.type === 'savings'
              ? g.targetAmount > 0 ? g.currentAmount / g.targetAmount : 0
              : g.startingAmount > 0 ? 1 - g.currentAmount / g.startingAmount : 0;
            return (
              <Card key={g.id} className="p-3">
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm text-gray-700 dark:text-gray-200">{g.name}</span>
                  <span className="text-xs font-medium" style={{ color: g.color ?? '#34d399' }}>
                    {Math.round(progress * 100)}%
                  </span>
                </div>
                <ProgressBar value={progress} color={g.color ?? '#34d399'} height="h-1.5" />
                <p className="text-xs text-gray-400 mt-1">
                  {formatCurrency(g.currentAmount, sym)} of {formatCurrency(g.type === 'savings' ? g.targetAmount : g.startingAmount, sym)}
                </p>
              </Card>
            );
          })}
        </div>
      )}

      {/* Export / Import */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Data & Backup</h2>
        <div className="space-y-2">
          <Button
            variant="secondary"
            className="w-full justify-center"
            onClick={() => exportCSV(store, sym)}
          >
            📥 Export as CSV
          </Button>
          <Button
            variant="secondary"
            className="w-full justify-center"
            onClick={() => downloadFile('happyspends-backup.json', exportJSON(), 'application/json')}
          >
            💾 Export JSON Backup
          </Button>
          <Button
            variant="secondary"
            className="w-full justify-center"
            onClick={() => fileInputRef.current?.click()}
          >
            📂 Import JSON Backup
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
      </div>
    </div>
  );
}
