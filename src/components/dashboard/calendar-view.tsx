
'use client';

import { useState, useMemo } from 'react';
import { format, isSameMonth, startOfMonth } from 'date-fns';
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

export default function CalendarView({ transactions }: { transactions: Transaction[] }) {
  const [month, setMonth] = useState<Date>(startOfMonth(new Date()));
  const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const { transactionsByDay, monthStats } = useMemo(() => {
    const filteredTransactions = transactions.filter((t) => isSameMonth(t.date, month));
    
    const byDay: TransactionsByDay = {};
    let totalIncome = 0;
    let totalExpense = 0;

    for (const t of filteredTransactions) {
      const dayKey = format(t.date, 'yyyy-MM-dd');
      if (!byDay[dayKey]) {
        byDay[dayKey] = { transactions: [], income: 0, expense: 0 };
      }
      byDay[dayKey].transactions.push(t);
      if (t.type === 'income') {
        byDay[dayKey].income += t.amount;
        totalIncome += t.amount;
      } else if (t.type === 'expense') {
        byDay[dayKey].expense += t.amount;
        totalExpense += t.amount;
      }
    }
    
    return { 
      transactionsByDay: byDay,
      monthStats: {
        income: totalIncome,
        expense: totalExpense,
        balance: totalIncome - totalExpense
      }
    };
  }, [transactions, month]);

  const handleDayClick = (day: Date) => {
    const dayKey = format(day, 'yyyy-MM-dd');
    const dayData = transactionsByDay[dayKey];
    if (dayData && dayData.transactions.length > 0) {
      setSelectedTransactions(dayData.transactions);
      setSelectedDate(day);
      setDialogOpen(true);
    }
  };

  function DayContent({ date }: { date: Date }) {
    const dayKey = format(date, 'yyyy-MM-dd');
    const dayData = transactionsByDay[dayKey];
    const dayNumber = format(date, 'd');
    
    if (!isSameMonth(date, month)) {
      return <div className="text-muted-foreground/50">{dayNumber}</div>;
    }

    const total = (dayData?.income || 0) - (dayData?.expense || 0);

    return (
      <div className="flex flex-col h-full w-full p-1.5" onClick={() => handleDayClick(date)}>
        <div className="w-full text-right text-xs mb-1">{dayNumber}</div>
        <div className="flex-grow flex flex-col justify-end w-full space-y-1">
          {dayData?.income > 0 && <div className="w-full h-1.5 bg-primary rounded-full" />}
          {dayData?.expense > 0 && <div className="w-full h-1.5 bg-destructive rounded-full" />}
          {total !== 0 && (
            <p className={cn("text-xs font-bold truncate", total > 0 ? 'text-primary' : 'text-destructive')}>
              {formatCurrency(total)}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm">Monthly</Button>
                <Button variant="ghost" size="sm">Weekly</Button>
                <Button variant="ghost" size="sm">Daily</Button>
                 <Button variant="ghost" size="sm">Total</Button>
            </div>
            <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-muted-foreground"/>
                    <span>Balance:</span>
                    <span className="font-semibold">{formatCurrency(monthStats.balance)}</span>
                </div>
                <div className="flex items-center gap-2 text-primary">
                    <TrendingUp className="h-4 w-4"/>
                    <span>Income:</span>
                    <span className="font-semibold">{formatCurrency(monthStats.income)}</span>
                </div>
                 <div className="flex items-center gap-2 text-destructive">
                    <TrendingDown className="h-4 w-4"/>
                    <span>Expense:</span>
                    <span className="font-semibold">{formatCurrency(monthStats.expense)}</span>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-2">
          <Calendar
            month={month}
            onMonthChange={setMonth}
            components={{ Day: DayContent }}
            className="p-0"
            classNames={{
              day: 'h-24 md:h-28 relative border-t border-l first:border-l-0',
              head_row: 'border-b',
              row: 'flex w-full',
              table: 'border-collapse w-full border-b',
              day_selected: '',
              day_today: 'bg-accent/50',
              day_outside: 'text-muted-foreground/50',
              day_disabled: '',
            }}
          />
        </CardContent>
      </Card>
      <TransactionDetailsDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        date={selectedDate}
        transactions={selectedTransactions}
      />
    </>
  );
}
