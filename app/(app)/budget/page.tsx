'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/components/providers/StoreProvider';
import { computeCategorySummaries, formatCurrency } from '@/lib/calculations';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import type { Category, CategoryType } from '@/lib/types';
import { generateId } from '@/lib/utils';

const TYPE_LABELS: Record<CategoryType, string> = {
  income: 'Income',
  expense: 'Expenses',
  bill: 'Bills',
  saving: 'Savings',
  debt: 'Debt',
};

const TYPE_COLORS: Record<CategoryType, string> = {
  income: '#34d399',
  expense: '#f472b6',
  bill: '#818cf8',
  saving: '#34d399',
  debt: '#fb923c',
};

const CATEGORY_TYPES: CategoryType[] = ['income', 'expense', 'bill', 'saving', 'debt'];

interface CategoryFormData {
  name: string;
  type: CategoryType;
  planned: string;
}

export default function BudgetPage() {
  const { store, addCategory, updateCategory, removeCategory } = useStore();
  const sym = store.settings.currencySymbol;
  const categorySummaries = useMemo(() => computeCategorySummaries(store), [store]);

  const [activeType, setActiveType] = useState<CategoryType>('expense');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryFormData>({ name: '', type: 'expense', planned: '' });

  function openAdd() {
    setEditTarget(null);
    setForm({ name: '', type: activeType, planned: '' });
    setModalOpen(true);
  }

  function openEdit(cat: Category) {
    setEditTarget(cat);
    setForm({ name: cat.name, type: cat.type, planned: String(cat.planned) });
    setModalOpen(true);
  }

  function handleSave() {
    if (!form.name.trim() || !form.planned) return;
    const planned = parseFloat(form.planned);
    if (isNaN(planned)) return;
    if (editTarget) {
      updateCategory({ ...editTarget, name: form.name.trim(), type: form.type, planned });
    } else {
      addCategory({ name: form.name.trim(), type: form.type, planned, color: TYPE_COLORS[form.type] });
    }
    setModalOpen(false);
  }

  const filtered = categorySummaries.filter((cs) => cs.category.type === activeType);

  const totalPlanned = filtered.reduce((s, cs) => s + cs.category.planned, 0);
  const totalActual = filtered.reduce((s, cs) => s + cs.actual, 0);

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Budget Planner</h1>
        <Button size="sm" onClick={openAdd}>+ Add</Button>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORY_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeType === t
                ? 'gradient-pink text-white shadow-md shadow-pink-200'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700'
            }`}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Summary card */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-xs text-gray-500">Total {TYPE_LABELS[activeType]}</p>
            <p className="text-xl font-bold tabular-nums" style={{ color: TYPE_COLORS[activeType] }}>
              {formatCurrency(totalActual, sym)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Planned</p>
            <p className="text-xl font-bold tabular-nums text-gray-700 dark:text-gray-200">
              {formatCurrency(totalPlanned, sym)}
            </p>
          </div>
        </div>
        <ProgressBar value={totalPlanned > 0 ? totalActual / totalPlanned : 0} color={TYPE_COLORS[activeType]} />
        <p className="text-xs text-gray-400 mt-1 text-right">
          {totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0}% of budget used
        </p>
      </Card>

      {/* Category list */}
      <AnimatePresence>
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-5xl mb-4">📂</div>
            <p className="text-gray-500 font-medium">No {TYPE_LABELS[activeType]} categories yet</p>
            <p className="text-gray-400 text-sm mt-1">Tap &quot;+ Add&quot; to create your first one</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filtered.map((cs, i) => (
              <motion.div
                key={cs.category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cs.category.color ?? TYPE_COLORS[cs.category.type] }} />
                      <span className="font-semibold text-gray-800 dark:text-gray-100">{cs.category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={cs.status}>
                        {cs.status === 'good' ? '✓ Good' : cs.status === 'warning' ? '⚠ Warning' : '✗ Over'}
                      </Badge>
                      <button onClick={() => openEdit(cs.category)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <ProgressBar value={cs.progress} color={cs.category.color ?? TYPE_COLORS[cs.category.type]} />
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {formatCurrency(cs.actual, sym)} spent
                    </span>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {formatCurrency(cs.category.planned, sym)} planned
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Category' : 'Add Category'}
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Groceries"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Select
            label="Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as CategoryType })}
          >
            {CATEGORY_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </Select>
          <Input
            label={`Planned Amount (${sym})`}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.planned}
            onChange={(e) => setForm({ ...form, planned: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            {editTarget && (
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => { removeCategory(editTarget.id); setModalOpen(false); }}
              >
                Delete
              </Button>
            )}
            <Button className="flex-1" onClick={handleSave}>
              {editTarget ? 'Save Changes' : 'Add Category'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
