'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Transaction, TransactionCategory } from '@/types';
import { mockTransactions, categories as mockCategories } from '@/data/mock-data';
import { useToast } from '@/hooks/use-toast';

type TransactionsContextType = {
  transactions: Transaction[];
  categories: TransactionCategory[];
  addTransaction: (data: Omit<Transaction, 'id'>) => void;
  editTransaction: (data: Omit<Transaction, 'id'>, id: string) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: TransactionCategory) => void;
  editCategory: (oldCategory: string, newCategory: string) => void;
  deleteCategory: (category: string) => void;
};

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [categories, setCategories] = useState<TransactionCategory[]>(mockCategories);

  const addTransaction = (data: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...data,
      id: (transactions.length + 1).toString() + Math.random(), // Not robust, but ok for mock
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const editTransaction = (data: Omit<Transaction, 'id'>, id: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...data, id } : t));
  };
  
  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addCategory = (category: TransactionCategory) => {
    if (category.trim() && !categories.includes(category.trim())) {
      setCategories(prev => [...prev, category.trim()].sort());
       toast({
          title: 'Category Added',
          description: `"${category.trim()}" has been added to your categories.`,
      });
    }
  };

  const editCategory = (oldCategory: string, newCategory: string) => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories(prev => prev.map(c => c === oldCategory ? newCategory.trim() : c).sort());
      setTransactions(prev => prev.map(t => t.category === oldCategory ? { ...t, category: newCategory.trim() } : t));
       toast({
          title: 'Category Updated',
          description: `"${oldCategory}" has been renamed to "${newCategory.trim()}".`,
      });
    }
  };
  
  const deleteCategory = (category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
    toast({
        title: 'Category Deleted',
        description: `"${category}" has been deleted.`,
        variant: 'destructive'
    });
  };

  const value = {
    transactions,
    categories,
    addTransaction,
    editTransaction,
    deleteTransaction,
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
