'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OnboardingStepCardProps {
  step: number;        // 1-based display (e.g. 2 of 9)
  totalSteps: number;
  title: string;
  subtitle?: string;
  hint?: string;       // small contextual tip shown below subtitle
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
    /* Dark gradient shell â€” always rendered in "night" palette */
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg,#0B0B1A 0%,#1A0E3A 55%,#0D1429 100%)' }}
    >
      {/* Decorative ambient blobs */}
      <div className="pointer-events-none absolute -top-36 -right-24 w-96 h-96 rounded-full opacity-30 blur-3xl" style={{ background: '#FF5FA2' }} />
      <div className="pointer-events-none absolute -bottom-28 -left-24 w-96 h-96 rounded-full opacity-25 blur-3xl" style={{ background: '#9B6DFF' }} />
      <div className="pointer-events-none absolute top-1/2 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: '#6C63FF' }} />

      {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-5 pt-12 pb-4"
        style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', background: 'rgba(11,11,26,0.6)' }}>
        {/* Back button */}
        <div className="w-10">
          {onBack && (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={onBack}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
          )}
        </div>

        {/* Segmented progress */}
        <div className="flex-1 flex gap-1.5 mx-3">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="relative flex-1 h-1 rounded-full overflow-hidden bg-white/15">
              {i < step && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ originX: 0, background: 'linear-gradient(90deg,#FF5FA2,#9B6DFF)' }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Skip button */}
        <div className="w-10 flex justify-end">
          {onSkip && (
            <button onClick={onSkip} className="text-xs font-semibold text-white/50 hover:text-white/80 transition-colors py-1 px-1">
              Skip
            </button>
          )}
        </div>
      </div>

      {/* â”€â”€ Scrollable content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-6 pb-4 max-w-lg mx-auto">
          {/* Step heading */}
          <motion.div
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <p className="text-[11px] font-bold tracking-widest uppercase mb-2"
              style={{ color: '#FF5FA2' }}>
              Step {step} of {totalSteps}
            </p>
            <h1 className="text-2xl font-extrabold text-white leading-tight">{title}</h1>
            {subtitle && (
              <p className="text-sm text-white/55 mt-2 leading-relaxed">{subtitle}</p>
            )}
            {hint && (
              <div className="mt-3 flex items-start gap-2 rounded-2xl px-3.5 py-2.5" style={{ background: 'rgba(255,95,162,0.12)', border: '1px solid rgba(255,95,162,0.2)' }}>
                <span className="text-sm mt-0.5">ðŸ’¡</span>
                <p className="text-xs text-white/65 leading-relaxed">{hint}</p>
              </div>
            )}
          </motion.div>

          {children}
        </div>
      </div>

      {/* â”€â”€ Footer actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="sticky bottom-0 px-5 py-5 safe-bottom"
        style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', background: 'rgba(11,11,26,0.7)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex gap-3 max-w-lg mx-auto">
          {onBack && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onBack}
              className="flex-1 py-4 rounded-2xl text-sm font-semibold text-white/70 transition-all"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              â† Back
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: nextDisabled ? 1 : 0.96 }}
            onClick={onNext}
            disabled={nextDisabled}
            className={cn(
              'py-4 rounded-2xl font-bold text-sm transition-all',
              onBack ? 'flex-[2]' : 'w-full',
              nextDisabled
                ? 'opacity-40 cursor-not-allowed text-white/60'
                : 'text-white shadow-lg'
            )}
            style={nextDisabled ? { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' } : { background: 'linear-gradient(135deg,#FF5FA2 0%,#9B6DFF 100%)', boxShadow: '0 4px 24px rgba(255,95,162,0.35)' }}
          >
            {nextLabel}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
