import type { ReactNode } from 'react';

export type TransactionCategory = 'Food' | 'Transport' | 'Shopping' | 'Utilities' | 'Entertainment' | 'Salary' | 'Other';

export type Transaction = {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: TransactionCategory;
};

export type Budget = {
  goal: number;
  spent: number;
};

export type BudgetCategory = {
  name: string;
  goal: number;
  spent: number;
  icon: ReactNode;
};
