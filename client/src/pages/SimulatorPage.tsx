import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../utils/formatters';
import {
  SlidersHorizontal,
  Info,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Target,
  Sparkles,
} from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const SimulatorPage: React.FC = () => {
  const { data: dashboard, isLoading } = useDashboard();

  // Baseline figures from live dashboard (or fallback defaults if still loading)
  const baselineIncome = dashboard?.totalIncome ?? 103500;
  const baselineExpenses = dashboard?.totalExpenses ?? 39177;
  const baselineSurplus = baselineIncome - baselineExpenses; // 64323
  const baselineSavingsRate = baselineIncome > 0 ? (baselineSurplus / baselineIncome) * 100 : 0;

  // Simulation Sliders State
  const [incomePctChange, setIncomePctChange] = useState<number>(0);
  const [rentDelta, setRentDelta] = useState<number>(0);
  const [discretionaryDelta, setDiscretionaryDelta] = useState<number>(0);
  const [newRecurringExpense, setNewRecurringExpense] = useState<number>(0);
  const [extraSavings, setExtraSavings] = useState<number>(0);

  // Simulated Calculations
  const simulatedIncome = Math.round(baselineIncome * (1 + incomePctChange / 100));
  const simulatedExpenses = Math.max(
    0,
    baselineExpenses + rentDelta + discretionaryDelta + newRecurringExpense
  );
  const simulatedSurplus = simulatedIncome - simulatedExpenses - extraSavings;
  const deltaSurplus = simulatedSurplus - baselineSurplus;
  const simulatedSavingsRate =
    simulatedIncome > 0 ? ((simulatedSurplus + extraSavings) / simulatedIncome) * 100 : 0;
  const annualSavingsDelta = (extraSavings + (baselineExpenses - simulatedExpenses) + (simulatedIncome - baselineIncome)) * 12;

  const handleReset = () => {
    setIncomePctChange(0);
    setRentDelta(0);
    setDiscretionaryDelta(0);
    setNewRecurringExpense(0);
    setExtraSavings(0);
  };

  // Chart comparison data
  const comparisonData = [
    {
      metric: 'Monthly Inflow',
      Baseline: baselineIncome,
      Simulated: simulatedIncome,
    },
    {
      metric: 'Monthly Outflow',
      Baseline: baselineExpenses,
      Simulated: simulatedExpenses,
    },
    {
      metric: 'Net Surplus',
      Baseline: baselineSurplus,
      Simulated: Math.max(0, simulatedSurplus),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>What-If Financial Simulator</span>
            <Badge variant="cyan" size="sm">
              Sandbox Engine
            </Badge>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Test hypothetical life changes, career transitions, and spending adjustments in real time without altering your records.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleReset}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Reset Simulation
        </Button>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center gap-3 text-xs text-cyan-300">
        <Info className="w-4 h-4 shrink-0 text-cyan-400" />
        <span>
          <strong>Hypothetical Sandbox:</strong> Baseline values reflect your live November records ({formatCurrency(baselineIncome)} income, {formatCurrency(baselineExpenses)} expenses). All slider updates are calculated locally and do not alter actual database transactions.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Input Panel: 2 Columns */}
        <Card className="lg:col-span-2 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span>Hypothetical Financial Levers</span>
            </CardTitle>
            <span className="text-[11px] text-slate-400 font-mono">
              Live Baseline: {formatCurrency(baselineSurplus)}/mo surplus
            </span>
          </div>

          {/* Slider 1: Income Growth / Cut */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-200">
                Salary / Income Adjustment:
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {incomePctChange > 0 ? `+${incomePctChange}%` : incomePctChange < 0 ? `${incomePctChange}%` : '0%'} ({formatCurrency(simulatedIncome)})
              </span>
            </div>
            <input
              type="range"
              min="-40"
              max="100"
              step="5"
              value={incomePctChange}
              onChange={(e) => setIncomePctChange(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-40% (Job transition)</span>
              <span>Baseline ({formatCurrency(baselineIncome)})</span>
              <span>+100% (Promotion / Double Inflow)</span>
            </div>
          </div>

          {/* Slider 2: Rent / Housing Change */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-200">
                Housing & Rent Variance:
              </span>
              <span className="font-mono font-bold text-white">
                {rentDelta > 0
                  ? `+${formatCurrency(rentDelta)}/mo`
                  : rentDelta < 0
                  ? `-${formatCurrency(Math.abs(rentDelta))}/mo`
                  : '₹0'}
              </span>
            </div>
            <input
              type="range"
              min="-15000"
              max="30000"
              step="1000"
              value={rentDelta}
              onChange={(e) => setRentDelta(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-₹15,000 (Downsize)</span>
              <span>Current Rent</span>
              <span>+₹30,000 (Luxury Flat)</span>
            </div>
          </div>

          {/* Slider 3: Discretionary Spending (Dining, Entertainment, Shopping) */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-200">
                Discretionary Spending Delta (Dining & Leisure):
              </span>
              <span className="font-mono font-bold text-slate-200">
                {discretionaryDelta > 0
                  ? `+${formatCurrency(discretionaryDelta)}`
                  : discretionaryDelta < 0
                  ? `-${formatCurrency(Math.abs(discretionaryDelta))} (Frugal)`
                  : '₹0'}
              </span>
            </div>
            <input
              type="range"
              min="-10000"
              max="15000"
              step="500"
              value={discretionaryDelta}
              onChange={(e) => setDiscretionaryDelta(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-₹10,000 (Cook at Home)</span>
              <span>Current Spending</span>
              <span>+₹15,000 (High Leisure)</span>
            </div>
          </div>

          {/* Slider 4: New Recurring Monthly Bill / EMI */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-200">
                New Recurring Subscription / Car EMI / Gym:
              </span>
              <span className="font-mono font-bold text-rose-400">
                +{formatCurrency(newRecurringExpense)}/mo
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25000"
              step="500"
              value={newRecurringExpense}
              onChange={(e) => setNewRecurringExpense(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>₹0</span>
              <span>+₹12,500</span>
              <span>+₹25,000 / month</span>
            </div>
          </div>

          {/* Slider 5: Additional Monthly Savings Allocation */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-200">
                Extra Dedicated Savings Allocation:
              </span>
              <span className="font-mono font-bold text-cyan-400">
                +{formatCurrency(extraSavings)}/mo
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="40000"
              step="1000"
              value={extraSavings}
              onChange={(e) => setExtraSavings(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>₹0</span>
              <span>+₹20,000</span>
              <span>+₹40,000 / month</span>
            </div>
          </div>

          {/* Recharts Visual Comparison */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-semibold text-slate-200">
              Side-by-Side Inflow vs Outflow Projection
            </h4>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="metric" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0A0E17', borderColor: '#334155', borderRadius: '8px' }}
                    formatter={(val: any) => [formatCurrency(Number(val)), '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Baseline" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Simulated" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Real-Time Outcome Column */}
        <div className="space-y-4">
          <Card className="p-6 bg-[#131B2E] border-slate-700/80 space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Projected Impact
              </span>
              <h3 className="text-base font-bold text-white mt-1">Simulated Net Cash Flow</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Baseline Monthly Surplus:</span>
                <span className="font-mono font-medium text-slate-300">
                  {formatCurrency(baselineSurplus)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Simulated Outflow:</span>
                <span className="font-mono font-medium text-slate-300">
                  {formatCurrency(simulatedExpenses)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Simulated Savings Rate:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {simulatedSavingsRate.toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-800 text-sm">
                <span className="font-bold text-white">Simulated Disposable Cash:</span>
                <span
                  className={`font-mono font-bold ${
                    simulatedSurplus >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatCurrency(simulatedSurplus)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0A0E17] border border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-400">Monthly Surplus Delta:</span>
                <span
                  className={`font-mono font-bold flex items-center gap-1 ${
                    deltaSurplus >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {deltaSurplus >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {deltaSurplus >= 0 ? '+' : ''}
                  {formatCurrency(deltaSurplus)}/mo
                </span>
              </div>
            </div>

            {/* 12-Month Projection */}
            <div className="p-4 rounded-xl bg-gradient-to-tr from-emerald-500/10 via-slate-900 to-transparent border border-emerald-500/20 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                12-Month Cumulative Wealth Impact
              </span>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {annualSavingsDelta >= 0 ? '+' : ''}
                {formatCurrency(annualSavingsDelta)}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Compound net effect on your bank balance over 1 full calendar year under these scenario parameters.
              </p>
            </div>

            {/* Goal Milestone Impact */}
            {extraSavings > 0 && (
              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                  <Target className="w-3.5 h-3.5" />
                  <span>Goal Acceleration</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Investing an extra <strong>{formatCurrency(extraSavings)}/mo</strong> accelerates your MacBook Pro & Emergency Reserve target dates by approximately <strong>{Math.max(1, Math.round(extraSavings / 4000))} months</strong> earlier.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
