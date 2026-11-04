import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

interface IncomeExpenseChartProps {
  data: {
    month: string;
    income: number;
    expenses: number;
  }[];
  currency?: string;
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({
  data,
  currency = 'INR',
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#131B2E] border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-semibold text-slate-200 border-b border-slate-800 pb-1 mb-1.5">{label}</p>
          <div className="flex items-center justify-between gap-4 text-emerald-400">
            <span>Income:</span>
            <span className="font-mono font-semibold">{formatCurrency(payload[0]?.value, currency)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-rose-400">
            <span>Expenses:</span>
            <span className="font-mono font-semibold">{formatCurrency(payload[1]?.value, currency)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-cyan-400 pt-1 border-t border-slate-800 font-medium">
            <span>Net Saved:</span>
            <span className="font-mono">{formatCurrency((payload[0]?.value || 0) - (payload[1]?.value || 0), currency)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#1E293B' }}
          />
          <YAxis
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => (currency === 'INR' ? `₹${value / 1000}k` : `$${value / 1000}k`)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
          />
          <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Bar dataKey="expenses" name="Expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

