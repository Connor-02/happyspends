'use client';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStepCardProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  hint?: string;
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
  hint,
  children,
  onNext,
  onBack,
  onSkip,
  nextLabel = 'Continue',
  nextDisabled = false,
}: OnboardingStepCardProps) {
  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: '#F8FAFC' }}
    >
      {/* Soft ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at top right, rgba(236,72,153,0.10), transparent 40%)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at bottom left, rgba(96,165,250,0.08), transparent 45%)' }}
        />
      </div>

      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-5 pt-12 pb-3"
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          background: 'rgba(248,250,252,0.85)',
          borderBottom: '1px solid #F3F4F6',
        }}
      >
        {/* Back button */}
        <div className="w-10">
          {onBack && (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={onBack}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Segmented progress */}
        <div className="flex-1 flex gap-1.5 mx-3">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="relative flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#E5E7EB' }}>
              {i < step && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ originX: 0, background: 'linear-gradient(90deg, #EC4899, #8B5CF6)' }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Skip */}
        <div className="w-10 flex justify-end">
          {onSkip && (
            <button
              onClick={onSkip}
              className="text-xs font-semibold py-1 px-1 transition-colors"
              style={{ color: '#9CA3AF' }}
            >
              Skip
            </button>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="px-5 pt-6 pb-4 max-w-[580px] mx-auto w-full">
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-5"
          >
            <p
              className="text-xs font-bold tracking-widest uppercase mb-1.5"
              style={{ color: '#EC4899' }}
            >
              Step {step} of {totalSteps}
            </p>
            <h1 className="text-2xl font-extrabold leading-tight" style={{ color: '#111827' }}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm mt-1.5 leading-relaxed" style={{ color: '#6B7280' }}>
                {subtitle}
              </p>
            )}
            {hint && (
              <div
                className="mt-3 flex items-start gap-2.5 rounded-2xl px-3.5 py-2.5"
                style={{
                  background: 'rgba(236,72,153,0.06)',
                  border: '1px solid rgba(236,72,153,0.18)',
                }}
              >
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  style={{ color: '#EC4899' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs leading-relaxed" style={{ color: '#BE185D' }}>
                  {hint}
                </p>
              </div>
            )}
          </motion.div>
          {children}
        </div>
      </div>

      {/* Footer */}
      <div
        className="sticky bottom-0 px-5 py-4 safe-bottom relative z-10"
        style={{ background: '#FFFFFF', borderTop: '1px solid #F3F4F6' }}
      >
        <div className="flex gap-3 max-w-[580px] mx-auto">
          {onBack && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onBack}
              className="flex-1 py-4 rounded-2xl text-sm font-semibold transition-all"
              style={{ background: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB' }}
            >
              Back
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: nextDisabled ? 1 : 0.97 }}
            onClick={onNext}
            disabled={nextDisabled}
            className={cn(
              'py-4 rounded-2xl font-bold text-sm text-white transition-all',
              onBack ? 'flex-[2]' : 'w-full',
            )}
            style={
              nextDisabled
                ? { background: '#D1D5DB', cursor: 'not-allowed', opacity: 0.6 }
                : {
                    background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
                    boxShadow: '0 4px 20px rgba(236,72,153,0.28)',
                  }
            }
          >
            {nextLabel}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
