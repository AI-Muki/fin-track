import React from 'react';
import { cn } from '@/src/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable, children, id, ...props }, ref) => {
    return (
      <div
        ref={ref}
        id={id}
        className={cn(
          'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-all',
          hoverable && 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('font-semibold text-lg text-slate-900 dark:text-slate-100', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-slate-500 dark:text-slate-400', className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('pt-0', className)} {...props}>
    {children}
  </div>
);
