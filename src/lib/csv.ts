import { Transaction, Currency, DuplicateDetectionResult } from '@/src/types';

/**
 * Escapes CSV values and neutralizes CSV Formula Injection (CSV Injection / DDE).
 * Formula injection occurs when fields start with '=', '+', '-', '@', '\t', '\r'.
 */
export function sanitizeCsvField(value: unknown): string {
  if (value === null || value === undefined) return '';
  let str = String(value);

  // If starts with potential formula trigger characters, prefix with single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape double quotes by doubling them
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports transactions to CSV string.
 */
export function exportTransactionsToCsv(transactions: Transaction[]): string {
  const headers = [
    'ID',
    'Date',
    'Type',
    'Amount',
    'Currency',
    'Merchant',
    'Category',
    'AccountId',
    'Notes',
    'Tags',
  ];

  const rows = transactions.map((t) => [
    sanitizeCsvField(t.id),
    sanitizeCsvField(t.date),
    sanitizeCsvField(t.type),
    sanitizeCsvField(t.amount),
    sanitizeCsvField(t.currency),
    sanitizeCsvField(t.merchant),
    sanitizeCsvField(t.category),
    sanitizeCsvField(t.accountId),
    sanitizeCsvField(t.notes || ''),
    sanitizeCsvField(t.tags ? t.tags.join(';') : ''),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

export const generateCsvContent = exportTransactionsToCsv;

/**
 * Parses raw CSV text into a structured row matrix.
 */
export function parseCsvText(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  const normalized = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const nextChar = normalized[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',' || char === ';') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

export interface CsvColumnMapping {
  dateCol: number;
  amountCol: number;
  typeCol?: number;
  merchantCol: number;
  categoryCol?: number;
  currencyCol?: number;
  notesCol?: number;
}

/**
 * Auto-detects column positions from a CSV header row.
 */
export function detectCsvColumns(headerRow: string[]): CsvColumnMapping {
  const normalized = headerRow.map((h) => h.toLowerCase().replace(/[^a-z]/g, ''));

  const findIndex = (matches: string[]) =>
    normalized.findIndex((col) => matches.some((m) => col.includes(m)));

  const dateCol = Math.max(0, findIndex(['date', 'datum', 'time', 'timestamp']));
  const amountCol = Math.max(1, findIndex(['amount', 'iznos', 'value', 'price', 'total', 'sum']));
  const typeCol = findIndex(['type', 'tip', 'kind']);
  const merchantCol = Math.max(0, findIndex(['merchant', 'payee', 'description', 'opis', 'name', 'title', 'receiver']));
  const categoryCol = findIndex(['category', 'kategorija', 'group', 'tag']);
  const currencyCol = findIndex(['currency', 'valuta', 'curr']);
  const notesCol = findIndex(['notes', 'note', 'memo', 'comment', 'napomena']);

  return {
    dateCol,
    amountCol,
    typeCol: typeCol !== -1 ? typeCol : undefined,
    merchantCol: merchantCol !== -1 ? merchantCol : 2,
    categoryCol: categoryCol !== -1 ? categoryCol : undefined,
    currencyCol: currencyCol !== -1 ? currencyCol : undefined,
    notesCol: notesCol !== -1 ? notesCol : undefined,
  };
}

/**
 * Checks if a candidate transaction is a duplicate of an existing one.
 */
export function checkDuplicateTransaction(
  candidate: { date: string; amount: number; merchant: string; accountId?: string },
  existingTransactions: Transaction[]
): { isDuplicate: boolean; confidence: number; matchedId?: string; reason?: string } {
  const cleanMerchant = candidate.merchant.trim().toLowerCase();

  for (const existing of existingTransactions) {
    const isSameDate = existing.date === candidate.date;
    const isSameAmount = Math.abs(existing.amount - candidate.amount) < 0.01;
    const existingCleanMerchant = existing.merchant.trim().toLowerCase();
    const isSameMerchant =
      existingCleanMerchant === cleanMerchant ||
      existingCleanMerchant.includes(cleanMerchant) ||
      cleanMerchant.includes(existingCleanMerchant);
    const isSameAccount = !candidate.accountId || existing.accountId === candidate.accountId;

    if (isSameDate && isSameAmount && isSameMerchant && isSameAccount) {
      return {
        isDuplicate: true,
        confidence: 0.98,
        matchedId: existing.id,
        reason: `Exact match with transaction "${existing.merchant}" on ${existing.date} (${existing.amount} ${existing.currency})`,
      };
    }

    if (isSameDate && isSameAmount && isSameAccount) {
      return {
        isDuplicate: true,
        confidence: 0.85,
        matchedId: existing.id,
        reason: `Same date & exact amount on same account (${existing.date}, ${existing.amount} ${existing.currency})`,
      };
    }
  }

  return { isDuplicate: false, confidence: 0 };
}
