import type { Transaction, Budget, TransactionCategory, BudgetCategory, Account } from '@/types';
import { Utensils, Car, ShoppingBag, Wrench } from 'lucide-react';

const today = new Date();

export const mockTransactions: Transaction[] = [];

export const mockBudget: Budget = {
  goal: 2000,
  spent: 0,
};

export const categories: TransactionCategory[] = ['Food', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Salary', 'Other'];
export const accounts: Account[] = ['Cash', 'Bank', 'Card'];

export const generate14DayTransactionData = () => {
  const data = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const day = date.toLocaleString('en-US', { month: 'short', day: '2-digit' });
    const total = Math.floor(Math.random() * 4500) + 500;
    data.push({ name: day, total });
  }
  return data;
};

const baseBudgets: Omit<BudgetCategory, 'spent'>[] = [
    { name: 'Food', goal: 500, icon: Utensils },
    { name: 'Transport', goal: 150, icon: Car },
    { name: 'Shopping', goal: 200, icon: ShoppingBag },
    { name: 'Utilities', goal: 150, icon: Wrench },
];

export const mockBudgets: BudgetCategory[] = baseBudgets.map(budget => ({
  ...budget,
  spent: 0
}));
