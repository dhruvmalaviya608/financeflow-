
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Transaction, TransactionCategory } from '@/types';
import { useToast } from '@/hooks/use-toast';

type TransactionsContextType = {
  transactions: Transaction[];
  categories: TransactionCategory[];
  addTransaction: (data: Omit<Transaction, 'id'>) => void;
  editTransaction: (data: Omit<Transaction, 'id'>, id: string) => void;
  deleteTransaction: (id: string) => void;
  deleteMultipleTransactions: (ids: string[]) => void;
  addCategory: (category: TransactionCategory) => void;
  editCategory: (oldCategory: string, newCategory: string) => void;
  deleteCategory: (category: string) => void;
};

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

const TRANSACTIONS_STORAGE_KEY = 'financeFlowTransactions';
const CATEGORIES_STORAGE_KEY = 'financeFlowCategories';

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Load from localStorage on initial client-side mount
  useEffect(() => {
    setIsClient(true);
    try {
      const storedTransactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (storedTransactions) {
        const parsed = JSON.parse(storedTransactions).map((t: any) => ({
          ...t,
          date: new Date(t.date),
        }));
        setTransactions(parsed);
      } else {
        // If nothing in storage, initialize with an empty array for full manual control.
        setTransactions([]);
        localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify([]));
      }

      const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        // Start with an empty category list for full manual control.
        setCategories([]);
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify([]));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage, starting with empty state.", error);
      setTransactions([]);
      setCategories([]);
    }
  }, []);

  const updateAndSaveTransactions = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    if (isClient) {
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(newTransactions));
    }
  };

  const updateAndSaveCategories = (newCategories: TransactionCategory[]) => {
    setCategories(newCategories);
    if (isClient) {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(newCategories));
    }
  };

  const addTransaction = (data: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...data,
      id: (transactions.length + 1).toString() + Math.random(),
    };
    updateAndSaveTransactions([newTransaction, ...transactions]);
  };

  const editTransaction = (data: Omit<Transaction, 'id'>, id: string) => {
    const updated = transactions.map(t => (t.id === id ? { ...data, id } : t));
    updateAndSaveTransactions(updated);
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    updateAndSaveTransactions(updated);
  };

  const deleteMultipleTransactions = (ids: string[]) => {
    const updated = transactions.filter(t => !ids.includes(t.id));
    updateAndSaveTransactions(updated);
    toast({
      title: `${ids.length} transaction${ids.length > 1 ? 's' : ''} deleted.`,
      variant: 'destructive',
    });
  };

  const addCategory = (category: TransactionCategory) => {
    if (category.trim() && !categories.includes(category.trim())) {
      const newCategories = [...categories, category.trim()].sort();
      updateAndSaveCategories(newCategories);
      toast({
        title: 'Category Added',
        description: `"${category.trim()}" has been added to your categories.`,
      });
    }
  };

  const editCategory = (oldCategory: string, newCategory: string) => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const newCategories = categories.map(c => (c === oldCategory ? newCategory.trim() : c)).sort();
      updateAndSaveCategories(newCategories);

      const updatedTransactions = transactions.map(t =>
        t.category === oldCategory ? { ...t, category: newCategory.trim() } : t
      );
      updateAndSaveTransactions(updatedTransactions);

      toast({
        title: 'Category Updated',
        description: `"${oldCategory}" has been renamed to "${newCategory.trim()}".`,
      });
    }
  };

  const deleteCategory = (category: string) => {
    const newCategories = categories.filter(c => c !== category);
    updateAndSaveCategories(newCategories);
    toast({
      title: 'Category Deleted',
      description: `"${category}" has been deleted.`,
      variant: 'destructive',
    });
  };

  const value = {
    transactions,
    categories,
    addTransaction,
    editTransaction,
    deleteTransaction,
    deleteMultipleTransactions,
    addCategory,
    editCategory,
    deleteCategory,
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
}
