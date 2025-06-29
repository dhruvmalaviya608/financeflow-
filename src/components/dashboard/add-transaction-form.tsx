
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
import { accounts } from '@/data/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, CreditCard, Folder, DollarSign, Pen, Plus, Trash2, Pencil, Check, X, Camera } from 'lucide-react';
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn, formatCurrency } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { Label } from '../ui/label';
import { useHotkeys } from '@/hooks/use-hotkeys';

const FormSchema = z.object({
  description: z.string().optional(),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  type: z.enum(['income', 'expense', 'transfer']),
  category: z.string().min(1, { message: 'Category is required.' }),
  account: z.custom<Account>(),
  date: z.date({
    required_error: "A date is required.",
  }),
  currency: z.string().min(2, { message: 'Currency is required.' }),
  imageUrls: z.array(z.string()).optional(),
});

const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'JPY', symbol: '¥' },
  { code: 'GBP', symbol: '£' },
  { code: 'INR', symbol: '₹' },
];

type AddTransactionFormProps = {
  onFormSubmit: (data: Omit<Transaction, 'id' | 'description'> & { description: string }, id?: string) => void;
  setDialogOpen: (open: boolean) => void;
  initialData?: Transaction | null;
  transactionDate?: Date | null;
  initialType?: 'income' | 'expense' | 'transfer';
  categories: TransactionCategory[];
  onAddCategory: (category: TransactionCategory) => void;
  onEditCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (name: string) => void;
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

const ManageCategoriesDialog = ({ categories, onAddCategory, onEditCategory, onDeleteCategory, onSelectCategory, setOpen }: { 
    categories: TransactionCategory[],
    onAddCategory: (category: TransactionCategory) => void;
    onEditCategory: (oldName: string, newName: string) => void;
    onDeleteCategory: (name: string) => void;
    onSelectCategory: (category: string) => void;
    setOpen: (open: boolean) => void;
}) => {
    const { toast } = useToast();
    const [newCategoryName, setNewCategoryName] = React.useState('');
    const [editingCategory, setEditingCategory] = React.useState<string | null>(null);
    const [editingValue, setEditingValue] = React.useState('');

    const handleAdd = () => {
        const newCat = newCategoryName.trim();
        if (newCat && !categories.includes(newCat)) {
            onAddCategory(newCat);
            setNewCategoryName('');
        } else if (categories.includes(newCat)) {
             toast({
                title: 'Category Exists',
                description: `Category "${newCat}" already exists.`,
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (category: string) => {
        setEditingCategory(category);
        setEditingValue(category);
    };

    const handleSaveEdit = (oldName: string) => {
        const newName = editingValue.trim();
        if (newName && newName !== oldName && !categories.includes(newName)) {
            onEditCategory(oldName, newName);
            setEditingCategory(null);
        } else if (categories.includes(newName) && newName !== oldName) {
            toast({ title: 'Category Exists', description: `Category "${newName}" already exists.`, variant: 'destructive'});
        } else {
             setEditingCategory(null);
        }
    };

    const handleDelete = (category: string) => {
        onDeleteCategory(category);
    };

    const handleSelect = (category: string) => {
        onSelectCategory(category);
        setOpen(false);
    }
    
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Manage Categories</DialogTitle>
                <DialogDescription>Add, edit, or delete your transaction categories.</DialogDescription>
            </DialogHeader>
            <div className="flex w-full items-center space-x-2">
                <Input
                    placeholder="New category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAdd();}}}
                />
                <Button type="button" onClick={handleAdd}>Add</Button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {categories.map((category) => (
                <div key={category} className="flex items-center justify-between gap-2 rounded-lg p-1 group">
                    {editingCategory === category ? (
                        <div className="flex flex-1 items-center gap-2">
                            <Input
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleSaveEdit(category);}}}
                                autoFocus
                                className="h-8"
                            />
                            <Button type="button" size="icon" className="h-8 w-8" onClick={() => handleSaveEdit(category)}><Check className="h-4 w-4" /></Button>
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingCategory(null)}><X className="h-4 w-4" /></Button>
                        </div>
                    ) : (
                        <>
                            <Button variant="link" className="p-0 h-auto font-normal text-base text-foreground" onClick={() => handleSelect(category)}>{category}</Button>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(category)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(category)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
                ))}
            </div>
        </DialogContent>
    );
};


export function AddTransactionForm({ onFormSubmit, setDialogOpen, initialData, transactionDate, initialType = 'expense', categories, onAddCategory, onEditCategory, onDeleteCategory }: AddTransactionFormProps) {
  const { toast } = useToast();
  const [isManageCategoryOpen, setManageCategoryOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialData ? {
        ...initialData,
        imageUrls: initialData.imageUrls || [],
    } : {
      description: '',
      amount: 0,
      type: initialType,
      category: 'Food',
      account: 'Cash',
      date: transactionDate || new Date(),
      currency: 'USD',
      imageUrls: [],
    },
  });

  const submitButtonRef = React.useRef<HTMLButtonElement>(null);
  
  useHotkeys([
    {
      keys: ['ctrl', 's'],
      callback: (event) => {
        event.preventDefault();
        submitButtonRef.current?.click();
      },
    }
  ], []);

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        imageUrls: initialData.imageUrls || [],
      });
    } else {
      form.reset({
        description: '',
        amount: 0,
        type: initialType,
        category: 'Food',
        account: 'Cash',
        date: transactionDate || new Date(),
        currency: 'USD',
        imageUrls: [],
      });
    }
  }, [initialData, transactionDate, initialType, form]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    onFormSubmit({
        ...data,
        description: data.description || '',
    }, initialData?.id);
    toast({
      title: `Transaction ${initialData ? 'updated' : 'added'}!`,
      description: `${data.category} for ${formatCurrency(data.amount, data.currency)} has been logged.`,
    })
    setDialogOpen(false);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const currentUrls = form.getValues('imageUrls') || [];
    if (currentUrls.length + files.length > 5) {
      toast({
        title: 'Image limit reached',
        description: 'You can upload a maximum of 5 images per transaction.',
        variant: 'destructive',
      });
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newUrls = [...(form.getValues('imageUrls') || []), reader.result as string];
        form.setValue('imageUrls', newUrls, { shouldValidate: true, shouldDirty: true });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePreview = (indexToRemove: number) => {
    const currentUrls = form.getValues('imageUrls') || [];
    const updatedUrls = currentUrls.filter((_, index) => index !== indexToRemove);
    form.setValue('imageUrls', updatedUrls, { shouldValidate: true, shouldDirty: true });
  };

  const transactionType = form.watch('type');
  const imageUrls = form.watch('imageUrls') || [];

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
                  value={field.value}
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
                      <Dialog open={isManageCategoryOpen} onOpenChange={setManageCategoryOpen}>
                        <DialogTrigger asChild>
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <ManageCategoriesDialog 
                            categories={categories}
                            onAddCategory={onAddCategory}
                            onEditCategory={onEditCategory}
                            onDeleteCategory={onDeleteCategory}
                            onSelectCategory={(category) => form.setValue('category', category, { shouldValidate: true })}
                            setOpen={setManageCategoryOpen}
                        />
                      </Dialog>
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
                    <div className="flex items-center">
                      <FormField
                          control={form.control}
                          name="currency"
                          render={({ field: currencyField }) => (
                              <Select onValueChange={currencyField.onChange} defaultValue={currencyField.value}>
                                  <SelectTrigger className="w-auto border-0 focus:ring-0 p-0 h-auto justify-end bg-transparent font-semibold text-base">
                                      <SelectValue placeholder="$" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {currencies.map((c) => (
                                          <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code}</SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                          )}
                      />
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="0.00" 
                          {...field}
                          className="w-auto p-0 h-auto border-0 text-right focus-visible:ring-0 bg-transparent text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </FormControl>
                    </div>
                </FormItem>
                )}
            />
        </div>
         <div className="text-destructive text-sm min-h-[1.25rem]">
            {form.formState.errors.amount?.message ? <p>{form.formState.errors.amount?.message}</p> : null}
            {form.formState.errors.category?.message ? <p>{form.formState.errors.category?.message}</p> : null}
            {form.formState.errors.currency?.message ? <p>{form.formState.errors.currency?.message}</p> : null}
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
        
        <div className="space-y-2">
            <Label className="flex items-center gap-3 text-card-foreground"><Camera className="w-5 h-5 text-muted-foreground" /> Attachments</Label>
            <div className="flex flex-wrap gap-2">
                {imageUrls.map((src, index) => (
                <div key={index} className="relative w-20 h-20 group">
                    <Image src={src} alt={`preview ${index}`} fill className="object-cover rounded-md" />
                    <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemovePreview(index)}
                    >
                    <X className="h-4 w-4" />
                    </Button>
                </div>
                ))}
                {imageUrls.length < 5 && (
                <Button
                    type="button"
                    variant="outline"
                    className="w-20 h-20 flex flex-col items-center justify-center text-muted-foreground hover:text-foreground"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Plus className="h-6 w-6" />
                    <span className="text-xs mt-1">Add Photo</span>
                </Button>
                )}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handleFileChange}
            />
        </div>

        <div className="pt-2">
            <Button ref={submitButtonRef} type="submit" className={cn( "w-full", typeColors[transactionType] )}>
                {initialData ? 'Update Transaction' : 'Save Transaction'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
