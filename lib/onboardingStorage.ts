import type { OnboardingState, SpendingCategoryItem } from '@/types/budget';
import { today } from '@/lib/utils';

const KEY = 'happyspends_onboarding';

const DEFAULT_SPENDING: SpendingCategoryItem[] = [
  { id: 'groceries', name: 'Groceries', icon: '🛒', amount: 0 },
  { id: 'transport', name: 'Fuel & Transport', icon: '🚗', amount: 0 },
  { id: 'eating-out', name: 'Eating Out', icon: '🍕', amount: 0 },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', amount: 0 },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', amount: 0 },
  { id: 'health', name: 'Health', icon: '💊', amount: 0 },
  { id: 'pets', name: 'Pets', icon: '🐾', amount: 0 },
  { id: 'gifts', name: 'Gifts', icon: '🎁', amount: 0 },
  { id: 'personal-care', name: 'Personal Care', icon: '💅', amount: 0 },
  { id: 'other-spending', name: 'Other', icon: '📦', amount: 0 },
];

export function getDefaultOnboardingState(): OnboardingState {
  return {
    version: 1,
    currentStep: 0,
    setup: {
      name: '',
      currency: 'AUD',
      currencySymbol: '$',
      budgetPeriod: 'monthly',
      startDate: today(),
      rollover: 0,
    },
    incomeSources: [],
    bills: [],
    subscriptions: [],
    spendingCategories: DEFAULT_SPENDING.map((c) => ({ ...c })),
    savingsGoals: [],
    debtGoals: [],
  };
}

export function loadOnboardingState(): OnboardingState {
  if (typeof window === 'undefined') return getDefaultOnboardingState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return getDefaultOnboardingState();
    const parsed = JSON.parse(raw) as OnboardingState;
    // Backfill spending categories if missing (schema update)
    if (!parsed.spendingCategories || parsed.spendingCategories.length === 0) {
      parsed.spendingCategories = DEFAULT_SPENDING.map((c) => ({ ...c }));
    }
    return parsed;
  } catch {
    return getDefaultOnboardingState();
  }
}

export function saveOnboardingState(state: OnboardingState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save onboarding state', e);
  }
}

export function clearOnboardingState(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
