import React, { useState, useEffect } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useData } from '@/src/features/data/DataContext';
import { SavingsGoal, Currency } from '@/src/types';
import { goalSchema } from '@/src/lib/validations';
import { useAuth } from '@/src/features/auth/AuthContext';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGoal?: SavingsGoal | null;
}

const GOAL_CATEGORIES = ['Emergency', 'Travel', 'Vehicle', 'Home', 'Retirement', 'Education', 'Gadget', 'Other'];
const PRESET_COLORS = ['#10b981', '#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6', '#06b6d4'];

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, initialGoal }) => {
  const { addGoal, updateGoal } = useData();
  const { currency: baseCurrency } = useAuth();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [currency, setCurrency] = useState<Currency>(baseCurrency);
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState(GOAL_CATEGORIES[0]);
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialGoal) {
      setName(initialGoal.name);
      setTargetAmount(initialGoal.targetAmount.toString());
      setCurrentAmount(initialGoal.currentAmount.toString());
      setCurrency(initialGoal.currency);
      setDeadline(initialGoal.deadline);
      setCategory(initialGoal.category || GOAL_CATEGORIES[0]);
      setColor(initialGoal.color || PRESET_COLORS[0]);
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setCurrency(baseCurrency);
      // Default deadline: 1 year from now
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      setDeadline(d.toISOString().split('T')[0]);
      setCategory(GOAL_CATEGORIES[0]);
      setColor(PRESET_COLORS[0]);
    }
    setErrors({});
  }, [initialGoal, isOpen, baseCurrency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      name: name.trim(),
      targetAmount: parseFloat(targetAmount) || 0,
      currentAmount: parseFloat(currentAmount) || 0,
      currency,
      deadline,
      category,
      color,
    };

    const validation = goalSchema.safeParse(payload);
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

    if (initialGoal) {
      updateGoal(initialGoal.id, payload);
    } else {
      addGoal(payload);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
      description="Plan for large milestones and calculate required monthly deposits"
      maxWidth="md"
      id="goal-modal"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="goal-name-input"
          label="Goal Name"
          placeholder="e.g. Emergency Fund, New Car, Vacation"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="goal-target-amount-input"
            label="Target Amount"
            type="number"
            step="0.01"
            min="1"
            placeholder="10000.00"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            error={errors.targetAmount}
            required
          />

          <Input
            id="goal-current-amount-input"
            label="Starting Saved Amount"
            type="number"
            step="0.01"
            min="0"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            error={errors.currentAmount}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="goal-deadline-input"
            label="Target Target Date"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            error={errors.deadline}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <select
              id="goal-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {GOAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Badge Accent Color
          </label>
          <div className="flex items-center gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                  color === c ? 'scale-110 border-indigo-600 ring-2 ring-indigo-200' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {initialGoal ? 'Save Changes' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
