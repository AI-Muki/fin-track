import React, { useState, useEffect } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useData } from '@/src/features/data/DataContext';
import { Subscription, BillingCycle, Currency } from '@/src/types';
import { subscriptionSchema } from '@/src/lib/validations';
import { useAuth } from '@/src/features/auth/AuthContext';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubscription?: Subscription | null;
}

const CATEGORIES = [
  'Entertainment',
  'Software & Tech',
  'Utilities & Bills',
  'Health & Fitness',
  'News & Media',
  'Other',
];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  initialSubscription,
}) => {
  const { addSubscription, updateSubscription } = useData();
  const { currency: baseCurrency } = useAuth();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>(baseCurrency);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [nextPaymentDate, setNextPaymentDate] = useState('');
  const [status, setStatus] = useState<'active' | 'paused' | 'cancelled'>('active');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialSubscription) {
      setName(initialSubscription.name);
      setAmount(initialSubscription.amount.toString());
      setCurrency(initialSubscription.currency);
      setBillingCycle(initialSubscription.billingCycle);
      setCategory(initialSubscription.category);
      setNextPaymentDate(initialSubscription.nextPaymentDate);
      setStatus(initialSubscription.status);
      setNotes(initialSubscription.notes || '');
    } else {
      setName('');
      setAmount('');
      setCurrency(baseCurrency);
      setBillingCycle('monthly');
      setCategory(CATEGORIES[0]);
      // Default: 10 days ahead
      const d = new Date();
      d.setDate(d.getDate() + 10);
      setNextPaymentDate(d.toISOString().split('T')[0]);
      setStatus('active');
      setNotes('');
    }
    setErrors({});
  }, [initialSubscription, isOpen, baseCurrency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      name: name.trim(),
      amount: parseFloat(amount) || 0,
      currency,
      billingCycle,
      category,
      nextPaymentDate,
      status,
      notes: notes.trim() || undefined,
    };

    const validation = subscriptionSchema.safeParse(payload);
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

    if (initialSubscription) {
      updateSubscription(initialSubscription.id, payload);
    } else {
      addSubscription(payload);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialSubscription ? 'Edit Subscription' : 'Track New Subscription'}
      description="Keep tabs on recurring recurring charges and upcoming renewals"
      maxWidth="md"
      id="subscription-modal"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="sub-name-input"
          label="Subscription / Service"
          placeholder="e.g. Netflix 4K, Spotify, GitHub Pro"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="sub-amount-input"
            label="Recurring Amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="14.99"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={errors.amount}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Billing Cycle
            </label>
            <select
              id="sub-billing-cycle-select"
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="quarterly">Quarterly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <select
              id="sub-category-select"
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

          <Input
            id="sub-date-input"
            label="Next Payment Date"
            type="date"
            value={nextPaymentDate}
            onChange={(e) => setNextPaymentDate(e.target.value)}
            error={errors.nextPaymentDate}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Status
          </label>
          <select
            id="sub-status-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <Input
          id="sub-notes-input"
          label="Notes (Optional)"
          placeholder="e.g. Shared with team, annual discount applied"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {initialSubscription ? 'Save Changes' : 'Add Subscription'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
