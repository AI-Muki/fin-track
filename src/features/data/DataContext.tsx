import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  Account,
  Transaction,
  Budget,
  SavingsGoal,
  Subscription,
  VerifiedFinancialMetrics,
} from '@/src/types';
import { STORAGE } from '@/src/lib/storage';
import { calculateVerifiedMetrics } from '@/src/lib/metrics';
import { useAuth } from '@/src/features/auth/AuthContext';
import { convertCurrency } from '@/src/lib/currency';

interface DataContextType {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  subscriptions: Subscription[];
  metrics: VerifiedFinancialMetrics;

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

  const [accounts, setAccounts] = useState<Account[]>(() => STORAGE.getAccounts());
  const [transactions, setTransactions] = useState<Transaction[]>(() => STORAGE.getTransactions());
  const [budgets, setBudgets] = useState<Budget[]>(() => STORAGE.getBudgets());
  const [goals, setGoals] = useState<SavingsGoal[]>(() => STORAGE.getGoals());
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() =>
    STORAGE.getSubscriptions()
  );

  // Compute verified metrics mathematically
  const metrics = useMemo(() => {
    return calculateVerifiedMetrics(
      accounts,
      transactions,
      budgets,
      goals,
      subscriptions,
      currency
    );
  }, [accounts, transactions, budgets, goals, subscriptions, currency]);

  // Accounts
  const addAccount = (data: Omit<Account, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newAcc: Account = {
      ...data,
      id: `acc_${Date.now()}`,
      userId: user?.id || 'user_default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newAcc, ...accounts];
    setAccounts(updated);
    STORAGE.saveAccounts(updated);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    const updated = accounts.map((acc) =>
      acc.id === id ? { ...acc, ...updates, updatedAt: new Date().toISOString() } : acc
    );
    setAccounts(updated);
    STORAGE.saveAccounts(updated);
  };

  const deleteAccount = (id: string) => {
    const updated = accounts.filter((acc) => acc.id !== id);
    setAccounts(updated);
    STORAGE.saveAccounts(updated);
  };

  // Transactions with Automatic Account Balance adjustments
  const addTransaction = (data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newTx: Transaction = {
      ...data,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user?.id || 'user_default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update account balance
    const updatedAccounts = accounts.map((acc) => {
      if (acc.id === newTx.accountId) {
        let diff = 0;
        if (newTx.type === 'income') diff = newTx.amount;
        else if (newTx.type === 'expense') diff = -newTx.amount;
        else if (newTx.type === 'transfer') diff = -newTx.amount;
        return { ...acc, balance: Math.round((acc.balance + diff) * 100) / 100 };
      }
      if (newTx.type === 'transfer' && acc.id === newTx.toAccountId) {
        // Convert transfer amount if accounts have different currencies
        const originAcc = accounts.find((a) => a.id === newTx.accountId);
        const originCurrency = originAcc?.currency || newTx.currency;
        const converted = convertCurrency(newTx.amount, originCurrency, acc.currency);
        return { ...acc, balance: Math.round((acc.balance + converted) * 100) / 100 };
      }
      return acc;
    });

    const updatedTxList = [newTx, ...transactions];
    setTransactions(updatedTxList);
    STORAGE.saveTransactions(updatedTxList);

    setAccounts(updatedAccounts);
    STORAGE.saveAccounts(updatedAccounts);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const updated = transactions.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    setTransactions(updated);
    STORAGE.saveTransactions(updated);
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (tx) {
      // Revert account balance
      const updatedAccounts = accounts.map((acc) => {
        if (acc.id === tx.accountId) {
          let diff = 0;
          if (tx.type === 'income') diff = -tx.amount;
          else if (tx.type === 'expense') diff = tx.amount;
          else if (tx.type === 'transfer') diff = tx.amount;
          return { ...acc, balance: Math.round((acc.balance + diff) * 100) / 100 };
        }
        if (tx.type === 'transfer' && acc.id === tx.toAccountId) {
          const originAcc = accounts.find((a) => a.id === tx.accountId);
          const originCurrency = originAcc?.currency || tx.currency;
          const converted = convertCurrency(tx.amount, originCurrency, acc.currency);
          return { ...acc, balance: Math.round((acc.balance - converted) * 100) / 100 };
        }
        return acc;
      });
      setAccounts(updatedAccounts);
      STORAGE.saveAccounts(updatedAccounts);
    }

    const updatedTxList = transactions.filter((t) => t.id !== id);
    setTransactions(updatedTxList);
    STORAGE.saveTransactions(updatedTxList);
  };

  // Budgets
  const addBudget = (data: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newBudget: Budget = {
      ...data,
      id: `bud_${Date.now()}`,
      userId: user?.id || 'user_default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...budgets, newBudget];
    setBudgets(updated);
    STORAGE.saveBudgets(updated);
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    const updated = budgets.map((b) =>
      b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
    );
    setBudgets(updated);
    STORAGE.saveBudgets(updated);
  };

  const deleteBudget = (id: string) => {
    const updated = budgets.filter((b) => b.id !== id);
    setBudgets(updated);
    STORAGE.saveBudgets(updated);
  };

  // Savings Goals
  const addGoal = (data: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: SavingsGoal = {
      ...data,
      id: `goal_${Date.now()}`,
      userId: user?.id || 'user_default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    STORAGE.saveGoals(updated);
  };

  const updateGoal = (id: string, updates: Partial<SavingsGoal>) => {
    const updated = goals.map((g) =>
      g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
    );
    setGoals(updated);
    STORAGE.saveGoals(updated);
  };

  const deleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    STORAGE.saveGoals(updated);
  };

  const depositToGoal = (goalId: string, amount: number, fromAccountId?: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const newAmount = Math.max(0, goal.currentAmount + amount);
    updateGoal(goalId, { currentAmount: newAmount });

    if (fromAccountId && amount > 0) {
      // Deduct from origin account
      const fromAcc = accounts.find((a) => a.id === fromAccountId);
      if (fromAcc) {
        const converted = convertCurrency(amount, goal.currency, fromAcc.currency);
        updateAccount(fromAccountId, {
          balance: Math.round((fromAcc.balance - converted) * 100) / 100,
        });

        // Record as an internal transfer transaction
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
      userId: user?.id || 'user_default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...subscriptions, newSub];
    setSubscriptions(updated);
    STORAGE.saveSubscriptions(updated);
  };

  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
    const updated = subscriptions.map((s) =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    );
    setSubscriptions(updated);
    STORAGE.saveSubscriptions(updated);
  };

  const deleteSubscription = (id: string) => {
    const updated = subscriptions.filter((s) => s.id !== id);
    setSubscriptions(updated);
    STORAGE.saveSubscriptions(updated);
  };

  // CSV Import Batch
  const importTransactions = (
    newTxList: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]
  ) => {
    const created: Transaction[] = newTxList.map((t, idx) => ({
      ...t,
      id: `tx_imported_${Date.now()}_${idx}`,
      userId: user?.id || 'user_default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const combined = [...created, ...transactions];
    setTransactions(combined);
    STORAGE.saveTransactions(combined);
    return { importedCount: created.length };
  };

  const resetData = () => {
    STORAGE.resetToDemo();
    setAccounts(STORAGE.getAccounts());
    setTransactions(STORAGE.getTransactions());
    setBudgets(STORAGE.getBudgets());
    setGoals(STORAGE.getGoals());
    setSubscriptions(STORAGE.getSubscriptions());
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
