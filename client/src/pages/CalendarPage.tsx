import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatCurrency, formatDate } from '../utils/formatters';
import { mockTransactions, mockRecurringPayments } from '../data/mockData';
import { Calendar as CalendarIcon, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number>(4);

  // Generate 30 days for November 2026
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  // Map transactions and bills by day number
  const getEventsForDay = (day: number) => {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `2026-11-${dayStr}`;

    const txs = mockTransactions.filter((t) => t.transactionDate === dateStr);
    const bills = mockRecurringPayments.filter((p) => p.nextPaymentDate.endsWith(`-${dayStr}`));

    return { txs, bills, dateStr };
  };

  const activeDayEvents = getEventsForDay(selectedDay);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Financial Calendar & Timeline</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize income deposits, expense occurrences, and recurring bill due dates across November 2026.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span className="text-slate-300">Expense</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-slate-300">Bill Due</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid: 2 Columns */}
        <Card className="lg:col-span-2 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white">November 2026</h3>
            <span className="text-xs text-slate-400">Select any day to inspect details</span>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold text-slate-400">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Date cells */}
          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map((day) => {
              const { txs, bills } = getEventsForDay(day);
              const isSelected = selectedDay === day;
              const hasIncome = txs.some((t) => t.transactionType === 'income');
              const hasExpense = txs.some((t) => t.transactionType === 'expense');
              const hasBill = bills.length > 0;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`h-16 p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-sm'
                      : 'bg-[#0A0E17] border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-semibold">{day}</span>
                  <div className="flex items-center gap-1">
                    {hasIncome && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    {hasExpense && <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
                    {hasBill && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Selected Day Agenda Detail */}
        <Card className="p-5 flex flex-col justify-between space-y-4">
          <div>
            <CardHeader className="p-0 pb-3 border-b border-slate-800">
              <CardTitle className="text-sm">
                <CalendarIcon className="w-4 h-4 text-emerald-400" />
                <span>Day Schedule: Nov {selectedDay}, 2026</span>
              </CardTitle>
            </CardHeader>

            <div className="mt-4 space-y-3">
              {activeDayEvents.txs.length === 0 && activeDayEvents.bills.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  No recorded transactions or bills due on this day.
                </p>
              ) : (
                <>
                  {activeDayEvents.txs.map((tx) => {
                    const isIncome = tx.transactionType === 'income';
                    return (
                      <div
                        key={tx.id}
                        className="p-3 rounded-xl bg-[#0A0E17] border border-slate-800 text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {isIncome ? (
                            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-rose-400" />
                          )}
                          <div>
                            <div className="font-semibold text-slate-100">{tx.title}</div>
                            <span className="text-[10px] text-slate-400">{tx.category}</span>
                          </div>
                        </div>
                        <div
                          className={`font-mono font-bold ${
                            isIncome ? 'text-emerald-400' : 'text-slate-100'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </div>
                      </div>
                    );
                  })}

                  {activeDayEvents.bills.map((bill) => (
                    <div
                      key={bill.id}
                      className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        <div>
                          <div className="font-semibold text-white">{bill.title}</div>
                          <span className="text-[10px] text-cyan-300">Scheduled Bill Due</span>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-cyan-300">
                        {formatCurrency(bill.amount)}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-500">
            Helcyon Financial Intelligence Calendar
          </div>
        </Card>
      </div>
    </div>
  );
};

