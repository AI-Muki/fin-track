import React from 'react';
import { cn } from '@/src/lib/utils';

export interface BadgeProps {
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  children?: React.ReactNode;
  id?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  id,
  style,
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    info: 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    outline: 'border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300',
  };

  return (
    <span
      id={id}
      style={style}
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
