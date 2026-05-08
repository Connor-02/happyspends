'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 rounded-full border-4 border-pink-400 border-t-transparent animate-spin" />
    </div>
  );
}
