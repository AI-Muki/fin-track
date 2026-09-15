import React, { useState } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useData } from '@/src/features/data/DataContext';
import { SavingsGoal } from '@/src/types';
import { formatCurrency } from '@/src/lib/currency';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, goal }) => {
  const { accounts, depositToGoal } = useData();

  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');

  if (!goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (parsedAmount > 0) {
      depositToGoal(goal.id, parsedAmount, selectedAccountId);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Deposit to ${goal.name}`}
      description={`Currently saved: ${formatCurrency(goal.currentAmount, goal.currency)} of ${formatCurrency(goal.targetAmount, goal.currency)}`}
      maxWidth="sm"
      id="deposit-goal-modal"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Deduct From Account
          </label>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({formatCurrency(a.balance, a.currency)})
              </option>
            ))}
          </select>
        </div>

        <Input
          id="deposit-amount-input"
          label={`Deposit Amount (${goal.currency})`}
          type="number"
          step="0.01"
          min="1"
          placeholder="100.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Confirm Deposit
          </Button>
        </div>
      </form>
    </Modal>
  );
};
