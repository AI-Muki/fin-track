import React, { useState, useEffect } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useData } from '@/src/features/data/DataContext';
import { Account, AccountType, Currency } from '@/src/types';
import { accountSchema } from '@/src/lib/validations';
import { CURRENCY_NAMES } from '@/src/lib/currency';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAccount?: Account | null;
}

const PRESET_COLORS = [
  '#0284c7', // Sky
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#475569', // Slate
];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  initialAccount,
}) => {
  const { addAccount, updateAccount } = useData();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [balance, setBalance] = useState('0.00');
  const [institution, setInstitution] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [isDefault, setIsDefault] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialAccount) {
      setName(initialAccount.name);
      setType(initialAccount.type);
      setCurrency(initialAccount.currency);
      setBalance(initialAccount.balance.toString());
      setInstitution(initialAccount.institution || '');
      setAccountNumber(initialAccount.accountNumber || '');
      setColor(initialAccount.color || PRESET_COLORS[0]);
      setIsDefault(initialAccount.isDefault || false);
    } else {
      setName('');
      setType('bank');
      setCurrency('EUR');
      setBalance('0.00');
      setInstitution('');
      setAccountNumber('');
      setColor(PRESET_COLORS[0]);
      setIsDefault(false);
    }
    setErrors({});
  }, [initialAccount, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      name: name.trim(),
      type,
      currency,
      balance: parseFloat(balance) || 0,
      institution: institution.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
      color,
      isDefault,
    };

    const validation = accountSchema.safeParse(payload);
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

    if (initialAccount) {
      updateAccount(initialAccount.id, payload);
    } else {
      addAccount(payload);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialAccount ? 'Edit Account' : 'Add Financial Account'}
      description="Connect checking, savings, credit cards, or cash holdings"
      maxWidth="md"
      id="account-modal"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="account-name-input"
          label="Account Name"
          placeholder="e.g. Main Checking, Revolut Vault, Cash Wallet"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Account Type
            </label>
            <select
              id="account-type-select"
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="bank">Bank Checking</option>
              <option value="savings">Savings Account</option>
              <option value="cash">Physical Cash</option>
              <option value="credit_card">Credit Card</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Currency
            </label>
            <select
              id="account-currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {Object.entries(CURRENCY_NAMES).map(([code, cname]) => (
                <option key={code} value={code}>
                  {code} - {cname}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="account-balance-input"
            label="Current Balance"
            type="number"
            step="0.01"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            error={errors.balance}
            required
          />

          <Input
            id="account-institution-input"
            label="Financial Institution"
            placeholder="e.g. Deutsche Bank, Chase, Cash"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
          />
        </div>

        <Input
          id="account-number-input"
          label="Account / Card Number or IBAN (Optional)"
          placeholder="e.g. •••• 4912 or DE89 ..."
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
        />

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Card Accent Color
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

        <div className="flex items-center gap-2 pt-2">
          <input
            id="account-default-checkbox"
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="account-default-checkbox" className="text-xs text-slate-700 dark:text-slate-300">
            Set as default transaction account
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {initialAccount ? 'Save Changes' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
