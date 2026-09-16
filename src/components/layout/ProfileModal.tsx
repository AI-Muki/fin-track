import React, { useState } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { ConfirmModal } from '@/src/components/ui/ConfirmModal';
import { useAuth } from '@/src/features/auth/AuthContext';
import { useData } from '@/src/features/data/DataContext';
import { CURRENCY_NAMES } from '@/src/lib/currency';
import { Currency } from '@/src/types';
import { RotateCcw, KeyRound, Check } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, currency, setCurrency, updateProfile, resetPassword, switchDemoUser, logout } = useAuth();
  const { resetData } = useData();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [incomeTarget, setIncomeTarget] = useState(user?.monthlyIncomeTarget?.toString() || '5000');
  const [savingsTarget, setSavingsTarget] = useState(user?.savingsRateTarget?.toString() || '25');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName,
      email,
      monthlyIncomeTarget: parseFloat(incomeTarget) || 0,
      savingsRateTarget: parseFloat(savingsTarget) || 0,
    });
    setStatusMessage({ text: 'Profile preferences saved successfully!', type: 'success' });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handlePasswordReset = async () => {
    if (!email) return;
    const res = await resetPassword(email);
    setStatusMessage({ text: res.message, type: 'info' });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleResetData = () => {
    resetData();
    setStatusMessage({ text: 'Demo database restored to default seed.', type: 'info' });
    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile & Preferences"
      description="Manage your identity, preferred currency, and financial targets"
      maxWidth="md"
      id="profile-modal"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-sky-50 text-sky-800 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300'
            }`}
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="profile-display-name"
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <Input
            id="profile-email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Default Base Currency
          </label>
          <select
            id="profile-currency-select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {Object.entries(CURRENCY_NAMES).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-slate-500">
            All charts, net worth totals, and metrics will automatically recalculate to this currency.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="profile-income-target"
            label="Monthly Income Target"
            type="number"
            value={incomeTarget}
            onChange={(e) => setIncomeTarget(e.target.value)}
          />
          <Input
            id="profile-savings-rate-target"
            label="Target Savings Rate (%)"
            type="number"
            value={savingsTarget}
            onChange={(e) => setSavingsTarget(e.target.value)}
          />
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Quick Persona Switcher (Demo Mode)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => switchDemoUser('founder')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-center cursor-pointer transition-colors"
              >
                Founder (EUR)
              </button>
              <button
                type="button"
                onClick={() => switchDemoUser('freelancer')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-center cursor-pointer transition-colors"
              >
                Nomad (BAM)
              </button>
              <button
                type="button"
                onClick={() => switchDemoUser('student')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-center cursor-pointer transition-colors"
              >
                Student (USD)
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePasswordReset}
              className="text-xs"
            >
              <KeyRound className="w-3.5 h-3.5 mr-1" /> Send Password Reset
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsResetConfirmOpen(true)}
              className="text-xs text-amber-600 dark:text-amber-400 hover:border-amber-300"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Seed Data
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => {
              onClose();
              logout();
            }}
          >
            Log Out
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </div>
      </form>

      <ConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetData}
        title="Reset Financial Data"
        message="Are you sure you want to reset all your accounts, transactions, budgets, goals, and subscriptions back to the clean default seed data? All custom additions will be replaced."
        confirmLabel="Reset to Seed Data"
        variant="warning"
      />
    </Modal>
  );
};
