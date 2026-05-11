'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Target,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { GoalProgressRing } from '@/components/goals/GoalProgressRing';
import type { GoalSavingsRecommendation } from '@/types/goals';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(amount: number, sym: string): string {
  return sym + amount.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  'on-track': {
    label: 'On track',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    text: '#15803D',
    ring: '#22C55E',
    Icon: CheckCircle2,
  },
  tight: {
    label: 'Tight',
    bg: '#FFFBEB',
    border: '#FDE68A',
    text: '#B45309',
    ring: '#F59E0B',
    Icon: AlertTriangle,
  },
  'needs-adjusting': {
    label: 'Needs adjusting',
    bg: '#FFF1F2',
    border: '#FECDD3',
    text: '#BE123C',
    ring: '#F43F5E',
    Icon: AlertTriangle,
  },
  'no-date': {
    label: 'No target date',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    text: '#1D4ED8',
    ring: '#60A5FA',
    Icon: Info,
  },
  'already-reached': {
    label: 'Goal reached!',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    text: '#15803D',
    ring: '#22C55E',
    Icon: CheckCircle2,
  },
} as const;

// ─── Single bubble card ───────────────────────────────────────────────────────
function GoalBubbleCard({
  rec,
  sym,
  isPrimary,
}: {
  rec: GoalSavingsRecommendation;
  sym: string;
  isPrimary: boolean;
}) {
  const [mathOpen, setMathOpen] = useState(false);
  const cfg = STATUS_CONFIG[rec.status];

  const ringColor =
    rec.status === 'on-track' || rec.status === 'already-reached'
      ? '#22C55E'
      : rec.status === 'tight'
      ? '#F59E0B'
      : rec.status === 'no-date'
      ? '#60A5FA'
      : '#F43F5E';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border overflow-hidden"
      style={{
        background: '#FFFFFF',
        borderColor: '#E5E7EB',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        minWidth: isPrimary ? undefined : 280,
        maxWidth: isPrimary ? undefined : 300,
      }}
    >
      {/* Gradient top accent strip */}
      <div
        className="h-1 w-full"
        style={{ background: 'linear-gradient(90deg, #EC4899 0%, #8B5CF6 100%)' }}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #FDF2F8 0%, #EDE9FE 100%)' }}
            >
              <Target size={18} style={{ color: '#EC4899' }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium">Savings goal</p>
              <p className="text-sm font-bold text-gray-900 truncate">{rec.goalName}</p>
            </div>
          </div>
          {/* Status badge */}
          <span
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 flex items-center gap-1"
            style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}
          >
            <cfg.Icon size={11} />
            {cfg.label}
          </span>
        </div>

        {/* Progress ring + key numbers */}
        <div className="flex items-center gap-4 mb-4">
          <GoalProgressRing
            percent={rec.progressPercent}
            size={80}
            strokeWidth={7}
            color={ringColor}
            trackColor="#F3F4F6"
          >
            <span className="text-sm font-bold text-gray-900">{rec.progressPercent}%</span>
          </GoalProgressRing>

          <div className="flex-1 space-y-1.5">
            <div>
              <p className="text-xs text-gray-500">Saved so far</p>
              <p className="text-base font-bold text-gray-900">{fmt(rec.currentSavedAmount, sym)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Target</p>
              <p className="text-base font-bold" style={{ color: '#8B5CF6' }}>
                {fmt(rec.targetAmount, sym)}
              </p>
            </div>
            {rec.remainingGoalAmount > 0 && (
              <div>
                <p className="text-xs text-gray-500">Remaining</p>
                <p className="text-sm font-semibold text-gray-700">
                  {fmt(rec.remainingGoalAmount, sym)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Status message */}
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">{rec.statusMessage}</p>

        {/* Recommendation box — only when there's a useful savings figure */}
        {rec.status !== 'already-reached' && rec.suggestedWeeklySavings > 0 && (
          <div
            className="rounded-2xl p-4 mb-4"
            style={{
              background: 'linear-gradient(135deg, #FDF2F8 0%, #EDE9FE 100%)',
              border: '1px solid #FBCFE8',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} style={{ color: '#EC4899' }} />
              <p className="text-xs font-semibold text-gray-700">Recommended weekly savings</p>
            </div>
            <p className="text-2xl font-extrabold" style={{ color: '#EC4899' }}>
              {fmt(rec.suggestedWeeklySavings, sym)}
              <span className="text-sm font-medium text-gray-500">/week</span>
            </p>
            {rec.requiredWeeklySavings != null && rec.requiredWeeklySavings > rec.suggestedWeeklySavings && (
              <p className="text-xs text-gray-500 mt-1">
                Goal requires {fmt(rec.requiredWeeklySavings, sym)}/week &mdash; that&apos;s{' '}
                {fmt(rec.shortfallPerWeek, sym)}/week more than your safe capacity.
              </p>
            )}
            {rec.requiredWeeklySavings != null && rec.requiredWeeklySavings <= rec.suggestedWeeklySavings && rec.weeksRemaining != null && (
              <p className="text-xs text-gray-500 mt-1">
                Save {fmt(rec.requiredWeeklySavings, sym)}/week to reach your goal by{' '}
                {rec.weeksRemaining != null
                  ? `${Math.round(rec.weeksRemaining)} weeks from now`
                  : 'your target date'}
                .
              </p>
            )}
          </div>
        )}

        {/* Shortfall / suggested date */}
        {rec.suggestedNewTargetDate && (
          <div
            className="rounded-2xl p-3 mb-4 flex items-start gap-2"
            style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
          >
            <Info size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#B45309' }} />
            <p className="text-xs text-amber-700">
              Based on your budget, a more realistic target date might be{' '}
              <strong>{fmtDate(rec.suggestedNewTargetDate)}</strong>.
            </p>
          </div>
        )}

        {/* "Math behind this" expandable */}
        <button
          onClick={() => setMathOpen((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors mb-1 w-full"
        >
          {mathOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          Math behind this
        </button>

        <AnimatePresence>
          {mathOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div
                className="rounded-2xl p-4 mt-2 space-y-2"
                style={{ background: '#F8FAFC', border: '1px solid #E5E7EB' }}
              >
                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                  Your weekly income is{' '}
                  <strong className="text-gray-800">{fmt(rec.weeklyIncome, sym)}</strong>. After
                  bills, debt payments, and essential spending, you have about{' '}
                  <strong className="text-gray-800">
                    {fmt(rec.weeklyAvailableAfterCommitments, sym)}
                  </strong>{' '}
                  left. To stay safe, HappySpends recommends saving up to 70% of that, which is{' '}
                  <strong className="text-gray-800">{fmt(rec.safeSavingsCapacity, sym)}/week</strong>.
                </p>
                {[
                  { label: 'Weekly income', value: rec.weeklyIncome, positive: true },
                  { label: 'Bills & subscriptions', value: rec.weeklyBills },
                  { label: 'Debt payments', value: rec.weeklyDebtPayments },
                  { label: 'Essential spending', value: rec.weeklyEssentialSpending },
                  {
                    label: 'Available after commitments',
                    value: rec.weeklyAvailableAfterCommitments,
                    highlight: true,
                  },
                  {
                    label: 'Safe savings capacity (70%)',
                    value: rec.safeSavingsCapacity,
                    highlight: true,
                  },
                  ...(rec.requiredWeeklySavings != null
                    ? [{ label: 'Required weekly savings', value: rec.requiredWeeklySavings }]
                    : []),
                  ...(rec.shortfallPerWeek > 0
                    ? [{ label: 'Shortfall per week', value: rec.shortfallPerWeek, warn: true }]
                    : []),
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-xs">
                    <span
                      className={
                        'highlight' in row && row.highlight
                          ? 'font-semibold text-gray-700'
                          : 'text-gray-500'
                      }
                    >
                      {row.label}
                    </span>
                    <span
                      className="font-bold tabular-nums"
                      style={{
                        color:
                          'warn' in row && row.warn
                            ? '#B45309'
                            : 'highlight' in row && row.highlight
                            ? '#EC4899'
                            : '#positive' in row
                            ? '#15803D'
                            : '#374151',
                      }}
                    >
                      {'positive' in row && row.positive ? '+' : row.value > 0 ? '-' : ''}
                      {fmt(row.value, sym)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA row */}
        <div className="flex gap-2 mt-4">
          <Link
            href="/goals"
            className="flex-1 text-center text-xs font-semibold py-2.5 rounded-2xl transition-all"
            style={{
              background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
              color: '#FFFFFF',
            }}
          >
            View goal
          </Link>
          <Link
            href="/goals"
            className="flex-1 text-center text-xs font-semibold py-2.5 rounded-2xl border transition-all hover:bg-gray-50"
            style={{ borderColor: '#E5E7EB', color: '#6B7280' }}
          >
            Adjust goal
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────
interface GoalSavingsBubbleProps {
  recommendations: GoalSavingsRecommendation[];
  sym: string;
}

export function GoalSavingsBubble({ recommendations, sym }: GoalSavingsBubbleProps) {
  if (recommendations.length === 0) {
    return (
      <div
        className="rounded-3xl p-5 flex items-center gap-4 border"
        style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #FDF2F8 0%, #EDE9FE 100%)' }}
        >
          <Target size={22} style={{ color: '#EC4899' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">No savings goals yet</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Add a goal to see how much to save each week.
          </p>
        </div>
        <Link href="/goals">
          <ChevronRight size={18} className="text-gray-400" />
        </Link>
      </div>
    );
  }

  const [primary, ...rest] = recommendations;

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">Savings Goals</p>
        {recommendations.length > 1 && (
          <Link href="/goals" className="text-xs font-medium" style={{ color: '#EC4899' }}>
            See all {recommendations.length} &rarr;
          </Link>
        )}
      </div>

      {/* Primary goal */}
      <GoalBubbleCard rec={primary} sym={sym} isPrimary />

      {/* Secondary goals — horizontal scroll */}
      {rest.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4">
          {rest.map((rec) => (
            <GoalBubbleCard key={rec.goalId} rec={rec} sym={sym} isPrimary={false} />
          ))}
        </div>
      )}
    </div>
  );
}
