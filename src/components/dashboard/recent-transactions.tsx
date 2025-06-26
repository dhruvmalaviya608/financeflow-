'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Transaction, TransactionCategory } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { MoreHorizontal, Utensils, Car, ShoppingBag, Wrench, Ticket, Landmark } from 'lucide-react';

type RecentTransactionsProps = {
  transactions: Transaction[];
};

const categoryIcons: { [key in TransactionCategory]: React.ReactNode } = {
    Food: <Utensils className="h-4 w-4 text-muted-foreground" />,
    Transport: <Car className="h-4 w-4 text-muted-foreground" />,
    Shopping: <ShoppingBag className="h-4 w-4 text-muted-foreground" />,
    Utilities: <Wrench className="h-4 w-4 text-muted-foreground" />,
    Entertainment: <Ticket className="h-4 w-4 text-muted-foreground" />,
    Salary: <Landmark className="h-4 w-4 text-muted-foreground" />,
    Other: <MoreHorizontal className="h-4 w-4 text-muted-foreground" />,
};


export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle>Messages</CardTitle>
            <div>
                <Button variant="ghost" size="sm">Today</Button>
                <Button variant="secondary" size="sm">All</Button>
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
                <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.category}</p>
                </div>
                <div className={`ml-auto font-medium ${transaction.type === 'income' ? 'text-blue-400' : ''}`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                </div>
            </div>
        ))}
      </CardContent>
    </Card>
  );
}
