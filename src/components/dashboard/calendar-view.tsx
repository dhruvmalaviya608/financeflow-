
'use client';

import { useState, useMemo, useEffect } from 'react';
import { format, isSameMonth, startOfWeek, endOfWeek, isWithinInterval, isSameDay } from 'date-fns';
import type { Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatCurrency, cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import TransactionDetailsDialog from './transaction-details-dialog';
import { Scale, TrendingDown, TrendingUp } from 'lucide-react';

type TransactionsByDay = {
  [key: string]: {
    transactions: Transaction[];
    income: number;
    expense: number;
  };
};

type CalendarViewProps = {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  month: Date;
  onMonthChange: (date: Date) => void;
  onAddTransaction: (date: Date) => void;
};

export default function CalendarView({ transactions, onEdit, onDelete, month, onMonthChange, onAddTransaction }: CalendarViewProps) {
  const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([]);
  const [selectedDateForDialog, setSelectedDateForDialog] = useState<Date | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [view, setView] = useState<'monthly' | 'weekly' | 'daily' | 'total'>('monthly');
  const [selectedDay, setSelectedDay] = useState<Date>(month);

  useEffect(() => {
    setSelectedDay(month);
  }, [month]);

  const { transactionsByDay, stats } = useMemo(() => {
    const filteredTransactions = transactions.filter((t) => isSameMonth(t.date, month));
    
    const byDay: TransactionsByDay = {};

    for (const t of filteredTransactions) {
      if (t.currency !== 'USD') continue; // Aggregating only USD for simplicity
      const dayKey = format(t.date, 'yyyy-MM-dd');
      if (!byDay[dayKey]) {
        byDay[dayKey] = { transactions: [], income: 0, expense: 0 };
      }
      byDay[dayKey].transactions.push(t);
      if (t.type === 'income') {
        byDay[dayKey].income += t.amount;
      } else if (t.type === 'expense') {
        byDay[dayKey].expense += t.amount;
      }
    }
    
    for (const t of filteredTransactions) {
        if (t.currency === 'USD') continue;
        const dayKey = format(t.date, 'yyyy-MM-dd');
        if (!byDay[dayKey]) {
            byDay[dayKey] = { transactions: [], income: 0, expense: 0 };
        }
        if (!byDay[dayKey].transactions.find(tx => tx.id === t.id)) {
            byDay[dayKey].transactions.push(t);
        }
    }

    let statsTxs: Transaction[];
    if (view === 'daily') {
      statsTxs = transactions.filter(t => isSameDay(t.date, selectedDay));
    } else if (view === 'weekly') {
      const weekStart = startOfWeek(selectedDay);
      const weekEnd = endOfWeek(selectedDay);
      statsTxs = transactions.filter(t => isWithinInterval(t.date, { start: weekStart, end: weekEnd }));
    } else { // monthly or total
      statsTxs = transactions.filter((t) => isSameMonth(t.date, month));
    }

    const usdTransactions = statsTxs.filter(t => t.currency === 'USD');
    const totalIncome = usdTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = usdTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    return { 
      transactionsByDay: byDay,
      stats: {
        income: totalIncome,
        expense: totalExpense,
        balance: totalIncome - totalExpense
      }
    };
  }, [transactions, month, view, selectedDay]);

  const handleDayClick = (day: Date) => {
    if (!isSameMonth(day, month) && view === 'monthly') {
      return;
    }
    setSelectedDay(day);
    const dayKey = format(day, 'yyyy-MM-dd');
    const dayData = transactionsByDay[dayKey];
    if (dayData && dayData.transactions.length > 0) {
      setSelectedTransactions(dayData.transactions);
      setSelectedDateForDialog(day);
      setDialogOpen(true);
    } else {
      onAddTransaction(day);
    }
  };

  function DayContent({ date }: { date: Date }) {
    const dayKey = format(date, 'yyyy-MM-dd');
    const dayData = transactionsByDay[dayKey];
    const dayNumber = format(date, 'd');
    
    if (!isSameMonth(date, month)) {
      return (
        <div className="flex justify-end p-1.5 h-full">
          <div className="text-xs text-muted-foreground/50">{dayNumber}</div>
        </div>
      )
    }

    const MAX_DOTS = 4;
    const transactions = dayData?.transactions || [];
    const visibleTransactions = transactions.slice(0, MAX_DOTS);
    const hiddenCount = transactions.length > visibleTransactions.length ? transactions.length - visibleTransactions.length : 0;

    const formatAmount = (amount: number) => {
      return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    return (
      <div className="flex flex-col h-full w-full p-1.5 overflow-hidden" onClick={() => handleDayClick(date)}>
        <div className="text-right text-xs font-semibold">{dayNumber}</div>
        
        <div className="flex-grow min-h-0 pt-1">
          {transactions.length > 0 && (
            <div className="flex items-center flex-wrap gap-1">
                {visibleTransactions.map(t => (
                    <div key={t.id} className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        t.type === 'income' ? 'bg-primary' : 'bg-destructive'
                    )} />
                ))}
                {hiddenCount > 0 && (
                    <span className="text-[10px] text-muted-foreground font-bold">+{hiddenCount}</span>
                )}
            </div>
          )}
        </div>
        
        <div className="text-xs font-semibold text-right space-y-0.5">
            {dayData?.income > 0 && (
                <p className="text-primary truncate">{formatAmount(dayData.income)}</p>
            )}
            {dayData?.expense > 0 && (
                <p className="text-destructive truncate">{formatAmount(dayData.expense)}</p>
            )}
        </div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
                <Button variant={view === 'monthly' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('monthly')}>Monthly</Button>
                <Button variant={view === 'weekly' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('weekly')}>Weekly</Button>
                <Button variant={view === 'daily' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('daily')}>Daily</Button>
                <Button variant={view === 'total' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('total')}>Total</Button>
            </div>
            <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-muted-foreground"/>
                    <span>Balance:</span>
                    <span className="font-semibold">{formatCurrency(stats.balance, 'USD')}</span>
                </div>
                <div className="flex items-center gap-2 text-primary">
                    <TrendingUp className="h-4 w-4"/>
                    <span>Income:</span>
                    <span className="font-semibold">{formatCurrency(stats.income, 'USD')}</span>
                </div>
                 <div className="flex items-center gap-2 text-destructive">
                    <TrendingDown className="h-4 w-4"/>
                    <span>Expense:</span>
                    <span className="font-semibold">{formatCurrency(stats.expense, 'USD')}</span>
                </div>
            </div>
        </CardHeader>
        <CardContent className={cn("p-0 sm:p-2", (view === 'weekly' || view === 'daily') && 'week-view-container')}>
          <Calendar
            month={month}
            onMonthChange={onMonthChange}
            onDayClick={handleDayClick}
            components={{ Day: DayContent }}
            selected={view === 'daily' ? selectedDay : view === 'weekly' ? { from: startOfWeek(selectedDay), to: endOfWeek(selectedDay) } : undefined}
            className="p-0"
            classNames={{
              table: 'w-full border-collapse table-fixed',
              head_row: '',
              head_cell: 'text-muted-foreground font-normal text-xs text-center p-2 border',
              row: '',
              cell: 'border relative',
              day: 'h-24 md:h-28 w-full p-0',
              day_selected: 'bg-primary/20 text-primary-foreground',
              day_today: 'bg-accent/50',
              day_outside: 'text-muted-foreground/50',
              day_disabled: '',
              day_range_start: 'day-range-start bg-primary/20 rounded-l-md',
              day_range_end: 'day-range-end bg-primary/20 rounded-r-md',
              day_range_middle: 'day-range-middle bg-primary/10',
            }}
          />
        </CardContent>
      </Card>
      <TransactionDetailsDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        date={selectedDateForDialog}
        transactions={selectedTransactions}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  );
}
