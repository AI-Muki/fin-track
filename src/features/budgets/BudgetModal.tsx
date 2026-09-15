import React, { useState, useEffect } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useData } from '@/src/features/data/DataContext';
import { Budget, Currency } from '@/src/types';
import { budgetSchema } from '@/src/lib/validations';
import { useAuth } from '@/src/features/auth/AuthContext';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBudget?: Budget | null;
}

const CATEGORIES = [
  'Groceries',
  'Dining & Restaurants',
  'Housing & Rent',
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

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  initialBudget,
}) => {
  const { addBudget, updateBudget } = useData();
  const { currency: baseCurrency } = useAuth();

  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>(baseCurrency);
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialBudget) {
      setCategory(initialBudget.category);
      setAmount(initialBudget.amount.toString());
      setCurrency(initialBudget.currency);
      setPeriod(initialBudget.period);
    } else {
      setCategory(CATEGORIES[0]);
      setAmount('');
      setCurrency(baseCurrency);
      setPeriod('monthly');
    }
    setErrors({});
  }, [initialBudget, isOpen, baseCurrency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      category,
      amount: parseFloat(amount) || 0,
      currency,
      period,
      alertThresholds: [75, 90, 100],
    };

    const validation = budgetSchema.safeParse(payload);
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

    if (initialBudget) {
      updateBudget(initialBudget.id, payload);
    } else {
      addBudget(payload);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialBudget ? 'Edit Spending Budget' : 'Set Category Budget'}
      description="Stay on track with spending limits and automated threshold alerts"
      maxWidth="md"
      id="budget-modal"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Category
          </label>
          <select
            id="budget-category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="budget-amount-input"
            label="Budget Limit"
            type="number"
            step="0.01"
            min="1"
            placeholder="500.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={errors.amount}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Period
            </label>
            <select
              id="budget-period-select"
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl space-y-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300">Automated Alerts:</p>
          <p>• 75% reached: Warning banner in Notifications</p>
          <p>• 90% reached: Critical alert badge</p>
          <p>• 100%+ reached: Exceeded status & highlight</p>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {initialBudget ? 'Save Changes' : 'Create Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
