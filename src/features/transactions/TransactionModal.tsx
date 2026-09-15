import React, { useState, useEffect } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useData } from '@/src/features/data/DataContext';
import { Transaction, TransactionType, Currency } from '@/src/types';
import { transactionSchema } from '@/src/lib/validations';
import { Sparkles } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTransaction?: Transaction | null;
}

const CATEGORIES = [
  'Salary',
  'Freelance & Consulting',
  'Investments & Savings',
  'Housing & Rent',
  'Groceries',
  'Dining & Restaurants',
  'Transportation',
  'Utilities & Bills',
  'Software & Tech',
  'Health & Fitness',
  'Entertainment',
  'Shopping & Retail',
  'Education',
  'Travel',
  'Personal Care',
  'Other',
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  initialTransaction,
}) => {
  const { accounts, addTransaction, updateTransaction } = useData();

  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || '');
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [category, setCategory] = useState('Groceries');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialTransaction) {
      setAccountId(initialTransaction.accountId);
      setToAccountId(initialTransaction.toAccountId || '');
      setType(initialTransaction.type);
      setAmount(initialTransaction.amount.toString());
      setCurrency(initialTransaction.currency);
      setCategory(initialTransaction.category);
      setMerchant(initialTransaction.merchant);
      setDate(initialTransaction.date);
      setNotes(initialTransaction.notes || '');
      setTagsInput(initialTransaction.tags ? initialTransaction.tags.join(', ') : '');
    } else {
      // Defaults
      const defaultAcc = accounts.find((a) => a.isDefault) || accounts[0];
      if (defaultAcc) {
        setAccountId(defaultAcc.id);
        setCurrency(defaultAcc.currency);
      }
      setType('expense');
      setAmount('');
      setCategory('Groceries');
      setMerchant('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setTagsInput('');
    }
    setErrors({});
  }, [initialTransaction, isOpen, accounts]);

  // When account changes, default to its currency
  const handleAccountChange = (id: string) => {
    setAccountId(id);
    const acc = accounts.find((a) => a.id === id);
    if (acc) {
      setCurrency(acc.currency);
    }
  };

  // AI-powered auto-categorization
  const handleAutoCategorize = async () => {
    if (!merchant.trim()) return;
    setIsCategorizing(true);
    try {
      const res = await fetch('/api/gemini/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchant, amount: parseFloat(amount) || undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.category) {
          setCategory(data.category);
        }
        if (data.suggestedTags && data.suggestedTags.length > 0) {
          const currentTags = tagsInput ? tagsInput.split(',').map((t) => t.trim()) : [];
          const combined = Array.from(new Set([...currentTags, ...data.suggestedTags]));
          setTagsInput(combined.join(', '));
        }
      }
    } catch (e) {
      console.error('Categorize fetch error:', e);
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsedAmount = parseFloat(amount);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      type,
      amount: parsedAmount,
      currency,
      category: type === 'transfer' ? 'Transfer' : category,
      merchant: merchant.trim(),
      date,
      notes: notes.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    };

    const validation = transactionSchema.safeParse(payload);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    if (initialTransaction) {
      updateTransaction(initialTransaction.id, payload);
    } else {
      addTransaction(payload);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTransaction ? 'Edit Transaction' : 'Record New Transaction'}
      description="Keep your financial records accurate and verified"
      maxWidth="md"
      id="transaction-modal"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction Type Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Type
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {(['expense', 'income', 'transfer'] as TransactionType[]).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setType(t)}
                className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer ${
                  type === t
                    ? t === 'expense'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : t === 'income'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Account and Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {type === 'transfer' ? 'From Account' : 'Account'}
            </label>
            <select
              id="tx-account-select"
              value={accountId}
              onChange={(e) => handleAccountChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.currency})
                </option>
              ))}
            </select>
            {errors.accountId && <p className="text-xs text-rose-500 mt-1">{errors.accountId}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Amount ({currency})
            </label>
            <Input
              id="tx-amount-input"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={errors.amount}
              required
            />
          </div>
        </div>

        {/* If Transfer: Destination Account */}
        {type === 'transfer' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              To Destination Account
            </label>
            <select
              id="tx-to-account-select"
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {accounts
                .filter((a) => a.id !== accountId)
                .map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.currency})
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Merchant & AI Categorize trigger */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {type === 'transfer' ? 'Transfer Description' : 'Merchant / Payee'}
            </label>
            {type !== 'transfer' && merchant.trim().length > 1 && (
              <button
                type="button"
                onClick={handleAutoCategorize}
                disabled={isCategorizing}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                {isCategorizing ? 'Categorizing...' : 'AI Auto-Categorize'}
              </button>
            )}
          </div>
          <Input
            id="tx-merchant-input"
            placeholder={
              type === 'transfer'
                ? 'Internal transfer'
                : 'e.g. Bio Supermarkt, Netflix, Landlord'
            }
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            error={errors.merchant}
            required
          />
        </div>

        {/* Category & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {type !== 'transfer' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                id="tx-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div />
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Date
            </label>
            <Input
              id="tx-date-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              error={errors.date}
              required
            />
          </div>
        </div>

        {/* Notes & Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="tx-tags-input"
            label="Tags (comma-separated)"
            placeholder="groceries, organic, weekend"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
          <Input
            id="tx-notes-input"
            label="Notes (Optional)"
            placeholder="Optional details or invoice reference"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {initialTransaction ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
