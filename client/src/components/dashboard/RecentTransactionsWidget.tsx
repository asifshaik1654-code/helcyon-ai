import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ArrowUpRight, ArrowDownLeft, Receipt, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentTransactionsWidgetProps {
  transactions: Transaction[];
  currency?: string;
}

export const RecentTransactionsWidget: React.FC<RecentTransactionsWidgetProps> = ({
  transactions,
  currency = 'INR',
}) => {
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <CardTitle>
          <Receipt className="w-4 h-4 text-emerald-400" />
          <span>Recent Activity</span>
        </CardTitle>
        <Link
          to="/transactions"
          className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-slate-800/60">
        {transactions.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No transactions recorded yet.
          </div>
        ) : (
          transactions.slice(0, 6).map((tx) => {
            const isIncome = tx.transactionType === 'income';
            return (
              <div
                key={tx.id}
                className="p-3.5 px-5 flex items-center justify-between hover:bg-slate-800/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      isIncome
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800/80 border-slate-700/60 text-slate-300'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-rose-400" />
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-200 truncate max-w-[170px] sm:max-w-xs">
                      {tx.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                      <span>{formatDate(tx.transactionDate, 'short')}</span>
                      <span>•</span>
                      <span className="text-slate-400">{tx.category}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-xs font-mono font-semibold tabular-nums ${
                      isIncome ? 'text-emerald-400' : 'text-slate-100'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(tx.amount, currency)}
                  </div>
                  <Badge variant="slate" size="sm" className="mt-0.5 text-[10px]">
                    {tx.paymentMethod}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
