import type { Transaction, Budget, TransactionCategory } from '@/types';

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
];


const spent = mockTransactions
  .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === today.getMonth())
  .reduce((sum, t) => sum + t.amount, 0);

export const mockBudget: Budget = {
  goal: 2000,
  spent: spent,
};

export const categories: TransactionCategory[] = ['Food', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Salary', 'Other'];
