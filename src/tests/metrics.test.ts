import { describe, it, expect } from 'vitest';
import { calculateVerifiedMetrics } from '@/src/lib/metrics';
import { Account, Transaction, Budget, SavingsGoal, Subscription } from '@/src/types';

describe('Financial Metrics Calculation Engine', () => {
  const mockAccounts: Account[] = [
    {
      id: 'acc_1',
      userId: 'user_1',
      name: 'Checking',
      type: 'bank',
      currency: 'EUR',
      balance: 1000,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'acc_2',
      userId: 'user_1',
      name: 'Savings',
      type: 'savings',
      currency: 'EUR',
      balance: 5000,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ];

  const now = new Date();
  const currentMonthDate = now.toISOString().split('T')[0];

  const prevMonth = new Date();
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  const prevMonthDate = prevMonth.toISOString().split('T')[0];

  const mockTransactions: Transaction[] = [
    {
      id: 'tx_1',
      userId: 'user_1',
      accountId: 'acc_1',
      amount: 3000,
      currency: 'EUR',
      type: 'income',
      category: 'Salary',
      merchant: 'Employer Inc',
      date: currentMonthDate,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'tx_2',
      userId: 'user_1',
      accountId: 'acc_1',
      amount: 1500,
      currency: 'EUR',
      type: 'expense',
      category: 'Housing & Rent',
      merchant: 'Landlord',
      date: currentMonthDate,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'tx_3',
      userId: 'user_1',
      accountId: 'acc_1',
      amount: 300,
      currency: 'EUR',
      type: 'expense',
      category: 'Groceries',
      merchant: 'Supermarket',
      date: currentMonthDate,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    // Previous month transactions
    {
      id: 'tx_prev_1',
      userId: 'user_1',
      accountId: 'acc_1',
      amount: 2500,
      currency: 'EUR',
      type: 'income',
      category: 'Salary',
      merchant: 'Employer Inc',
      date: prevMonthDate,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'tx_prev_2',
      userId: 'user_1',
      accountId: 'acc_1',
      amount: 2000,
      currency: 'EUR',
      type: 'expense',
      category: 'Housing & Rent',
      merchant: 'Landlord',
      date: prevMonthDate,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ];

  const mockBudgets: Budget[] = [
    {
      id: 'bud_1',
      userId: 'user_1',
      category: 'Groceries',
      amount: 400,
      currency: 'EUR',
      period: 'monthly',
      alertThresholds: [75, 90, 100],
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ];

  const mockGoals: SavingsGoal[] = [];
  const mockSubscriptions: Subscription[] = [];

  it('correctly calculates total net worth', () => {
    const metrics = calculateVerifiedMetrics(
      mockAccounts,
      mockTransactions,
      mockBudgets,
      mockGoals,
      mockSubscriptions,
      'EUR'
    );
    expect(metrics.totalNetWorth).toBe(6000);
  });

  it('correctly calculates monthly income, expenses, and net savings', () => {
    const metrics = calculateVerifiedMetrics(
      mockAccounts,
      mockTransactions,
      mockBudgets,
      mockGoals,
      mockSubscriptions,
      'EUR'
    );
    expect(metrics.totalIncomeThisMonth).toBe(3000);
    expect(metrics.totalExpensesThisMonth).toBe(1800);
    expect(metrics.netSavingsThisMonth).toBe(1200);
    expect(metrics.savingsRateThisMonth).toBe(40); // 1200 / 3000 * 100
  });

  it('correctly calculates month-over-month percentage changes', () => {
    const metrics = calculateVerifiedMetrics(
      mockAccounts,
      mockTransactions,
      mockBudgets,
      mockGoals,
      mockSubscriptions,
      'EUR'
    );
    expect(metrics.previousMonthIncome).toBe(2500);
    expect(metrics.previousMonthExpenses).toBe(2000);
    // Income changed from 2500 to 3000 -> +20%
    expect(metrics.incomeMonthOverMonthChangePct).toBe(20);
    // Expenses changed from 2000 to 1800 -> -10%
    expect(metrics.expensesMonthOverMonthChangePct).toBe(-10);
  });

  it('correctly assesses budget adherence and thresholds', () => {
    const metrics = calculateVerifiedMetrics(
      mockAccounts,
      mockTransactions,
      mockBudgets,
      mockGoals,
      mockSubscriptions,
      'EUR'
    );
    expect(metrics.budgetAdherence.length).toBe(1);
    const groceryBudget = metrics.budgetAdherence[0];
    expect(groceryBudget.category).toBe('Groceries');
    expect(groceryBudget.spent).toBe(300);
    expect(groceryBudget.budgeted).toBe(400);
    expect(groceryBudget.percentUsed).toBe(75);
    expect(groceryBudget.status).toBe('warning'); // >= 75%
  });
});
