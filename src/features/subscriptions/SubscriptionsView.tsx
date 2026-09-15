import React, { useState } from 'react';
import { Plus, Repeat, Calendar, AlertCircle, Edit2, Trash2, CheckCircle2, PauseCircle } from 'lucide-react';
import { useData } from '@/src/features/data/DataContext';
import { useAuth } from '@/src/features/auth/AuthContext';
import { Subscription } from '@/src/types';
import { formatCurrency, convertCurrency } from '@/src/lib/currency';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { SubscriptionModal } from './SubscriptionModal';

export const SubscriptionsView: React.FC = () => {
  const { subscriptions, deleteSubscription, updateSubscription, metrics } = useData();
  const { currency } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  const totalMonthlyCost = metrics.totalRecurringMonthlyCost;
  const totalYearlyCost = totalMonthlyCost * 12;

  const getDaysUntilDue = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr);
    due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Recurring Subscriptions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Detect recurring cash burn, upcoming renewal dates, and cancel unused services
          </p>
        </div>

        <Button
          id="add-subscription-btn"
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingSub(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Subscription
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Monthly Commitment
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {formatCurrency(totalMonthlyCost, currency)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across {subscriptions.filter((s) => s.status === 'active').length} active services
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Annual Projected Burn
          </span>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {formatCurrency(totalYearlyCost, currency)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Annualized recurring financial drain
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Upcoming Bills (Next 7 Days)
          </span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {
              subscriptions.filter((s) => {
                if (s.status !== 'active') return false;
                const days = getDaysUntilDue(s.nextPaymentDate);
                return days >= 0 && days <= 7;
              }).length
            }
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Services due for automated charge soon
          </span>
        </Card>
      </div>

      {/* Subscriptions Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(subscriptions || []).map((sub) => {
          const daysLeft = getDaysUntilDue(sub.nextPaymentDate);
          const convertedVal = convertCurrency(sub.amount, sub.currency, currency);

          return (
            <Card key={sub.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-slate-500">{sub.category}</p>
                  </div>

                  <Badge
                    variant={
                      sub.status === 'active'
                        ? 'success'
                        : sub.status === 'paused'
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {sub.status}
                  </Badge>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500 capitalize">
                    {sub.billingCycle} charge
                  </span>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(sub.amount, sub.currency)}
                  </div>
                  {sub.currency !== currency && (
                    <span className="text-xs text-slate-400 font-medium">
                      ≈ {formatCurrency(convertedVal, currency)}
                    </span>
                  )}
                </div>

                <div className="mt-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sub.nextPaymentDate}</span>
                  </div>
                  <span
                    className={`font-semibold ${
                      daysLeft <= 3 && daysLeft >= 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : daysLeft <= 7 && daysLeft > 3
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {daysLeft < 0
                      ? 'Overdue'
                      : daysLeft === 0
                      ? 'Due today!'
                      : `In ${daysLeft} days`}
                  </span>
                </div>

                {sub.notes && (
                  <p className="text-xs text-slate-400 mt-2 truncate">{sub.notes}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() =>
                    updateSubscription(sub.id, {
                      status: sub.status === 'active' ? 'paused' : 'active',
                    })
                  }
                  className="text-xs font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 cursor-pointer"
                >
                  {sub.status === 'active' ? 'Pause Service' : 'Resume Service'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingSub(sub);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Edit subscription"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove subscription "${sub.name}"?`)) {
                        deleteSubscription(sub.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Delete subscription"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSub(null);
        }}
        initialSubscription={editingSub}
      />
    </div>
  );
};
