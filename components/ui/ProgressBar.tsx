'use client';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // 0-1
  color?: string;
  className?: string;
  height?: string;
}

export function ProgressBar({ value, color = '#ec4899', className, height = 'h-2' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value * 100));
  const barColor =
    value >= 1 ? '#ef4444' : value >= 0.8 ? '#f59e0b' : color;

  return (
    <div className={cn('w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden', height, className)}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: barColor }}
      />
    </div>
  );
}
