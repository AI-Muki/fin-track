import { describe, it, expect } from 'vitest';
import { convertCurrency, formatCurrency } from '@/src/lib/currency';

describe('Multi-Currency Engine', () => {
  it('correctly converts between same currency', () => {
    expect(convertCurrency(100, 'EUR', 'EUR')).toBe(100);
    expect(convertCurrency(50, 'USD', 'USD')).toBe(50);
  });

  it('correctly converts EUR to BAM (Bosnia and Herzegovina Convertible Mark)', () => {
    // 1 EUR is 1.95583 BAM (fixed currency board rate)
    const converted = convertCurrency(100, 'EUR', 'BAM');
    expect(converted).toBeCloseTo(195.58, 1);
  });

  it('correctly converts BAM to EUR', () => {
    const converted = convertCurrency(195.583, 'BAM', 'EUR');
    expect(converted).toBeCloseTo(100, 1);
  });

  it('formats currency correctly with symbols', () => {
    const formattedEur = formatCurrency(1250.5, 'EUR');
    expect(formattedEur).toContain('€');
    expect(formattedEur).toContain('1,250.50');

    const formattedBam = formatCurrency(500, 'BAM');
    expect(formattedBam).toContain('KM');
  });
});
