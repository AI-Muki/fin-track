import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  Account,
  Transaction,
  Budget,
  SavingsGoal,
  Subscription,
  VerifiedFinancialMetrics,
  DashboardPeriod,
} from '@/src/types';
import { STORAGE } from '@/src/lib/storage';
import { calculateVerifiedMetrics, calculateAccountBalance } from '@/src/lib/metrics';
import { useAuth } from '@/src/features/auth/AuthContext';
import { convertCurrency } from '@/src/lib/currency';

interface DataContextType {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  subscriptions: Subscription[];
  metrics: VerifiedFinancialMetrics;
  dashboardPeriod: DashboardPeriod;
  setDashboardPeriod: (p: DashboardPeriod) => void;
  customDateRange: { start: string; end: string };
  setCustomDateRange: (range: { start: string; end: string }) => void;

  // Account operations
  addAccount: (account: Omit<Account, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  // Transaction operations
  addTransaction: (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Budget operations
  addBudget: (budget: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  // Goal operations
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  depositToGoal: (goalId: string, amount: number, fromAccountId?: string) => void;

  // Subscription operations
  addSubscription: (sub: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;

  // Import / Export
  importTransactions: (
    newTxList: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]
  ) => { importedCount: number };
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, currency } = useAuth();
  const currentUserId = user?.id || 'user_default';

  const [accounts, setAccounts] = useState<Account[]>(() => STORAGE.getAccounts(currentUserId));
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    STORAGE.getTransactions(currentUserId)
  );
  const [budgets, setBudgets] = useState<Budget[]>(() => STORAGE.getBudgets(currentUserId));
  const [goals, setGoals] = useState<SavingsGoal[]>(() => STORAGE.getGoals(currentUserId));
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() =>
    STORAGE.getSubscriptions(currentUserId)
  );

  const [dashboardPeriod, setDashboardPeriod] = useState<DashboardPeriod>('this_month');
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const end = today.toISOString().split('T')[0];
    return { start, end };
  });

  // Re-synchronize when authenticated user changes (prevents cross-user data leakage)
  useEffect(() => {
    const uid = user?.id || 'user_default';
    setAccounts(STORAGE.getAccounts(uid));
    setTransactions(STORAGE.getTransactions(uid));
    setBudgets(STORAGE.getBudgets(uid));
    setGoals(STORAGE.getGoals(uid));
    setSubscriptions(STORAGE.getSubscriptions(uid));
  }, [user?.id]);

  // Compute verified metrics mathematically
  const metrics = useMemo(() => {
    return calculateVerifiedMetrics(
      accounts,
      transactions,
      budgets,
      goals,
      subscriptions,
      currency,
      dashboardPeriod,
      customDateRange.start,
      customDateRange.end
    );
  }, [
    accounts,
    transactions,
    budgets,
    goals,
    subscriptions,
    currency,
    dashboardPeriod,
    customDateRange.start,
    customDateRange.end,
  ]);

  // Helper to recompute balances dynamically
  const recomputeAccounts = (accs: Account[], txs: Transaction[]): Account[] => {
    return accs.map((acc) => ({
      ...acc,
      balance: calculateAccountBalance(acc, txs),
    }));
  };

  // Accounts
  const addAccount = (data: Omit<Account, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const initBal = data.initialBalance ?? data.balance ?? 0;
    const newAcc: Account = {
      ...data,
      id: `acc_${Date.now()}`,
      userId: currentUserId,
      initialBalance: initBal,
      balance: initBal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newAcc, ...accounts];
    const computed = recomputeAccounts(updated, transactions);
    setAccounts(computed);
    STORAGE.saveAccounts(computed, currentUserId);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    const updated = accounts.map((acc) =>
      acc.id === id ? { ...acc, ...updates, updatedAt: new Date().toISOString() } : acc
    );
    const computed = recomputeAccounts(updated, transactions);
    setAccounts(computed);
    STORAGE.saveAccounts(computed, currentUserId);
  };

  const deleteAccount = (id: string) => {
    const updated = accounts.filter((acc) => acc.id !== id);
    setAccounts(updated);
    STORAGE.saveAccounts(updated, currentUserId);
  };

  // Transactions with Automatic Account Balance adjustments
  const addTransaction = (data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newTx: Transaction = {
      ...data,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedTxList = [newTx, ...transactions];
    const computedAccounts = recomputeAccounts(accounts, updatedTxList);

    setTransactions(updatedTxList);
    STORAGE.saveTransactions(updatedTxList, currentUserId);

    setAccounts(computedAccounts);
    STORAGE.saveAccounts(computedAccounts, currentUserId);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const updatedTxList = transactions.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    const computedAccounts = recomputeAccounts(accounts, updatedTxList);

    setTransactions(updatedTxList);
    STORAGE.saveTransactions(updatedTxList, currentUserId);

    setAccounts(computedAccounts);
    STORAGE.saveAccounts(computedAccounts, currentUserId);
  };

  const deleteTransaction = (id: string) => {
    const updatedTxList = transactions.filter((t) => t.id !== id);
    const computedAccounts = recomputeAccounts(accounts, updatedTxList);

    setTransactions(updatedTxList);
    STORAGE.saveTransactions(updatedTxList, currentUserId);

    setAccounts(computedAccounts);
    STORAGE.saveAccounts(computedAccounts, currentUserId);
  };

  // Budgets
  const addBudget = (data: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newBudget: Budget = {
      ...data,
      id: `bud_${Date.now()}`,
      userId: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...budgets, newBudget];
    setBudgets(updated);
    STORAGE.saveBudgets(updated, currentUserId);
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    const updated = budgets.map((b) =>
      b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
    );
    setBudgets(updated);
    STORAGE.saveBudgets(updated, currentUserId);
  };

  const deleteBudget = (id: string) => {
    const updated = budgets.filter((b) => b.id !== id);
    setBudgets(updated);
    STORAGE.saveBudgets(updated, currentUserId);
  };

  // Savings Goals
  const addGoal = (data: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: SavingsGoal = {
      ...data,
      id: `goal_${Date.now()}`,
      userId: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    STORAGE.saveGoals(updated, currentUserId);
  };

  const updateGoal = (id: string, updates: Partial<SavingsGoal>) => {
    const updated = goals.map((g) =>
      g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
    );
    setGoals(updated);
    STORAGE.saveGoals(updated, currentUserId);
  };

  const deleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    STORAGE.saveGoals(updated, currentUserId);
  };

  const depositToGoal = (goalId: string, amount: number, fromAccountId?: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const newAmount = Math.max(0, goal.currentAmount + amount);
    updateGoal(goalId, { currentAmount: newAmount });

    if (fromAccountId && amount > 0) {
      const fromAcc = accounts.find((a) => a.id === fromAccountId);
      if (fromAcc) {
        const converted = convertCurrency(amount, goal.currency, fromAcc.currency);

        // Record as an internal transfer/savings transaction which recalculates ledger balance
        addTransaction({
          accountId: fromAccountId,
          amount: converted,
          currency: fromAcc.currency,
          type: 'expense',
          category: 'Investments & Savings',
          merchant: `Deposit to Goal: ${goal.name}`,
          date: new Date().toISOString().split('T')[0],
          notes: `Allocated savings for goal ${goal.name}`,
          tags: ['savings-goal'],
        });
      }
    }
  };

  // Subscriptions
  const addSubscription = (
    data: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    const newSub: Subscription = {
      ...data,
      id: `sub_${Date.now()}`,
      userId: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...subscriptions, newSub];
    setSubscriptions(updated);
    STORAGE.saveSubscriptions(updated, currentUserId);
  };

  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
    const updated = subscriptions.map((s) =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    );
    setSubscriptions(updated);
    STORAGE.saveSubscriptions(updated, currentUserId);
  };

  const deleteSubscription = (id: string) => {
    const updated = subscriptions.filter((s) => s.id !== id);
    setSubscriptions(updated);
    STORAGE.saveSubscriptions(updated, currentUserId);
  };

  // CSV Import Batch
  const importTransactions = (
    newTxList: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]
  ) => {
    const created: Transaction[] = newTxList.map((t, idx) => ({
      ...t,
      id: `tx_imported_${Date.now()}_${idx}`,
      userId: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const combined = [...created, ...transactions];
    const computedAccounts = recomputeAccounts(accounts, combined);

    setTransactions(combined);
    STORAGE.saveTransactions(combined, currentUserId);

    setAccounts(computedAccounts);
    STORAGE.saveAccounts(computedAccounts, currentUserId);

    return { importedCount: created.length };
  };

  const resetData = () => {
    STORAGE.resetToDemo(currentUserId);
    setAccounts(STORAGE.getAccounts(currentUserId));
    setTransactions(STORAGE.getTransactions(currentUserId));
    setBudgets(STORAGE.getBudgets(currentUserId));
    setGoals(STORAGE.getGoals(currentUserId));
    setSubscriptions(STORAGE.getSubscriptions(currentUserId));
  };

  return (
    <DataContext.Provider
      value={{
        accounts,
        transactions,
        budgets,
        goals,
        subscriptions,
        metrics,
        dashboardPeriod,
        setDashboardPeriod,
        customDateRange,
        setCustomDateRange,
        addAccount,
        updateAccount,
        deleteAccount,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBudget,
        updateBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        deleteGoal,
        depositToGoal,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        importTransactions,
        resetData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
