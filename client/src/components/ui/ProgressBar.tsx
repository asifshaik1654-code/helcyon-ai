import React from 'react';
import { cn } from '../../utils/formatters';

export interface ProgressBarProps {
  value: number; // 0 to 100+
  max?: number;
  className?: string;
  variant?: 'dynamic' | 'emerald' | 'cyan' | 'amber' | 'rose';
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className,
  variant = 'dynamic',
  size = 'md',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Dynamic status color based on utilization
  const getDynamicColor = (pct: number) => {
    if (pct < 70) return 'bg-emerald-500';
    if (pct < 90) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const variantStyles = {
    dynamic: getDynamicColor(percentage),
    emerald: 'bg-emerald-500',
    cyan: 'bg-cyan-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div className={cn('w-full bg-slate-800/80 rounded-full overflow-hidden', sizeStyles[size], className)}>
      <div
        className={cn('h-full transition-all duration-500 ease-out rounded-full', variantStyles[variant])}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
