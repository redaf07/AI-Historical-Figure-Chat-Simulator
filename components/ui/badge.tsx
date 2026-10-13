import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gold' | 'outline' | 'secondary';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-800 text-slate-200 border-slate-700/80',
    gold: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    secondary: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    outline: 'border-slate-700 text-slate-300',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
