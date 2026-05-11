'use client';
import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Bell, TrendingUp, ShoppingBag, ChevronRight,
  ArrowUpRight, ArrowDownLeft, Target, Plus, BarChart2
} from 'lucide-react';
import { useStore } from '@/components/providers/StoreProvider';
import {
  computeBudgetSummary,
  formatCurrency,
  computeCategorySummaries,
} from '@/lib/calculations';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { DailyCheckIn } from '@/components/premium/DailyCheckIn';
import { QuickAddSheet } from '@/components/premium/QuickAddSheet';
import { InstallPrompt } from '@/components/premium/InstallPrompt';
import { NotificationPermissionBanner } from '@/components/premium/NotificationPermission';
import { computeSpendingStreak } from '@/lib/habitEngine';
import { getUnreadCount } from '@/lib/premiumStorage';
import { runReminderChecks } from '@/lib/notificationService';
import { GoalSavingsBubble } from '@/components/dashboard/GoalSavingsBubble';
import { SpendingByCategory } from '@/components/dashboard/SpendingByCategory';
import {
  buildGoalInputsFromStore,
  calculateGoalSavingsRecommendation,
} from '@/lib/goalSavingsCalculations';

// ─── Stagger helper ───────────────────────────────────────────────────────────
function s(i: number) {
  return {
    initial: { y: 18, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { delay: i * 0.055, duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] },
  };
}

// ─── Format helpers ───────────────────────────────────────────────────────────
function fmtAmt(n: number, sym: string) {
  return sym + Math.abs(n).toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

const displayFont = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" };

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { store } = useStore();
  const sym = store.settings.currencySymbol;

  const summary = useMemo(() => computeBudgetSummary(store), [store]);
  const categorySummaries = useMemo(() => computeCategorySummaries(store), [store]);
  const goalRecommendations = useMemo(() => {
    return buildGoalInputsFromStore(store).map(calculateGoalSavingsRecommendation);
  }, [store]);
  const { streak } = useMemo(() => computeSpendingStreak(store.transactions), [store.transactions]);

  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(getUnreadCount());
    runReminderChecks(store);
  }, [store]);

  const spendingRatio =
    summary.plannedIncome > 0
      ? (summary.totalExpenses + summary.totalBills) / summary.plannedIncome
      : 0;

  // Recent 5 transactions sorted newest first
  const recentTx = useMemo(
    () =>
      [...store.transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [store.transactions]
  );

  return (
    <div
      className="px-4 pt-5 pb-6 space-y-4 min-h-dvh"
      style={{ background: '#F8FAFC' }}
    >
      {/* ── 1. Header ────────────────────────────────────────────────────── */}
      <motion.div {...s(0)} className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
            {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-xl font-bold leading-tight mt-0.5" style={{ ...displayFont, color: '#111827' }}>
            Hey, {store.settings.name || 'there'} 👋
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <Link
              href="/tracking"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full border cursor-pointer"
              style={{ background: '#FFF7ED', borderColor: '#FED7AA' }}
            >
              <span className="text-sm">🔥</span>
              <span className="text-xs font-bold" style={{ color: '#C2410C' }}>{streak}</span>
            </Link>
          )}
          <Link
            href="/notifications"
            className="relative w-10 h-10 rounded-full flex items-center justify-center cursor-pointer border"
            style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}
          >
            <Bell size={18} style={{ color: '#6B7280' }} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                style={{ background: '#EC4899' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </motion.div>

      {/* ── Banners ──────────────────────────────────────────────────────── */}
      <motion.div {...s(1)} className="space-y-2">
        <NotificationPermissionBanner />
        <InstallPrompt />
      </motion.div>

      {/* ── 2. Balance hero card ─────────────────────────────────────────── */}
      <motion.div {...s(2)}>
        <div
          className="rounded-3xl p-5 overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
        >
          {/* Soft inner glow */}
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
          />
          <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Amount Left to Spend
          </p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-extrabold tabular-nums text-white leading-none" style={displayFont}>
                {formatCurrency(summary.amountLeftToSpend, sym)}
              </p>
              <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {store.settings.budgetPeriod === 'weekly' ? 'This week' :
                 store.settings.budgetPeriod === 'fortnightly' ? 'This fortnight' : 'This month'}
              </p>
            </div>
            <ProgressRing
              value={spendingRatio}
              size={72}
              strokeWidth={7}
              color="rgba(255,255,255,0.95)"
              trackColor="rgba(255,255,255,0.25)"
            >
              <span className="text-xs font-bold text-white">{Math.min(999, Math.round(spendingRatio * 100))}%</span>
            </ProgressRing>
          </div>
          <div
            className="mt-4 pt-3 flex items-center gap-1"
            style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}
          >
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Spent{' '}
              <span className="font-semibold text-white">
                {formatCurrency(summary.totalExpenses + summary.totalBills, sym)}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-white">
                {formatCurrency(summary.plannedExpenses + summary.plannedBills, sym)}
              </span>{' '}
              planned
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── 3. Budget summary row ────────────────────────────────────────── */}
      <motion.div {...s(3)} className="grid grid-cols-2 gap-3">
        {/* Income pill */}
        <div
          className="rounded-2xl p-4 border"
          style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#F0FDF4' }}>
              <TrendingUp size={16} style={{ color: '#22C55E' }} />
            </div>
            <p className="text-xs font-medium" style={{ color: '#6B7280' }}>Income</p>
          </div>
          <p className="text-lg font-bold tabular-nums" style={{ ...displayFont, color: '#22C55E' }}>
            {formatCurrency(summary.totalIncome || summary.plannedIncome, sym)}
          </p>
          {summary.plannedIncome > 0 && (
            <p className="text-[10px] mt-0.5 tabular-nums" style={{ color: '#9CA3AF' }}>
              planned {formatCurrency(summary.plannedIncome, sym)}
            </p>
          )}
        </div>

        {/* Expenses pill */}
        <div
          className="rounded-2xl p-4 border"
          style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#FFF1F2' }}>
              <ShoppingBag size={16} style={{ color: '#F43F5E' }} />
            </div>
            <p className="text-xs font-medium" style={{ color: '#6B7280' }}>Expenses</p>
          </div>
          <p className="text-lg font-bold tabular-nums" style={{ ...displayFont, color: '#F43F5E' }}>
            {formatCurrency(summary.totalExpenses + summary.totalBills, sym)}
          </p>
          {(summary.plannedExpenses + summary.plannedBills) > 0 && (
            <p className="text-[10px] mt-0.5 tabular-nums" style={{ color: '#9CA3AF' }}>
              planned {formatCurrency(summary.plannedExpenses + summary.plannedBills, sym)}
            </p>
          )}
        </div>
      </motion.div>

      {/* ── 4. Daily check-in ────────────────────────────────────────────── */}
      <motion.div {...s(4)}>
        <DailyCheckIn amountLeft={summary.amountLeftToSpend} sym={sym} />
      </motion.div>

      {/* ── 5. Goals savings bubble ──────────────────────────────────────── */}
      <motion.div {...s(5)}>
        <GoalSavingsBubble recommendations={goalRecommendations} sym={sym} />
      </motion.div>

      {/* ── 6. Spending by category ──────────────────────────────────────── */}
      <motion.div {...s(6)}>
        <SpendingByCategory summaries={categorySummaries} sym={sym} />
      </motion.div>

      {/* ── 7. Recent transactions ───────────────────────────────────────── */}
      {recentTx.length > 0 && (
        <motion.div {...s(7)}>
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
              <p className="text-sm font-semibold" style={{ ...displayFont, color: '#111827' }}>
                Recent Transactions
              </p>
              <Link
                href="/transactions"
                className="flex items-center gap-0.5 text-xs font-medium cursor-pointer"
                style={{ color: '#EC4899' }}
              >
                View all <ChevronRight size={13} />
              </Link>
            </div>
            <div>
              {recentTx.map((tx, i) => {
                const isIncome = tx.type === 'income';
                const amtColor = isIncome ? '#22C55E' : '#111827';
                const iconBg = isIncome ? '#F0FDF4' : '#F8FAFC';
                const IconComp = isIncome ? ArrowUpRight : ArrowDownLeft;
                const iconColor = isIncome ? '#22C55E' : '#9CA3AF';
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                    style={{
                      borderTop: i > 0 ? '1px solid #F3F4F6' : undefined,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: iconBg }}
                    >
                      <IconComp size={16} style={{ color: iconColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#111827' }}>
                        {tx.categoryName}
                      </p>
                      {tx.notes && (
                        <p className="text-[11px] truncate" style={{ color: '#9CA3AF' }}>{tx.notes}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold tabular-nums" style={{ color: amtColor }}>
                        {isIncome ? '+' : '-'}{fmtAmt(tx.amount, sym)}
                      </p>
                      <p className="text-[10px]" style={{ color: '#9CA3AF' }}>{fmtDate(tx.date)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── 8. Quick actions ─────────────────────────────────────────────── */}
      <motion.div {...s(8)}>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setQuickAddOpen(true)}
            className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer border transition-colors min-h-[56px]"
            style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
          >
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
            >
              <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold" style={{ ...displayFont, color: '#111827' }}>Quick Add</span>
          </motion.button>
          <Link
            href="/goals"
            className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer border transition-colors min-h-[56px]"
            style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#EDE9FE' }}>
              <Target size={18} style={{ color: '#8B5CF6' }} />
            </div>
            <span className="text-sm font-semibold" style={{ ...displayFont, color: '#111827' }}>View Goals</span>
          </Link>
          <Link
            href="/budget"
            className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer border transition-colors min-h-[56px]"
            style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#EFF6FF' }}>
              <BarChart2 size={18} style={{ color: '#60A5FA' }} />
            </div>
            <span className="text-sm font-semibold" style={{ ...displayFont, color: '#111827' }}>Budget</span>
          </Link>
          <Link
            href="/tracking"
            className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer border transition-colors min-h-[56px]"
            style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#F0FDF4' }}>
              <TrendingUp size={18} style={{ color: '#22C55E' }} />
            </div>
            <span className="text-sm font-semibold" style={{ ...displayFont, color: '#111827' }}>Insights</span>
          </Link>
        </div>
      </motion.div>

      {/* ── Quick Add Sheet ───────────────────────────────────────────────── */}
      <QuickAddSheet isOpen={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </div>
  );
}
