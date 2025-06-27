
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Transaction } from '@/types';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

type TransactionDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  transactions: Transaction[];
};

export default function TransactionDetailsDialog({ open, onOpenChange, date, transactions }: TransactionDetailsDialogProps) {
  if (!date) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transactions for {format(date, 'PPP')}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
            {transactions.length > 0 ? (
                transactions
                .sort((a,b) => b.amount - a.amount)
                .map((transaction) => (
                    <div key={transaction.id} className="flex items-center gap-4">
                        <Avatar className="h-9 w-9">
                            <AvatarImage data-ai-hint="person portrait" src={`https://placehold.co/100x100.png?text=${transaction.description.charAt(0)}`} alt="Avatar" />
                            <AvatarFallback>{transaction.description.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1 flex-1">
                            <p className="text-sm font-medium leading-none">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">{transaction.category}</p>
                        </div>
                        <div className={`font-medium text-right ${transaction.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No transactions for this day.</p>
            )}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
