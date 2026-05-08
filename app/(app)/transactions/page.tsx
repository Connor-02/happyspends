'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/components/providers/StoreProvider';
import { formatCurrency, } from '@/lib/calculations';
import { formatDate, today } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FAB } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Transaction, CategoryType } from '@/lib/types';

const TYPE_COLORS: Record<CategoryType, string> = {
  income: '#34d399',
  expense: '#f472b6',
  bill: '#818cf8',
  saving: '#34d399',
  debt: '#fb923c',
};

const TYPE_LABELS: Record<CategoryType, string> = {
  income: 'Income',
  expense: 'Expense',
  bill: 'Bill',
  saving: 'Saving',
  debt: 'Debt',
};

const TYPE_ICONS: Record<CategoryType, string> = {
  income: '📈',
  expense: '🛍️',
  bill: '🧾',
  saving: '🏦',
  debt: '💳',
};

interface TxForm {
  date: string;
  type: CategoryType;
  categoryId: string;
  amount: string;
  notes: string;
}

function emptyForm(): TxForm {
  return { date: today(), type: 'expense', categoryId: '', amount: '', notes: '' };
}

export default function TransactionsPage() {
  const { store, addTransaction, updateTransaction, removeTransaction } = useStore();
  const sym = store.settings.currencySymbol;

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<CategoryType | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const [form, setForm] = useState<TxForm>(emptyForm());

  const filteredCategories = store.categories.filter((c) => c.type === form.type);

  const transactions = useMemo(() => {
    let list = [...store.transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    if (filterType !== 'all') list = list.filter((t) => t.type === filterType);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.categoryName.toLowerCase().includes(q) ||
          (t.notes ?? '').toLowerCase().includes(q) ||
          t.amount.toString().includes(q)
      );
    }
    return list;
  }, [store.transactions, filterType, search]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    transactions.forEach((t) => {
      const key = t.date;
      const arr = map.get(key) ?? [];
      arr.push(t);
      map.set(key, arr);
    });
    return Array.from(map.entries());
  }, [transactions]);

  function openAdd() {
    setEditTarget(null);
    setForm(emptyForm());
    setModalOpen(true);
  }

  function openEdit(tx: Transaction) {
    setEditTarget(tx);
    setForm({
      date: tx.date,
      type: tx.type,
      categoryId: tx.categoryId,
      amount: String(tx.amount),
      notes: tx.notes ?? '',
    });
    setModalOpen(true);
  }

  function handleSave() {
    const amount = parseFloat(form.amount);
    if (!form.categoryId || isNaN(amount) || amount <= 0) return;
    const cat = store.categories.find((c) => c.id === form.categoryId);
    if (!cat) return;
    const txData = {
      date: form.date,
      type: form.type,
      categoryId: form.categoryId,
      categoryName: cat.name,
      amount,
      notes: form.notes || undefined,
    };
    if (editTarget) {
      updateTransaction({ ...editTarget, ...txData });
    } else {
      addTransaction(txData);
    }
    setModalOpen(false);
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Transactions</h1>
        <span className="text-sm text-gray-400">{store.transactions.length} total</span>
      </div>

      {/* Search */}
      <input
        type="search"
        placeholder="Search transactions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-pink-400 transition-all"
      />

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'income', 'expense', 'bill', 'saving', 'debt'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              filterType === t
                ? 'gradient-pink text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700'
            }`}
          >
            {t === 'all' ? 'All' : TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      {grouped.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">💸</div>
          <p className="text-gray-500 font-medium">No transactions yet</p>
          <p className="text-gray-400 text-sm mt-1">Tap + to log your first transaction</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([date, txs]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                {formatDate(date)}
              </p>
              <div className="space-y-2">
                <AnimatePresence>
                  {txs.map((tx, i) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Card
                        className="flex items-center gap-3 p-3 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => openEdit(tx)}
                      >
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg"
                          style={{ backgroundColor: `${TYPE_COLORS[tx.type]}20` }}
                        >
                          {TYPE_ICONS[tx.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{tx.categoryName}</p>
                          {tx.notes && <p className="text-xs text-gray-400 truncate">{tx.notes}</p>}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p
                            className="font-bold tabular-nums"
                            style={{ color: tx.type === 'income' ? '#34d399' : TYPE_COLORS[tx.type] }}
                          >
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, sym)}
                          </p>
                          <Badge variant="neutral" className="text-[10px]">{TYPE_LABELS[tx.type]}</Badge>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <FAB onClick={openAdd} />

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Transaction' : 'Add Transaction'}
      >
        <div className="space-y-4">
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <Select
            label="Type"
            value={form.type}
            onChange={(e) => {
              const t = e.target.value as CategoryType;
              setForm({ ...form, type: t, categoryId: '' });
            }}
          >
            {(['income', 'expense', 'bill', 'saving', 'debt'] as CategoryType[]).map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </Select>
          <Select
            label="Category"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            <option value="">Select category...</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Input
            label={`Amount (${sym})`}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <Textarea
            label="Notes (optional)"
            placeholder="What was this for?"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            {editTarget && (
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => { removeTransaction(editTarget.id); setModalOpen(false); }}
              >
                Delete
              </Button>
            )}
            <Button className="flex-1" onClick={handleSave}>
              {editTarget ? 'Save Changes' : 'Add Transaction'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
