import type { Transaction, Budget, TransactionCategory, BudgetCategory, Account } from '@/types';
import { Utensils, Car, ShoppingBag, Wrench } from 'lucide-react';

const today = new Date();
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const generateRandomDateThisMonth = () => {
  const day = Math.floor(Math.random() * today.getDate()) + 1;
  return new Date(today.getFullYear(), today.getMonth(), day);
}

export const mockTransactions: Transaction[] = [];

const spent = mockTransactions
  .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === today.getMonth())
  .reduce((sum, t) => sum + t.amount, 0);

export const mockBudget: Budget = {
  goal: 2000,
  spent: spent,
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

export const mockBudgets: BudgetCategory[] = [
    { name: 'Groceries', spent: 0, goal: 500, icon: Utensils },
    { name: 'Transport', spent: 0, goal: 150, icon: Car },
    { name: 'Shopping', spent: 0, goal: 200, icon: ShoppingBag },
    { name: 'Utilities', spent: 0, goal: 150, icon: Wrench },
]
