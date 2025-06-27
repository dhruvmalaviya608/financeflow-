'use client';

import { useMemo } from 'react';
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Transaction } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { MoreHorizontal, Pencil, Plus, Trash2, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';

type RecentTransactionsProps = {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onAdd: (date?: Date) => void;
  viewMode: 'daily' | 'monthly' | 'yearly';
  onViewModeChange: (mode: 'daily' | 'monthly' | 'yearly') => void;
  selection?: string[];
  onSelectionChange?: (ids: string[]) => void;
};

type TransactionsByGroup = {
  key: string;
  date: Date;
  transactions: Transaction[];
  income: number;
  expense: number;
};

export default function RecentTransactions({ transactions, onEdit, onDelete, onAdd, viewMode, onViewModeChange, selection, onSelectionChange }: RecentTransactionsProps) {
  const groupedTransactions = useMemo(() => {
    let groupBy: (t: Transaction) => string;
    if (viewMode === 'daily') {
      groupBy = (t: Transaction) => format(t.date, 'yyyy-MM-dd');
    } else if (viewMode === 'monthly') {
      groupBy = (t: Transaction) => format(t.date, 'yyyy-MM');
    } else if (viewMode === 'yearly') {
      groupBy = (t: Transaction) => format(t.date, 'yyyy');
    } else {
      return [];
    }
    
    // 1. Group transactions
    const groups = [...transactions].reduce((acc, transaction) => {
        const dateKey = groupBy(transaction);
        if (!acc[dateKey]) {
            acc[dateKey] = {
                key: dateKey,
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
    }, {} as Record<string, TransactionsByGroup>);

    const groupsAsArray = Object.values(groups);

    // 2. Sort transactions inside each group by date (descending)
    for (const group of groupsAsArray) {
      group.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // 3. Sort the groups themselves by date (descending)
    groupsAsArray.sort((a, b) => new Date(b.key).getTime() - new Date(a.key).getTime());

    return groupsAsArray;
  }, [transactions, viewMode]);

  const getGroupTitle = (date: Date) => {
      if (viewMode === 'daily') {
          return {
              main: format(date, 'dd'),
              sub: format(date, 'EEE'),
          };
      }
      if (viewMode === 'monthly') {
          return {
              main: format(date, 'MMMM'),
              sub: format(date, 'yyyy'),
          };
      }
      if (viewMode === 'yearly') {
          return {
              main: format(date, 'yyyy'),
              sub: '',
          };
      }
      return { main: '', sub: '' };
  };

  const handleTransactionSelect = (transactionId: string, isSelected: boolean) => {
    if (!selection || !onSelectionChange) return;
    if (isSelected) {
      onSelectionChange([...selection, transactionId]);
    } else {
      onSelectionChange(selection.filter(id => id !== transactionId));
    }
  };

  const defaultOpen = useMemo(() => groupedTransactions.map(g => g.key), [groupedTransactions]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle>Transactions</CardTitle>
            <div className="flex items-center gap-1">
                <Button variant={viewMode === 'daily' ? 'secondary' : 'ghost'} size="sm" onClick={() => onViewModeChange('daily')}>Daily</Button>
                <Button variant={viewMode === 'monthly' ? 'secondary' : 'ghost'} size="sm" onClick={() => onViewModeChange('monthly')}>Monthly</Button>
                <Button variant={viewMode === 'yearly' ? 'secondary' : 'ghost'} size="sm" onClick={() => onViewModeChange('yearly')}>Yearly</Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {groupedTransactions.length > 0 ? (
          <Accordion type="multiple" className="w-full space-y-4" defaultValue={defaultOpen}>
            {groupedTransactions.map(({ key, date, transactions: dayTransactions, income, expense }) => {
              const { main: titleMain, sub: titleSub } = getGroupTitle(date);
              
              return (
                <AccordionItem value={key} key={key} className="border-b-0">
                  <div className={cn("flex items-center border-b pb-2 mb-4", selection && onSelectionChange && "gap-4")}>
                    {selection && onSelectionChange && <div className="w-4 shrink-0" />}
                    <AccordionPrimitive.Header className="flex flex-1 items-center">
                        <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-between py-0 font-normal hover:no-underline group">
                          <div className="flex items-baseline gap-3">
                              <span className="text-3xl font-bold">{titleMain}</span>
                              <span className="text-sm text-muted-foreground">{titleSub}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm font-semibold">
                              {income > 0 && <span className="text-primary">{formatCurrency(income, 'USD')}</span>}
                              {expense > 0 && <span className="text-destructive">{formatCurrency(expense, 'USD')}</span>}
                          </div>
                          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </AccordionPrimitive.Trigger>
                    </AccordionPrimitive.Header>
                  </div>
                  <AccordionContent className="pt-4">
                    <div className="space-y-4">
                      {dayTransactions.map(transaction => (
                        <div key={transaction.id} className="group flex items-start gap-4">
                           {selection && onSelectionChange && (
                            <Checkbox
                              checked={selection.includes(transaction.id)}
                              onCheckedChange={(checked) => handleTransactionSelect(transaction.id, !!checked)}
                              className="mt-1"
                              aria-label={`Select transaction: ${transaction.description}`}
                            />
                          )}
                            <div className={cn("grid gap-0.5 flex-1", !selection && "pl-1")}>
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
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
            <div className="text-center text-muted-foreground py-10">
                <p>No transactions to display.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
