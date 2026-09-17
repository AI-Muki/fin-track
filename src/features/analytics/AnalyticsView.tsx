import React from 'react';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { useData } from '@/src/features/data/DataContext';
import { useAuth } from '@/src/features/auth/AuthContext';
import { formatCurrency } from '@/src/lib/currency';
import { Card, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { ShieldCheck, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#ef4444', // Red
  '#64748b', // Slate
];

export const AnalyticsView: React.FC = () => {
  const { metrics, transactions } = useData();
  const { currency } = useAuth();

  // Pie chart data: Category spending
  const categoryData = (metrics?.topSpendingCategories || []).map((c) => ({
    name: c.category,
    value: c.amount,
  }));

  // Bar chart data: Income vs Expenses (Current vs Previous month)
  const comparisonData = [
    {
      period: 'Last Month',
      Income: metrics.previousMonthIncome,
      Expenses: metrics.previousMonthExpenses,
      NetSavings: Math.max(0, metrics.previousMonthIncome - metrics.previousMonthExpenses),
    },
    {
      period: 'This Month',
      Income: metrics.totalIncomeThisMonth,
      Expenses: metrics.totalExpensesThisMonth,
      NetSavings: Math.max(0, metrics.netSavingsThisMonth),
    },
  ];

  // Spending trend over last 30 days
  const dailySpendingMap = new Map<string, number>();
  const now = new Date();
  for (let i = 14; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const key = d.toISOString().split('T')[0];
    dailySpendingMap.set(key, 0);
  }

  transactions.forEach((tx) => {
    if (tx.type === 'expense' && dailySpendingMap.has(tx.date)) {
      const current = dailySpendingMap.get(tx.date) || 0;
      dailySpendingMap.set(tx.date, current + tx.amount);
    }
  });

  const trendData = Array.from(dailySpendingMap.entries()).map(([date, amount]) => ({
    date: date.slice(5), // MM-DD
    amount,
  }));

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-indigo-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Financial Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Rigorous charts and mathematically verified performance indicators
        </p>
      </div>

      {/* Health Score Pillar */}
      <Card className="p-6 bg-gradient-to-r from-indigo-900 to-slate-900 text-white border-0 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex flex-col items-center justify-center shrink-0 border border-white/20">
              <span className={`text-3xl font-extrabold ${getScoreColor(metrics.financialHealthScore)}`}>
                {metrics.financialHealthScore}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-300">/ 100</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold">Verified Financial Health Rating</h3>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Calculated strictly from your actual savings rate ({metrics.savingsRateThisMonth}%), emergency
                liquidity runway ({metrics.emergencyFundRunwayMonths} months), and category budget adherence.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-center">
              <span className="text-[11px] text-slate-300 block">Savings Rate</span>
              <span className="text-base font-bold text-white">{metrics.savingsRateThisMonth}%</span>
            </div>
            <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-center">
              <span className="text-[11px] text-slate-300 block">Runway</span>
              <span className="text-base font-bold text-white">
                {metrics.emergencyFundRunwayMonths} mo
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <Card className="p-5">
          <CardHeader>
            <CardTitle>Income vs Expenses (Monthly Comparison)</CardTitle>
          </CardHeader>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(value: any) => [`${value} ${currency}`, '']}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="NetSavings" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown Donut */}
        <Card className="p-5">
          <CardHeader>
            <CardTitle>Spending by Category ({currency})</CardTitle>
          </CardHeader>
          <div className="h-72 w-full pt-4">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No expense data available for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${formatCurrency(value, currency)}`, 'Amount']}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Daily Spending Trend (Area Chart) */}
        <Card className="p-5 lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Expense Velocity (Last 14 Days)</CardTitle>
          </CardHeader>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(val: any) => [`${formatCurrency(val, currency)}`, 'Spent']}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#spendingGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Categories Table */}
      <Card className="p-5">
        <CardTitle className="text-base mb-4">Top Spending Categories</CardTitle>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {(metrics?.topSpendingCategories || []).map((cat, idx) => (
            <div key={cat.category} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {cat.category}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-500">{cat.percentage}% of total</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(cat.amount, currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
