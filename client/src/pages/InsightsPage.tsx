import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { mockInsights } from '../data/mockData';
import { FinancialInsight } from '../types';
import { formatDate } from '../utils/formatters';
import { Sparkles, AlertTriangle, TrendingUp, CheckCircle, Info, ShieldAlert, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InsightsPageProps {
  isDemoMode: boolean;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ isDemoMode }) => {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<FinancialInsight[]>(
    isDemoMode ? mockInsights : []
  );

  const handleDismiss = (id: string) => {
    setInsights((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Spending Anomaly & Pattern Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent statistical checks and observations derived from your historical cash flow.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/assistant')}
          leftIcon={<Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
        >
          Ask Assistant for Advice
        </Button>
      </div>

      {/* Safety Notice regarding Explainability */}
      <div className="p-4 rounded-xl bg-[#131B2E] border border-slate-800 flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="text-slate-300 leading-relaxed">
          <strong>Explainable Anomaly Principle:</strong> Helcyon AI never labels transactions as "fraud" or jumps to unsupported conclusions. Each observation indicates a statistical shift against your past 3-month average for your review.
        </p>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-400">
            No active anomalies or spending warnings flagged for this billing cycle.
          </Card>
        ) : (
          insights.map((item) => (
            <Card key={item.id} className="p-5 space-y-3 hover:border-slate-700 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {item.severity === 'warning' ? (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  ) : item.insightType === 'trend' ? (
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                    <span className="text-[11px] text-slate-500">
                      Observed on {formatDate(item.createdAt.split('T')[0], 'medium')}
                    </span>
                  </div>
                </div>

                <Badge
                  variant={
                    item.severity === 'warning'
                      ? 'amber'
                      : item.severity === 'critical'
                      ? 'rose'
                      : 'cyan'
                  }
                  size="sm"
                >
                  {item.insightType.toUpperCase()}
                </Badge>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pl-0 sm:pl-11">
                {item.description}
              </p>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800/80 text-xs">
                <button
                  onClick={() => handleDismiss(item.id)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  Dismiss Observation
                </button>
                <button
                  onClick={() => navigate('/transactions')}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <span>Review Related Transactions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
