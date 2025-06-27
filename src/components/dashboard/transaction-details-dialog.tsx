
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
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type TransactionDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
};

export default function TransactionDetailsDialog({ open, onOpenChange, date, transactions, onEdit, onDelete }: TransactionDetailsDialogProps) {
  if (!date) return null;

  const handleEditClick = (transaction: Transaction) => {
    onEdit(transaction);
    onOpenChange(false);
  }

  const handleDeleteClick = (id: string) => {
    onDelete(id);
    onOpenChange(false);
  }

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
                            {formatCurrency(transaction.amount, transaction.currency)}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => handleEditClick(transaction)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleDeleteClick(transaction.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
