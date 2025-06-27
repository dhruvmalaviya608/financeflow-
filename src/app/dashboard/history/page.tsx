'use client';

import { useState } from 'react';
import type { Transaction, TransactionCategory } from '@/types';
import { mockTransactions, mockCategories } from '@/data/mock-data';
import RecentTransactions from '@/components/dashboard/recent-transactions';
import { AddTransactionForm } from '@/components/dashboard/add-transaction-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function HistoryPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [categories, setCategories] = useState<TransactionCategory[]>(mockCategories);
  const [isAddTransactionOpen, setAddTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [newTransactionDate, setNewTransactionDate] = useState<Date | null>(null);

  const handleSaveTransaction = (data: Omit<Transaction, 'id'>, id?: string) => {
    if (id) {
      setTransactions(prev => prev.map(t => t.id === id ? { ...data, id } : t));
    } else {
      const newTransaction: Transaction = {
        ...data,
        id: (transactions.length + 1).toString() + Math.random(), // Not robust, but ok for mock
      };
      setTransactions(prev => [newTransaction, ...prev]);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setAddTransactionOpen(true);
  };

  const handleConfirmDeleteTransaction = () => {
    if (!deletingTransactionId) return;
    setTransactions(prev => prev.filter(t => t.id !== deletingTransactionId));
    setDeletingTransactionId(null);
  };
  
  const handleAddCategory = (category: TransactionCategory) => {
    if (category.trim() && !categories.includes(category.trim())) {
      setCategories(prev => [...prev, category.trim()].sort());
       toast({
          title: 'Category Added',
          description: `"${category.trim()}" has been added to your categories.`,
      });
    }
  };
  
  const handleEditCategory = (oldCategory: string, newCategory: string) => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories(prev => prev.map(c => c === oldCategory ? newCategory.trim() : c).sort());
      setTransactions(prev => prev.map(t => t.category === oldCategory ? { ...t, category: newCategory.trim() } : t));
       toast({
          title: 'Category Updated',
          description: `"${oldCategory}" has been renamed to "${newCategory.trim()}".`,
      });
    }
  };
  
  const handleConfirmDeleteCategory = () => {
    if (!deletingCategory) return;
    setCategories(prev => prev.filter(c => c !== deletingCategory));
    setDeletingCategory(null);
    toast({
        title: 'Category Deleted',
        description: `"${deletingCategory}" has been deleted.`,
        variant: 'destructive'
    });
  };

  const handleAddTransaction = (date?: Date) => {
    setEditingTransaction(null);
    setNewTransactionDate(date || null);
    setAddTransactionOpen(true);
  }

  return (
    <>
      <div className="flex w-full flex-col">
        <header className="sticky top-0 flex h-14 items-center justify-between gap-4 border-b bg-card px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <h1 className="text-xl font-semibold">History</h1>
          <Dialog open={isAddTransactionOpen} onOpenChange={(isOpen) => {
            setAddTransactionOpen(isOpen);
            if (!isOpen) {
              setEditingTransaction(null);
              setNewTransactionDate(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1" onClick={() => handleAddTransaction()}>
                <Plus className="h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTransaction ? 'Edit transaction' : 'Add a new transaction'}</DialogTitle>
                <DialogDescription>
                  {editingTransaction ? 'Update the details below.' : 'Fill in the details below to log a new income or expense.'}
                </DialogDescription>
              </DialogHeader>
              <AddTransactionForm 
                onFormSubmit={handleSaveTransaction}
                setDialogOpen={setAddTransactionOpen}
                initialData={editingTransaction}
                transactionDate={newTransactionDate}
                categories={categories}
                onAddCategory={handleAddCategory}
                onEditCategory={handleEditCategory}
                onDeleteCategory={setDeletingCategory}
              />
            </DialogContent>
          </Dialog>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <RecentTransactions 
            transactions={transactions} 
            onEdit={handleEdit}
            onDelete={setDeletingTransactionId}
            onAdd={handleAddTransaction}
          />
        </main>
      </div>

      <AlertDialog open={!!deletingTransactionId} onOpenChange={(isOpen) => !isOpen && setDeletingTransactionId(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this transaction.
              </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingTransactionId(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDeleteTransaction}>Delete</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
       <AlertDialog open={!!deletingCategory} onOpenChange={(isOpen) => !isOpen && setDeletingCategory(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                  This will permanently delete the category "{deletingCategory}". Transactions using this category will not be deleted.
              </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingCategory(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDeleteCategory}>Delete</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
