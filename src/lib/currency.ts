import { Currency } from '@/src/types';

// Base currency is EUR. Exchange rates relative to 1 EUR.
export const EXCHANGE_RATES: Record<Currency, number> = {
  EUR: 1.0,
  BAM: 1.95583, // Bosnia & Herzegovina Convertible Mark (historically pegged to DEM / EUR)
  USD: 1.085,
  GBP: 0.855,
  CHF: 0.952,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR: '€',
  BAM: 'KM',
  USD: '$',
  GBP: '£',
  CHF: 'CHF',
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  EUR: 'Euro (EUR)',
  BAM: 'Convertible Mark (BAM)',
  USD: 'US Dollar (USD)',
  GBP: 'British Pound (GBP)',
  CHF: 'Swiss Franc (CHF)',
};

/**
 * Converts an amount from one currency to another using the exchange rates matrix.
 */
export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency
): number {
  if (from === to) return amount;
  // Convert from origin to base EUR, then from EUR to target currency
  const amountInEUR = amount / EXCHANGE_RATES[from];
  const converted = amountInEUR * EXCHANGE_RATES[to];
  return Math.round(converted * 100) / 100;
}

/**
 * Formats a monetary value according to currency rules.
 */
export function formatCurrency(
  amount: number,
  currency: Currency = 'EUR',
  options?: {
    showSign?: boolean;
    compact?: boolean;
    decimalPlaces?: number;
  }
): string {
  const decimals = options?.decimalPlaces ?? 2;
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formattedNumber: string;
  if (options?.compact && absAmount >= 1000000) {
    formattedNumber = (absAmount / 1000000).toFixed(1) + 'M';
  } else if (options?.compact && absAmount >= 1000) {
    formattedNumber = (absAmount / 1000).toFixed(1) + 'k';
  } else {
    formattedNumber = absAmount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  const symbol = CURRENCY_SYMBOLS[currency];
  let result = '';

  switch (currency) {
    case 'USD':
    case 'GBP':
      result = `${symbol}${formattedNumber}`;
      break;
    case 'EUR':
      result = `€${formattedNumber}`;
      break;
    case 'BAM':
      result = `${formattedNumber} KM`;
      break;
    case 'CHF':
      result = `${formattedNumber} CHF`;
      break;
    default:
      result = `${symbol} ${formattedNumber}`;
  }

  if (isNegative) {
    return `-${result}`;
  }
  if (options?.showSign && amount > 0) {
    return `+${result}`;
  }
  return result;
}
