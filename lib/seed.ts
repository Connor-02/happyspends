import type { UserSettings, Category, Transaction, Goal, GoalTransaction } from './types';
import { generateId } from './utils';

export const defaultSettings: UserSettings = {
  name: 'Alex',
  currency: 'USD',
  currencySymbol: '$',
  budgetPeriod: 'monthly',
  startDay: 1,
  theme: 'pink',
  rollover: 0,
  onboardingComplete: false,
};

export const defaultCategories: Category[] = [
  // Income
  { id: 'cat-salary', name: 'Salary', type: 'income', planned: 3200, color: '#34d399' },
  { id: 'cat-freelance', name: 'Freelance', type: 'income', planned: 500, color: '#6ee7b7' },

  // Expenses
  { id: 'cat-groceries', name: 'Groceries', type: 'expense', planned: 400, color: '#f472b6' },
  { id: 'cat-dining', name: 'Dining Out', type: 'expense', planned: 200, color: '#fb7185' },
  { id: 'cat-transport', name: 'Transport', type: 'expense', planned: 150, color: '#f9a8d4' },
  { id: 'cat-clothing', name: 'Clothing', type: 'expense', planned: 100, color: '#e879f9' },
  { id: 'cat-entertainment', name: 'Entertainment', type: 'expense', planned: 150, color: '#c084fc' },
  { id: 'cat-health', name: 'Health', type: 'expense', planned: 80, color: '#a78bfa' },

  // Bills
  { id: 'cat-rent', name: 'Rent', type: 'bill', planned: 1200, color: '#818cf8' },
  { id: 'cat-electricity', name: 'Electricity', type: 'bill', planned: 80, color: '#60a5fa' },
  { id: 'cat-internet', name: 'Internet', type: 'bill', planned: 50, color: '#38bdf8' },
  { id: 'cat-netflix', name: 'Netflix', type: 'bill', planned: 15, color: '#22d3ee' },

  // Savings
  { id: 'cat-emergency', name: 'Emergency Fund', type: 'saving', planned: 200, color: '#34d399' },
  { id: 'cat-vacation', name: 'Vacation Fund', type: 'saving', planned: 100, color: '#4ade80' },

  // Debt
  { id: 'cat-credit-card', name: 'Credit Card', type: 'debt', planned: 250, color: '#fb923c' },
  { id: 'cat-student-loan', name: 'Student Loan', type: 'debt', planned: 300, color: '#fbbf24' },
];

function d(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

export const seedTransactions: Transaction[] = [
  { id: generateId(), date: d(0), type: 'income', categoryId: 'cat-salary', categoryName: 'Salary', amount: 3200, notes: 'Monthly salary' },
  { id: generateId(), date: d(2), type: 'expense', categoryId: 'cat-groceries', categoryName: 'Groceries', amount: 88.45, notes: 'Grocery Store' },
  { id: generateId(), date: d(3), type: 'bill', categoryId: 'cat-electricity', categoryName: 'Electricity', amount: 65, notes: 'Gas Station' },
  { id: generateId(), date: d(5), type: 'bill', categoryId: 'cat-netflix', categoryName: 'Netflix', amount: 15, notes: 'Netflix subscription' },
  { id: generateId(), date: d(6), type: 'income', categoryId: 'cat-freelance', categoryName: 'Freelance', amount: 350, notes: 'Freelance Work' },
  { id: generateId(), date: d(7), type: 'expense', categoryId: 'cat-dining', categoryName: 'Dining Out', amount: 45, notes: 'Coffee Shop' },
  { id: generateId(), date: d(8), type: 'saving', categoryId: 'cat-emergency', categoryName: 'Emergency Fund', amount: 200, notes: 'Monthly savings' },
  { id: generateId(), date: d(9), type: 'debt', categoryId: 'cat-credit-card', categoryName: 'Credit Card', amount: 250, notes: 'Credit card payment' },
  { id: generateId(), date: d(10), type: 'expense', categoryId: 'cat-transport', categoryName: 'Transport', amount: 55, notes: 'Gas' },
  { id: generateId(), date: d(11), type: 'expense', categoryId: 'cat-groceries', categoryName: 'Groceries', amount: 62.30, notes: 'Weekly shop' },
  { id: generateId(), date: d(12), type: 'bill', categoryId: 'cat-rent', categoryName: 'Rent', amount: 1200, notes: 'Monthly rent' },
  { id: generateId(), date: d(14), type: 'expense', categoryId: 'cat-entertainment', categoryName: 'Entertainment', amount: 35, notes: 'Movie night' },
  { id: generateId(), date: d(16), type: 'saving', categoryId: 'cat-vacation', categoryName: 'Vacation Fund', amount: 100, notes: 'Summer trip fund' },
  { id: generateId(), date: d(18), type: 'expense', categoryId: 'cat-health', categoryName: 'Health', amount: 45, notes: 'Pharmacy' },
  { id: generateId(), date: d(20), type: 'debt', categoryId: 'cat-student-loan', categoryName: 'Student Loan', amount: 300, notes: 'Monthly payment' },
];

export const seedGoals: Goal[] = [
  {
    id: 'goal-emergency',
    name: 'Emergency Fund',
    type: 'savings',
    startingAmount: 0,
    targetAmount: 2000,
    currentAmount: 1250,
    color: '#34d399',
    createdAt: d(90),
  },
  {
    id: 'goal-laptop',
    name: 'New Laptop',
    type: 'savings',
    startingAmount: 0,
    targetAmount: 1200,
    currentAmount: 406,
    color: '#60a5fa',
    createdAt: d(60),
  },
  {
    id: 'goal-credit-card',
    name: 'Pay Off Credit Card',
    type: 'debt',
    startingAmount: 2500,
    targetAmount: 0,
    currentAmount: 1100,
    color: '#fb923c',
    createdAt: d(120),
  },
];

export const seedGoalTransactions: GoalTransaction[] = [
  { id: generateId(), goalId: 'goal-emergency', date: d(20), amount: 100, notes: 'Contribution' },
  { id: generateId(), goalId: 'goal-emergency', date: d(16), amount: 50, notes: 'Contribution' },
  { id: generateId(), goalId: 'goal-emergency', date: d(10), amount: 75, notes: 'Contribution' },
  { id: generateId(), goalId: 'goal-emergency', date: d(6), amount: 50, notes: 'Contribution' },
  { id: generateId(), goalId: 'goal-laptop', date: d(25), amount: 100, notes: 'Saved from freelance' },
  { id: generateId(), goalId: 'goal-laptop', date: d(12), amount: 56, notes: 'Birthday money' },
  { id: generateId(), goalId: 'goal-credit-card', date: d(30), amount: 250, notes: 'Payment' },
  { id: generateId(), goalId: 'goal-credit-card', date: d(15), amount: 250, notes: 'Payment' },
];
