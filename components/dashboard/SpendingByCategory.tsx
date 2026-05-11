'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { CategorySummary } from '@/lib/types';

// ─── Colour pool for categories ──────────────────────────────────────────────
const PALETTE = [
  '#EC4899', '#8B5CF6', '#60A5FA', '#22C55E',
  '#F59E0B', '#F43F5E', '#06B6D4', '#A78BFA',
];

function fmt(n: number, sym: string) {
  return sym + n.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

interface Props {
  summaries: CategorySummary[];
  sym: string;
}

export function SpendingByCategory({ summaries, sym }: Props) {
  const [expanded, setExpanded] = useState(false);

  // Only expense + bill categories with planned > 0 or actual > 0
  const spending = useMemo(() => {
    const cats = summaries.filter(
      (s) => (s.category.type === 'expense' || s.category.type === 'bill') &&
             (s.category.planned > 0 || s.actual > 0)
    );
    // Sort by actual descending
    return cats.sort((a, b) => b.actual - a.actual);
  }, [summaries]);

  if (spending.length === 0) return null;

  const totalSpent = spending.reduce((s, c) => s + c.actual, 0);

  // Donut data — max 5 slices + Other
  const donutItems = spending.slice(0, 5);
  const otherTotal = spending.slice(5).reduce((s, c) => s + c.actual, 0);
  const donutData = [
    ...donutItems.map((s, i) => ({
      name: s.category.name,
      value: s.actual,
      color: PALETTE[i % PALETTE.length],
    })),
    ...(otherTotal > 0 ? [{ name: 'Other', value: otherTotal, color: '#D1D5DB' }] : []),
  ];

  const visibleRows = expanded ? spending : spending.slice(0, 4);

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <p className="text-sm font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#111827' }}>
          Spending by Category
        </p>
        <Link
          href="/budget"
          className="flex items-center gap-0.5 text-xs font-medium cursor-pointer"
          style={{ color: '#EC4899' }}
        >
          View all <ChevronRight size={13} />
        </Link>
      </div>

      {/* Donut */}
      {totalSpent > 0 && (
        <div className="relative mx-auto" style={{ width: 180, height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {donutData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [fmt(value, sym), '']}
                contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Centre label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[10px] font-medium" style={{ color: '#9CA3AF' }}>Spent</p>
            <p
              className="text-base font-extrabold tabular-nums leading-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#111827' }}
            >
              {fmt(totalSpent, sym)}
            </p>
          </div>
        </div>
      )}

      {/* Category rows */}
      <div className="px-4 pb-3 space-y-3">
        <AnimatePresence initial={false}>
          {visibleRows.map((s, i) => {
            const color = PALETTE[i % PALETTE.length];
            const pct = Math.min(100, Math.round(s.progress * 100));
            const statusColor =
              s.status === 'over' ? '#F43F5E' :
              s.status === 'warning' ? '#F59E0B' : '#22C55E';

            return (
              <motion.div
                key={s.category.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-xs font-medium truncate max-w-[130px]" style={{ color: '#374151' }}>
                      {s.category.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold tabular-nums" style={{ color: '#111827' }}>
                      {fmt(s.actual, sym)}
                    </span>
                    {s.category.planned > 0 && (
                      <span className="text-[10px] tabular-nums" style={{ color: '#9CA3AF' }}>
                        / {fmt(s.category.planned, sym)}
                      </span>
                    )}
                  </div>
                </div>
                {s.category.planned > 0 && (
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{ background: statusColor }}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Show more / less */}
        {spending.length > 4 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium cursor-pointer pt-1"
            style={{ color: '#6B7280' }}
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? 'Show less' : `Show ${spending.length - 4} more`}
          </button>
        )}
      </div>
    </div>
  );
}
