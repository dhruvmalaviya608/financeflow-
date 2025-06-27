import type { Transaction, Budget, TransactionCategory, BudgetCategory, Account } from '@/types';
import { Utensils, Car, ShoppingBag, Wrench } from 'lucide-react';

const today = new Date();
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const generateRandomDateThisMonth = () => {
  const day = Math.floor(Math.random() * today.getDate()) + 1;
  return new Date(today.getFullYear(), today.getMonth(), day);
}

export const mockTransactions: Transaction[] = [
  { id: '1', date: new Date(today.getFullYear(), today.getMonth(), 1), description: 'Grocery Shopping', amount: 150.75, type: 'expense', category: 'Food', account: 'Card', currency: 'USD' },
  { id: '2', date: new Date(today.getFullYear(), today.getMonth(), 5), description: 'Monthly Salary', amount: 5000, type: 'income', category: 'Salary', account: 'Bank', currency: 'USD' },
  { id: '3', date: new Date(today.getFullYear(), today.getMonth(), 8), description: 'Electricity Bill', amount: 75, type: 'expense', category: 'Utilities', account: 'Bank', currency: 'USD' },
  { id: '4', date: new Date(today.getFullYear(), today.getMonth(), 8), description: 'Bus Fare', amount: 22.50, type: 'expense', category: 'Transport', account: 'Cash', currency: 'USD' },
  { id: '5', date: new Date(today.getFullYear(), today.getMonth(), 10), description: 'Internet Bill', amount: 60, type: 'expense', category: 'Utilities', account: 'Bank', currency: 'USD' },
  { id: '6', date: new Date(today.getFullYear(), today.getMonth(), 14), description: 'Lunch with friends', amount: 55.20, type: 'expense', category: 'Food', account: 'Cash', currency: 'USD' },
  { id: '7', date: new Date(today.getFullYear(), today.getMonth(), 15), description: 'Movie Tickets', amount: 30, type: 'expense', category: 'Entertainment', account: 'Card', currency: 'USD' },
  { id: '8', date: new Date(today.getFullYear(), today.getMonth(), 18), description: 'Freelance Project', amount: 750, type: 'income', category: 'Other', account: 'Bank', currency: 'USD' },
  { id: '9', date: new Date(today.getFullYear(), today.getMonth(), 22), description: 'Gasoline', amount: 45.50, type: 'expense', category: 'Transport', account: 'Card', currency: 'USD' },
  { id: '10', date: new Date(today.getFullYear(), today.getMonth(), 23), description: 'New T-shirt', amount: 25, type: 'expense', category: 'Shopping', account: 'Card', currency: 'USD' },
  { id: '11', date: new Date(today.getFullYear(), today.getMonth() - 1, 15), description: 'Dinner Out', amount: 88, type: 'expense', category: 'Food', account: 'Card', currency: 'USD' },
  { id: '12', date: new Date(today.getFullYear(), today.getMonth() - 1, 14), description: 'New book', amount: 15, type: 'expense', category: 'Shopping', account: 'Card', currency: 'EUR' },
  { id: '13', date: new Date(today.getFullYear(), today.getMonth() - 1, 13), description: 'Coffee', amount: 5.50, type: 'expense', category: 'Food', account: 'Cash', currency: 'USD' },
];

const spent = mockTransactions
  .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === today.getMonth() && t.currency === 'USD')
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

const baseBudgets: Omit<BudgetCategory, 'spent'>[] = [
    { name: 'Food', goal: 500, icon: Utensils },
    { name: 'Transport', goal: 150, icon: Car },
    { name: 'Shopping', goal: 200, icon: ShoppingBag },
    { name: 'Utilities', goal: 150, icon: Wrench },
];

export const mockBudgets: BudgetCategory[] = baseBudgets.map(budget => {
  const spent = mockTransactions
    .filter(t => t.type === 'expense' && t.category === budget.name && new Date(t.date).getMonth() === today.getMonth() && t.currency === 'USD')
    .reduce((sum, t) => sum + t.amount, 0);
  return { ...budget, spent };
});
