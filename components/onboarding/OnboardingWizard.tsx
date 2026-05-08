'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { OnboardingState } from '@/types/budget';
import {
  loadOnboardingState,
  saveOnboardingState,
  clearOnboardingState,
} from '@/lib/onboardingStorage';
import { buildAppStoreFromOnboarding } from '@/lib/budgetCalculations';
import { saveStore } from '@/lib/store';
import { WelcomeStep } from './WelcomeStep';
import { SetupStep } from './SetupStep';
import { IncomeStep } from './IncomeStep';
import { BillsStep } from './BillsStep';
import { SubscriptionsStep } from './SubscriptionsStep';
import { SpendingStep } from './SpendingStep';
import { SavingsGoalsStep } from './SavingsGoalsStep';
import { DebtGoalsStep } from './DebtGoalsStep';
import { ReviewStep } from './ReviewStep';

const TOTAL_STEPS = 10;

export function OnboardingWizard() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState | null>(null);
  const [finishing, setFinishing] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setState(loadOnboardingState());
  }, []);

  // Auto-save on every state change
  useEffect(() => {
    if (state) saveOnboardingState(state);
  }, [state]);

  const update = useCallback((partial: Partial<OnboardingState>) => {
    setState((s) => (s ? { ...s, ...partial } : s));
  }, []);

  const next = useCallback(() => {
    setState((s) => (s ? { ...s, currentStep: Math.min(s.currentStep + 1, TOTAL_STEPS - 1) } : s));
  }, []);

  const back = useCallback(() => {
    setState((s) => (s ? { ...s, currentStep: Math.max(s.currentStep - 1, 0) } : s));
  }, []);

  async function complete() {
    if (!state) return;
    setFinishing(true);
    const appStore = buildAppStoreFromOnboarding(state);
    saveStore(appStore);
    clearOnboardingState();
    // Brief success pause before redirect
    await new Promise((r) => setTimeout(r, 2200));
    router.push('/dashboard');
  }

  // Loading state
  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 rounded-full border-4 border-pink-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Finishing / success screen
  if (finishing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-pink-50 to-white dark:from-gray-950 dark:to-gray-900 px-6 text-center gap-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring', bounce: 0.5 }}
          className="text-8xl"
        >
          🎉
        </motion.div>
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3 max-w-xs"
        >
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Your first budget is ready!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
            Head to your dashboard to see your full budget overview and start tracking.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center gap-2 text-pink-500"
        >
          <div className="w-4 h-4 rounded-full border-2 border-pink-400 border-t-transparent animate-spin" />
          <span className="text-sm font-semibold">Opening your dashboard…</span>
        </motion.div>
      </div>
    );
  }

  const { currentStep } = state;

  // Slide direction
  const slideVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onStart={next} />;

      case 1:
        return (
          <SetupStep
            setup={state.setup}
            onChange={(setup) => update({ setup })}
            onNext={next}
            onBack={back}
          />
        );

      case 2:
        return (
          <IncomeStep
            incomeSources={state.incomeSources}
            onChange={(incomeSources) => update({ incomeSources })}
            currencySymbol={state.setup.currencySymbol}
            onNext={next}
            onBack={back}
            onSkip={next}
          />
        );

      case 3:
        return (
          <BillsStep
            bills={state.bills}
            onChange={(bills) => update({ bills })}
            currencySymbol={state.setup.currencySymbol}
            onNext={next}
            onBack={back}
            onSkip={next}
          />
        );

      case 4:
        return (
          <SubscriptionsStep
            subscriptions={state.subscriptions}
            onChange={(subscriptions) => update({ subscriptions })}
            currencySymbol={state.setup.currencySymbol}
            onNext={next}
            onBack={back}
            onSkip={next}
          />
        );

      case 5:
        return (
          <SpendingStep
            spendingCategories={state.spendingCategories}
            onChange={(spendingCategories) => update({ spendingCategories })}
            currencySymbol={state.setup.currencySymbol}
            budgetPeriod={state.setup.budgetPeriod}
            onNext={next}
            onBack={back}
          />
        );

      case 6:
        return (
          <SavingsGoalsStep
            savingsGoals={state.savingsGoals}
            onChange={(savingsGoals) => update({ savingsGoals })}
            currencySymbol={state.setup.currencySymbol}
            onNext={next}
            onBack={back}
            onSkip={next}
          />
        );

      case 7:
        return (
          <DebtGoalsStep
            debtGoals={state.debtGoals}
            onChange={(debtGoals) => update({ debtGoals })}
            currencySymbol={state.setup.currencySymbol}
            onNext={next}
            onBack={back}
            onSkip={next}
          />
        );

      case 8:
        return (
          <ReviewStep
            state={state}
            onNext={complete}
            onBack={back}
          />
        );

      default:
        return <WelcomeStep onStart={next} />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="min-h-screen"
      >
        {renderStep()}
      </motion.div>
    </AnimatePresence>
  );
}
