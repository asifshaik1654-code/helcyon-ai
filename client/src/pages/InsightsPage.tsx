import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate, formatCurrency } from '../utils/formatters';
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Info,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as anomalyService from '../services/anomalyService';

interface InsightsPageProps {
  isDemoMode?: boolean;
  currency?: string;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({
  currency = 'INR',
}) => {
  const navigate = useNavigate();
  const [anomalies, setAnomalies] = useState<anomalyService.AnomalyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnomalies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await anomalyService.getAnomalies();
      setAnomalies(res.anomalies);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch spending observations';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnomalies();
  }, [fetchAnomalies]);

  const handleDismiss = async (id: string) => {
    try {
      await anomalyService.dismissAnomaly(id);
      setAnomalies((prev) => prev.filter((i) => i.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to dismiss anomaly');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Spending Anomaly &amp; Pattern Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent statistical checks and observations derived from your historical cash flow.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchAnomalies()}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            title="Refresh"
          >
            Refresh
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/assistant')}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
          >
            Ask Assistant for Advice
          </Button>
        </div>
      </div>

      {/* Safety Notice regarding Explainability (Module 8) */}
      <div className="p-4 rounded-xl bg-[#131B2E] border border-slate-800 flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="text-slate-300 leading-relaxed">
          <strong>Explainable Anomaly Principle:</strong> Helcyon AI never labels transactions as &quot;fraud&quot; or makes unsupported claims. Each observation indicates a statistical shift against your past category baseline for your informed review.
        </p>
      </div>

      {/* Insights List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5 space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-28" />
            </Card>
          ))}
        </div>
      ) : anomalies.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={CheckCircle}
            title="No Spending Anomalies Flagged"
            description="All recent transactions align within your historical statistical standard deviation. No unusual spikes or duplicate charges detected."
            actionLabel="View All Transactions"
            onAction={() => navigate('/transactions')}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {anomalies.map((item) => (
            <Card
              key={item.id}
              className={`p-5 transition-all ${
                item.severity === 'critical'
                  ? 'border-rose-500/40 bg-rose-950/10'
                  : item.severity === 'warning'
                  ? 'border-amber-500/40 bg-amber-950/10'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      item.severity === 'critical'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : item.severity === 'warning'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    }`}
                  >
                    {item.severity === 'critical' ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : item.severity === 'warning' ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <TrendingUp className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                      <Badge
                        variant={
                          item.severity === 'critical'
                            ? 'rose'
                            : item.severity === 'warning'
                            ? 'amber'
                            : 'cyan'
                        }
                        size="sm"
                      >
                        {item.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="slate" size="sm">
                        {item.category}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {item.explanation}
                    </p>

                    <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400">
                      <span>Recorded Date: {formatDate(item.date, 'medium')}</span>
                      {item.amount && (
                        <>
                          <span>•</span>
                          <span className="font-mono font-semibold text-slate-200">
                            Amount: {formatCurrency(item.amount, currency)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDismiss(item.id)}
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
