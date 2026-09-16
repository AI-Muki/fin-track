import React, { useState, useEffect } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useData } from '@/src/features/data/DataContext';
import { Account, AccountType, Currency } from '@/src/types';
import { accountSchema } from '@/src/lib/validations';
import { CURRENCY_NAMES, formatCurrency } from '@/src/lib/currency';
import { Info, Calculator } from 'lucide-react';

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
  const [initialBalance, setInitialBalance] = useState('0.00');
  const [description, setDescription] = useState('');
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
      setInitialBalance((initialAccount.initialBalance ?? initialAccount.balance ?? 0).toString());
      setDescription(initialAccount.description || '');
      setInstitution(initialAccount.institution || '');
      setAccountNumber(initialAccount.accountNumber || '');
      setColor(initialAccount.color || PRESET_COLORS[0]);
      setIsDefault(initialAccount.isDefault || false);
    } else {
      setName('');
      setType('bank');
      setCurrency('EUR');
      setInitialBalance('0.00');
      setDescription('');
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

    const initBal = parseFloat(initialBalance) || 0;
    const payload = {
      name: name.trim(),
      type,
      currency,
      initialBalance: initBal,
      balance: initialAccount ? initialAccount.balance : initBal,
      description: description.trim() || undefined,
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
      description="Connect checking, savings, credit cards, cash, or custom holdings"
      maxWidth="md"
      id="account-modal"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {initialAccount && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-xs font-medium text-slate-500 block">
                  Computed Current Balance
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatCurrency(initialAccount.balance, initialAccount.currency)}
                </span>
              </div>
            </div>
            <span className="text-[11px] text-slate-500 max-w-[200px] text-right">
              Calculated deterministically from ledger transactions
            </span>
          </div>
        )}

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
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="bank">Bank (Checking / Depository)</option>
              <option value="cash">Cash (Physical Wallet)</option>
              <option value="credit_card">Credit Card (Liability)</option>
              <option value="savings">Savings (Vault / Reserve)</option>
              <option value="other">Other Asset (Brokerage / Digital)</option>
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
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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
          <div>
            <Input
              id="account-initial-balance-input"
              label="Initial Starting Balance"
              type="number"
              step="any"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              error={errors.initialBalance}
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {type === 'credit_card'
                ? 'Outstanding balance (debt) at start'
                : 'Starting asset balance'}
            </p>
          </div>

          <Input
            id="account-institution-input"
            label="Financial Institution (Optional)"
            placeholder="e.g. UniCredit, Revolut, Chase"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
          />
        </div>

        <Input
          id="account-description-input"
          label="Description / Purpose (Optional)"
          placeholder="e.g. Primary salary account and monthly utility payments"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

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
                  color === c ? 'scale-110 border-emerald-600 ring-2 ring-emerald-200' : 'border-transparent'
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
            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
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
