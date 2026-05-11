'use client';
import { motion } from 'framer-motion';
import { Wallet, ShieldCheck, Pencil, TrendingUp, FileText, Target, BarChart2 } from 'lucide-react';

interface WelcomeStepProps {
  onStart: () => void;
}

const features = [
  { Icon: TrendingUp, label: 'Setup in minutes', desc: 'Quick guided flow' },
  { Icon: ShieldCheck, label: 'Private & secure', desc: 'Stays on your device' },
  { Icon: Pencil, label: 'Edit anytime', desc: 'No locked-in settings' },
];

const steps = [
  { Icon: TrendingUp, label: 'Income', color: '#22C55E' },
  { Icon: FileText, label: 'Bills', color: '#8B5CF6' },
  { Icon: Target, label: 'Goals', color: '#EC4899' },
  { Icon: BarChart2, label: 'Insights', color: '#60A5FA' },
];

export function WelcomeStep({ onStart }: WelcomeStepProps) {
  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: '#F8FAFC' }}
    >
      {/* Soft ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at top right, rgba(236,72,153,0.14), transparent 42%)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at bottom left, rgba(96,165,250,0.11), transparent 46%)' }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-6 max-w-sm mx-auto w-full text-center relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
          className="mb-7"
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto"
            style={{
              background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
              boxShadow: '0 8px 32px rgba(236,72,153,0.32)',
            }}
          >
            <Wallet className="w-9 h-9 text-white" />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="space-y-3 mb-7"
        >
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight" style={{ color: '#111827' }}>
            Meet your money
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              assistant
            </span>
          </h1>
          <p className="text-base leading-relaxed" style={{ color: '#6B7280' }}>
            HappySpends helps everyday people feel confident about their money — no spreadsheets, no stress.
          </p>
        </motion.div>

        {/* Step previews */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="flex items-center gap-4 mb-7"
        >
          {steps.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1.5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              >
                <s.Icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <p className="text-[10px] font-medium" style={{ color: '#9CA3AF' }}>{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.48, duration: 0.4 }}
          className="grid grid-cols-3 gap-2 w-full mb-8"
        >
          {features.map((f) => (
            <div
              key={f.label}
              className="rounded-2xl p-3 text-center"
              style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              <div className="flex justify-center mb-1.5">
                <f.Icon className="w-4 h-4" style={{ color: '#EC4899' }} />
              </div>
              <p className="text-[11px] font-bold leading-tight" style={{ color: '#374151' }}>{f.label}</p>
              <p className="text-[10px] mt-0.5 leading-tight" style={{ color: '#9CA3AF' }}>{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ y: 32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="px-6 pb-12 max-w-sm mx-auto w-full relative z-10"
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="w-full py-4 rounded-3xl font-bold text-base text-white"
          style={{
            background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
            boxShadow: '0 6px 28px rgba(236,72,153,0.32)',
          }}
        >
          Get Started
        </motion.button>
        <p className="text-center text-xs mt-3" style={{ color: '#9CA3AF' }}>
          Takes 3–5 minutes · No account needed · 100% private
        </p>
      </motion.div>
    </div>
  );
}
