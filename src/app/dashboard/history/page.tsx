
'use client';

import { useState } from 'react';
import type { Transaction } from '@/types';
import { useTransactions } from '@/context/transactions-context';
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
import { Button } from '@/components/ui/button';
import { Plus, Search, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function HistoryPage() {
  const { 
    transactions, 
    categories, 
    addTransaction, 
    editTransaction, 
    deleteTransaction,
    deleteMultipleTransactions,
    addCategory, 
    editCategory,
    deleteCategory,
  } = useTransactions();
  
  const [isAddTransactionOpen, setAddTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [newTransactionDate, setNewTransactionDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

  const handleSaveTransaction = (data: Omit<Transaction, 'id'>, id?: string) => {
    if (id) {
      editTransaction(data, id);
    } else {
      addTransaction(data);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setAddTransactionOpen(true);
  };

  const handleConfirmDeleteTransaction = () => {
    if (!deletingTransactionId) return;
    deleteTransaction(deletingTransactionId);
    setDeletingTransactionId(null);
  };
  
  const handleConfirmDeleteCategory = () => {
    if (!deletingCategory) return;
    deleteCategory(deletingCategory);
    setDeletingCategory(null);
  };

  const handleAddTransaction = (date?: Date) => {
    setEditingTransaction(null);
    setNewTransactionDate(date || null);
    setAddTransactionOpen(true);
  }

  const displayedTransactions = searchQuery
    ? transactions.filter(t => t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    : transactions;

  return (
    <>
      <div className="flex w-full flex-col">
        <header className="sticky top-0 flex h-14 items-center justify-between gap-4 border-b bg-card px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <h1 className="text-xl font-semibold">History</h1>
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative flex-1 md:grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search transactions..."
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
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
                  onAddCategory={addCategory}
                  onEditCategory={editCategory}
                  onDeleteCategory={setDeletingCategory}
                />
              </DialogContent>
            </Dialog>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <RecentTransactions 
            transactions={displayedTransactions} 
            onEdit={handleEdit}
            onDelete={setDeletingTransactionId}
            onAdd={handleAddTransaction}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
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
