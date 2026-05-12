'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { loadStore } from '@/lib/store';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const store = loadStore();
    if (store.settings.onboardingComplete) {
      router.replace('/dashboard');
    } else {
      router.replace('/onboarding');
    }
  }, [router]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: '#FFFFFF' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col items-center gap-8"
      >
        <Image
          src="/branding/happyspends-full-logo.png"
          alt="HappySpends"
          width={300}
          height={180}
          priority
          style={{ width: '100%', maxWidth: 300, height: 'auto', objectFit: 'contain' }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.35 }}
          className="flex flex-col items-center gap-3"
        >
          <div
            className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#EC4899', borderTopColor: 'transparent' }}
          />
          <p
            className="text-sm font-medium"
            style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
          >
            Loading your budget…
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
