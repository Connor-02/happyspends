'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OnboardingStepCardProps {
  step: number; // 1-based display number (e.g. 2 of 10)
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}

export function OnboardingStepCard({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  onNext,
  onBack,
  onSkip,
  nextLabel = 'Continue',
  nextDisabled = false,
}: OnboardingStepCardProps) {
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Sticky progress header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-wide">
            STEP {step} OF {totalSteps}
          </span>
          {onSkip && (
            <button
              onClick={onSkip}
              className="text-sm text-pink-500 font-semibold py-1 px-2 -mr-2 rounded-lg active:bg-pink-50 dark:active:bg-pink-900/20 transition-colors"
            >
              Skip
            </button>
          )}
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-pink-400 to-pink-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-5 max-w-lg mx-auto">
          <motion.div
            key={step}
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="mb-5"
          >
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1.5 leading-relaxed">
                {subtitle}
              </p>
            )}
          </motion.div>

          {children}
        </div>
      </div>

      {/* Sticky bottom navigation */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-4 safe-bottom">
        <div className="flex gap-3 max-w-lg mx-auto">
          {onBack && (
            <button
              onClick={onBack}
              className="flex-1 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-sm active:scale-95 transition-transform"
            >
              ← Back
            </button>
          )}
          <button
            onClick={onNext}
            disabled={nextDisabled}
            className={cn(
              'flex-[2] py-4 rounded-2xl font-bold text-sm transition-all',
              nextDisabled
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-200 dark:shadow-pink-900/30 active:scale-95'
            )}
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
