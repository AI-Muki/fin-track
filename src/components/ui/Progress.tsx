import { cn } from '@/src/lib/utils';

export interface ProgressProps {
  value: number; // 0 to 100
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
}

export const Progress = ({
  value,
  className,
  variant = 'default',
  showLabel = false,
}: ProgressProps) => {
  const clamped = Math.min(100, Math.max(0, value));

  const variants = {
    default: 'bg-indigo-600 dark:bg-indigo-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
        <div
          className={cn('h-full transition-all duration-500 rounded-full', variants[variant])}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mt-1">
          <span>{clamped.toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
};
