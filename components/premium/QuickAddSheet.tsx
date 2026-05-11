'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/components/providers/StoreProvider';
import type { Category } from '@/lib/types';
import { formatCurrency } from '@/lib/calculations';
import { today } from '@/lib/utils';

interface QuickAddSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAddSheet({ isOpen, onClose }: QuickAddSheetProps) {
  const { store, addTransaction } = useStore();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const expenseCategories = store.categories.filter(
    (c) => c.type === 'expense'
  );
  const sym = store.settings.currencySymbol;

  const reset = useCallback(() => {
    setAmount('');
    setNote('');
    setSelectedCat(null);
    setSuccess(false);
    setSaving(false);
  }, []);

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !selectedCat) return;

    setSaving(true);
    addTransaction({
      date: today(),
      type: 'expense',
      categoryId: selectedCat.id,
      categoryName: selectedCat.name,
      amount: amt,
      notes: note || undefined,
    });

    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const quickAmounts = [10, 20, 50, 100];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl max-w-lg mx-auto pb-10"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>

            <div className="px-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Quick Add</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {success ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-8"
                >
                  <div className="text-5xl mb-2">✅</div>
                  <p className="text-base font-bold text-gray-900 dark:text-white">Transaction added!</p>
                </motion.div>
              ) : (
                <>
                  {/* Amount input */}
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block">Amount</label>
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700">
                      <span className="text-lg font-bold text-gray-400">{sym}</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="flex-1 bg-transparent text-2xl font-bold text-gray-900 dark:text-white outline-none"
                        autoFocus
                      />
                    </div>
                    {/* Quick amounts */}
                    <div className="flex gap-2 mt-2">
                      {quickAmounts.map((a) => (
                        <button
                          key={a}
                          onClick={() => setAmount(String(a))}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            amount === String(a)
                              ? 'bg-pink-500 text-white border-pink-500'
                              : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {sym}{a}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category picker */}
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2 block">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {expenseCategories.slice(0, 8).map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCat(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            selectedCat?.id === cat.id
                              ? 'bg-pink-500 text-white border-pink-500'
                              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800'
                          }`}
                        >
                          {cat.icon && <span className="mr-1">{cat.icon}</span>}
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block">Note (optional)</label>
                    <input
                      type="text"
                      placeholder="What was this for?"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-pink-400"
                    />
                  </div>

                  {/* Save button */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSave}
                    disabled={!amount || !selectedCat || saving}
                    className="w-full py-3.5 rounded-2xl gradient-pink text-white font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                  >
                    {saving ? 'Saving…' : `Add ${amount ? formatCurrency(parseFloat(amount) || 0, sym) : ''} Expense`}
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
