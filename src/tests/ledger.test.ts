import { describe, it, expect } from 'vitest';
import { calculateVerifiedMetrics, calculateAccountBalance } from '@/src/lib/metrics';
import { Account, Transaction } from '@/src/types';
import { convertCurrency } from '@/src/lib/currency';

describe('Deterministic Ledger Logic & Invariant Validation', () => {
  const baseAccounts: Account[] = [
    {
      id: 'acc_checking',
      userId: 'usr_main',
      name: 'Primary Checking',
      type: 'bank',
      currency: 'EUR',
      balance: 2000.0,
      initialBalance: 2000.0,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'acc_savings',
      userId: 'usr_main',
      name: 'High-Yield Savings',
      type: 'savings',
      currency: 'EUR',
      balance: 10000.0,
      initialBalance: 10000.0,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ];

  it('preserves ledger conservation during internal account transfers', () => {
    // Transfer 500 EUR from Checking to Savings
    const transferTx: Transaction = {
      id: 'tx_transfer_1',
      userId: 'usr_main',
      accountId: 'acc_checking',
      toAccountId: 'acc_savings',
      amount: 500.0,
      currency: 'EUR',
      type: 'transfer',
      category: 'Transfer',
      merchant: 'Internal Vault Transfer',
      date: new Date().toISOString().split('T')[0],
      createdAt: '2026-01-02T10:00:00Z',
      updatedAt: '2026-01-02T10:00:00Z',
    };

    const checkingBalance = calculateAccountBalance(baseAccounts[0], [transferTx]);
    const savingsBalance = calculateAccountBalance(baseAccounts[1], [transferTx]);

    // Checking: 2000 - 500 = 1500
    expect(checkingBalance).toBe(1500);
    // Savings: 10000 + 500 = 10500
    expect(savingsBalance).toBe(10500);
    // Conservation: sum before equals sum after
    expect(checkingBalance + savingsBalance).toBe(12000);

    const metrics = calculateVerifiedMetrics(
      baseAccounts,
      [transferTx],
      [],
      [],
      [],
      'EUR'
    );

    // Total Net Worth must remain unchanged
    expect(metrics.totalNetWorth).toBe(12000);
    // Transfers must not be counted as operating income or expenses
    expect(metrics.totalIncomeThisMonth).toBe(0);
    expect(metrics.totalExpensesThisMonth).toBe(0);
  });

  it('guarantees deterministic balance calculation with multiple transactions', () => {
    const today = new Date().toISOString().split('T')[0];
    const transactions: Transaction[] = [
      {
        id: 'tx_inc_1',
        userId: 'usr_main',
        accountId: 'acc_checking',
        amount: 3250.75,
        currency: 'EUR',
        type: 'income',
        category: 'Salary',
        merchant: 'Acme Corp Payroll',
        date: today,
        createdAt: '2026-01-01T08:00:00Z',
        updatedAt: '2026-01-01T08:00:00Z',
      },
      {
        id: 'tx_exp_1',
        userId: 'usr_main',
        accountId: 'acc_checking',
        amount: 1420.5,
        currency: 'EUR',
        type: 'expense',
        category: 'Rent',
        merchant: 'Metropolitan Properties',
        date: today,
        createdAt: '2026-01-02T08:00:00Z',
        updatedAt: '2026-01-02T08:00:00Z',
      },
      {
        id: 'tx_exp_2',
        userId: 'usr_main',
        accountId: 'acc_checking',
        amount: 85.25,
        currency: 'EUR',
        type: 'expense',
        category: 'Utilities',
        merchant: 'City Power Grid',
        date: today,
        createdAt: '2026-01-03T08:00:00Z',
        updatedAt: '2026-01-03T08:00:00Z',
      },
    ];

    const checkingBalance = calculateAccountBalance(baseAccounts[0], transactions);
    // Initial: 2000.00 + 3250.75 - 1420.50 - 85.25 = 3745.00
    expect(checkingBalance).toBe(3745.0);

    const metrics = calculateVerifiedMetrics(
      baseAccounts,
      transactions,
      [],
      [],
      [],
      'EUR'
    );

    expect(metrics.totalIncomeThisMonth).toBe(3250.75);
    expect(metrics.totalExpensesThisMonth).toBe(1505.75);
    expect(metrics.netSavingsThisMonth).toBe(1745.0);
    expect(metrics.totalNetWorth).toBe(13745.0);
  });

  it('correctly manages credit card liability semantics', () => {
    const creditAccount: Account = {
      id: 'acc_cc_test',
      userId: 'usr_main',
      name: 'Mastercard Platinum',
      type: 'credit_card',
      currency: 'EUR',
      balance: 100.0, // Existing debt owed
      initialBalance: 100.0,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const today = new Date().toISOString().split('T')[0];
    const ccTransactions: Transaction[] = [
      // Card purchase of 50 EUR increases outstanding balance
      {
        id: 'tx_cc_purchase',
        userId: 'usr_main',
        accountId: 'acc_cc_test',
        amount: 50.0,
        currency: 'EUR',
        type: 'expense',
        category: 'Shopping',
        merchant: 'Department Store',
        date: today,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      // Transfer payment from checking to credit card reduces outstanding debt
      {
        id: 'tx_cc_payment',
        userId: 'usr_main',
        accountId: 'acc_checking',
        toAccountId: 'acc_cc_test',
        amount: 80.0,
        currency: 'EUR',
        type: 'transfer',
        category: 'Debt Payment',
        merchant: 'Card Settlement',
        date: today,
        createdAt: '2026-01-02T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
      },
    ];

    const ccBalance = calculateAccountBalance(creditAccount, ccTransactions);
    // Initial debt: 100 + 50 purchase - 80 payment = 70 EUR debt
    expect(ccBalance).toBe(70.0);
  });

  it('eliminates floating point drift with exact 2-decimal rounding in currency conversion', () => {
    // Check conversion precision
    const converted = convertCurrency(100.333333, 'USD', 'EUR');
    expect(Number.isInteger(converted * 100)).toBe(true);

    const convertedPegged = convertCurrency(19.5583, 'BAM', 'EUR');
    expect(convertedPegged).toBe(10);
  });

  it('accurately aggregates top spending categories', () => {
    const today = new Date().toISOString().split('T')[0];
    const transactions: Transaction[] = [
      {
        id: 'tx_g1',
        userId: 'usr_main',
        accountId: 'acc_checking',
        amount: 120.0,
        currency: 'EUR',
        type: 'expense',
        category: 'Food & Dining',
        merchant: 'Grocery Market',
        date: today,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'tx_g2',
        userId: 'usr_main',
        accountId: 'acc_checking',
        amount: 80.0,
        currency: 'EUR',
        type: 'expense',
        category: 'Food & Dining',
        merchant: 'Bistro Central',
        date: today,
        createdAt: '2026-01-02T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
      },
      {
        id: 'tx_t1',
        userId: 'usr_main',
        accountId: 'acc_checking',
        amount: 50.0,
        currency: 'EUR',
        type: 'expense',
        category: 'Transportation',
        merchant: 'Metro Transit',
        date: today,
        createdAt: '2026-01-03T00:00:00Z',
        updatedAt: '2026-01-03T00:00:00Z',
      },
    ];

    const metrics = calculateVerifiedMetrics(
      baseAccounts,
      transactions,
      [],
      [],
      [],
      'EUR'
    );

    const foodCategory = metrics.topSpendingCategories.find((c) => c.category === 'Food & Dining');
    const transportCategory = metrics.topSpendingCategories.find(
      (c) => c.category === 'Transportation'
    );

    expect(foodCategory).toBeDefined();
    expect(foodCategory?.amount).toBe(200.0);
    expect(transportCategory).toBeDefined();
    expect(transportCategory?.amount).toBe(50.0);

    // Total expense = 250 EUR
    // Food = 200 / 250 = 80%
    // Transport = 50 / 250 = 20%
    expect(foodCategory?.percentage).toBe(80);
    expect(transportCategory?.percentage).toBe(20);
  });
});
