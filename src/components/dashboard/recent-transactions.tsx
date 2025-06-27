'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type RecentTransactionsProps = {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onAdd: (date?: Date) => void;
};

type TransactionsByDay = {
  date: Date;
  transactions: Transaction[];
  income: number;
  expense: number;
};

export default function RecentTransactions({ transactions, onEdit, onDelete, onAdd }: RecentTransactionsProps) {

  const groupedTransactions = useMemo(() => {
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const groups = sortedTransactions.reduce((acc, transaction) => {
        const dateKey = format(transaction.date, 'yyyy-MM-dd');
        if (!acc[dateKey]) {
            acc[dateKey] = {
                date: transaction.date,
                transactions: [],
                income: 0,
                expense: 0,
            };
        }
        acc[dateKey].transactions.push(transaction);
        // Only aggregate USD for totals
        if (transaction.currency === 'USD') {
            if (transaction.type === 'income') {
                acc[dateKey].income += transaction.amount;
            } else if (transaction.type === 'expense') {
                acc[dateKey].expense += transaction.amount;
            }
        }
        return acc;
    }, {} as Record<string, TransactionsByDay>);

    return Object.values(groups);
  }, [transactions]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle>Transactions</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {groupedTransactions.map(({ date, transactions: dayTransactions, income, expense }) => (
          <div key={format(date, 'yyyy-MM-dd')}>
            <div className="flex items-baseline justify-between border-b pb-2 mb-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">{format(date, 'dd')}</span>
                <span className="text-sm text-muted-foreground">{format(date, 'EEE')}</span>
              </div>
              <div className="flex items-center gap-4 text-sm font-semibold">
                {income > 0 && <span className="text-primary">{formatCurrency(income, 'USD')}</span>}
                {expense > 0 && <span className="text-destructive">{formatCurrency(expense, 'USD')}</span>}
              </div>
            </div>
            <div className="space-y-4">
              {dayTransactions.map(transaction => (
                 <div key={transaction.id} className="group flex items-start gap-4">
                    <div className="grid gap-0.5 flex-1">
                        <div className="flex justify-between items-start">
                            <p className="font-medium leading-none">{transaction.description}</p>
                            <div className="flex items-center -mt-1 -mr-2">
                                <p className={`font-semibold text-right ${transaction.type === 'income' ? 'text-primary' : transaction.type === 'expense' ? 'text-destructive' : ''}`}>
                                    {transaction.type !== 'transfer' && (transaction.type === 'income' ? '+' : '-')}
                                    {formatCurrency(transaction.amount, transaction.currency)}
                                </p>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => onAdd(date)}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            <span>Add New</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onSelect={() => onEdit(transaction)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            <span>Edit</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => onDelete(transaction.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Delete</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{transaction.category} · {transaction.account}</p>
                    </div>
                 </div>
              ))}
            </div>
          </div>
        ))}
        {groupedTransactions.length === 0 && (
            <div className="text-center text-muted-foreground py-10">
                <p>No transactions to display.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
