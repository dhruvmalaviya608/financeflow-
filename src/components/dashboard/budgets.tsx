'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { type BudgetCategory } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Image from 'next/image';

type BudgetsProps = {
  budgets: BudgetCategory[];
};

export function Budgets({ budgets }: BudgetsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle>Projects</CardTitle>
             <div>
                <Button variant="ghost" size="sm">Today</Button>
                <Button variant="secondary" size="sm">All</Button>
            </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        {budgets.map((budget) => (
          <div key={budget.name} className="flex items-center justify-between gap-4">
            <div className='flex items-center gap-4'>
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                    {budget.icon}
                </div>
                <div>
                    <p className="text-sm font-medium">{budget.name}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                <Avatar className="h-6 w-6 border-2 border-card">
                  <AvatarImage data-ai-hint="person" src="https://placehold.co/40x40.png" />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <Avatar className="h-6 w-6 border-2 border-card">
                  <AvatarImage data-ai-hint="person" src="https://placehold.co/40x40.png" />
                  <AvatarFallback>B</AvatarFallback>
                </Avatar>
              </div>
              <Progress value={(budget.spent / budget.goal) * 100} className="w-24 h-2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
