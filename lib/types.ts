// ─── Theme ───────────────────────────────────────────────────────────────────
export type ThemeOption = 'pink' | 'blue' | 'dark' | 'system';

// ─── User Settings ────────────────────────────────────────────────────────────
export interface UserSettings {
  name: string;
  currency: string;
  currencySymbol: string;
  budgetPeriod: 'monthly' | 'weekly' | 'fortnightly';
  startDay: number; // 1-28
  theme: ThemeOption;
  rollover: number;
  onboardingComplete: boolean;
}

// ─── Category ────────────────────────────────────────────────────────────────
export type CategoryType = 'income' | 'expense' | 'bill' | 'saving' | 'debt';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  planned: number;
  color?: string;
  icon?: string;
}

// ─── Transaction ─────────────────────────────────────────────────────────────
export interface Transaction {
  id: string;
  date: string; // ISO date string
  type: CategoryType;
  categoryId: string;
  categoryName: string;
  amount: number;
  notes?: string;
  goalId?: string; // links to a goal if applicable
}

// ─── Goal ────────────────────────────────────────────────────────────────────
export type GoalType = 'savings' | 'debt';

export interface Goal {
  id: string;
  name: string;
  type: GoalType;
  startingAmount: number; // for debt: original debt; for savings: starting saved amount
  targetAmount: number;   // for debt: 0 (paid off); for savings: target
  currentAmount: number;  // tracked by linked transactions + starting
  color?: string;
  createdAt: string;
}

// ─── Goal Transaction ────────────────────────────────────────────────────────
export interface GoalTransaction {
  id: string;
  goalId: string;
  date: string;
  amount: number;
  notes?: string;
}

// ─── Budget Period ────────────────────────────────────────────────────────────
export interface BudgetPeriod {
  label: string;
  startDate: string;
  endDate: string;
}

// ─── App Store ────────────────────────────────────────────────────────────────
export interface AppStore {
  settings: UserSettings;
  categories: Category[];
  transactions: Transaction[];
  goals: Goal[];
  goalTransactions: GoalTransaction[];
}

// ─── Computed / derived ───────────────────────────────────────────────────────
export interface CategorySummary {
  category: Category;
  actual: number;
  progress: number; // 0-1
  status: 'good' | 'warning' | 'over';
}

export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  totalBills: number;
  totalSavings: number;
  totalDebt: number;
  cashFlow: number;
  amountLeftToSpend: number;
  budgetHealthScore: number; // 0-100
  plannedIncome: number;
  plannedExpenses: number;
  plannedBills: number;
  plannedSavings: number;
  plannedDebt: number;
}
