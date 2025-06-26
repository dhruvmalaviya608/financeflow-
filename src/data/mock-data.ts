import type { Transaction, Budget, TransactionCategory, BudgetCategory } from '@/types';
import { Utensils, Car, ShoppingBag, Wrench } from 'lucide-react';

const today = new Date();
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const generateRandomDateThisMonth = () => {
  const day = Math.floor(Math.random() * today.getDate()) + 1;
  return new Date(today.getFullYear(), today.getMonth(), day);
}

export const mockTransactions: Transaction[] = [
  { id: '1', date: generateRandomDateThisMonth(), description: 'Monthly Salary', amount: 5000, type: 'income', category: 'Salary' },
  { id: '2', date: generateRandomDateThisMonth(), description: 'Grocery Shopping', amount: 150.75, type: 'expense', category: 'Food' },
  { id: '3', date: generateRandomDateThisMonth(), description: 'Gasoline', amount: 45.50, type: 'expense', category: 'Transport' },
  { id: '4', date: generateRandomDateThisMonth(), description: 'Electricity Bill', amount: 75.00, type: 'expense', category: 'Utilities' },
  { id: '5', date: generateRandomDateThisMonth(), description: 'Movie Tickets', amount: 30.00, type: 'expense', category: 'Entertainment' },
  { id: '6', date: generateRandomDateThisMonth(), description: 'New T-shirt', amount: 25.00, type: 'expense', category: 'Shopping' },
  { id: '7', date: generateRandomDateThisMonth(), description: 'Lunch with friends', amount: 55.20, type: 'expense', category: 'Food' },
  { id: '8', date: generateRandomDateThisMonth(), description: 'Internet Bill', amount: 60.00, type: 'expense', category: 'Utilities' },
  { id: '9', date: generateRandomDateThisMonth(), description: 'Freelance Project', amount: 750, type: 'income', category: 'Other' },
  { id: '10', date: generateRandomDateThisMonth(), description: 'Bus Fare', amount: 22.50, type: 'expense', category: 'Transport' },
  { id: '11', date: new Date('2024-07-15'), description: 'Dinner Out', amount: 88.00, type: 'expense', category: 'Food' },
  { id: '12', date: new Date('2024-07-14'), description: 'New book', amount: 15.00, type: 'expense', category: 'Shopping' },
  { id: '13', date: new Date('2024-07-13'), description: 'Coffee', amount: 5.50, type: 'expense', category: 'Food' },
];


const spent = mockTransactions
  .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === today.getMonth())
  .reduce((sum, t) => sum + t.amount, 0);

export const mockBudget: Budget = {
  goal: 2000,
  spent: spent,
};

export const categories: TransactionCategory[] = ['Food', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Salary', 'Other'];

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
    { name: 'Groceries', spent: 320, goal: 500, icon: Utensils },
    { name: 'Transport', spent: 80, goal: 150, icon: Car },
    { name: 'Shopping', spent: 120, goal: 200, icon: ShoppingBag },
    { name: 'Utilities', spent: 150, goal: 150, icon: Wrench },
]
