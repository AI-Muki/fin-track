import React, { useState } from 'react';
import {
  Plus,
  Landmark,
  Wallet,
  PiggyBank,
  CreditCard,
  CircleDollarSign,
  Edit2,
  Trash2,
  ArrowLeftRight,
  History,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  Info,
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
import { ConfirmModal } from '@/src/components/ui/ConfirmModal';

export const AccountsView: React.FC = () => {
  const { accounts, transactions, deleteAccount, metrics } = useData();
  const { currency } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedHistoryAccount, setSelectedHistoryAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);

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
      case 'other':
      default:
        return <CircleDollarSign className="w-5 h-5" />;
    }
  };

  const getTypeName = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return 'Checking';
      case 'savings':
        return 'Savings Vault';
      case 'cash':
        return 'Physical Cash';
      case 'credit_card':
        return 'Credit Card';
      case 'other':
      default:
        return 'Other Asset';
    }
  };

  const accountTransactions = selectedHistoryAccount
    ? transactions.filter(
        (t) =>
          t.accountId === selectedHistoryAccount.id ||
          t.toAccountId === selectedHistoryAccount.id
      )
    : [];

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
        <Card className="p-4 bg-gradient-to-br from-emerald-50/50 to-white dark:from-slate-800/50 dark:to-slate-900 border-emerald-100 dark:border-emerald-950">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Combined Net Worth
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {formatCurrency(metrics.totalNetWorth, currency)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across {accounts.length} linked accounts (assets minus liabilities)
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
            Credit Liabilities & Debt
          </span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(
              accounts
                .filter((a) => a.type === 'credit_card')
                .reduce((sum, a) => sum + Math.max(0, convertCurrency(a.balance, a.currency, currency)), 0),
              currency
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Revolving credit card debt to settle
          </span>
        </Card>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(accounts || []).map((account) => {
          const convertedVal = convertCurrency(account.balance, account.currency, currency);
          const isCredit = account.type === 'credit_card';

          return (
            <Card
              key={account.id}
              hoverable
              className="relative flex flex-col justify-between overflow-hidden border-t-4"
              style={{ borderTopColor: account.color || '#10b981' }}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: account.color || '#10b981' }}
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

                {account.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    {account.description}
                  </p>
                )}

                {account.accountNumber && (
                  <p className="text-[11px] font-mono text-slate-400 mt-2 tracking-wide">
                    {account.accountNumber}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500">
                    {isCredit ? 'Outstanding Balance (Owed)' : 'Current Balance'}
                  </span>
                  <div className={`text-2xl font-bold ${isCredit ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100'}`}>
                    {formatCurrency(account.balance, account.currency)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                    <span>
                      Start: {formatCurrency(account.initialBalance ?? 0, account.currency)}
                    </span>
                    {account.currency !== currency && (
                      <span className="font-medium">
                        ≈ {formatCurrency(convertedVal, currency)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedHistoryAccount(account)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:underline cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>View History</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingAccount(account);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Edit account"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {accounts.length > 1 && (
                    <button
                      onClick={() => setDeletingAccount(account)}
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

      {/* Per-Account Transaction History Modal */}
      {selectedHistoryAccount && (
        <div
          id="account-history-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            id="account-history-card"
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
              <div className="flex items-center space-x-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: selectedHistoryAccount.color || '#10b981' }}
                >
                  {getAccountIcon(selectedHistoryAccount.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                    {selectedHistoryAccount.name} History
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{getTypeName(selectedHistoryAccount.type)}</span>
                    <span>•</span>
                    <span>Starting: {formatCurrency(selectedHistoryAccount.initialBalance ?? 0, selectedHistoryAccount.currency)}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Balance: {formatCurrency(selectedHistoryAccount.balance, selectedHistoryAccount.currency)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedHistoryAccount(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Transaction List */}
            <div className="p-5 overflow-y-auto flex-1">
              {accountTransactions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>No transactions recorded for this account yet.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Balance equals initial starting balance: {formatCurrency(selectedHistoryAccount.initialBalance ?? 0, selectedHistoryAccount.currency)}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {accountTransactions.map((tx) => {
                    const isIncome = tx.type === 'income';
                    const isTransfer = tx.type === 'transfer';
                    const isCreditCard = selectedHistoryAccount.type === 'credit_card';

                    return (
                      <div
                        key={tx.id}
                        className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isIncome
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                                : isTransfer
                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : isTransfer ? (
                              <ArrowLeftRight className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-slate-900 dark:text-white">
                              {tx.merchant || tx.category}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {tx.date} • {tx.category} {tx.notes ? `• ${tx.notes}` : ''}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={`font-semibold text-xs font-mono ${
                              isIncome
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {isIncome ? '+' : '-'}
                            {formatCurrency(tx.amount, tx.currency)}
                          </div>
                          <span className="text-[10px] text-slate-400 capitalize">
                            {tx.type}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedHistoryAccount(null)}
              >
                Close History
              </Button>
            </div>
          </div>
        </div>
      )}

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

      <ConfirmModal
        isOpen={!!deletingAccount}
        onClose={() => setDeletingAccount(null)}
        onConfirm={() => {
          if (deletingAccount) {
            deleteAccount(deletingAccount.id);
          }
        }}
        title="Delete Account"
        message={
          deletingAccount
            ? `Are you sure you want to delete the account "${deletingAccount.name}"? Future calculations will exclude this account.`
            : ''
        }
        confirmLabel="Delete Account"
        variant="danger"
      />
    </div>
  );
};
