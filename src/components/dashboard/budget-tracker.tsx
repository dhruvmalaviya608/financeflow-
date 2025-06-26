'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { Pencil } from 'lucide-react';

type BudgetTrackerProps = {
  budget: number;
  onSetBudget: (newBudget: number) => void;
  currentSpending: number;
};

export default function BudgetTracker({ budget, onSetBudget, currentSpending }: BudgetTrackerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budget);

  const progress = (currentSpending / budget) * 100;
  const remaining = budget - currentSpending;

  const handleSave = () => {
    onSetBudget(newBudget);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>Budget Tracker</span>
           <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)} className="h-6 w-6">
            <Pencil className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>Your spending progress for this month.</CardDescription>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="flex gap-2">
            <Input 
              type="number"
              value={newBudget}
              onChange={(e) => setNewBudget(Number(e.target.value))}
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <Button onClick={handleSave}>Save</Button>
          </div>
        ) : (
          <>
            <div className="mb-2 flex justify-between items-baseline">
                <span className="text-2xl font-bold">{formatCurrency(currentSpending)}</span>
                <span className="text-sm text-muted-foreground">/ {formatCurrency(budget)}</span>
            </div>
            <Progress value={progress > 100 ? 100 : progress} className="h-3" />
          </>
        )}
      </CardContent>
      <CardFooter>
         <p className={`text-sm ${remaining < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
          {remaining >= 0
            ? `${formatCurrency(remaining)} remaining`
            : `${formatCurrency(Math.abs(remaining))} over budget`}
        </p>
      </CardFooter>
    </Card>
  );
}
