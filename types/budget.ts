// ─── Frequency ────────────────────────────────────────────────────────────────
export type Frequency = 'weekly' | 'fortnightly' | 'monthly' | 'yearly';
export type OnboardingBudgetPeriod = 'weekly' | 'fortnightly' | 'monthly';

// ─── Budget Setup (step 2) ────────────────────────────────────────────────────
export interface BudgetSetup {
  name: string;
  currency: string;
  currencySymbol: string;
  budgetPeriod: OnboardingBudgetPeriod;
  startDate: string; // ISO date
  rollover: number;
}

// ─── Income (step 3) ─────────────────────────────────────────────────────────
export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  nextPayDate?: string;
}

// ─── Bills (step 4) ──────────────────────────────────────────────────────────
export interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  dueDate?: string;
}

// ─── Subscriptions (step 5) ──────────────────────────────────────────────────
export interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  renewalDate?: string;
}

// ─── Spending categories (step 6) ────────────────────────────────────────────
export interface SpendingCategoryItem {
  id: string;
  name: string;
  icon: string;
  amount: number; // already in budget period units
}

// ─── Savings goals (step 7) ───────────────────────────────────────────────────
export interface SavingsGoalDraft {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
}

// ─── Debt goals (step 8) ─────────────────────────────────────────────────────
export interface DebtGoalDraft {
  id: string;
  name: string;
  startingBalance: number;
  currentBalance: number;
  minimumPayment: number;
  paymentFrequency: Frequency;
  dueDate?: string;
}

// ─── Full onboarding state ────────────────────────────────────────────────────
export interface OnboardingState {
  version: number;
  currentStep: number;
  setup: BudgetSetup;
  incomeSources: IncomeSource[];
  bills: RecurringBill[];
  subscriptions: Subscription[];
  spendingCategories: SpendingCategoryItem[];
  savingsGoals: SavingsGoalDraft[];
  debtGoals: DebtGoalDraft[];
}
