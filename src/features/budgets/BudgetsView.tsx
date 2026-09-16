import React, { useState } from 'react';
import { Plus, PieChart, AlertCircle, AlertTriangle, CheckCircle2, Edit2, Trash2 } from 'lucide-react';
import { useData } from '@/src/features/data/DataContext';
import { useAuth } from '@/src/features/auth/AuthContext';
import { Budget } from '@/src/types';
import { formatCurrency } from '@/src/lib/currency';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Progress } from '@/src/components/ui/Progress';
import { BudgetModal } from './BudgetModal';
import { ConfirmModal } from '@/src/components/ui/ConfirmModal';

export const BudgetsView: React.FC = () => {
  const { budgets, deleteBudget, metrics } = useData();
  const { currency } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudgetId, setDeletingBudgetId] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<string>('');

  const totalBudgeted = metrics.budgetAdherence.reduce((sum, b) => sum + b.budgeted, 0);
  const totalSpent = metrics.budgetAdherence.reduce((sum, b) => sum + b.spent, 0);
  const overallUsedPct = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Budgets & Spending Limits
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track monthly category caps and prevent unexpected budget overruns
          </p>
        </div>

        <Button
          id="add-budget-btn"
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingBudget(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Budget
        </Button>
      </div>

      {/* Aggregate Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Monthly Budget
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {formatCurrency(totalBudgeted, currency)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across {budgets.length} active categories
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Spent To Date
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {formatCurrency(totalSpent, currency)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {overallUsedPct}% of overall budget consumed
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Overall Remaining Headroom
          </span>
          <div
            className={`text-2xl font-bold mt-1 ${
              totalBudgeted - totalSpent >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(totalBudgeted - totalSpent, currency)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {totalBudgeted - totalSpent >= 0 ? 'Safe remaining allowance' : 'Over budget'}
          </span>
        </Card>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(metrics?.budgetAdherence || []).map((adherence) => {
          const rawBudget = budgets.find((b) => b.id === adherence.budgetId);

          const getStatusBadge = () => {
            switch (adherence.status) {
              case 'safe':
                return <Badge variant="success">Safe</Badge>;
              case 'warning':
                return <Badge variant="warning">Warning (75%)</Badge>;
              case 'critical':
                return <Badge variant="warning">Critical (90%)</Badge>;
              case 'exceeded':
                return <Badge variant="danger">Exceeded</Badge>;
            }
          };

          const getProgressBarVariant = () => {
            switch (adherence.status) {
              case 'safe':
                return 'success';
              case 'warning':
                return 'warning';
              case 'critical':
                return 'warning';
              case 'exceeded':
                return 'danger';
            }
          };

          return (
            <Card key={adherence.budgetId} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
                      {adherence.category}
                    </h3>
                    <p className="text-xs text-slate-500 capitalize">Monthly limit</p>
                  </div>
                  {getStatusBadge()}
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-500">
                      Spent:{' '}
                      <strong className="text-slate-900 dark:text-slate-100 font-semibold">
                        {formatCurrency(adherence.spent, currency)}
                      </strong>
                    </span>
                    <span className="text-slate-500">
                      Limit: {formatCurrency(adherence.budgeted, currency)}
                    </span>
                  </div>

                  <Progress
                    value={adherence.percentUsed}
                    variant={getProgressBarVariant()}
                  />

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {adherence.percentUsed}% utilized
                    </span>
                    <span
                      className={`font-semibold ${
                        adherence.remaining >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {adherence.remaining >= 0
                        ? `${formatCurrency(adherence.remaining, currency)} left`
                        : `${formatCurrency(Math.abs(adherence.remaining), currency)} over`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                {rawBudget && (
                  <button
                    onClick={() => {
                      setEditingBudget(rawBudget);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Edit budget"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm(`Delete budget for ${adherence.category}?`)) {
                      deleteBudget(adherence.budgetId);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Delete budget"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        initialBudget={editingBudget}
      />
    </div>
  );
};
