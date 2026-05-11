'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { performCheckIn, getCheckInStatus } from '@/lib/premiumStorage';
import { formatCurrency } from '@/lib/calculations';

interface DailyCheckInProps {
  amountLeft: number;
  sym: string;
}

export function DailyCheckIn({ amountLeft, sym }: DailyCheckInProps) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const status = getCheckInStatus();
    setCheckedIn(status.checkedInToday);
    setStreak(status.streak);
  }, []);

  if (!mounted) return null;

  const handleCheckIn = () => {
    const result = performCheckIn();
    setCheckedIn(true);
    setStreak(result.streak);
    if (result.isFirstToday) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  const greetings = ["Let's keep the streak alive! 🔥", "You've got this today 💪", "Every day counts ✨", "Stay on track! 🎯"];
  const greeting = greetings[streak % greetings.length];

  return (
    <div className="relative overflow-hidden rounded-2xl gradient-pink p-4 text-white">
      {/* Confetti particles */}
      <AnimatePresence>
        {showConfetti &&
          Array.from({ length: 12 }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 1, y: 0, x: 0, scale: 0 }}
              animate={{
                opacity: 0,
                y: -60 - Math.random() * 60,
                x: (Math.random() - 0.5) * 120,
                scale: 1,
                rotate: Math.random() * 360,
              }}
              transition={{ duration: 0.9, delay: i * 0.05 }}
              className="absolute text-xl pointer-events-none"
              style={{ left: '50%', top: '40%' }}
            >
              {['🎉', '⭐', '✨', '🌟', '💫'][i % 5]}
            </motion.span>
          ))}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-pink-100 text-xs font-medium">Today's Check-in</p>
          <p className="text-xl font-extrabold mt-0.5">
            {checkedIn ? `${streak} day streak! 🔥` : greeting}
          </p>
          <p className="text-pink-100 text-xs mt-1">
            {formatCurrency(amountLeft, sym)} left to spend this period
          </p>
        </div>

        <AnimatePresence mode="wait">
          {checkedIn ? (
            <motion.div
              key="done"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center"
            >
              <span className="text-3xl">✅</span>
            </motion.div>
          ) : (
            <motion.button
              key="cta"
              whileTap={{ scale: 0.92 }}
              onClick={handleCheckIn}
              className="bg-white text-pink-600 font-bold text-sm px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              Check in
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
