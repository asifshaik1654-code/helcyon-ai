import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCurrency } from '../utils/formatters';
import { FileSpreadsheet, Download, Printer, Sparkles, CheckCircle2 } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('2026-11');

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent =
      'Month,TotalIncome,TotalExpenses,NetSurplus,SavingsRate\n' +
      'November 2026,103500,39177,64323,62.1%\n' +
      'October 2026,94000,41200,52800,56.2%\n' +
      'September 2026,80000,38700,41300,51.6%\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `helcyon_financial_report_${selectedMonth}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Intelligent Monthly Financial Reports</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Comprehensive audit report covering cash flow, budget adherence, and AI explanations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Print / PDF
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Month Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['2026-11', '2026-10', '2026-09'].map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMonth(m)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedMonth === m
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'bg-[#131B2E] text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {m === '2026-11' ? 'November 2026 (Current)' : m === '2026-10' ? 'October 2026' : 'September 2026'}
          </button>
        ))}
      </div>

      {/* Printable Report Document Card */}
      <Card className="p-6 sm:p-8 space-y-6 bg-[#131B2E] border-slate-700/80">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">HELCYON FINANCIAL STATEMENT</span>
              <Badge variant="emerald" size="sm">
                VERIFIED
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Account Holder: Shaik Asif • Period: November 01 - November 30, 2026
            </p>
          </div>
          <div className="text-right text-xs text-slate-400">
            <div>Document Ref: #HL-2026-11</div>
            <div>Generated: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#0A0E17] border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Revenue Inflow</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
              {formatCurrency(103500)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0A0E17] border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Expenses Cleared</span>
            <div className="text-xl font-bold font-mono text-rose-400 mt-1 tabular-nums">
              {formatCurrency(39177)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0A0E17] border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Net Cash Surplus</span>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-1 tabular-nums">
              {formatCurrency(64323)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0A0E17] border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Operating Savings Rate</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
              62.1%
            </div>
          </div>
        </div>

        {/* Plain-English AI Explanation Section */}
        <div className="p-5 rounded-2xl bg-[#0A0E17] border border-emerald-500/30 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              AI-Generated Plain-English Review
            </h4>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            During November 2026, you achieved outstanding budget discipline. Your primary outflow was Housing (₹22,000), which remained consistent with previous months. Discretionary spending on Food & Dining stood at ₹2,450, leaving 69.4% of your allotted dining budget intact. You deposited ₹30,000 across your savings goals, driving your Emergency Fund to 72.5% of completion.
          </p>
        </div>

        {/* Category Breakdown Table */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white">Category-wise Expenditure Summary</h4>
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0E17] text-[11px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3">Transactions</th>
                  <th className="p-3">Budget Limit</th>
                  <th className="p-3">Actual Spent</th>
                  <th className="p-3 text-right">Adherence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="p-3 font-medium text-slate-200">Housing</td>
                  <td className="p-3 text-slate-400">1</td>
                  <td className="p-3 font-mono">₹24,000</td>
                  <td className="p-3 font-mono font-semibold text-rose-400">₹22,000</td>
                  <td className="p-3 text-right text-emerald-400 font-semibold">91.6% (Safe)</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-200">Food & Dining</td>
                  <td className="p-3 text-slate-400">1</td>
                  <td className="p-3 font-mono">₹8,000</td>
                  <td className="p-3 font-mono font-semibold text-rose-400">₹2,450</td>
                  <td className="p-3 text-right text-emerald-400 font-semibold">30.6% (Under)</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-200">Groceries</td>
                  <td className="p-3 text-slate-400">1</td>
                  <td className="p-3 font-mono">₹10,000</td>
                  <td className="p-3 font-mono font-semibold text-rose-400">₹4,250</td>
                  <td className="p-3 text-right text-emerald-400 font-semibold">42.5% (Under)</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-200">Utilities</td>
                  <td className="p-3 text-slate-400">2</td>
                  <td className="p-3 font-mono">₹5,000</td>
                  <td className="p-3 font-mono font-semibold text-rose-400">₹4,049</td>
                  <td className="p-3 text-right text-emerald-400 font-semibold">81.0% (Warning)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};
