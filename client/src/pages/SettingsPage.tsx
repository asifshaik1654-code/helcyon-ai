import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { mockProfile } from '../data/mockData';
import { Settings, User, ShieldCheck, Database, RefreshCw, CheckCircle2 } from 'lucide-react';

interface SettingsPageProps {
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  currency: string;
  onChangeCurrency: (curr: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  isDemoMode,
  onToggleDemoMode,
  currency,
  onChangeCurrency,
}) => {
  const [fullName, setFullName] = useState(mockProfile.fullName);
  const [email, setEmail] = useState(mockProfile.email);
  const [monthlyIncome, setMonthlyIncome] = useState(String(mockProfile.monthlyIncome || 85000));
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all synthetic demo records back to baseline state?')) {
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          <span>Account & Preferences</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure profile details, currency standards, and development presentation settings.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      {/* Profile Form Card */}
      <Card className="p-6">
        <CardTitle className="text-sm border-b border-slate-800 pb-3 mb-5">
          Personal Information
        </CardTitle>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
              helperText="Managed securely via Supabase Auth"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Preferred Currency"
              value={currency}
              onChange={(e) => onChangeCurrency(e.target.value)}
              options={[
                { label: 'Indian Rupee (INR ₹) — Default', value: 'INR' },
                { label: 'US Dollar (USD $)', value: 'USD' },
                { label: 'Euro (EUR €)', value: 'EUR' },
              ]}
            />

            <Input
              label="Baseline Monthly Inflow (₹)"
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              helperText="Used to compute savings rate and surplus"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="sm">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Demo Mode & Presentation Controls Card */}
      <Card className="p-6 space-y-4 border-cyan-500/30">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <CardTitle className="text-sm">Presentation & Demo Mode</CardTitle>
          </div>
          <Badge variant={isDemoMode ? 'emerald' : 'slate'} size="sm">
            {isDemoMode ? 'Demo Active' : 'Empty Database'}
          </Badge>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Demo mode loads synthetic but realistic financial data (income, housing, groceries, utilities, and savings goals) so evaluators and teachers can explore Helcyon AI without having to input real bank details.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleDemoMode}
          >
            {isDemoMode ? 'Switch to Empty Account' : 'Load Demo Data'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleResetDemo}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Reset Demo Dataset
          </Button>
        </div>
      </Card>

      {/* College Project Architecture Acknowledgement */}
      <Card className="p-6 bg-gradient-to-r from-[#0A0E17] via-[#131B2E] to-[#0A0E17] border-slate-800 space-y-2">
        <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
          First-Year BTech Capstone Build
        </span>
        <h4 className="text-sm font-semibold text-white">Helcyon AI — Financial Intelligence</h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          Built with React 18, Vite, Tailwind CSS, Node.js REST API, PostgreSQL with Row-Level Security, and Google Gemini AI integration. Designed for zero financial hallucinations with deterministic mathematical verification.
        </p>
      </Card>
    </div>
  );
};
