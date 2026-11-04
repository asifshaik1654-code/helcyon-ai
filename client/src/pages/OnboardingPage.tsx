import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Check, Sparkles, ArrowRight, IndianRupee, DollarSign, Euro } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const GOAL_OPTIONS = [
  'Build Emergency Safety Fund',
  'Buy Laptop / Gadgets',
  'Track Monthly Leakage',
  'Save for Higher Education',
  'Travel & Vacation',
  'Pay Off Student Loan',
  'Invest in Mutual Funds',
];

const CATEGORY_OPTIONS = [
  'Housing & Rent',
  'Food & Dining',
  'Groceries',
  'Commute & Transport',
  'Utilities & Bills',
  'Education & Books',
  'Tech & Subscriptions',
  'Shopping',
];

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [currency, setCurrency] = useState('INR');
  const [monthlyIncome, setMonthlyIncome] = useState('85000');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    'Build Emergency Safety Fund',
    'Buy Laptop / Gadgets',
  ]);
  const [monthlyBudget, setMonthlyBudget] = useState('45000');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Housing & Rent',
    'Food & Dining',
    'Groceries',
    'Commute & Transport',
  ]);

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0A0E17] flex items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-6">
        {/* Progress Bar */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
              {step}
            </div>
            <span className="text-xs font-semibold text-slate-300">
              {step === 1 ? 'Currency & Baseline Inflow' : step === 2 ? 'Goals & Ambitions' : 'Budget Preferences'}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">Step {step} of 3</span>
        </div>

        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Wizard Card */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* STEP 1: Currency & Income */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-bold text-white">Select Preferred Currency & Monthly Inflow</h3>
                <p className="text-xs text-slate-400 mt-1">
                  We use your default currency to format charts, tables, and AI explanations.
                </p>
              </div>

              {/* Currency Selector Pills */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { code: 'INR', symbol: '₹', label: 'Indian Rupee (Default)' },
                  { code: 'USD', symbol: '$', label: 'US Dollar' },
                  { code: 'EUR', symbol: '€', label: 'Euro' },
                ].map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCurrency(c.code)}
                    className={`p-3.5 rounded-xl border text-center transition-all ${
                      currency === c.code
                        ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                        : 'bg-[#0A0E17] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xl font-bold font-mono">{c.symbol}</div>
                    <div className="text-xs font-semibold mt-1">{c.code}</div>
                    <div className="text-[10px] text-slate-500">{c.label}</div>
                  </button>
                ))}
              </div>

              {/* Monthly Inflow */}
              <Input
                label="Estimated Monthly Inflow / Allowance (Optional)"
                type="number"
                placeholder="e.g. 85000"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                helperText="Helcyon uses this to compute your savings capacity and cash flow ratios."
              />
            </div>
          )}

          {/* STEP 2: Goals */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-bold text-white">What are your top financial goals?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Select what matters most. We will create goal trackers and recommend monthly targets.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {GOAL_OPTIONS.map((goal) => {
                  const isSelected = selectedGoals.includes(goal);
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300'
                          : 'bg-[#0A0E17] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>{goal}</span>
                      {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Categories & Budget Limit */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-bold text-white">Budget & Primary Spending Categories</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Set an overarching monthly spending limit and pick the categories you wish to track.
                </p>
              </div>

              <Input
                label="Total Monthly Spending Budget (Optional)"
                type="number"
                placeholder="e.g. 45000"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                helperText="We will alert you when you approach 80% and 100% of this threshold."
              />

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Categories to monitor:
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const isSelected = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                            : 'bg-[#0A0E17] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Wizard Footer Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {step > 1 ? (
              <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleFinish}>
                Skip for now
              </Button>
            )}

            {step < 3 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setStep(step + 1)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next Step
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleFinish}
                rightIcon={<Sparkles className="w-4 h-4" />}
              >
                Complete & Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
