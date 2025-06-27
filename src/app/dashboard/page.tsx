'use client';

import { Suspense, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Transaction, TransactionCategory } from '@/types';
import { mockTransactions, mockBudgets, categories as mockCategories } from '@/data/mock-data';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Search, Plus, X } from 'lucide-react';
import { Budgets } from '@/components/dashboard/budgets';
import SpendingBreakdown from '@/components/dashboard/spending-breakdown';
import { AddTransactionForm } from '@/components/dashboard/add-transaction-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CalendarView from '@/components/dashboard/calendar-view';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatCurrency } from '@/lib/utils';

function UserMenu() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get('name');

  const handleLogout = () => {
    router.push('/');
  };

  const capitalize = (s: string | null): string => {
    if (!s) return 'User';
    const words = s.split(' ');
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }

  const getInitials = (s: string | null): string => {
    if (!s) return 'U';
    const nameParts = s.split(' ');
    if (nameParts.length > 1) {
      return nameParts[0].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    }
    return s.charAt(0).toUpperCase();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 flex items-center gap-2 rounded-full p-1 pr-3">
          <Avatar className="h-8 w-8">
            <AvatarImage data-ai-hint="person" src={`https://placehold.co/100x100.png?text=${getInitials(name)}`} alt="User Avatar" />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline-block">{capitalize(name)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DashboardPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [categories, setCategories] = useState<TransactionCategory[]>(mockCategories);
  const [isAddTransactionOpen, setAddTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [newTransactionDate, setNewTransactionDate] = useState<Date | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSaveTransaction = (data: Omit<Transaction, 'id'>, id?: string) => {
    if (id) {
      setTransactions(prev => prev.map(t => t.id === id ? { ...data, id } : t));
    } else {
      const newTransaction: Transaction = {
        ...data,
        id: (transactions.length + 1).toString() + Math.random(), // Not robust, but ok for mock
      };
      setTransactions(prev => [newTransaction, ...prev]);
    }
  };
  
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setAddTransactionOpen(true);
  };
  
  const handleConfirmDeleteTransaction = () => {
    if (!deletingTransactionId) return;
    setTransactions(prev => prev.filter(t => t.id !== deletingTransactionId));
    setDeletingTransactionId(null);
  };

  const handleAddCategory = (category: TransactionCategory) => {
    if (category.trim() && !categories.includes(category.trim())) {
      setCategories(prev => [...prev, category.trim()].sort());
       toast({
          title: 'Category Added',
          description: `"${category.trim()}" has been added to your categories.`,
      });
    }
  };
  
  const handleEditCategory = (oldCategory: string, newCategory: string) => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories(prev => prev.map(c => c === oldCategory ? newCategory.trim() : c).sort());
      setTransactions(prev => prev.map(t => t.category === oldCategory ? { ...t, category: newCategory.trim() } : t));
       toast({
          title: 'Category Updated',
          description: `"${oldCategory}" has been renamed to "${newCategory.trim()}".`,
      });
    }
  };
  
  const handleConfirmDeleteCategory = () => {
    if (!deletingCategory) return;
    setCategories(prev => prev.filter(c => c !== deletingCategory));
    setDeletingCategory(null);
    toast({
        title: 'Category Deleted',
        description: `"${deletingCategory}" has been deleted.`,
        variant: 'destructive'
    });
  };

  const handleAddTransaction = (date?: Date) => {
    setEditingTransaction(null);
    setNewTransactionDate(date || null);
    setAddTransactionOpen(true);
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (activeTransaction) {
      setActiveTransaction(null);
    }
    if (query.length > 0) {
      if (!isSearchOpen) setIsSearchOpen(true);
    } else {
      if (isSearchOpen) setIsSearchOpen(false);
    }
  };

  const handleSuggestionClick = (transaction: Transaction) => {
    setActiveTransaction(transaction);
    setSearchQuery(transaction.description);
    setIsSearchOpen(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveTransaction(null);
    setIsSearchOpen(false);
  };

  const displayedTransactions = activeTransaction ? [activeTransaction] : transactions;

  const searchSuggestions = useMemo(() => {
    if (searchQuery.length === 0 || activeTransaction) return [];
    return transactions.filter(t => 
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, transactions, activeTransaction]);


  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-14 items-center gap-4 border-b bg-card px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Popover open={isSearchOpen && searchSuggestions.length > 0} onOpenChange={setIsSearchOpen}>
                <PopoverTrigger asChild>
                    <Input
                      type="search"
                      placeholder="Search transactions..."
                      className="w-full rounded-lg bg-background pl-8 pr-8 md:w-[200px] lg:w-[320px]"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={() => { if (searchQuery.length > 0 && searchSuggestions.length > 0) setIsSearchOpen(true); }}
                    />
                </PopoverTrigger>
                <PopoverContent className="w-[200px] lg:w-[320px] p-0" align="start">
                    <div className="flex flex-col">
                        {searchSuggestions.slice(0, 7).map(t => (
                            <Button
                                key={t.id}
                                variant="ghost"
                                className="justify-between font-normal p-2 h-auto"
                                onClick={() => handleSuggestionClick(t)}
                            >
                                <span>{t.description}</span>
                                <span className="text-sm text-muted-foreground">{formatCurrency(t.amount, t.currency)}</span>
                            </Button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
            {searchQuery && (
                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={handleClearSearch}>
                    <X className="h-4 w-4 text-muted-foreground" />
                </Button>
            )}
          </div>
          <Dialog open={isAddTransactionOpen} onOpenChange={(isOpen) => {
            setAddTransactionOpen(isOpen);
            if (!isOpen) {
              setEditingTransaction(null);
              setNewTransactionDate(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1" onClick={() => handleAddTransaction()}>
                <Plus className="h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTransaction ? 'Edit transaction' : 'Add a new transaction'}</DialogTitle>
                <DialogDescription>
                  {editingTransaction ? 'Update the details below.' : 'Fill in the details below to log a new income or expense.'}
                </DialogDescription>
              </DialogHeader>
              <AddTransactionForm 
                onFormSubmit={handleSaveTransaction}
                setDialogOpen={setAddTransactionOpen}
                initialData={editingTransaction}
                transactionDate={newTransactionDate}
                categories={categories}
                onAddCategory={handleAddCategory}
                onEditCategory={handleEditCategory}
                onDeleteCategory={setDeletingCategory}
              />
            </DialogContent>
          </Dialog>
          <Suspense fallback={<Skeleton className="h-10 w-24 rounded-full" />}>
            <UserMenu />
          </Suspense>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-2 md:w-[300px]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4 space-y-4">
              <Overview transactions={displayedTransactions} />
              <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <RecentTransactions 
                    transactions={displayedTransactions} 
                    onEdit={handleEdit}
                    onDelete={setDeletingTransactionId}
                    onAdd={handleAddTransaction}
                  />
                </div>
                <div className="lg:col-span-1 flex flex-col gap-4">
                  <Budgets budgets={mockBudgets} />
                  <SpendingBreakdown transactions={displayedTransactions} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="calendar" className="mt-4">
              <CalendarView 
                transactions={displayedTransactions}
                onEdit={handleEdit}
                onDelete={setDeletingTransactionId}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <AlertDialog open={!!deletingTransactionId} onOpenChange={(isOpen) => !isOpen && setDeletingTransactionId(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this transaction.
              </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingTransactionId(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDeleteTransaction}>Delete</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
       <AlertDialog open={!!deletingCategory} onOpenChange={(isOpen) => !isOpen && setDeletingCategory(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                  This will permanently delete the category "{deletingCategory}". Transactions using this category will not be deleted.
              </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingCategory(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDeleteCategory}>Delete</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
