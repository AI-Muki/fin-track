import React, { useState } from 'react';
import { Plus, Target, Calendar, ArrowUpRight, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { useData } from '@/src/features/data/DataContext';
import { useAuth } from '@/src/features/auth/AuthContext';
import { SavingsGoal } from '@/src/types';
import { formatCurrency } from '@/src/lib/currency';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Progress } from '@/src/components/ui/Progress';
import { GoalModal } from './GoalModal';
import { DepositModal } from './DepositModal';
import { ConfirmModal } from '@/src/components/ui/ConfirmModal';

export const GoalsView: React.FC = () => {
  const { goals, deleteGoal, metrics } = useData();
  const { currency } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [depositingGoal, setDepositingGoal] = useState<SavingsGoal | null>(null);
  const [deletingGoalInfo, setDeletingGoalInfo] = useState<{ id: string; name: string } | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Savings Goals
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build your emergency runway and fund future milestones with target pacing
          </p>
        </div>

        <Button
          id="add-goal-btn"
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingGoal(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" /> New Savings Goal
        </Button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(metrics?.goalsProgress || metrics?.activeGoalsProgress || []).map((gp) => {
          const rawGoal = goals.find((g) => g.id === gp.goalId);
          const percent = gp.percentComplete ?? gp.percentAchieved ?? 0;
          const isComplete = percent >= 100;

          return (
            <Card
              key={gp.goalId}
              className="p-5 flex flex-col justify-between border-t-4"
              style={{ borderTopColor: rawGoal?.color || '#3b82f6' }}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
                      {gp.name}
                    </h3>
                    <p className="text-xs text-slate-500">{rawGoal?.category || 'Goal'}</p>
                  </div>
                  {isComplete ? (
                    <Badge variant="success">Achieved 🎉</Badge>
                  ) : (
                    <Badge variant="outline">{percent}%</Badge>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-500">
                      Saved:{' '}
                      <strong className="text-slate-900 dark:text-slate-100 font-semibold">
                        {formatCurrency(gp.currentAmount, currency)}
                      </strong>
                    </span>
                    <span className="text-slate-500">
                      Target: {formatCurrency(gp.targetAmount, currency)}
                    </span>
                  </div>

                  <Progress
                    value={percent}
                    variant={isComplete ? 'success' : 'default'}
                  />

                  {/* Dynamic calculation of required monthly savings */}
                  {!isComplete && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg mt-3 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Target Date:
                        </span>
                        <span className="font-medium">{gp.deadline || rawGoal?.deadline || 'Upcoming'}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span>Required pace:</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(gp.requiredMonthlySaving, currency)} / mo
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDepositingGoal(rawGoal || null)}
                  className="text-xs h-8"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> Deposit
                </Button>

                <div className="flex items-center gap-1">
                  {rawGoal && (
                    <button
                      onClick={() => {
                        setEditingGoal(rawGoal);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit goal"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setDeletingGoalInfo({ id: gp.goalId, name: gp.name });
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Delete goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
        }}
        initialGoal={editingGoal}
      />

      <DepositModal
        isOpen={Boolean(depositingGoal)}
        onClose={() => setDepositingGoal(null)}
        goal={depositingGoal}
      />

      <ConfirmModal
        isOpen={!!deletingGoalInfo}
        onClose={() => setDeletingGoalInfo(null)}
        onConfirm={() => {
          if (deletingGoalInfo) {
            deleteGoal(deletingGoalInfo.id);
          }
        }}
        title="Delete Savings Goal"
        message={
          deletingGoalInfo
            ? `Are you sure you want to delete the goal "${deletingGoalInfo.name}"? Progress and target records will be removed.`
            : ''
        }
        confirmLabel="Delete Goal"
        variant="danger"
      />
    </div>
  );
};
