
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Transaction, TransactionCategory } from '@/types';
import { mockTransactions, categories as mockCategories } from '@/data/mock-data';
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
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on initial client-side render
  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (storedTransactions) {
        const parsed = JSON.parse(storedTransactions).map((t: any) => ({
          ...t,
          date: new Date(t.date),
        }));
        setTransactions(parsed);
      } else {
        // If nothing in storage, initialize with mock data
        setTransactions(mockTransactions);
      }

      const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        setCategories(mockCategories);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage, using mock data.", error);
      setTransactions(mockTransactions);
      setCategories(mockCategories);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever state changes, but only after initial load
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    }
  }, [categories, isLoaded]);

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

  const deleteMultipleTransactions = (ids: string[]) => {
    setTransactions(prev => prev.filter(t => !ids.includes(t.id)));
    toast({
      title: `${ids.length} transaction${ids.length > 1 ? 's' : ''} deleted.`,
      variant: 'destructive',
    });
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
