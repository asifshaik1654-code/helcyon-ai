import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../utils/formatters';
import { SlidersHorizontal, ArrowRight, Info, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';

export const SimulatorPage: React.FC = () => {
  // Baseline reality
  const baselineIncome = 103500;
  const baselineExpenses = 39177;
  const baselineSurplus = baselineIncome - baselineExpenses; // 64323

  // Simulation Sliders
  const [rentDelta, setRentDelta] = useState(0);
  const [diningCut, setDiningCut] = useState(0);
  const [extraSavings, setExtraSavings] = useState(0);
  const [newSubscription, setNewSubscription] = useState(0);

  // Simulated Calculations
  const simulatedExpenses = baselineExpenses + rentDelta - diningCut + newSubscription;
  const simulatedSurplus = baselineIncome - simulatedExpenses - extraSavings;
  const deltaSurplus = simulatedSurplus - baselineSurplus;
  const annualSavingsDelta = (extraSavings + (baselineExpenses - simulatedExpenses)) * 12;

  const handleReset = () => {
    setRentDelta(0);
    setDiningCut(0);
    setExtraSavings(0);
    setNewSubscription(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>What-If Financial Simulator</span>
            <Badge variant="cyan" size="sm">
              Sandbox Mode
            </Badge>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Test hypothetical life changes and view their impact on cash flow without altering real records.
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

      {/* Safety Notice */}
      <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center gap-3 text-xs text-cyan-300">
        <Info className="w-4 h-4 shrink-0 text-cyan-400" />
        <span>
          <strong>Hypothetical Sandbox:</strong> Modifying sliders below recalculates simulated numbers in real-time. Your actual database transactions remain 100% untouched.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Input Panel: 2 Columns */}
        <Card className="lg:col-span-2 p-6 space-y-6">
          <CardTitle>Adjust Hypothetical Variables</CardTitle>

          {/* Slider 1: Rent / Housing Change */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-200">Rent / Housing Change:</span>
              <span className="font-mono font-bold text-white">
                {rentDelta > 0 ? `+${formatCurrency(rentDelta)}` : rentDelta < 0 ? `-${formatCurrency(Math.abs(rentDelta))}` : '₹0'}
              </span>
            </div>
            <input
              type="range"
              min="-10000"
              max="20000"
              step="1000"
              value={rentDelta}
              onChange={(e) => setRentDelta(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-₹10,000 (Cheaper Flat)</span>
              <span>Baseline Rent</span>
              <span>+₹20,000 (Luxury Upgrade)</span>
            </div>
          </div>

          {/* Slider 2: Reduce Dining & Entertainment */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-200">Cut Dining & Entertainment:</span>
              <span className="font-mono font-bold text-emerald-400">
                {diningCut > 0 ? `-${formatCurrency(diningCut)} saved` : '₹0'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="6000"
              step="500"
              value={diningCut}
              onChange={(e) => setDiningCut(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>₹0 (Current Spending)</span>
              <span>Cook at home 50%</span>
              <span>-₹6,000 (Frugal Month)</span>
            </div>
          </div>

          {/* Slider 3: Additional Monthly Savings Allocation */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-200">Deposit Extra to Goals:</span>
              <span className="font-mono font-bold text-cyan-400">
                +{formatCurrency(extraSavings)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30000"
              step="2500"
              value={extraSavings}
              onChange={(e) => setExtraSavings(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>₹0</span>
              <span>+₹15,000</span>
              <span>+₹30,000 / month</span>
            </div>
          </div>

          {/* Slider 4: Add New Recurring Bill */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-200">New Monthly Bill (Gym, Car, EMI):</span>
              <span className="font-mono font-bold text-rose-400">
                +{formatCurrency(newSubscription)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="15000"
              step="500"
              value={newSubscription}
              onChange={(e) => setNewSubscription(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>₹0</span>
              <span>+₹7,500</span>
              <span>+₹15,000 / month</span>
            </div>
          </div>
        </Card>

        {/* Real-Time Outcome Card */}
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
                <span className="text-slate-400">Simulated Expenses:</span>
                <span className="font-mono font-medium text-slate-300">
                  {formatCurrency(simulatedExpenses)}
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
                <span className="text-slate-400">Net Difference:</span>
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

            {/* Annual Projection */}
            <div className="p-4 rounded-xl bg-gradient-to-tr from-emerald-500/10 via-slate-900 to-transparent border border-emerald-500/20 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                12-Month Projected Savings Growth
              </span>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {annualSavingsDelta >= 0 ? '+' : ''}
                {formatCurrency(annualSavingsDelta)}
              </div>
              <p className="text-[11px] text-slate-400">
                Impact on your wealth buffer across 1 full calendar year under this simulation.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
