
'use client';

import { useMemo, useState, useEffect } from 'react';
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Transaction } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { MoreHorizontal, Pencil, Plus, Trash2, ChevronsUpDown, Camera } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import ImageGalleryDialog from './image-gallery-dialog';

type RecentTransactionsProps = {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onAdd: (date?: Date) => void;
  viewMode: 'daily' | 'monthly' | 'yearly';
  onViewModeChange: (mode: 'daily' | 'monthly' | 'yearly') => void;
  enableBulkDelete?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
};

type TransactionsByGroup = {
  key: string;
  date: Date;
  transactions: Transaction[];
  income: number;
  expense: number;
};

export default function RecentTransactions({ 
  transactions, 
  onEdit, 
  onDelete, 
  onAdd, 
  viewMode, 
  onViewModeChange,
  enableBulkDelete = false,
  selectedIds = new Set(),
  onSelectionChange = () => {},
}: RecentTransactionsProps) {

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [imagesToShow, setImagesToShow] = useState<string[]>([]);

  const handleOpenGallery = (urls: string[]) => {
    if (urls && urls.length > 0) {
      setImagesToShow(urls);
      setGalleryOpen(true);
    }
  };

  const groupedTransactions = useMemo(() => {
    let groupBy: (t: Transaction) => string;
    if (viewMode === 'daily') {
      groupBy = (t: Transaction) => format(t.date, 'yyyy-MM-dd');
    } else if (viewMode === 'monthly') {
      groupBy = (t: Transaction) => format(t.date, 'yyyy-MM');
    } else if (viewMode === 'yearly') {
      groupBy = (t: Transaction) => format(t.date, 'yyyy');
    } else {
      return [];
    }
    
    const groups = [...transactions].reduce((acc, transaction) => {
        const dateKey = groupBy(transaction);
        if (!acc[dateKey]) {
            acc[dateKey] = {
                key: dateKey,
                date: transaction.date,
                transactions: [],
                income: 0,
                expense: 0,
            };
        }
        acc[dateKey].transactions.push(transaction);
        if (transaction.currency === 'USD') {
            if (transaction.type === 'income') {
                acc[dateKey].income += transaction.amount;
            } else if (transaction.type === 'expense') {
                acc[dateKey].expense += transaction.amount;
            }
        }
        return acc;
    }, {} as Record<string, TransactionsByGroup>);

    const groupsAsArray = Object.values(groups);

    for (const group of groupsAsArray) {
      group.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    groupsAsArray.sort((a, b) => new Date(b.key).getTime() - new Date(a.key).getTime());

    return groupsAsArray;
  }, [transactions, viewMode]);
  
  const allItemKeys = useMemo(() => groupedTransactions.map(g => g.key), [groupedTransactions]);
  const [openItems, setOpenItems] = useState<string[]>(allItemKeys);

  useEffect(() => {
    setOpenItems(groupedTransactions.map(g => g.key));
  }, [groupedTransactions]);

  const allVisibleTransactionIds = useMemo(() => 
    groupedTransactions.flatMap(group => group.transactions.map(t => t.id)),
    [groupedTransactions]
  );

  const selectedVisibleCount = allVisibleTransactionIds.filter(id => selectedIds.has(id)).length;
  const isAllSelected = selectedVisibleCount > 0 && selectedVisibleCount === allVisibleTransactionIds.length;
  const isSomeSelected = selectedVisibleCount > 0 && selectedVisibleCount < allVisibleTransactionIds.length;
  const masterCheckboxState = isAllSelected ? true : isSomeSelected ? 'indeterminate' : false;

  const handleMasterSelect = (checked: boolean | 'indeterminate') => {
    const newSelectedIds = new Set(selectedIds);
    if (checked === true) {
      allVisibleTransactionIds.forEach(id => newSelectedIds.add(id));
    } else {
      allVisibleTransactionIds.forEach(id => newSelectedIds.delete(id));
    }
    onSelectionChange(newSelectedIds);
  };

  const areAllOpen = openItems.length === allItemKeys.length && allItemKeys.every(key => openItems.includes(key));

  const toggleAll = () => {
    if (areAllOpen) {
      setOpenItems([]);
    } else {
      setOpenItems(allItemKeys);
    }
  };

  const getGroupTitle = (date: Date) => {
      if (viewMode === 'daily') {
          return {
              main: format(date, 'dd'),
              sub: format(date, 'EEE'),
          };
      }
      if (viewMode === 'monthly') {
          return {
              main: format(date, 'MMMM'),
              sub: format(date, 'yyyy'),
          };
      }
      if (viewMode === 'yearly') {
          return {
              main: format(date, 'yyyy'),
              sub: '',
          };
      }
      return { main: '', sub: '' };
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {enableBulkDelete && allVisibleTransactionIds.length > 0 && (
                  <Checkbox
                    checked={masterCheckboxState}
                    onCheckedChange={handleMasterSelect}
                    aria-label="Select all transactions in this view"
                    className="shrink-0"
                  />
                )}
                <CardTitle>Transactions</CardTitle>
                {groupedTransactions.length > 0 && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleAll}>
                    <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">{areAllOpen ? 'Collapse all' : 'Expand all'}</span>
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-1">
                  <Button variant={viewMode === 'daily' ? 'secondary' : 'ghost'} size="sm" onClick={() => onViewModeChange('daily')}>Daily</Button>
                  <Button variant={viewMode === 'monthly' ? 'secondary' : 'ghost'} size="sm" onClick={() => onViewModeChange('monthly')}>Monthly</Button>
                  <Button variant={viewMode === 'yearly' ? 'secondary' : 'ghost'} size="sm" onClick={() => onViewModeChange('yearly')}>Yearly</Button>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          {groupedTransactions.length > 0 ? (
            <Accordion 
              type="multiple" 
              className="w-full space-y-4" 
              value={openItems}
              onValueChange={setOpenItems}
            >
              {groupedTransactions.map(({ key, date, transactions: dayTransactions, income, expense }) => {
                const { main: titleMain, sub: titleSub } = getGroupTitle(date);
                const groupTransactionIds = dayTransactions.map(t => t.id);
                
                const handleGroupSelect = (checked: boolean | 'indeterminate') => {
                  const newSelectedIds = new Set(selectedIds);
                  if (checked === true) {
                    groupTransactionIds.forEach(id => newSelectedIds.add(id));
                  } else {
                    groupTransactionIds.forEach(id => newSelectedIds.delete(id));
                  }
                  onSelectionChange(newSelectedIds);
                };
                
                const selectedInGroupCount = groupTransactionIds.filter(id => selectedIds.has(id)).length;
                const isGroupSelected = selectedInGroupCount > 0 && selectedInGroupCount === groupTransactionIds.length 
                    ? true 
                    : selectedInGroupCount > 0 
                        ? 'indeterminate' 
                        : false;

                return (
                  <AccordionItem value={key} key={key} className="border-b-0">
                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        {enableBulkDelete && (
                          <Checkbox
                            checked={isGroupSelected}
                            onCheckedChange={handleGroupSelect}
                            aria-label="Select all transactions in this group"
                            className="shrink-0"
                          />
                        )}
                        <AccordionTrigger className="flex-initial justify-start p-0 hover:no-underline [&_svg]:ml-2">
                          <div className="flex items-baseline gap-3">
                              <span className="text-3xl font-bold">{titleMain}</span>
                              <span className="text-sm text-muted-foreground">{titleSub}</span>
                          </div>
                        </AccordionTrigger>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm font-semibold">
                          {income > 0 && <span className="text-primary">{formatCurrency(income, 'USD')}</span>}
                          {expense > 0 && <span className="text-destructive">{formatCurrency(expense, 'USD')}</span>}
                      </div>
                    </div>
                    <AccordionContent className="pt-0">
                      <div className={cn("space-y-4", enableBulkDelete ? "pl-9" : "pl-10")}>
                        {dayTransactions.map(transaction => {
                          const handleSelect = (checked: boolean) => {
                            const newSelectedIds = new Set(selectedIds);
                            if (checked) {
                                newSelectedIds.add(transaction.id);
                            } else {
                                newSelectedIds.delete(transaction.id);
                            }
                            onSelectionChange(newSelectedIds);
                          };
                          
                          return (
                            <div key={transaction.id} className="group flex items-start gap-4">
                                {enableBulkDelete && (
                                  <div className="pt-1">
                                    <Checkbox
                                        checked={selectedIds.has(transaction.id)}
                                        onCheckedChange={handleSelect}
                                        aria-label={`Select transaction ${transaction.description}`}
                                    />
                                  </div>
                                )}
                                <div className="grid gap-0.5 flex-1">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                          <p className="font-medium leading-none">{transaction.description}</p>
                                          {transaction.imageUrls && transaction.imageUrls.length > 0 && (
                                            <button onClick={() => handleOpenGallery(transaction.imageUrls!)}>
                                                <Camera className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                            </button>
                                          )}
                                        </div>
                                        <div className="flex items-center -mt-1 -mr-2">
                                            <p className={`font-semibold text-right ${transaction.type === 'income' ? 'text-primary' : transaction.type === 'expense' ? 'text-destructive' : ''}`}>
                                                {transaction.type !== 'transfer' && (transaction.type === 'income' ? '+' : '-')}
                                                {formatCurrency(transaction.amount, transaction.currency)}
                                            </p>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => onAdd(date)}>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        <span>Add New</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onSelect={() => onEdit(transaction)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        <span>Edit</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => onDelete(transaction.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span>Delete</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{transaction.category} · {transaction.account}</p>
                                </div>
                            </div>
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
              <div className="text-center text-muted-foreground py-10">
                  <p>No transactions to display.</p>
              </div>
          )}
        </CardContent>
      </Card>
      <ImageGalleryDialog
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        imageUrls={imagesToShow}
      />
    </>
  );
}
