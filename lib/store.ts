import type {
  AppStore,
  UserSettings,
  Category,
  Transaction,
  Goal,
  GoalTransaction,
} from './types';
import { defaultSettings, defaultCategories } from './seed';

const STORAGE_KEY = 'happyspends_store';

function isServer(): boolean {
  return typeof window === 'undefined';
}

export function loadStore(): AppStore {
  if (isServer()) return getDefaultStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultStore();
    return JSON.parse(raw) as AppStore;
  } catch {
    return getDefaultStore();
  }
}

export function saveStore(store: AppStore): void {
  if (isServer()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save store', e);
  }
}

export function getDefaultStore(): AppStore {
  return {
    settings: defaultSettings,
    categories: defaultCategories,
    transactions: [],
    goals: [],
    goalTransactions: [],
  };
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export function getSettings(): UserSettings {
  return loadStore().settings;
}

export function saveSettings(settings: UserSettings): void {
  const store = loadStore();
  store.settings = settings;
  saveStore(store);
}

// ─── Categories ───────────────────────────────────────────────────────────────
export function getCategories(): Category[] {
  return loadStore().categories;
}

export function saveCategory(cat: Category): void {
  const store = loadStore();
  const idx = store.categories.findIndex((c) => c.id === cat.id);
  if (idx >= 0) store.categories[idx] = cat;
  else store.categories.push(cat);
  saveStore(store);
}

export function deleteCategory(id: string): void {
  const store = loadStore();
  store.categories = store.categories.filter((c) => c.id !== id);
  saveStore(store);
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export function getTransactions(): Transaction[] {
  return loadStore().transactions;
}

export function saveTransaction(tx: Transaction): void {
  const store = loadStore();
  const idx = store.transactions.findIndex((t) => t.id === tx.id);
  if (idx >= 0) store.transactions[idx] = tx;
  else store.transactions.push(tx);
  saveStore(store);
}

export function deleteTransaction(id: string): void {
  const store = loadStore();
  store.transactions = store.transactions.filter((t) => t.id !== id);
  saveStore(store);
}

// ─── Goals ────────────────────────────────────────────────────────────────────
export function getGoals(): Goal[] {
  return loadStore().goals;
}

export function saveGoal(goal: Goal): void {
  const store = loadStore();
  const idx = store.goals.findIndex((g) => g.id === goal.id);
  if (idx >= 0) store.goals[idx] = goal;
  else store.goals.push(goal);
  saveStore(store);
}

export function deleteGoal(id: string): void {
  const store = loadStore();
  store.goals = store.goals.filter((g) => g.id !== id);
  store.goalTransactions = store.goalTransactions.filter(
    (gt) => gt.goalId !== id
  );
  saveStore(store);
}

// ─── Goal Transactions ────────────────────────────────────────────────────────
export function getGoalTransactions(): GoalTransaction[] {
  return loadStore().goalTransactions;
}

export function saveGoalTransaction(gt: GoalTransaction): void {
  const store = loadStore();
  const idx = store.goalTransactions.findIndex((t) => t.id === gt.id);
  if (idx >= 0) store.goalTransactions[idx] = gt;
  else store.goalTransactions.push(gt);
  // Update goal currentAmount
  const goal = store.goals.find((g) => g.id === gt.goalId);
  if (goal) {
    const total = store.goalTransactions
      .filter((t) => t.goalId === gt.goalId)
      .reduce((sum, t) => sum + t.amount, 0);
    goal.currentAmount = goal.startingAmount + total;
    const gIdx = store.goals.findIndex((g) => g.id === gt.goalId);
    if (gIdx >= 0) store.goals[gIdx] = goal;
  }
  saveStore(store);
}

export function deleteGoalTransaction(id: string): void {
  const store = loadStore();
  const gt = store.goalTransactions.find((t) => t.id === id);
  store.goalTransactions = store.goalTransactions.filter((t) => t.id !== id);
  // Recalculate goal currentAmount
  if (gt) {
    const goal = store.goals.find((g) => g.id === gt.goalId);
    if (goal) {
      const total = store.goalTransactions
        .filter((t) => t.goalId === gt.goalId)
        .reduce((sum, t) => sum + t.amount, 0);
      goal.currentAmount = goal.startingAmount + total;
      const gIdx = store.goals.findIndex((g) => g.id === gt.goalId);
      if (gIdx >= 0) store.goals[gIdx] = goal;
    }
  }
  saveStore(store);
}

// ─── Full store reset (for testing) ──────────────────────────────────────────
export function resetStore(): void {
  if (isServer()) return;
  localStorage.removeItem(STORAGE_KEY);
}

export function exportJSON(): string {
  return JSON.stringify(loadStore(), null, 2);
}

export function importJSON(json: string): void {
  const data = JSON.parse(json) as AppStore;
  saveStore(data);
}
