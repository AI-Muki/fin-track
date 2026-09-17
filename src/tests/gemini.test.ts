import { describe, it, expect } from 'vitest';
import {
  extractCleanErrorMessage,
  isTransientError,
  heuristicCategorizeMerchant,
  getDeterministicSpendingAnalysis,
  getDeterministicMonthlyExplanation,
  getDeterministicSavingsOpportunities,
  getDeterministicAnswer,
} from '@/src/server/gemini';
import { VerifiedFinancialMetrics, Transaction } from '@/src/types';

describe('Gemini Resiliency, Error Handling, and Fallback Ledger Engine', () => {
  const sampleMetrics: VerifiedFinancialMetrics = {
    totalNetWorth: 12500,
    totalIncomeThisMonth: 4200,
    totalExpensesThisMonth: 2100,
    netSavingsThisMonth: 2100,
    savingsRateThisMonth: 50,
    previousMonthIncome: 4000,
    previousMonthExpenses: 2500,
    incomeMonthOverMonthChangePct: 5,
    expensesMonthOverMonthChangePct: -16,
    emergencyFundRunwayMonths: 5.9,
    financialHealthScore: 88,
    totalRecurringMonthlyCost: 45,
    totalRecurringYearlyCost: 540,
    topSpendingCategories: [
      { category: 'Housing & Rent', amount: 1200, percentage: 57.14, count: 1 },
      { category: 'Groceries', amount: 500, percentage: 23.81, count: 5 },
      { category: 'Dining & Restaurants', amount: 250, percentage: 11.9, count: 3 },
    ],
    budgetAdherence: [
      { budgetId: 'b_1', category: 'Housing & Rent', budgeted: 1200, spent: 1200, remaining: 0, percentUsed: 100, status: 'warning' },
      { budgetId: 'b_2', category: 'Groceries', budgeted: 600, spent: 500, remaining: 100, percentUsed: 83.3, status: 'warning' },
      { budgetId: 'b_3', category: 'Dining & Restaurants', budgeted: 400, spent: 250, remaining: 150, percentUsed: 62.5, status: 'safe' },
    ],
    activeGoalsProgress: [],
  };

  const sampleTransactions: Transaction[] = [
    {
      id: 'tx_1',
      userId: 'user_default',
      accountId: 'acc_1',
      amount: 4200,
      currency: 'EUR',
      type: 'income',
      category: 'Salary',
      merchant: 'Tech Corp',
      date: '2026-03-01',
      createdAt: '2026-03-01',
      updatedAt: '2026-03-01',
    },
    {
      id: 'tx_2',
      userId: 'user_default',
      accountId: 'acc_1',
      amount: 1200,
      currency: 'EUR',
      type: 'expense',
      category: 'Housing & Rent',
      merchant: 'Landlord',
      date: '2026-03-02',
      createdAt: '2026-03-02',
      updatedAt: '2026-03-02',
    },
    {
      id: 'tx_3',
      userId: 'user_default',
      accountId: 'acc_1',
      amount: 150,
      currency: 'EUR',
      type: 'expense',
      category: 'Groceries',
      merchant: 'Lidl Supermarket',
      date: '2026-03-05',
      createdAt: '2026-03-05',
      updatedAt: '2026-03-05',
    },
  ];

  describe('Error Message Sanitization', () => {
    it('extracts human-readable message from raw 503 JSON string', () => {
      const raw503 = JSON.stringify({
        error: {
          code: 503,
          message: 'This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.',
          status: 'UNAVAILABLE',
        },
      });

      const cleaned = extractCleanErrorMessage(raw503);
      expect(cleaned).toBe(
        'This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.'
      );
    });

    it('extracts error message from an Error instance wrapping JSON', () => {
      const err = new Error(
        JSON.stringify({
          error: {
            code: 503,
            message: 'Model overloaded',
          },
        })
      );
      expect(extractCleanErrorMessage(err)).toBe('Model overloaded');
    });

    it('returns simple string when input is plain text', () => {
      expect(extractCleanErrorMessage('Standard failure')).toBe('Standard failure');
    });
  });

  describe('Transient Error Detection', () => {
    it('identifies 503 and unavailable conditions', () => {
      expect(isTransientError('code: 503 status: UNAVAILABLE')).toBe(true);
      expect(isTransientError('This model is currently experiencing high demand')).toBe(true);
      expect(isTransientError('RESOURCE_EXHAUSTED 429')).toBe(true);
      expect(isTransientError('ECONNRESET connection timeout')).toBe(true);
    });

    it('returns false for permanent/client errors', () => {
      expect(isTransientError('400 Bad Request: Invalid syntax')).toBe(false);
      expect(isTransientError('Validation error: Missing fields')).toBe(false);
    });
  });

  describe('Heuristic Merchant Categorization', () => {
    it('categorizes common grocers accurately', () => {
      const res = heuristicCategorizeMerchant('Lidl Supermarket Berlin');
      expect(res.category).toBe('Groceries');
      expect(res.confidence).toBeGreaterThan(0.8);
    });

    it('categorizes ride-share and transit', () => {
      const res = heuristicCategorizeMerchant('Uber BV');
      expect(res.category).toBe('Transportation');
    });

    it('categorizes digital subscriptions', () => {
      const res = heuristicCategorizeMerchant('Spotify Premium');
      expect(res.category).toBe('Entertainment');
    });

    it('categorizes dining and cafes', () => {
      const res = heuristicCategorizeMerchant('Starbucks Coffee');
      expect(res.category).toBe('Dining & Restaurants');
    });
  });

  describe('Deterministic Ledger Fallback Generation', () => {
    it('generates spending analysis grounded in verified metrics without throwing', () => {
      const analysis = getDeterministicSpendingAnalysis(sampleMetrics, 'EUR');
      expect(analysis).toContain('Comprehensive Financial Briefing');
      expect(analysis).toContain('88/100');
      expect(analysis).toContain('Housing & Rent');
      expect(analysis).toContain('5.9 months');
    });

    it('generates month-over-month explanation with verified deltas', () => {
      const explanation = getDeterministicMonthlyExplanation(sampleMetrics, 'EUR');
      expect(explanation).toContain('4200.00 EUR');
      expect(explanation).toContain('2100.00 EUR');
      expect(explanation).toContain('+5%');
    });

    it('generates savings recommendations based on active subscriptions and categories', () => {
      const suggestions = getDeterministicSavingsOpportunities(sampleMetrics, 'EUR', 45);
      expect(suggestions).toContain('45.00 EUR/month');
      expect(suggestions).toContain('Housing & Rent');
      expect(suggestions).toContain('5.9 months');
    });

    it('accurately answers category specific questions', () => {
      const answer = getDeterministicAnswer('How much did I spend on groceries?', sampleMetrics, 'EUR', sampleTransactions);
      expect(answer).toContain('500.00 EUR');
      expect(answer).toContain('Groceries');
    });

    it('accurately answers net worth questions', () => {
      const answer = getDeterministicAnswer('What is my total net worth?', sampleMetrics, 'EUR', sampleTransactions);
      expect(answer).toContain('12500.00 EUR');
    });

    it('evaluates affordability queries safely against verified monthly surplus', () => {
      const affordSmall = getDeterministicAnswer('Can I afford a €300 flight ticket?', sampleMetrics, 'EUR', sampleTransactions);
      expect(affordSmall).toContain('Yes');
      expect(affordSmall).toContain('300.00 EUR');

      const affordLarge = getDeterministicAnswer('Can I afford a €5000 luxury watch?', sampleMetrics, 'EUR', sampleTransactions);
      expect(affordLarge).toContain('Caution');
      expect(affordLarge).toContain('5000.00 EUR');
    });
  });
});
