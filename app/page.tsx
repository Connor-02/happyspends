'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { loadStore } from '@/lib/store';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const MIN_SPLASH_MS = 2000;
    const start = Date.now();

    const store = loadStore();
    const target = store.settings.onboardingComplete ? '/dashboard' : '/onboarding';

    const elapsed = Date.now() - start;
    const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);

    const timer = setTimeout(() => {
      router.replace(target);
    }, remaining);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: '#FFFFFF' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col items-center gap-10"
      >
        <Image
          src="/otterlogo.png"
          alt="Otter Money"
          width={320}
          height={200}
          priority
          style={{ width: '100%', maxWidth: 300, height: 'auto', objectFit: 'contain' }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex flex-col items-center gap-3"
        >
          <div
            className="w-6 h-6 rounded-full border-2 animate-spin"
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
