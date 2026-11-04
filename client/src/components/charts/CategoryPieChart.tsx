import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

interface CategoryData {
  category: string;
  amount: number;
}

interface CategoryPieChartProps {
  data: CategoryData[];
  currency?: string;
}

const COLORS = [
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#F43F5E', // Rose
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#64748B', // Slate
];

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  data,
  currency = 'INR',
}) => {
  const total = data.reduce((acc, curr) => acc + curr.amount, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const pct = total > 0 ? Math.round((item.amount / total) * 100) : 0;
      return (
        <div className="bg-[#131B2E] border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-semibold text-slate-100">{item.category}</p>
          <div className="flex items-center gap-3 text-slate-300">
            <span>Amount:</span>
            <span className="font-mono font-medium text-emerald-400">
              {formatCurrency(item.amount, currency)}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            <span>Share: </span>
            <span className="font-mono font-semibold text-cyan-400">{pct}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={3}
            dataKey="amount"
            nameKey="category"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="#0A0E17"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

