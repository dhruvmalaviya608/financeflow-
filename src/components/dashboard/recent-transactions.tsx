'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type RecentTransactionsProps = {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
};


export default function RecentTransactions({ transactions, onEdit, onDelete }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <div>
                <Button variant="ghost" size="sm">View All</Button>
            </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        {transactions.map(transaction => (
            <div key={transaction.id} className="flex items-center gap-4">
                <Avatar className="h-9 w-9">
                    <AvatarImage data-ai-hint="person portrait" src={`https://placehold.co/100x100.png?text=${transaction.description.charAt(0)}`} alt="Avatar" />
                    <AvatarFallback>{transaction.description.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1 flex-1">
                    <p className="text-sm font-medium leading-none">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.category} · {format(transaction.date, "LLL dd")}</p>
                </div>
                <div className={`font-medium text-right ${transaction.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
        ))}
      </CardContent>
    </Card>
  );
}
