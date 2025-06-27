
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

type CalendarViewProps = {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
};

export default function CalendarView({ transactions, onEdit, onDelete }: CalendarViewProps) {
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
              table: 'w-full border-collapse table-fixed',
              head_row: 'border-b',
              head_cell: 'text-muted-foreground font-normal text-xs text-center p-2',
              row: '',
              cell: 'border-t border-l first:border-l-0 relative',
              day: 'h-24 md:h-28 w-full p-0',
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
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  );
}
