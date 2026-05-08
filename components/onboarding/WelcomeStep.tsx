'use client';
import { motion } from 'framer-motion';

interface WelcomeStepProps {
  onStart: () => void;
}

const features = [
  { icon: '⏱️', label: '3–5 minutes' },
  { icon: '🔒', label: 'Stays on device' },
  { icon: '✏️', label: 'Edit anytime' },
];

export function WelcomeStep({ onStart }: WelcomeStepProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50 via-white to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-6 text-center gap-7 max-w-xs mx-auto w-full">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
          className="text-8xl select-none"
        >
          💰
        </motion.div>

        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="space-y-3"
        >
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Let&apos;s set up your first budget 🎉
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
            We&apos;ll guide you step-by-step — no spreadsheets, no stress. Just a few
            simple questions and you&apos;ll have a real budget ready to go.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="grid grid-cols-3 gap-3 w-full"
        >
          {features.map((f) => (
            <div
              key={f.label}
              className="bg-white dark:bg-gray-800 rounded-2xl p-3.5 shadow-sm border border-gray-100 dark:border-gray-700 text-center"
            >
              <div className="text-2xl mb-1">{f.icon}</div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 leading-tight">
                {f.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ y: 32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="px-6 pb-10 max-w-xs mx-auto w-full"
      >
        <button
          onClick={onStart}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold text-lg shadow-lg shadow-pink-200 dark:shadow-pink-900/30 active:scale-95 transition-transform"
        >
          Get Started →
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">
          No account needed. Your data stays private on your phone.
        </p>
      </motion.div>
    </div>
  );
}
