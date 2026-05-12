'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useStore } from '@/components/providers/StoreProvider';
import { computeBudgetSummary, computeCategorySummaries, formatCurrency } from '@/lib/calculations';
import { computeAllHabitStats, computeSpendingStreak } from '@/lib/habitEngine';
import { generatePremiumInsights } from '@/lib/premiumInsights';
import {
  getCheckInStatus,
  performCheckIn,
  addHabitCompletion,
  getHealthSnapshots,
  loadPremiumStore,
} from '@/lib/premiumStorage';
import type { HabitStats, BudgetHealthSnapshot } from '@/types/premium';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Card } from '@/components/ui/Card';
import { OtterInsightOverlay } from '@/components/tracking/OtterInsightOverlay';
import { Badge } from '@/components/ui/Badge';

function stagger(i: number) {
  return {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { delay: i * 0.07, duration: 0.35 },
  };
}

export default function TrackingPage() {
  const { store } = useStore();
  const sym = store.settings.currencySymbol;

  const summary = useMemo(() => computeBudgetSummary(store), [store]);
  const categorySummaries = useMemo(() => computeCategorySummaries(store), [store]);
  const habitStats = useMemo(() => computeAllHabitStats(store), [store]);
  const insights = useMemo(
    () => generatePremiumInsights(store, summary, categorySummaries),
    [store, summary, categorySummaries]
  );
  const { streak: spendingStreak, daysThisMonth } = useMemo(
    () => computeSpendingStreak(store.transactions),
    [store.transactions]
  );

  const [checkIn, setCheckIn] = useState({ streak: 0, checkedInToday: false });
  const [snapshots, setSnapshots] = useState<BudgetHealthSnapshot[]>([]);
  const [premiumData, setPremiumData] = useState(loadPremiumStore());
  const [completing, setCompleting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'habits' | 'insights' | 'history'>('habits');
  const [showOtterInsight, setShowOtterInsight] = useState(false);
  const otterShownRef = React.useRef(false);

  useEffect(() => {
    setCheckIn(getCheckInStatus());
    setSnapshots(getHealthSnapshots());
    setPremiumData(loadPremiumStore());
  }, []);

  const handleHabitComplete = (habitId: string) => {
    setCompleting(habitId);
    addHabitCompletion(habitId);
    setTimeout(() => {
      setCompleting(null);
      setPremiumData(loadPremiumStore());
    }, 800);
  };

  // Derived stats
  const billCats = store.categories.filter((c) => c.type === 'bill');
  const billTotal = billCats.reduce((s, c) => s + c.planned, 0);
  const savingsGoals = store.goals.filter((g) => g.type === 'savings');
  const debtGoals = store.goals.filter((g) => g.type === 'debt');
  const avgSavingsPct =
    savingsGoals.length > 0
      ? savingsGoals.reduce((s, g) => s + (g.targetAmount > 0 ? g.currentAmount / g.targetAmount : 0), 0) /
        savingsGoals.length
      : 0;
  const debtPaid =
    debtGoals.length > 0
      ? debtGoals.reduce((s, g) => s + (g.startingAmount > 0 ? (g.startingAmount - g.currentAmount) / g.startingAmount : 0), 0) /
        debtGoals.length
      : 0;

  // Derived insight values for the otter overlay
  const cashFlow = (summary.totalIncome || summary.plannedIncome) - (summary.totalExpenses + summary.totalBills);
  const cashFlowStr = sym + Math.abs(cashFlow).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const cashFlowPositive = cashFlow > 0;

  function handleInsightsTabClick() {
    setActiveTab('insights');
    if (!otterShownRef.current) {
      otterShownRef.current = true;
      setShowOtterInsight(true);
    }
  }

  const healthColor =
    summary.budgetHealthScore >= 80 ? '#34d399' : summary.budgetHealthScore >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <OtterInsightOverlay
        visible={showOtterInsight}
        onDismiss={() => setShowOtterInsight(false)}
        heading="Insight from Happy Otter ✨"
        openingLine={cashFlowPositive ? "You're doing great! 🎉" : "Here's how you're doing:"}
        body={
          cashFlowPositive
            ? `You have a positive cash flow of ${cashFlowStr} this period.`
            : `Your expenses are ${cashFlowStr} over your income this period.`
        }
        highlightText={cashFlowStr}
        closingLine="Keep it up by consistently tracking your habits and spending wisely."
      />
      {/* Header */}
      <motion.div {...stagger(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Tracking</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your financial habits at a glance</p>
        </div>
        <Link
          href="/settings"
          className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
      </motion.div>

      {/* Stats grid */}
      <motion.div {...stagger(1)}>
        <div className="grid grid-cols-2 gap-3">
          {/* Spending streak */}
          <Card className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-pink flex items-center justify-center text-xl shrink-0">
              🔥
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{spendingStreak}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Day streak</p>
            </div>
          </Card>
          {/* Days tracked */}
          <Card className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-blue flex items-center justify-center text-xl shrink-0">
              📅
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{daysThisMonth}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Days tracked</p>
            </div>
          </Card>
          {/* Budget health */}
          <Card className="p-4 flex items-center gap-3">
            <ProgressRing value={summary.budgetHealthScore / 100} size={48} strokeWidth={5} color={healthColor}>
              <span className="text-[10px] font-bold" style={{ color: healthColor }}>{summary.budgetHealthScore}</span>
            </ProgressRing>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{summary.budgetHealthScore}/100</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Budget health</p>
            </div>
          </Card>
          {/* Bills total */}
          <Card className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xl shrink-0">
              🧾
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(billTotal, sym)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Bills/period</p>
            </div>
          </Card>
          {/* Savings progress */}
          {savingsGoals.length > 0 && (
            <Card className="p-4 flex items-center gap-3">
              <ProgressRing value={avgSavingsPct} size={48} strokeWidth={5} color="#34d399">
                <span className="text-[10px] font-bold text-emerald-500">{Math.round(avgSavingsPct * 100)}%</span>
              </ProgressRing>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{Math.round(avgSavingsPct * 100)}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Savings avg</p>
              </div>
            </Card>
          )}
          {/* Debt payoff */}
          {debtGoals.length > 0 && (
            <Card className="p-4 flex items-center gap-3">
              <ProgressRing value={debtPaid} size={48} strokeWidth={5} color="#fb923c">
                <span className="text-[10px] font-bold text-orange-500">{Math.round(debtPaid * 100)}%</span>
              </ProgressRing>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{Math.round(debtPaid * 100)}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Debt paid off</p>
              </div>
            </Card>
          )}
        </div>
      </motion.div>

      {/* Tab bar */}
      <motion.div {...stagger(2)}>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
          {(['habits', 'insights', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => tab === 'insights' ? handleInsightsTabClick() : setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all capitalize ${
                activeTab === tab
                  ? 'bg-white dark:bg-gray-900 text-pink-500 shadow-sm'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'habits' && (
          <motion.div
            key="habits"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-3"
          >
            {habitStats.map((hs, i) => (
              <HabitCard
                key={hs.habit.id}
                stats={hs}
                onComplete={() => handleHabitComplete(hs.habit.id)}
                completing={completing === hs.habit.id}
              />
            ))}
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-3"
          >
            {insights.length === 0 ? (
              <EmptyInsights />
            ) : (
              insights.map((ins) => <InsightCardItem key={ins.id} insight={ins} />)
            )}
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-3"
          >
            <HealthHistory snapshots={snapshots} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Habit Card ────────────────────────────────────────────────────────────────

function HabitCard({
  stats,
  onComplete,
  completing,
}: {
  stats: HabitStats;
  onComplete: () => void;
  completing: boolean;
}) {
  const pct = Math.round(stats.completionRate * 100);
  const barColor = stats.completedThisPeriod ? '#34d399' : pct > 50 ? '#f59e0b' : '#ec4899';

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl shrink-0">
          {stats.habit.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{stats.habit.label}</p>
            {stats.currentStreak > 0 && (
              <span className="text-xs font-bold text-orange-500 whitespace-nowrap">🔥 {stats.currentStreak}</span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stats.encouragement}</p>
          {/* Progress bar */}
          <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: barColor }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-gray-400 dark:text-gray-500">{stats.nextAction}</p>
            {!stats.completedThisPeriod && (
              <button
                onClick={onComplete}
                disabled={completing}
                className="text-xs font-semibold text-pink-500 hover:text-pink-600 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {completing ? '✓ Done!' : 'Mark done'}
              </button>
            )}
            {stats.completedThisPeriod && (
              <span className="text-xs font-semibold text-emerald-500">✓ Complete</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Insight Card Item ────────────────────────────────────────────────────────

function InsightCardItem({ insight }: { insight: import('@/types/premium').InsightCard }) {
  const colorMap = {
    tip: 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900',
    warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900',
    achievement: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900',
    trend: 'bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900',
    reminder: 'bg-pink-50 dark:bg-pink-950/30 border-pink-100 dark:border-pink-900',
    info: 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700',
  };
  const cls = colorMap[insight.type] ?? colorMap.info;
  const Inner = (
    <div className={`card p-4 flex items-start gap-3 ${cls}`}>
      <span className="text-2xl mt-0.5 shrink-0">{insight.icon}</span>
      <div>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{insight.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{insight.body}</p>
      </div>
    </div>
  );
  if (insight.actionLink) return <Link href={insight.actionLink}>{Inner}</Link>;
  return Inner;
}

// ─── Empty Insights ────────────────────────────────────────────────────────────

function EmptyInsights() {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-3">💡</div>
      <p className="text-base font-semibold text-gray-700 dark:text-gray-200">No insights yet</p>
      <p className="text-sm text-gray-400 mt-1">Start logging transactions to get personalised insights.</p>
      <Link href="/transactions" className="inline-block mt-4 px-5 py-2.5 bg-pink-500 text-white text-sm font-semibold rounded-xl">
        Add Transaction
      </Link>
    </div>
  );
}

// ─── Health History ────────────────────────────────────────────────────────────

function HealthHistory({ snapshots }: { snapshots: BudgetHealthSnapshot[] }) {
  if (snapshots.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-3">📊</div>
        <p className="text-base font-semibold text-gray-700 dark:text-gray-200">No history yet</p>
        <p className="text-sm text-gray-400 mt-1">Budget health snapshots will appear here each month.</p>
      </div>
    );
  }
  const sorted = [...snapshots].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Budget Health History</p>
      {sorted.map((s) => {
        const color = s.healthScore >= 80 ? '#34d399' : s.healthScore >= 50 ? '#f59e0b' : '#ef4444';
        return (
          <Card key={s.id} className="p-4 flex items-center gap-4">
            <ProgressRing value={s.healthScore / 100} size={52} strokeWidth={5} color={color}>
              <span className="text-[10px] font-bold" style={{ color }}>{s.healthScore}</span>
            </ProgressRing>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {new Date(s.date + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Cash flow: {s.cashFlow >= 0 ? '+' : ''}${Math.round(s.cashFlow)}
              </p>
            </div>
            <Badge variant={s.healthScore >= 80 ? 'good' : s.healthScore >= 50 ? 'warning' : 'over'}>
              {s.healthScore >= 80 ? 'Great' : s.healthScore >= 50 ? 'Watch' : 'Low'}
            </Badge>
          </Card>
        );
      })}
    </div>
  );
}
