'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/components/providers/StoreProvider';
import { formatCurrency } from '@/lib/calculations';
import { formatDate, today } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Button, FAB } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import type { Goal, GoalType } from '@/lib/types';

const GOAL_COLORS = ['#34d399', '#60a5fa', '#f472b6', '#a78bfa', '#fb923c', '#fbbf24'];

interface GoalForm {
  name: string;
  type: GoalType;
  startingAmount: string;
  targetAmount: string;
  color: string;
}

interface ContribForm {
  amount: string;
  notes: string;
  date: string;
}

export default function GoalsPage() {
  const { store, addGoal, updateGoal, removeGoal, addGoalTransaction, removeGoalTransaction } = useStore();
  const sym = store.settings.currencySymbol;

  const [filter, setFilter] = useState<GoalType | 'all'>('all');
  const [goalModal, setGoalModal] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [detailGoal, setDetailGoal] = useState<Goal | null>(null);
  const [contribModal, setContribModal] = useState(false);
  const [goalForm, setGoalForm] = useState<GoalForm>({ name: '', type: 'savings', startingAmount: '0', targetAmount: '', color: '#34d399' });
  const [contribForm, setContribForm] = useState<ContribForm>({ amount: '', notes: '', date: today() });

  const goals = useMemo(() => {
    if (filter === 'all') return store.goals;
    return store.goals.filter((g) => g.type === filter);
  }, [store.goals, filter]);

  const goalTxsForDetail = useMemo(() => {
    if (!detailGoal) return [];
    return store.goalTransactions
      .filter((gt) => gt.goalId === detailGoal.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [store.goalTransactions, detailGoal]);

  function openAddGoal() {
    setEditGoal(null);
    setGoalForm({ name: '', type: 'savings', startingAmount: '0', targetAmount: '', color: '#34d399' });
    setGoalModal(true);
  }

  function openEditGoal(g: Goal) {
    setEditGoal(g);
    setGoalForm({ name: g.name, type: g.type, startingAmount: String(g.startingAmount), targetAmount: String(g.targetAmount), color: g.color ?? '#34d399' });
    setGoalModal(true);
  }

  function saveGoal() {
    const starting = parseFloat(goalForm.startingAmount) || 0;
    const target = parseFloat(goalForm.targetAmount);
    if (!goalForm.name.trim() || isNaN(target)) return;
    if (editGoal) {
      updateGoal({ ...editGoal, name: goalForm.name, type: goalForm.type, startingAmount: starting, targetAmount: target, color: goalForm.color });
    } else {
      addGoal({ name: goalForm.name, type: goalForm.type, startingAmount: starting, targetAmount: target, color: goalForm.color });
    }
    setGoalModal(false);
  }

  function openContrib(g: Goal) {
    setDetailGoal(g);
    setContribForm({ amount: '', notes: '', date: today() });
    setContribModal(true);
  }

  function saveContrib() {
    if (!detailGoal) return;
    const amount = parseFloat(contribForm.amount);
    if (isNaN(amount) || amount <= 0) return;
    addGoalTransaction({ goalId: detailGoal.id, amount, notes: contribForm.notes || undefined, date: contribForm.date });
    setContribModal(false);
  }

  function getProgress(g: Goal) {
    if (g.type === 'savings') {
      return g.targetAmount > 0 ? Math.min(1, g.currentAmount / g.targetAmount) : 0;
    } else {
      // debt: progress = amount paid / starting debt
      return g.startingAmount > 0 ? Math.min(1, 1 - g.currentAmount / g.startingAmount) : 0;
    }
  }

  function getRemaining(g: Goal) {
    if (g.type === 'savings') {
      return Math.max(0, g.targetAmount - g.currentAmount);
    } else {
      return Math.max(0, g.currentAmount);
    }
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Goals</h1>
        <span className="text-sm text-gray-400">{store.goals.length} goals</span>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'savings', 'debt'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
              filter === f
                ? 'gradient-pink text-white shadow-md shadow-pink-200'
                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700'
            }`}
          >
            {f === 'all' ? 'All' : f === 'savings' ? 'Savings' : 'Debt Payoff'}
          </button>
        ))}
      </div>

      {/* Goals list */}
      {goals.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎯</div>
          <p className="text-gray-500 font-medium">No goals yet</p>
          <p className="text-gray-400 text-sm mt-1">Set a savings or debt payoff goal</p>
          <Button className="mt-4" onClick={openAddGoal}>+ New Goal</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {goals.map((g, i) => {
              const progress = getProgress(g);
              const remaining = getRemaining(g);
              return (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start gap-4">
                      <ProgressRing value={progress} size={68} strokeWidth={6} color={g.color ?? '#34d399'}>
                        <span className="text-xs font-bold" style={{ color: g.color ?? '#34d399' }}>
                          {Math.round(progress * 100)}%
                        </span>
                      </ProgressRing>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{g.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5 capitalize">{g.type === 'savings' ? '💰 Savings Goal' : '💳 Debt Payoff'}</p>
                          </div>
                          <button onClick={() => openEditGoal(g)} className="text-gray-400 hover:text-gray-600 p-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-400">Current</span>
                            <p className="font-bold" style={{ color: g.color ?? '#34d399' }}>{formatCurrency(g.currentAmount, sym)}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">{g.type === 'savings' ? 'Target' : 'Starting'}</span>
                            <p className="font-bold text-gray-700 dark:text-gray-200">{formatCurrency(g.type === 'savings' ? g.targetAmount : g.startingAmount, sym)}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Remaining</span>
                            <p className="font-semibold text-gray-600 dark:text-gray-300">{formatCurrency(remaining, sym)}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => { setDetailGoal(g); }}
                            className="text-xs text-pink-500 font-medium"
                          >
                            View history →
                          </button>
                          <Button size="sm" className="ml-auto" onClick={() => openContrib(g)}>
                            + Contribute
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <FAB onClick={openAddGoal} icon={<span className="text-xl">🎯</span>} />

      {/* Goal detail / history modal */}
      <Modal
        open={!!detailGoal && !contribModal}
        onClose={() => setDetailGoal(null)}
        title={detailGoal?.name ?? 'Goal'}
      >
        {detailGoal && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <ProgressRing value={getProgress(detailGoal)} size={80} strokeWidth={8} color={detailGoal.color ?? '#34d399'}>
                <span className="text-sm font-bold" style={{ color: detailGoal.color }}>
                  {Math.round(getProgress(detailGoal) * 100)}%
                </span>
              </ProgressRing>
              <div>
                <p className="text-xs text-gray-500">Current Amount</p>
                <p className="text-2xl font-extrabold tabular-nums" style={{ color: detailGoal.color }}>{formatCurrency(detailGoal.currentAmount, sym)}</p>
                <p className="text-xs text-gray-400">of {formatCurrency(detailGoal.type === 'savings' ? detailGoal.targetAmount : detailGoal.startingAmount, sym)}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-center">
              {[
                { label: 'Starting', value: formatCurrency(detailGoal.startingAmount, sym) },
                { label: 'Target', value: formatCurrency(detailGoal.targetAmount, sym) },
                { label: 'Remaining', value: formatCurrency(getRemaining(detailGoal), sym) },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2">
                  <p className="text-gray-400">{item.label}</p>
                  <p className="font-bold text-gray-700 dark:text-gray-200 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Transaction History</p>
              {goalTxsForDetail.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No contributions yet</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {goalTxsForDetail.map((gt) => (
                    <div key={gt.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{gt.notes ?? 'Contribution'}</p>
                        <p className="text-xs text-gray-400">{formatDate(gt.date)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-emerald-500">+{formatCurrency(gt.amount, sym)}</span>
                        <button
                          onClick={() => removeGoalTransaction(gt.id)}
                          className="text-gray-300 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button className="w-full" onClick={() => { setContribModal(true); setContribForm({ amount: '', notes: '', date: today() }); }}>
              + Add Contribution
            </Button>
          </div>
        )}
      </Modal>

      {/* Contribution modal */}
      <Modal
        open={contribModal}
        onClose={() => setContribModal(false)}
        title="Add Contribution"
      >
        <div className="space-y-4">
          <Input
            label="Date"
            type="date"
            value={contribForm.date}
            onChange={(e) => setContribForm({ ...contribForm, date: e.target.value })}
          />
          <Input
            label={`Amount (${sym})`}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={contribForm.amount}
            onChange={(e) => setContribForm({ ...contribForm, amount: e.target.value })}
          />
          <Textarea
            label="Notes (optional)"
            placeholder="e.g. Monthly contribution"
            value={contribForm.notes}
            onChange={(e) => setContribForm({ ...contribForm, notes: e.target.value })}
          />
          <Button className="w-full" onClick={saveContrib}>Save Contribution</Button>
        </div>
      </Modal>

      {/* Goal add/edit modal */}
      <Modal
        open={goalModal}
        onClose={() => setGoalModal(false)}
        title={editGoal ? 'Edit Goal' : 'New Goal'}
      >
        <div className="space-y-4">
          <Input
            label="Goal Name"
            placeholder="e.g. Emergency Fund"
            value={goalForm.name}
            onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
          />
          <Select
            label="Type"
            value={goalForm.type}
            onChange={(e) => setGoalForm({ ...goalForm, type: e.target.value as GoalType })}
          >
            <option value="savings">Savings Goal</option>
            <option value="debt">Debt Payoff</option>
          </Select>
          <Input
            label={`Starting Amount (${sym})`}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={goalForm.startingAmount}
            onChange={(e) => setGoalForm({ ...goalForm, startingAmount: e.target.value })}
          />
          <Input
            label={`Target Amount (${sym})`}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={goalForm.targetAmount}
            onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
          />
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {GOAL_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setGoalForm({ ...goalForm, color: c })}
                  className={`w-8 h-8 rounded-full transition-transform ${goalForm.color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-300' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            {editGoal && (
              <Button variant="danger" className="flex-1" onClick={() => { removeGoal(editGoal.id); setGoalModal(false); }}>
                Delete
              </Button>
            )}
            <Button className="flex-1" onClick={saveGoal}>
              {editGoal ? 'Save Changes' : 'Create Goal'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
