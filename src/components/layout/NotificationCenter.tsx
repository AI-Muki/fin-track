import React, { useState } from 'react';
import { Bell, AlertTriangle, AlertCircle, Calendar } from 'lucide-react';
import { useData } from '@/src/features/data/DataContext';
import { formatCurrency } from '@/src/lib/currency';
import { useAuth } from '@/src/features/auth/AuthContext';

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { metrics, subscriptions } = useData();
  const { currency } = useAuth();

  // Find budget warnings
  const budgetAlerts = (metrics?.budgetAdherence || []).filter((b) => b.status !== 'safe');

  // Find subscriptions due within 7 days
  const today = new Date();
  const upcomingSubscriptions = (subscriptions || []).filter((s) => {
    if (s.status !== 'active') return false;
    const dueDate = new Date(s.nextPaymentDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  const totalNotifications = budgetAlerts.length + upcomingSubscriptions.length;

  return (
    <div className="relative">
      <button
        id="notifications-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {totalNotifications > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
            {totalNotifications}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            id="notifications-popover"
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50 dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Financial Alerts & Reminders
              </h4>
              <span className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium">
                {totalNotifications} new
              </span>
            </div>

            <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {totalNotifications === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
                  All budgets are in safe range and no bills are due soon. ✨
                </p>
              ) : (
                <>
                  {budgetAlerts.map((b) => (
                    <div
                      key={b.budgetId}
                      className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                        b.status === 'exceeded'
                          ? 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-300'
                          : b.status === 'critical'
                          ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300'
                          : 'bg-amber-50/50 border-amber-200/60 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-300'
                      }`}
                    >
                      {b.status === 'exceeded' ? (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold flex items-center justify-between">
                          <span>Budget: {b.category}</span>
                          <span>{b.percentUsed}%</span>
                        </div>
                        <p className="mt-0.5 opacity-90">
                          {b.status === 'exceeded'
                            ? `Exceeded by ${formatCurrency(Math.abs(b.remaining), currency)}!`
                            : `Spent ${formatCurrency(b.spent, currency)} of ${formatCurrency(b.budgeted, currency)}`}
                        </p>
                      </div>
                    </div>
                  ))}

                  {upcomingSubscriptions.map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-xl border border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-300 text-xs flex items-start gap-2.5"
                    >
                      <Calendar className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-semibold flex items-center justify-between">
                          <span>Upcoming: {s.name}</span>
                          <span>{formatCurrency(s.amount, s.currency)}</span>
                        </div>
                        <p className="mt-0.5 opacity-90">
                          Due on {s.nextPaymentDate} ({s.billingCycle})
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
