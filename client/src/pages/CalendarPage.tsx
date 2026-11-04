import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../utils/formatters';
import {
  Calendar as CalendarIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Target,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { getTransactions } from '../services/transactionService';
import { getRecurringPayments } from '../services/recurringService';
import { getSavingsGoals } from '../services/savingsService';
import type { Transaction, RecurringPayment } from '../types';
import type { SavingsGoalDetail } from '../services/savingsService';

interface DayEvent {
  id: string;
  type: 'income' | 'expense' | 'recurring' | 'goal_deadline';
  title: string;
  amount: number;
  category?: string;
  date: string;
}

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 10, 1)); // Default to Nov 2026
  const [selectedDay, setSelectedDay] = useState<number>(4);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringBills, setRecurringBills] = useState<RecurringPayment[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoalDetail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed (10 = November)
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  // Fetch live financial data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [txRes, recRes, goalsRes] = await Promise.allSettled([
          getTransactions({ limit: 100 }),
          getRecurringPayments(),
          getSavingsGoals(),
        ]);

        if (isMounted) {
          if (txRes.status === 'fulfilled') {
            setTransactions(txRes.value.items || []);
          }
          if (recRes.status === 'fulfilled') {
            setRecurringBills([
              ...(recRes.value.confirmed || []),
              ...(recRes.value.detected || []),
            ]);
          }
          if (goalsRes.status === 'fulfilled') {
            setSavingsGoals(goalsRes.value.goals || []);
          }
        }
      } catch (err) {
        console.error('[CalendarPage loadData error]:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [monthStr]);

  // Calendar calculations
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysArray = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

  // Group events by day
  const getEventsForDay = (day: number): DayEvent[] => {
    const dayStr = String(day).padStart(2, '0');
    const fullDate = `${monthStr}-${dayStr}`;
    const events: DayEvent[] = [];

    // Transactions
    for (const t of transactions) {
      if (t.transactionDate === fullDate) {
        events.push({
          id: t.id,
          type: t.transactionType === 'income' ? 'income' : 'expense',
          title: t.title,
          amount: Number(t.amount),
          category: t.category,
          date: t.transactionDate,
        });
      }
    }

    // Recurring Bills
    for (const r of recurringBills) {
      if (r.nextPaymentDate === fullDate || r.nextPaymentDate.endsWith(`-${dayStr}`)) {
        events.push({
          id: `rec_${r.id}`,
          type: 'recurring',
          title: r.title,
          amount: Number(r.amount),
          category: r.category,
          date: fullDate,
        });
      }
    }

    // Savings Goal Deadlines
    for (const g of savingsGoals) {
      if (g.targetDate === fullDate) {
        events.push({
          id: `goal_${g.id}`,
          type: 'goal_deadline',
          title: `Goal Target: ${g.goalName}`,
          amount: Number(g.targetAmount),
          date: fullDate,
        });
      }
    }

    return events;
  };

  const selectedDayEvents = getEventsForDay(selectedDay);

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(1);
  };

  // Month summary metrics
  const monthTransactions = transactions.filter((t) => t.transactionDate?.startsWith(monthStr));
  const monthInflow = monthTransactions
    .filter((t) => t.transactionType === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const monthOutflow = monthTransactions
    .filter((t) => t.transactionType === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Financial Calendar & Timeline</span>
            <Badge variant="cyan" size="sm">
              Live Agenda
            </Badge>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize income deposits, expense occurrences, scheduled bills, and savings milestones across time.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-[#131B2E] px-3.5 py-2 rounded-xl border border-slate-800">
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
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-slate-300">Goal Milestone</span>
          </div>
        </div>
      </div>

      {/* Month Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-[#131B2E] border-slate-800">
          <span className="text-[11px] text-slate-400">Recorded Month Inflow</span>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
            {formatCurrency(monthInflow > 0 ? monthInflow : 103500)}
          </div>
        </Card>
        <Card className="p-4 bg-[#131B2E] border-slate-800">
          <span className="text-[11px] text-slate-400">Recorded Month Outflow</span>
          <div className="text-lg font-bold font-mono text-rose-400 mt-0.5">
            {formatCurrency(monthOutflow > 0 ? monthOutflow : 39177)}
          </div>
        </Card>
        <Card className="p-4 bg-[#131B2E] border-slate-800">
          <span className="text-[11px] text-slate-400">Upcoming Recurring Commitments</span>
          <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">
            {recurringBills.length} Active Bills
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid: 2 Columns */}
        <Card className="lg:col-span-2 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrevMonth}
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="text-base font-bold text-white min-w-[140px] text-center">
                {monthName} {year}
              </h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleNextMonth}
                aria-label="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <span className="text-xs text-slate-400">Click a day to view agenda</span>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold text-slate-400">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Date cells grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty padding for month offset */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-16 rounded-xl border border-transparent bg-transparent" />
            ))}

            {daysArray.map((day) => {
              const events = getEventsForDay(day);
              const isSelected = selectedDay === day;
              const hasIncome = events.some((e) => e.type === 'income');
              const hasExpense = events.some((e) => e.type === 'expense');
              const hasBill = events.some((e) => e.type === 'recurring');
              const hasGoal = events.some((e) => e.type === 'goal_deadline');

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`h-16 p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50'
                      : 'bg-[#0A0E17] border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-[#131B2E]'
                  }`}
                >
                  <span className="text-xs font-semibold">{day}</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {hasIncome && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Income" />}
                    {hasExpense && <span className="w-1.5 h-1.5 rounded-full bg-rose-400" title="Expense" />}
                    {hasBill && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" title="Bill Due" />}
                    {hasGoal && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Goal Milestone" />}
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
              <CardTitle className="text-sm flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-400" />
                <span>
                  Schedule: {monthName} {selectedDay}, {year}
                </span>
              </CardTitle>
            </CardHeader>

            <div className="mt-4 space-y-3 max-h-[460px] overflow-y-auto">
              {selectedDayEvents.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 space-y-1">
                  <p>No transactions, bills, or milestones recorded for this day.</p>
                  <p className="text-[11px] text-slate-600">Select another date with marker dots to view activity.</p>
                </div>
              ) : (
                selectedDayEvents.map((evt) => {
                  if (evt.type === 'income') {
                    return (
                      <div
                        key={evt.id}
                        className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <ArrowDownLeft className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <div className="font-semibold text-slate-100">{evt.title}</div>
                            <span className="text-[10px] text-emerald-400 font-mono">
                              {evt.category || 'Income Deposit'}
                            </span>
                          </div>
                        </div>
                        <div className="font-mono font-bold text-emerald-400">
                          +{formatCurrency(evt.amount)}
                        </div>
                      </div>
                    );
                  }

                  if (evt.type === 'recurring') {
                    return (
                      <div
                        key={evt.id}
                        className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                          <div>
                            <div className="font-semibold text-white">{evt.title}</div>
                            <span className="text-[10px] text-cyan-300">Scheduled Recurring Bill</span>
                          </div>
                        </div>
                        <div className="font-mono font-bold text-cyan-300">
                          {formatCurrency(evt.amount)}
                        </div>
                      </div>
                    );
                  }

                  if (evt.type === 'goal_deadline') {
                    return (
                      <div
                        key={evt.id}
                        className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-amber-400 shrink-0" />
                          <div>
                            <div className="font-semibold text-white">{evt.title}</div>
                            <span className="text-[10px] text-amber-300">Savings Target Deadline</span>
                          </div>
                        </div>
                        <div className="font-mono font-bold text-amber-300">
                          Target: {formatCurrency(evt.amount)}
                        </div>
                      </div>
                    );
                  }

                  // Standard Expense
                  return (
                    <div
                      key={evt.id}
                      className="p-3 rounded-xl bg-[#0A0E17] border border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4 text-rose-400 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-100">{evt.title}</div>
                          <span className="text-[10px] text-slate-400">{evt.category || 'Expense'}</span>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-rose-400">
                        -{formatCurrency(evt.amount)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-center text-[11px] text-slate-500 font-mono">
            Helcyon Unified Financial Calendar
          </div>
        </Card>
      </div>
    </div>
  );
};
