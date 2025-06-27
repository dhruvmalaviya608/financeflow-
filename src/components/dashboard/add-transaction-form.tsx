'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Transaction, TransactionCategory, Account } from '@/types';
import { categories, accounts } from '@/data/mock-data';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '../ui/date-picker';
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

const FormSchema = z.object({
  description: z.string().optional(),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  type: z.enum(['income', 'expense', 'transfer']),
  category: z.custom<TransactionCategory>(),
  account: z.custom<Account>(),
  date: z.date({
    required_error: "A date is required.",
  }),
});

type AddTransactionFormProps = {
  onFormSubmit: (data: Omit<Transaction, 'id' | 'description'> & { description: string }, id?: string) => void;
  setDialogOpen: (open: boolean) => void;
  initialData?: Transaction | null;
};

export function AddTransactionForm({ onFormSubmit, setDialogOpen, initialData }: AddTransactionFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialData ? {
        ...initialData
    } : {
      description: '',
      amount: 0,
      type: 'expense',
      category: 'Food',
      account: 'Cash',
      date: new Date(),
    },
  });
  
  React.useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({
        description: '',
        amount: 0,
        type: 'expense',
        category: 'Food',
        account: 'Cash',
        date: new Date(),
      });
    }
  }, [initialData, form]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    onFormSubmit({
        ...data,
        description: data.description || '',
    }, initialData?.id);
    toast({
      title: `Transaction ${initialData ? 'updated' : 'added'}!`,
      description: `${data.description || 'Transaction'} for ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.amount)} has been logged.`,
    })
    setDialogOpen(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Tabs
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="income">Income</TabsTrigger>
                    <TabsTrigger value="expense">Expense</TabsTrigger>
                    <TabsTrigger value="transfer">Transfer</TabsTrigger>
                  </TabsList>
                </Tabs>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>Date & Time</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="account"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Account</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Select an account" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {accounts.map((acc) => (
                        <SelectItem key={acc} value={acc}>{acc}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Category</FormLabel>
                    <div className="flex items-center gap-2">
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="icon" className="flex-shrink-0">
                        <Plus className="h-4 w-4" />
                    </Button>
                    </div>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                        <Input 
                        type="number"
                        placeholder="0.00" 
                        {...field}
                        className="pl-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Add a note about this transaction" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">{initialData ? 'Update Transaction' : 'Save Transaction'}</Button>
      </form>
    </Form>
  );
}
