'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/components/providers/StoreProvider';
import { Button } from '@/components/ui/Button';
import type { ThemeOption } from '@/lib/types';

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'CAD', symbol: '$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: '$', label: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', label: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', label: 'Mexican Peso' },
  { code: 'SGD', symbol: '$', label: 'Singapore Dollar' },
];

const THEMES: { id: ThemeOption; label: string; color: string }[] = [
  { id: 'pink', label: 'Pink', color: '#ec4899' },
  { id: 'blue', label: 'Blue', color: '#6366f1' },
  { id: 'dark', label: 'Dark', color: '#1f2937' },
  { id: 'system', label: 'System', color: '#6b7280' },
];

const STEPS = [
  'welcome',
  'name',
  'currency',
  'period',
  'theme',
  'done',
] as const;

type Step = (typeof STEPS)[number];

export default function OnboardingPage() {
  const router = useRouter();
  const { store, saveSettings, loadSeedData } = useStore();
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [theme, setTheme] = useState<ThemeOption>('pink');

  const stepIndex = STEPS.indexOf(step);
  const progress = stepIndex / (STEPS.length - 1);

  function next() {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }

  function back() {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }

  function finish(useSeed: boolean) {
    const cur = CURRENCIES.find((c) => c.code === currency)!;
    saveSettings({
      ...store.settings,
      name: name || 'Friend',
      currency: cur.code,
      currencySymbol: cur.symbol,
      budgetPeriod: period,
      theme,
      onboardingComplete: true,
    });
    if (useSeed) loadSeedData();
    router.push('/dashboard');
  }

  const slide = {
    initial: { x: 40, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
    transition: { type: 'spring' as const, damping: 25, stiffness: 300 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex flex-col">
      {/* Progress bar */}
      {step !== 'welcome' && (
        <div className="h-1 bg-gray-100">
          <motion.div
            className="h-full gradient-pink"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div key="welcome" {...slide} className="text-center space-y-6 w-full">
              <div className="w-24 h-24 rounded-3xl gradient-pink flex items-center justify-center mx-auto shadow-xl shadow-pink-200">
                <span className="text-5xl">🐷</span>
              </div>
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                  Happy<span className="text-pink-500">Spends</span>
                </h1>
                <p className="text-gray-500 text-lg">Personal Budgeting. Simplified.</p>
              </div>
              <div className="space-y-3 text-left">
                {[
                  { icon: '📊', text: 'Replace your spreadsheet with a smart app' },
                  { icon: '🎯', text: 'Track income, expenses, bills, and goals' },
                  { icon: '🔒', text: 'Your data stays on your device, always private' },
                  { icon: '📱', text: 'Works offline — install on your home screen' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
              <Button size="lg" className="w-full" onClick={next}>
                Let&apos;s Get Started →
              </Button>
            </motion.div>
          )}

          {step === 'name' && (
            <motion.div key="name" {...slide} className="space-y-6 w-full">
              <div className="text-center">
                <div className="text-5xl mb-4">👋</div>
                <h2 className="text-2xl font-bold text-gray-900">What should we call you?</h2>
                <p className="text-gray-500 mt-1">We&apos;ll personalise your experience</p>
              </div>
              <input
                type="text"
                placeholder="Your first name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border-2 border-gray-200 focus:border-pink-400 px-5 py-4 text-lg font-medium text-center outline-none transition-colors"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && next()}
              />
              <Button size="lg" className="w-full" onClick={next}>
                Continue
              </Button>
            </motion.div>
          )}

          {step === 'currency' && (
            <motion.div key="currency" {...slide} className="space-y-6 w-full">
              <div className="text-center">
                <div className="text-5xl mb-4">💰</div>
                <h2 className="text-2xl font-bold text-gray-900">Choose your currency</h2>
                <p className="text-gray-500 mt-1">You can change this later in settings</p>
              </div>
              <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setCurrency(c.code)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${
                      currency === c.code
                        ? 'border-pink-400 bg-pink-50'
                        : 'border-gray-100 bg-white'
                    }`}
                  >
                    <span className="text-xl font-bold text-pink-500 w-8 text-center">{c.symbol}</span>
                    <div>
                      <div className="font-semibold text-sm">{c.code}</div>
                      <div className="text-xs text-gray-400">{c.label}</div>
                    </div>
                  </button>
                ))}
              </div>
              <Button size="lg" className="w-full" onClick={next}>
                Continue
              </Button>
            </motion.div>
          )}

          {step === 'period' && (
            <motion.div key="period" {...slide} className="space-y-6 w-full">
              <div className="text-center">
                <div className="text-5xl mb-4">📅</div>
                <h2 className="text-2xl font-bold text-gray-900">Budget period</h2>
                <p className="text-gray-500 mt-1">How do you want to track your budget?</p>
              </div>
              <div className="space-y-3">
                {[
                  { id: 'monthly' as const, label: 'Monthly', desc: 'Track spending month by month', icon: '📆' },
                  { id: 'weekly' as const, label: 'Weekly', desc: 'Track your budget week by week', icon: '🗓️' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPeriod(p.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      period === p.id
                        ? 'border-pink-400 bg-pink-50'
                        : 'border-gray-100 bg-white'
                    }`}
                  >
                    <span className="text-3xl">{p.icon}</span>
                    <div>
                      <div className="font-bold text-gray-900">{p.label}</div>
                      <div className="text-sm text-gray-500">{p.desc}</div>
                    </div>
                    {period === p.id && (
                      <svg className="ml-auto w-5 h-5 text-pink-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              <Button size="lg" className="w-full" onClick={next}>
                Continue
              </Button>
            </motion.div>
          )}

          {step === 'theme' && (
            <motion.div key="theme" {...slide} className="space-y-6 w-full">
              <div className="text-center">
                <div className="text-5xl mb-4">🎨</div>
                <h2 className="text-2xl font-bold text-gray-900">Choose your theme</h2>
                <p className="text-gray-500 mt-1">Pick a look you love</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                      theme === t.id
                        ? 'border-pink-400 bg-pink-50'
                        : 'border-gray-100 bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="font-semibold text-sm text-gray-700">{t.label}</span>
                  </button>
                ))}
              </div>
              <Button size="lg" className="w-full" onClick={next}>
                Continue
              </Button>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div key="done" {...slide} className="text-center space-y-6 w-full">
              <div className="text-6xl">🎉</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  You&apos;re all set{name ? `, ${name}` : ''}!
                </h2>
                <p className="text-gray-500 mt-2">Want to explore with some demo data, or start fresh?</p>
              </div>
              <div className="space-y-3">
                <Button size="lg" className="w-full" onClick={() => finish(true)}>
                  🚀 Load Demo Data & Explore
                </Button>
                <Button variant="secondary" size="lg" className="w-full" onClick={() => finish(false)}>
                  Start Fresh (Empty)
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {step !== 'welcome' && step !== 'done' && (
          <button
            onClick={back}
            className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
