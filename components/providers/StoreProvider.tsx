'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import type {
  AppStore,
  Category,
  Transaction,
  Goal,
  GoalTransaction,
  UserSettings,
} from '@/lib/types';
import {
  loadStore,
  saveStore,
  saveCategory,
  deleteCategory as _deleteCategory,
  saveTransaction,
  deleteTransaction as _deleteTransaction,
  saveGoal,
  deleteGoal as _deleteGoal,
  saveGoalTransaction,
  deleteGoalTransaction as _deleteGoalTransaction,
  saveSettings as _saveSettings,
  getDefaultStore,
} from '@/lib/store';
import { generateId, today } from '@/lib/utils';
import {
  seedTransactions,
  seedGoals,
  seedGoalTransactions,
} from '@/lib/seed';

interface StoreContextValue {
  store: AppStore;
  saveSettings: (s: UserSettings) => void;
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (cat: Category) => void;
  removeCategory: (id: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (tx: Transaction) => void;
  removeTransaction: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'currentAmount'>) => void;
  updateGoal: (goal: Goal) => void;
  removeGoal: (id: string) => void;
  addGoalTransaction: (gt: Omit<GoalTransaction, 'id'>) => void;
  removeGoalTransaction: (id: string) => void;
  loadSeedData: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<AppStore>(() => getDefaultStore());

  useEffect(() => {
    setStore(loadStore());
  }, []);

  const refresh = useCallback(() => setStore(loadStore()), []);

  const saveSettings = useCallback(
    (s: UserSettings) => {
      _saveSettings(s);
      refresh();
    },
    [refresh]
  );

  const addCategory = useCallback(
    (cat: Omit<Category, 'id'>) => {
      saveCategory({ ...cat, id: generateId() });
      refresh();
    },
    [refresh]
  );

  const updateCategory = useCallback(
    (cat: Category) => {
      saveCategory(cat);
      refresh();
    },
    [refresh]
  );

  const removeCategory = useCallback(
    (id: string) => {
      _deleteCategory(id);
      refresh();
    },
    [refresh]
  );

  const addTransaction = useCallback(
    (tx: Omit<Transaction, 'id'>) => {
      saveTransaction({ ...tx, id: generateId() });
      refresh();
    },
    [refresh]
  );

  const updateTransaction = useCallback(
    (tx: Transaction) => {
      saveTransaction(tx);
      refresh();
    },
    [refresh]
  );

  const removeTransaction = useCallback(
    (id: string) => {
      _deleteTransaction(id);
      refresh();
    },
    [refresh]
  );

  const addGoal = useCallback(
    (goal: Omit<Goal, 'id' | 'createdAt' | 'currentAmount'>) => {
      saveGoal({
        ...goal,
        id: generateId(),
        currentAmount: goal.startingAmount,
        createdAt: today(),
      });
      refresh();
    },
    [refresh]
  );

  const updateGoal = useCallback(
    (goal: Goal) => {
      saveGoal(goal);
      refresh();
    },
    [refresh]
  );

  const removeGoal = useCallback(
    (id: string) => {
      _deleteGoal(id);
      refresh();
    },
    [refresh]
  );

  const addGoalTransaction = useCallback(
    (gt: Omit<GoalTransaction, 'id'>) => {
      saveGoalTransaction({ ...gt, id: generateId() });
      refresh();
    },
    [refresh]
  );

  const removeGoalTransaction = useCallback(
    (id: string) => {
      _deleteGoalTransaction(id);
      refresh();
    },
    [refresh]
  );

  const loadSeedData = useCallback(() => {
    const current = loadStore();
    const newStore: AppStore = {
      ...current,
      settings: { ...current.settings, onboardingComplete: true },
      transactions: seedTransactions,
      goals: seedGoals,
      goalTransactions: seedGoalTransactions,
    };
    saveStore(newStore);
    refresh();
  }, [refresh]);

  return (
    <StoreContext.Provider
      value={{
        store,
        saveSettings,
        addCategory,
        updateCategory,
        removeCategory,
        addTransaction,
        updateTransaction,
        removeTransaction,
        addGoal,
        updateGoal,
        removeGoal,
        addGoalTransaction,
        removeGoalTransaction,
        loadSeedData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
