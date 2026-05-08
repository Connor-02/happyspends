import type { Frequency, OnboardingBudgetPeriod, OnboardingState } from '@/types/budget';
import type { AppStore, Category, Goal, UserSettings } from '@/lib/types';
import { generateId } from '@/lib/utils';

// ─── Frequency conversion ────────────────────────────────────────────────────
const PERIODS_PER_YEAR: Record<Frequency, number> = {
  weekly: 52,
  fortnightly: 26,
  monthly: 12,
  yearly: 1,
};

const BUDGET_PERIODS_PER_YEAR: Record<OnboardingBudgetPeriod, number> = {
  weekly: 52,
  fortnightly: 26,
  monthly: 12,
};

/** Normalise an amount from its billing frequency to the user's budget period */
export function normalizeAmount(
  amount: number,
  fromFrequency: Frequency,
  toPeriod: OnboardingBudgetPeriod
): number {
  const annual = amount * PERIODS_PER_YEAR[fromFrequency];
  return annual / BUDGET_PERIODS_PER_YEAR[toPeriod];
}

/** Human-readable per-period label */
export function periodLabel(period: OnboardingBudgetPeriod): string {
  if (period === 'weekly') return 'week';
  if (period === 'fortnightly') return 'fortnight';
  return 'month';
}

/** Readable frequency label */
export function freqLabel(freq: Frequency): string {
  const map: Record<Frequency, string> = {
    weekly: 'weekly',
    fortnightly: 'fortnightly',
    monthly: 'monthly',
    yearly: 'yearly',
  };
  return map[freq];
}

// ─── Review summary ───────────────────────────────────────────────────────────
export interface ReviewSummary {
  totalIncome: number;
  totalBills: number;
  totalSubscriptions: number;
  totalSpending: number;
  totalDebt: number;
  amountLeft: number;
  healthLabel: 'Looks healthy' | 'A little tight' | 'Needs attention';
  healthColor: string;
  healthEmoji: string;
}

export function computeOnboardingReview(state: OnboardingState): ReviewSummary {
  const p = state.setup.budgetPeriod;

  const totalIncome = state.incomeSources.reduce(
    (s, x) => s + normalizeAmount(x.amount, x.frequency, p), 0
  );
  const totalBills = state.bills.reduce(
    (s, x) => s + normalizeAmount(x.amount, x.frequency, p), 0
  );
  const totalSubscriptions = state.subscriptions.reduce(
    (s, x) => s + normalizeAmount(x.amount, x.frequency, p), 0
  );
  const totalSpending = state.spendingCategories.reduce((s, x) => s + x.amount, 0);
  const totalDebt = state.debtGoals.reduce(
    (s, x) => s + normalizeAmount(x.minimumPayment, x.paymentFrequency, p), 0
  );

  const totalOut = totalBills + totalSubscriptions + totalSpending + totalDebt;
  const amountLeft = totalIncome - totalOut + (state.setup.rollover ?? 0);

  let healthLabel: ReviewSummary['healthLabel'];
  let healthColor: string;
  let healthEmoji: string;

  if (totalIncome === 0 || amountLeft >= totalIncome * 0.2) {
    healthLabel = 'Looks healthy';
    healthColor = '#34d399';
    healthEmoji = '✅';
  } else if (amountLeft >= 0) {
    healthLabel = 'A little tight';
    healthColor = '#f59e0b';
    healthEmoji = '⚠️';
  } else {
    healthLabel = 'Needs attention';
    healthColor = '#ef4444';
    healthEmoji = '🔴';
  }

  return {
    totalIncome,
    totalBills,
    totalSubscriptions,
    totalSpending,
    totalDebt,
    amountLeft,
    healthLabel,
    healthColor,
    healthEmoji,
  };
}

// ─── Build AppStore from completed onboarding ─────────────────────────────────
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function buildAppStoreFromOnboarding(state: OnboardingState): AppStore {
  const p = state.setup.budgetPeriod;
  const categories: Category[] = [];
  const goals: Goal[] = [];

  // Income categories
  state.incomeSources.forEach((s) => {
    categories.push({
      id: generateId(),
      name: s.name,
      type: 'income',
      planned: round2(normalizeAmount(s.amount, s.frequency, p)),
    });
  });

  // Bill categories
  state.bills.forEach((b) => {
    categories.push({
      id: generateId(),
      name: b.name,
      type: 'bill',
      planned: round2(normalizeAmount(b.amount, b.frequency, p)),
    });
  });

  // Subscription categories (same type as bills)
  state.subscriptions.forEach((s) => {
    categories.push({
      id: generateId(),
      name: s.name,
      type: 'bill',
      planned: round2(normalizeAmount(s.amount, s.frequency, p)),
    });
  });

  // Expense categories
  state.spendingCategories.forEach((c) => {
    if (c.amount > 0) {
      categories.push({
        id: generateId(),
        name: c.name,
        type: 'expense',
        planned: c.amount,
      });
    }
  });

  // Debt payment categories + debt goals
  state.debtGoals.forEach((d) => {
    const payment = round2(normalizeAmount(d.minimumPayment, d.paymentFrequency, p));
    if (payment > 0) {
      categories.push({
        id: generateId(),
        name: `${d.name} — Payment`,
        type: 'debt',
        planned: payment,
      });
    }
    goals.push({
      id: generateId(),
      name: d.name,
      type: 'debt',
      startingAmount: d.startingBalance,
      targetAmount: 0,
      currentAmount: d.currentBalance,
      createdAt: new Date().toISOString(),
    });
  });

  // Savings goals
  state.savingsGoals.forEach((g) => {
    goals.push({
      id: generateId(),
      name: g.name,
      type: 'savings',
      startingAmount: g.currentAmount,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      createdAt: new Date().toISOString(),
    });
  });

  const settings: UserSettings = {
    name: state.setup.name || 'Friend',
    currency: state.setup.currency,
    currencySymbol: state.setup.currencySymbol,
    budgetPeriod: p === 'fortnightly' ? 'monthly' : (p as 'monthly' | 'weekly'),
    startDay: (() => {
      const d = new Date(state.setup.startDate);
      return isNaN(d.getTime()) ? 1 : d.getDate();
    })(),
    theme: 'pink',
    rollover: state.setup.rollover ?? 0,
    onboardingComplete: true,
  };

  return { settings, categories, transactions: [], goals, goalTransactions: [] };
}
