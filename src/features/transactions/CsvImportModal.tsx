import React, { useState, useRef } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { useData } from '@/src/features/data/DataContext';
import { parseCsvText, detectCsvColumns, checkDuplicateTransaction } from '@/src/lib/csv';
import { Transaction, TransactionType, Currency } from '@/src/types';
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, Check } from 'lucide-react';
import { Badge } from '@/src/components/ui/Badge';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedCandidate {
  date: string;
  amount: number;
  currency: Currency;
  type: TransactionType;
  category: string;
  merchant: string;
  accountId: string;
  notes?: string;
  tags?: string[];
  isDuplicate: boolean;
  duplicateReason?: string;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose }) => {
  const { accounts, transactions, importTransactions } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<ParsedCandidate[]>([]);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [importResult, setImportResult] = useState<{ imported: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processCsvContent = (text: string, name: string) => {
    setErrorMsg(null);
    setFileName(name);
    try {
      const rows = parseCsvText(text);
      if (rows.length < 2) {
        setErrorMsg('The CSV file appears to be empty or has no data rows.');
        return;
      }

      const headers = rows[0];
      const mapping = detectCsvColumns(headers);
      const dataRows = rows.slice(1);

      const parsed: ParsedCandidate[] = [];
      const defaultAcc = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

      for (const row of dataRows) {
        if (!row || row.length < 2) continue;

        const rawDate = row[mapping.dateCol] || new Date().toISOString().split('T')[0];
        // Clean date to YYYY-MM-DD
        let formattedDate = rawDate;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDate)) {
          const [m, d, y] = rawDate.split('/');
          formattedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        } else if (/^\d{2}\.\d{2}\.\d{4}$/.test(rawDate)) {
          const [d, m, y] = rawDate.split('.');
          formattedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }

        const rawAmount = (row[mapping.amountCol] || '0').replace(/[^0-9.-]/g, '');
        let amount = Math.abs(parseFloat(rawAmount)) || 0;
        if (amount === 0) continue;

        let rawType: TransactionType = 'expense';
        if (mapping.typeCol !== undefined && row[mapping.typeCol]) {
          const t = row[mapping.typeCol].toLowerCase();
          if (t.includes('income') || t.includes('priliv') || t.includes('credit')) {
            rawType = 'income';
          }
        } else if (parseFloat(rawAmount) > 0 && /deposit|payroll|salary|transfer in/i.test(row[mapping.merchantCol])) {
          rawType = 'income';
        }

        const merchant = (row[mapping.merchantCol] || 'Merchant').replace(/^'/, '');
        const category = mapping.categoryCol !== undefined && row[mapping.categoryCol]
          ? row[mapping.categoryCol]
          : 'Groceries';
        const currency: Currency = mapping.currencyCol !== undefined && row[mapping.currencyCol]
          ? (row[mapping.currencyCol].toUpperCase() as Currency)
          : defaultAcc?.currency || 'EUR';
        const notes = mapping.notesCol !== undefined ? row[mapping.notesCol] : undefined;

        // Duplicate check against existing transactions
        const dupCheck = checkDuplicateTransaction(
          { date: formattedDate, amount, merchant, accountId: defaultAcc?.id },
          transactions
        );

        parsed.push({
          date: formattedDate,
          amount,
          currency,
          type: rawType,
          category,
          merchant,
          accountId: defaultAcc?.id || 'acc_1',
          notes,
          tags: ['imported'],
          isDuplicate: dupCheck.isDuplicate,
          duplicateReason: dupCheck.reason,
        });
      }

      setCandidates(parsed);
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Failed to parse CSV file.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processCsvContent(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processCsvContent(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleExecuteImport = () => {
    const toImport = skipDuplicates ? candidates.filter((c) => !c.isDuplicate) : candidates;
    if (toImport.length === 0) {
      setErrorMsg('No transactions to import (all detected duplicates skipped).');
      return;
    }

    const payload = toImport.map((c) => ({
      accountId: selectedAccountId || c.accountId,
      amount: c.amount,
      currency: c.currency,
      type: c.type,
      category: c.category,
      merchant: c.merchant,
      date: c.date,
      notes: c.notes,
      tags: c.tags,
    }));

    const result = importTransactions(payload);
    setImportResult({ imported: result.importedCount });
    setTimeout(() => {
      onClose();
      setCandidates([]);
      setFileName(null);
      setImportResult(null);
    }, 1500);
  };

  const duplicateCount = candidates.filter((c) => c.isDuplicate).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Transactions (CSV)"
      description="Safely import bank statements with automatic duplicate detection"
      maxWidth="xl"
      id="csv-import-modal"
    >
      <div className="space-y-4">
        {importResult ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-base text-slate-900 dark:text-slate-100">
              Successfully Imported {importResult.imported} Transactions
            </h4>
            <p className="text-xs text-slate-500">Your accounts and charts have been refreshed.</p>
          </div>
        ) : candidates.length === 0 ? (
          <>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/20"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Click or drag & drop bank statement CSV
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports standard bank, PayPal, and credit card CSV exports.
              </p>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-500 text-center font-medium">{errorMsg}</p>
            )}

            <div className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                🛡️ Security Guaranteed:
              </p>
              <p>• DDE / Formula injection protection automatically sanitizes all fields.</p>
              <p>• Client-side parsing ensures your raw statement never leaks externally.</p>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {fileName}
                </span>
                <Badge variant="outline">{candidates.length} rows detected</Badge>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mr-2">
                  Target Account:
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-slate-800 dark:text-slate-200"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.currency})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {duplicateCount > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Detected <strong>{duplicateCount}</strong> potential duplicate transactions.
                  </span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-amber-900 dark:text-amber-200">
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="rounded border-amber-400 text-indigo-600 focus:ring-indigo-500"
                  />
                  Skip Duplicates
                </label>
              </div>
            )}

            {/* Preview Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2">Merchant</th>
                    <th className="p-2">Category</th>
                    <th className="p-2 text-right">Amount</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {candidates.map((c, i) => (
                    <tr
                      key={i}
                      className={
                        c.isDuplicate && skipDuplicates
                          ? 'opacity-40 bg-slate-50 dark:bg-slate-900/50'
                          : ''
                      }
                    >
                      <td className="p-2 whitespace-nowrap">{c.date}</td>
                      <td className="p-2 font-medium truncate max-w-[140px]">{c.merchant}</td>
                      <td className="p-2">{c.category}</td>
                      <td
                        className={`p-2 text-right font-semibold ${
                          c.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {c.type === 'income' ? '+' : '-'}
                        {c.amount.toFixed(2)} {c.currency}
                      </td>
                      <td className="p-2 text-center">
                        {c.isDuplicate ? (
                          <Badge variant="warning">Duplicate</Badge>
                        ) : (
                          <Badge variant="success">New</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCandidates([]);
                  setFileName(null);
                }}
              >
                Choose Different File
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="button" variant="primary" size="sm" onClick={handleExecuteImport}>
                  Import{' '}
                  {skipDuplicates
                    ? candidates.length - duplicateCount
                    : candidates.length}{' '}
                  Records
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
