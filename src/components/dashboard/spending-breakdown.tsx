'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';

type SpendingBreakdownProps = {
  transactions: Transaction[];
};

const COLORS = [
    'hsl(var(--chart-1))', 
    'hsl(var(--chart-2))', 
    'hsl(var(--chart-3))', 
    'hsl(var(--chart-4))', 
    'hsl(var(--chart-5))',
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Category
            </span>
            <span className="font-bold text-muted-foreground">
              {payload[0].name}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Amount
            </span>
            <span className="font-bold">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[0].value)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function SpendingBreakdown({ transactions }: SpendingBreakdownProps) {
  const { data, totalExpenses } = useMemo(() => {
    const expenseData = transactions
      .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
      .reduce((acc, transaction) => {
        const category = transaction.category;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += transaction.amount;
        return acc;
      }, {} as Record<string, number>);

    const total = Object.values(expenseData).reduce((sum, amount) => sum + amount, 0);
    const chartData = Object.entries(expenseData).map(([name, value]) => ({ name, value }));
    
    return { data: chartData.sort((a,b) => b.value - a.value), totalExpenses: total };
  }, [transactions]);

  if(data.length === 0) {
    return (
       <Card>
        <CardHeader>
          <CardTitle>Spending Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
            <p className="text-muted-foreground">No expense data for this month.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              labelLine={false}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                if (percent < 0.05) return null;
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                return (
                  <text x={x} y={y} fill="hsl(var(--card-foreground))" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={entry.value > 0 ? 'hsl(var(--background))' : 'none'} strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-3">
            {data.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-muted-foreground">{entry.name}</span>
                    </div>
                    <div className="font-medium text-right">
                        <span className="text-foreground">{formatCurrency(entry.value)}</span>
                        <span className="ml-4 w-12 inline-block text-right text-muted-foreground">
                            ({totalExpenses > 0 ? ((entry.value / totalExpenses) * 100).toFixed(0) : 0}%)
                        </span>
                    </div>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
