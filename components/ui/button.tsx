import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'gold' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variantStyles = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm font-medium',
      gold: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-semibold hover:from-amber-400 hover:to-yellow-300 shadow-md shadow-amber-500/20 active:scale-[0.98]',
      secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700/80 border border-slate-700/60',
      outline: 'border border-slate-700/80 bg-transparent text-slate-200 hover:bg-slate-800/60 hover:text-white',
      ghost: 'bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white',
      destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    };

    const sizeStyles = {
      sm: 'h-8 px-3 text-xs rounded-md',
      md: 'h-10 px-4 text-sm rounded-lg',
      lg: 'h-12 px-6 text-base rounded-xl',
      icon: 'h-10 w-10 p-0 rounded-lg flex items-center justify-center',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
