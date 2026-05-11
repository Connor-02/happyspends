'use client';
import { motion } from 'framer-motion';

interface WelcomeStepProps {
  onStart: () => void;
}

const features = [
  { icon: 'âš¡', label: 'Setup in minutes', desc: 'Quick guided flow' },
  { icon: 'ðŸ”’', label: 'Private & secure', desc: 'Stays on your device' },
  { icon: 'âœï¸', label: 'Edit anytime', desc: 'No locked-in settings' },
];

const steps = [
  { icon: 'ðŸ’°', label: 'Income' },
  { icon: 'ðŸ§¾', label: 'Bills' },
  { icon: 'ðŸŽ¯', label: 'Goals' },
  { icon: 'ðŸ“Š', label: 'Insights' },
];

export function WelcomeStep({ onStart }: WelcomeStepProps) {
  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg,#0B0B1A 0%,#1A0E3A 55%,#0D1429 100%)' }}
    >
      {/* Blobs */}
      <div className="pointer-events-none absolute -top-36 -right-24 w-96 h-96 rounded-full opacity-35 blur-3xl" style={{ background: '#FF5FA2' }} />
      <div className="pointer-events-none absolute -bottom-28 -left-20 w-96 h-96 rounded-full opacity-25 blur-3xl" style={{ background: '#9B6DFF' }} />
      <div className="pointer-events-none absolute top-1/3 left-1/4 w-72 h-72 rounded-full opacity-10 blur-3xl" style={{ background: '#6C63FF' }} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-6 max-w-sm mx-auto w-full text-center">
        {/* Logo mark */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, type: 'spring', bounce: 0.45 }}
          className="mb-8 relative"
        >
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-2xl"
            style={{ background: 'linear-gradient(135deg,#FF5FA2 0%,#9B6DFF 100%)', boxShadow: '0 0 60px rgba(255,95,162,0.5)' }}
          >
            <span className="text-4xl">ðŸ’°</span>
          </div>
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            style={{ background: 'linear-gradient(135deg,#FF5FA2,#9B6DFF)', opacity: 0.3 }}
            animate={{ scale: [1, 1.18, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ y: 28, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.45 }}
          className="space-y-3 mb-8"
        >
          <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
            Meet your money<br />
            <span style={{ background: 'linear-gradient(90deg,#FF5FA2,#9B6DFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              assistant
            </span>
          </h1>
          <p className="text-white/55 text-base leading-relaxed">
            HappySpends helps everyday people feel confident about their money â€” no spreadsheets, no stress.
          </p>
        </motion.div>

        {/* Step previews */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex items-center gap-3 mb-8"
        >
          {steps.map((s, i) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                {s.icon}
              </div>
              <p className="text-[10px] text-white/45 font-medium">{s.label}</p>
              {i < steps.length - 1 && (
                <div className="absolute" />
              )}
            </div>
          ))}
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.52, duration: 0.4 }}
          className="grid grid-cols-3 gap-2 w-full mb-10"
        >
          {features.map((f) => (
            <div
              key={f.label}
              className="rounded-2xl p-3 text-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="text-xl mb-1">{f.icon}</div>
              <p className="text-[11px] font-bold text-white/80 leading-tight">{f.label}</p>
              <p className="text-[10px] text-white/40 mt-0.5 leading-tight">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.65, duration: 0.4 }}
        className="px-6 pb-12 max-w-sm mx-auto w-full"
      >
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onStart}
          className="w-full py-5 rounded-3xl font-bold text-lg text-white shadow-2xl"
          style={{ background: 'linear-gradient(135deg,#FF5FA2 0%,#9B6DFF 100%)', boxShadow: '0 6px 32px rgba(255,95,162,0.45)' }}
        >
          Get Started â†’
        </motion.button>
        <p className="text-center text-[11px] text-white/35 mt-3">
          Takes 3â€“5 minutes Â· No account needed Â· 100% private
        </p>
      </motion.div>
    </div>
  );
}
