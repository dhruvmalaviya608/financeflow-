
'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Transaction } from '@/types';
import { mockTransactions, mockBudgets } from '@/data/mock-data';
import Overview from '@/components/dashboard/overview';
import RecentTransactions from '@/components/dashboard/recent-transactions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Bell, Search, UserCircle, Plus } from 'lucide-react';
import { TransactionOverview } from '@/components/dashboard/transaction-overview';
import { Budgets } from '@/components/dashboard/budgets';
import SpendingBreakdown from '@/components/dashboard/spending-breakdown';
import { AddTransactionForm } from '@/components/dashboard/add-transaction-form';
import { Skeleton } from '@/components/ui/skeleton';

function UserMenu() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get('name');

  const handleLogout = () => {
    router.push('/');
  };

  const capitalize = (s: string | null): string => {
    if (!s) return 'My Account';
    const words = s.split(' ');
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <UserCircle className="h-5 w-5" />
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{capitalize(name)}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [isAddTransactionOpen, setAddTransactionOpen] = useState(false);

  const handleAddTransaction = (data: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...data,
      id: (transactions.length + 1).toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-14 items-center gap-4 border-b bg-card px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <h1 className="text-xl font-semibold">Overview</h1>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
          />
        </div>
        <Dialog open={isAddTransactionOpen} onOpenChange={setAddTransactionOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a new transaction</DialogTitle>
              <DialogDescription>
                Fill in the details below to log a new income or expense.
              </DialogDescription>
            </DialogHeader>
            <AddTransactionForm 
              onFormSubmit={handleAddTransaction}
              setDialogOpen={setAddTransactionOpen}
            />
          </DialogContent>
        </Dialog>
        <Suspense fallback={<Skeleton className="h-8 w-8 rounded-full" />}>
          <UserMenu />
        </Suspense>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <Overview transactions={transactions} />
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <TransactionOverview />
          </div>
          <div className="flex flex-col gap-4">
            <RecentTransactions transactions={transactions.slice(0, 5)} />
          </div>
          <div className="xl:col-span-2">
            <Budgets budgets={mockBudgets} />
          </div>
          <div className="flex flex-col gap-4">
            <SpendingBreakdown transactions={transactions} />
          </div>
        </div>
      </main>
    </div>
  );
}
