import React, { useState } from 'react';
import {
  Plus,
  Landmark,
  Wallet,
  PiggyBank,
  CreditCard,
  Edit2,
  Trash2,
  ArrowLeftRight,
  TrendingUp,
} from 'lucide-react';
import { useData } from '@/src/features/data/DataContext';
import { useAuth } from '@/src/features/auth/AuthContext';
import { Account, AccountType } from '@/src/types';
import { formatCurrency, convertCurrency } from '@/src/lib/currency';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { AccountModal } from './AccountModal';
import { TransactionModal } from '@/src/features/transactions/TransactionModal';

export const AccountsView: React.FC = () => {
  const { accounts, deleteAccount, metrics } = useData();
  const { currency } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return <Landmark className="w-5 h-5" />;
      case 'savings':
        return <PiggyBank className="w-5 h-5" />;
      case 'cash':
        return <Wallet className="w-5 h-5" />;
      case 'credit_card':
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getTypeName = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return 'Checking';
      case 'savings':
        return 'Savings Vault';
      case 'cash':
        return 'Cash';
      case 'credit_card':
        return 'Credit Card';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Accounts & Wallets
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your multi-currency bank accounts, cash reserves, and credit facilities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTransferModalOpen(true)}
          >
            <ArrowLeftRight className="w-4 h-4 mr-1.5" /> Transfer Funds
          </Button>

          <Button
            id="add-account-btn"
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingAccount(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Account
          </Button>
        </div>
      </div>

      {/* Aggregate Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-800/50 dark:to-slate-900 border-indigo-100 dark:border-indigo-950">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Combined Net Worth
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {formatCurrency(metrics.totalNetWorth, currency)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across {accounts.length} linked accounts (normalized in {currency})
          </span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-50/50 to-white dark:from-slate-800/50 dark:to-slate-900 border-emerald-100 dark:border-emerald-950">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Liquid Cash & Checking
          </span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(
              accounts
                .filter((a) => a.type === 'bank' || a.type === 'cash')
                .reduce((sum, a) => sum + convertCurrency(a.balance, a.currency, currency), 0),
              currency
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Immediately accessible liquidity
          </span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-sky-50/50 to-white dark:from-slate-800/50 dark:to-slate-900 border-sky-100 dark:border-sky-950">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total In Savings & Vaults
          </span>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1">
            {formatCurrency(
              accounts
                .filter((a) => a.type === 'savings')
                .reduce((sum, a) => sum + convertCurrency(a.balance, a.currency, currency), 0),
              currency
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Allocated to savings & long-term reserves
          </span>
        </Card>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(accounts || []).map((account) => {
          const convertedVal = convertCurrency(account.balance, account.currency, currency);
          return (
            <Card
              key={account.id}
              hoverable
              className="relative flex flex-col justify-between overflow-hidden border-t-4"
              style={{ borderTopColor: account.color || '#6366f1' }}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: account.color || '#6366f1' }}
                    >
                      {getAccountIcon(account.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 leading-tight">
                        {account.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {account.institution || getTypeName(account.type)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {account.isDefault && <Badge variant="info">Default</Badge>}
                    <Badge variant="outline">{account.currency}</Badge>
                  </div>
                </div>

                {account.accountNumber && (
                  <p className="text-[11px] font-mono text-slate-400 mt-3 tracking-wide">
                    {account.accountNumber}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500">Current Balance</span>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(account.balance, account.currency)}
                  </div>
                  {account.currency !== currency && (
                    <span className="text-xs text-slate-400 font-medium">
                      ≈ {formatCurrency(convertedVal, currency)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-medium text-slate-400 capitalize">
                  {getTypeName(account.type)}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingAccount(account);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Edit account"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {accounts.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete account "${account.name}"?`)) {
                          deleteAccount(account.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Delete account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <AccountModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAccount(null);
        }}
        initialAccount={editingAccount}
      />

      <TransactionModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        initialTransaction={null}
      />
    </div>
  );
};
