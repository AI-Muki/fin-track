import { describe, it, expect } from 'vitest';
import { parseCsvText, sanitizeCsvField, checkDuplicateTransaction, generateCsvContent } from '@/src/lib/csv';
import { Transaction } from '@/src/types';

describe('CSV Engine & Security', () => {
  it('parses standard CSV text properly', () => {
    const csv = `Date,Merchant,Amount,Category\n2026-09-01,Supermarket,50.25,Groceries\n2026-09-02,Metro,2.50,Transportation`;
    const rows = parseCsvText(csv);
    expect(rows.length).toBe(3);
    expect(rows[0]).toEqual(['Date', 'Merchant', 'Amount', 'Category']);
    expect(rows[1]).toEqual(['2026-09-01', 'Supermarket', '50.25', 'Groceries']);
  });

  it('sanitizes formula injection attempts (DDE / CSV Injection)', () => {
    // Attack payloads starting with =, +, -, @, \t, \r
    expect(sanitizeCsvField('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)");
    expect(sanitizeCsvField('+cmd|/c calc')).toBe("'+cmd|/c calc");
    expect(sanitizeCsvField('-1+1')).toBe("'-1+1");
    expect(sanitizeCsvField('@SUM')).toBe("'@SUM");

    // Regular strings are unaffected
    expect(sanitizeCsvField('Bio Supermarkt')).toBe('Bio Supermarkt');
  });

  it('detects duplicate transactions with confidence scores', () => {
    const existing: Transaction[] = [
      {
        id: 'tx_1',
        userId: 'u1',
        accountId: 'acc_1',
        amount: 85.5,
        currency: 'EUR',
        type: 'expense',
        category: 'Dining & Restaurants',
        merchant: 'Trattoria Bella Vista',
        date: '2026-09-10',
        createdAt: '2026-09-10',
        updatedAt: '2026-09-10',
      },
    ];

    // Exact duplicate
    const exactDup = checkDuplicateTransaction(
      { date: '2026-09-10', amount: 85.5, merchant: 'Trattoria Bella Vista', accountId: 'acc_1' },
      existing
    );
    expect(exactDup.isDuplicate).toBe(true);
    expect(exactDup.confidence).toBeGreaterThanOrEqual(0.95);

    // Completely distinct transaction
    const distinct = checkDuplicateTransaction(
      { date: '2026-09-15', amount: 200, merchant: 'Electronics Store', accountId: 'acc_1' },
      existing
    );
    expect(distinct.isDuplicate).toBe(false);
  });
});
