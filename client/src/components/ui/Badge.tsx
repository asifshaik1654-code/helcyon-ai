import React from 'react';
import { cn } from '../../utils/formatters';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'emerald' | 'cyan' | 'rose' | 'amber' | 'slate' | 'purple';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'slate',
  size = 'md',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-0.5 font-medium',
  };

  const variantStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    slate: 'bg-slate-800 text-slate-300 border border-slate-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full select-none',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

