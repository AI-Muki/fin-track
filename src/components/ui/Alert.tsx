import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children?: React.ReactNode;
  className?: string;
  id?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  className,
  id,
}) => {
  const styles = {
    info: 'bg-sky-50 border-sky-200 text-sky-900 dark:bg-sky-950/30 dark:border-sky-800 dark:text-sky-200',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200',
    warning: 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200',
    danger: 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-200',
  };

  const icons = {
    info: <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
    danger: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />,
  };

  return (
    <div
      id={id}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border text-sm',
        styles[variant],
        className
      )}
    >
      {icons[variant]}
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-1">{title}</h5>}
        <div className="text-xs leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
};
