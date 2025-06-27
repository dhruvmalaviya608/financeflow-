import type { ElementType } from 'react';

export type TransactionCategory = string;
export type Account = 'Cash' | 'Bank' | 'Card';

export type Transaction = {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: TransactionCategory;
  account: Account;
  currency: string;
};

export type Budget = {
  goal: number;
  spent: number;
};

export type BudgetCategory = {
  name: string;
  goal: number;
  spent: number;
  icon: ElementType;
};
