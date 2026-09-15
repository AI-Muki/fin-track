import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Download,
  Upload,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit2,
  Tag,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
} from 'lucide-react';
import { useData } from '@/src/features/data/DataContext';
import { useAuth } from '@/src/features/auth/AuthContext';
import { Transaction, TransactionType } from '@/src/types';
import { formatCurrency } from '@/src/lib/currency';
import { generateCsvContent } from '@/src/lib/csv';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { TransactionModal } from './TransactionModal';
import { CsvImportModal } from './CsvImportModal';

export const TransactionsView: React.FC = () => {
  const { transactions, accounts, deleteTransaction } = useData();
  const { currency } = useAuth();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'merchant-asc'>('date-desc');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.category));
    return Array.from(set).sort();
  }, [transactions]);

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchMerchant = t.merchant.toLowerCase().includes(q);
          const matchNotes = t.notes?.toLowerCase().includes(q);
          const matchTags = t.tags?.some((tag) => tag.toLowerCase().includes(q));
          if (!matchMerchant && !matchNotes && !matchTags) return false;
        }

        // Type filter
        if (selectedType !== 'all' && t.type !== selectedType) return false;

        // Category filter
        if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

        // Account filter
        if (selectedAccountId !== 'all' && t.accountId !== selectedAccountId) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        if (sortBy === 'merchant-asc') return a.merchant.localeCompare(b.merchant);
        return 0;
      });
  }, [transactions, searchQuery, selectedType, selectedCategory, selectedAccountId, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  // CSV Export
  const handleExportCsv = () => {
    const csvData = generateCsvContent(filteredTransactions);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fintrack_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAccountName = (accId: string) => {
    return accounts.find((a) => a.id === accId)?.name || 'Account';
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, categorize, and inspect all verified financial records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            id="csv-import-btn"
            variant="outline"
            size="sm"
            onClick={() => setIsCsvModalOpen(true)}
          >
            <Upload className="w-4 h-4 mr-1.5" /> Import CSV
          </Button>

          <Button
            id="csv-export-btn"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
          >
            <Download className="w-4 h-4 mr-1.5" /> Export CSV
          </Button>

          <Button
            id="add-transaction-btn"
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingTx(null);
              setIsTxModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Transaction
          </Button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              id="tx-search-input"
              type="text"
              placeholder="Search merchant, tag, note..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              id="tx-type-filter"
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types (Income / Expense / Transfer)</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
              <option value="transfer">Transfers Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              id="tx-category-filter"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              id="tx-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="date-desc">Date: Newest First</option>
              <option value="date-asc">Date: Oldest First</option>
              <option value="amount-desc">Amount: Highest First</option>
              <option value="amount-asc">Amount: Lowest First</option>
              <option value="merchant-asc">Merchant: A-Z</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Transaction / Merchant</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Account</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    No transactions match your search criteria.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            tx.type === 'income'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                              : tx.type === 'expense'
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                              : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                          }`}
                        >
                          {tx.type === 'income' ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : tx.type === 'expense' ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowLeftRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {tx.merchant}
                          </div>
                          {tx.notes && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                              {tx.notes}
                            </p>
                          )}
                          {tx.tags && tx.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {tx.tags.map((tg) => (
                                <span
                                  key={tg}
                                  className="inline-flex items-center text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-md"
                                >
                                  #{tg}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="outline">{tx.category}</Badge>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {getAccountName(tx.accountId)}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {tx.date}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          tx.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : tx.type === 'expense'
                            ? 'text-slate-900 dark:text-slate-100'
                            : 'text-indigo-600 dark:text-indigo-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                        {formatCurrency(tx.amount, tx.currency)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingTx(tx);
                            setIsTxModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete transaction "${tx.merchant}"?`)) {
                              deleteTransaction(tx.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs">
          <div className="text-slate-500">
            Showing{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {filteredTransactions.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {Math.min(currentPage * pageSize, filteredTransactions.length)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {filteredTransactions.length}
            </span>{' '}
            results
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="py-1 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>

            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="h-7 px-2.5 text-xs"
              >
                Previous
              </Button>
              <span className="flex items-center px-2 font-medium text-slate-600 dark:text-slate-400">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-7 px-2.5 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        initialTransaction={editingTx}
      />

      <CsvImportModal isOpen={isCsvModalOpen} onClose={() => setIsCsvModalOpen(false)} />
    </div>
  );
};
