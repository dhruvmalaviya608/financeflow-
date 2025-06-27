
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
import { Calendar as CalendarIcon, CreditCard, Folder, DollarSign, Pen, Plus } from 'lucide-react';
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

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

const InlineDatePicker = ({ date, setDate }: { date: Date, setDate: (date: Date | undefined) => void }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"ghost"}
          className={cn(
            "w-auto justify-end text-right font-normal p-0 h-auto hover:bg-transparent",
            !date && "text-muted-foreground"
          )}
        >
          {date ? format(date, "MM/dd/yy (E) h:mm a") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

const InlineSelect = ({ value, onValueChange, placeholder, items }: { value: string, onValueChange: (value: string) => void, placeholder: string, items: readonly string[] }) => {
  return (
    <Select onValueChange={onValueChange} defaultValue={value}>
        <SelectTrigger className="w-auto border-0 text-right p-0 h-auto justify-end focus:ring-0">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item} value={item}>{item}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

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
      description: `${data.category} for ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.amount)} has been logged.`,
    })
    setDialogOpen(false);
  }

  const transactionType = form.watch('type');
  const typeColors = {
    income: 'bg-blue-500 hover:bg-blue-600 text-white',
    expense: 'bg-pink-500 hover:bg-pink-600 text-white',
    transfer: 'bg-slate-500 hover:bg-slate-600 text-white',
  };

  const typeTabColors = {
    income: 'data-[state=active]:bg-blue-500 data-[state=active]:text-blue-50',
    expense: 'data-[state=active]:bg-pink-500 data-[state=active]:text-pink-50',
    transfer: 'data-[state=active]:bg-slate-500 data-[state=active]:text-slate-50',
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
                    <TabsTrigger value="income" className={cn("rounded-md", typeTabColors.income)}>Income</TabsTrigger>
                    <TabsTrigger value="expense" className={cn("rounded-md", typeTabColors.expense)}>Expense</TabsTrigger>
                    <TabsTrigger value="transfer" className={cn("rounded-md", typeTabColors.transfer)}>Transfer</TabsTrigger>
                  </TabsList>
                </Tabs>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="rounded-lg border">
            <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 border-b">
                    <FormLabel className="flex items-center gap-3 text-card-foreground"><CalendarIcon className="w-5 h-5 text-muted-foreground" /> Date</FormLabel>
                    <FormControl>
                        <InlineDatePicker date={field.value} setDate={field.onChange} />
                    </FormControl>
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="account"
                render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 border-b">
                    <FormLabel className="flex items-center gap-3 text-card-foreground"><CreditCard className="w-5 h-5 text-muted-foreground" /> Account</FormLabel>
                    <FormControl>
                      <InlineSelect value={field.value} onValueChange={field.onChange} placeholder="Select account" items={accounts} />
                    </FormControl>
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3 border-b">
                    <FormLabel className="flex items-center gap-3 text-card-foreground"><Folder className="w-5 h-5 text-muted-foreground" /> Category</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <InlineSelect value={field.value} onValueChange={field.onChange} placeholder="Select category" items={categories} />
                      </FormControl>
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6">
                          <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3">
                    <FormLabel className="flex items-center gap-3 text-card-foreground"><DollarSign className="w-5 h-5 text-muted-foreground" /> Amount</FormLabel>
                    <FormControl>
                    <div className="relative flex items-center">
                        <span className="text-card-foreground">$</span>
                        <Input 
                        type="number"
                        placeholder="0.00" 
                        {...field}
                        className="w-auto p-0 h-auto border-0 text-right focus-visible:ring-0 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                    </FormControl>
                </FormItem>
                )}
            />
        </div>
         <div className="text-destructive text-sm min-h-[1.25rem]">
            {form.formState.errors.amount?.message ? <p>{form.formState.errors.amount?.message}</p> : null}
         </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="flex items-start gap-3 p-3 rounded-lg border">
              <FormLabel className="pt-2"><Pen className="w-5 h-5 text-muted-foreground" /></FormLabel>
              <FormControl>
                <Textarea placeholder="Note" {...field} value={field.value ?? ''} className="border-0 focus-visible:ring-0 p-0 resize-none bg-transparent" />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="pt-2">
            <Button type="submit" className={cn( "w-full", typeColors[transactionType] )}>
                {initialData ? 'Update Transaction' : 'Save Transaction'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
