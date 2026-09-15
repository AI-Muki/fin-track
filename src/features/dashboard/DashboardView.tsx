import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowLeftRight,
  Upload,
  Calendar,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useData } from '@/src/features/data/DataContext';
import { useAuth } from '@/src/features/auth/AuthContext';
import { formatCurrency } from '@/src/lib/currency';
import { Button } from '@/src/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Progress } from '@/src/components/ui/Progress';
import { TransactionModal } from '@/src/features/transactions/TransactionModal';
import { CsvImportModal } from '@/src/features/transactions/CsvImportModal';
import { NavTab } from '@/src/components/layout/Navbar';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
}

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { metrics, transactions, accounts, budgets, subscriptions } = useData();
  const { currency, user } = useAuth();

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Recent 6 transactions
  const recentTransactions = transactions.slice(0, 6);

  // Category spending data
  const categoryChartData = (metrics?.topSpendingCategories || []).slice(0, 5).map((c) => ({
    name: c.category,
    value: c.amount,
  }));

  // Bar chart data for this month
  const barData = [
    { name: 'Income', amount: metrics.totalIncomeThisMonth, fill: '#10b981' },
    { name: 'Expenses', amount: metrics.totalExpensesThisMonth, fill: '#f43f5e' },
    { name: 'Saved', amount: Math.max(0, metrics.netSavingsThisMonth), fill: '#6366f1' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user?.displayName || 'Finance Member'} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time ledger overview • Base currency set to{' '}
            <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">
              {currency}
            </strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCsvModalOpen(true)}
          >
            <Upload className="w-4 h-4 mr-1.5" /> Import CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTransferModalOpen(true)}
          >
            <ArrowLeftRight className="w-4 h-4 mr-1.5" /> Transfer
          </Button>

          <Button
            id="dash-add-tx-btn"
            variant="primary"
            size="sm"
            onClick={() => setIsTxModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Transaction
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Worth */}
        <Card className="p-4 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Net Worth
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {formatCurrency(metrics.totalNetWorth, currency)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <span>{accounts.length} linked accounts</span>
            <span>•</span>
            <button
              onClick={() => onNavigate('accounts')}
              className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline cursor-pointer"
            >
              Manage
            </button>
          </div>
        </Card>

        {/* Monthly Income */}
        <Card className="p-4 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Income This Month
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(metrics.totalIncomeThisMonth, currency)}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
            {metrics.incomeMonthOverMonthChangePct >= 0 ? (
              <span className="text-emerald-600 font-semibold flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +
                {metrics.incomeMonthOverMonthChangePct}%
              </span>
            ) : (
              <span className="text-rose-600 font-semibold flex items-center">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                {metrics.incomeMonthOverMonthChangePct}%
              </span>
            )}
            <span className="text-slate-400">vs last month</span>
          </div>
        </Card>

        {/* Monthly Expenses */}
        <Card className="p-4 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Expenses This Month
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {formatCurrency(metrics.totalExpensesThisMonth, currency)}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
            {metrics.expensesMonthOverMonthChangePct <= 0 ? (
              <span className="text-emerald-600 font-semibold flex items-center">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                {metrics.expensesMonthOverMonthChangePct}%
              </span>
            ) : (
              <span className="text-rose-600 font-semibold flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +
                {metrics.expensesMonthOverMonthChangePct}%
              </span>
            )}
            <span className="text-slate-400">vs last month</span>
          </div>
        </Card>

        {/* Savings Rate & Net Savings */}
        <Card className="p-4 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Net Savings Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
            {metrics.savingsRateThisMonth}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Saved{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {formatCurrency(metrics.netSavingsThisMonth, currency)}
            </strong>{' '}
            this month
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Cashflow */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-base">Monthly Cashflow Performance</CardTitle>
              <p className="text-xs text-slate-500">Income, spending, and net retained capital</p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              Full Analytics <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(val: any) => [`${formatCurrency(val, currency)}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-base">Top Spending</CardTitle>
              <button
                onClick={() => onNavigate('budgets')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                Budgets <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-44 w-full">
              {categoryChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No expense records yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${formatCurrency(val, currency)}`, 'Spent']}
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        borderRadius: '8px',
                        border: 'none',
                        color: '#fff',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {(metrics?.topSpendingCategories || []).slice(0, 3).map((c, i) => (
              <div key={c.category} className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  {c.category}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {c.percentage}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Grid: Recent Transactions & FinTrack AI Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-base">Recent Transactions</CardTitle>
              <p className="text-xs text-slate-500">Latest activity across all accounts</p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              View All ({transactions.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-850 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {tx.merchant}
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      {tx.category} • {tx.date}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-bold ${
                      tx.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount, tx.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* FinTrack AI Widget */}
        <Card className="p-5 flex flex-col justify-between bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 dark:from-slate-900 dark:to-indigo-950/40 border-indigo-100 dark:border-indigo-950">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                FinTrack AI Assistant
              </h3>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 p-3.5 rounded-xl border border-indigo-100/80 dark:border-indigo-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
              <p>
                💡 <strong>Verified Snapshot:</strong> Your emergency fund runway stands at{' '}
                <strong>{metrics.emergencyFundRunwayMonths} months</strong>.
              </p>
              <p>
                {metrics.savingsRateThisMonth >= 20 ? (
                  <span>
                    Your savings rate of {metrics.savingsRateThisMonth}% meets recommended financial
                    cushion targets!
                  </span>
                ) : (
                  <span>
                    Your savings rate of {metrics.savingsRateThisMonth}% is slightly under the 20%
                    benchmark.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="primary"
              size="sm"
              className="w-full text-xs"
              onClick={() => onNavigate('ai')}
            >
              Open AI Advisor & Chat
            </Button>
          </div>
        </Card>
      </div>

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        initialTransaction={null}
      />

      <TransactionModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        initialTransaction={null}
      />

      <CsvImportModal isOpen={isCsvModalOpen} onClose={() => setIsCsvModalOpen(false)} />
    </div>
  );
};
