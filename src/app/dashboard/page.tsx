'use client';

import { useState } from 'react';
import type { Transaction } from '@/types';
import { mockTransactions, mockBudget } from '@/data/mock-data';
import Overview from '@/components/dashboard/overview';
import BudgetTracker from '@/components/dashboard/budget-tracker';
import SpendingBreakdown from '@/components/dashboard/spending-breakdown';
import RecentTransactions from '@/components/dashboard/recent-transactions';
import AiReporter from '@/components/dashboard/ai-reporter';

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [budget, setBudget] = useState(mockBudget.goal);

  const handleAddTransaction = (newTransactionData: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...newTransactionData,
      id: `txn_${Date.now()}`,
      date: new Date(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const currentMonthExpenses = transactions
    .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.amount, 0);

  return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Overview transactions={transactions} />
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-4 xl:col-span-2">
            <RecentTransactions transactions={transactions} onAddTransaction={handleAddTransaction} />
          </div>
          <div className="flex flex-col gap-4">
            <BudgetTracker
              budget={budget}
              onSetBudget={setBudget}
              currentSpending={currentMonthExpenses}
            />
            <SpendingBreakdown transactions={transactions} />
            <AiReporter />
          </div>
        </div>
      </main>
  );
}
