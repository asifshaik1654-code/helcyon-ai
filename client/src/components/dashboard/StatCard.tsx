import React from 'react';
import { Card } from '../ui/Card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface StatCardProps {
  title: string;
  amount: number;
  currency?: string;
  trendPercentage?: number;
  trendLabel?: string;
  isPositiveTrendGood?: boolean;
  icon: LucideIcon;
  variant?: 'emerald' | 'cyan' | 'rose' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  currency = 'INR',
  trendPercentage,
  trendLabel = 'vs last month',
  isPositiveTrendGood = true,
  icon: Icon,
  variant = 'emerald',
}) => {
  const isPositive = (trendPercentage || 0) >= 0;
  const isGood = isPositiveTrendGood ? isPositive : !isPositive;

  const variantStyles = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };

  return (
    <Card className="p-5 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">{title}</span>
        <div className={`p-2.5 rounded-xl border ${variantStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold font-mono text-white tracking-tight tabular-nums">
          {formatCurrency(amount, currency)}
        </div>

        {trendPercentage !== undefined && (
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span
              className={`flex items-center font-semibold font-mono ${
                isGood ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
              {isPositive ? '+' : ''}
              {trendPercentage}%
            </span>
            <span className="text-slate-400 text-[11px]">{trendLabel}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

