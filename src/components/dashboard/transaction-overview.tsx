'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { generate14DayTransactionData } from '@/data/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { formatCurrency } from '@/lib/utils';

const data = generate14DayTransactionData();

export function TransactionOverview() {
  return (
     <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Transaction overview</CardTitle>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="text-sm text-muted-foreground">Profit</span>
                            <span className="text-sm font-semibold">{formatCurrency(4573, 'USD')}</span>
                        </div>
                         <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            <span className="text-sm text-muted-foreground">Expenses</span>
                            <span className="text-sm font-semibold">{formatCurrency(523, 'USD')}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">Monthly</Button>
                    <Button variant="secondary" size="sm">Yearly</Button>
                </div>
            </div>
        </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value / 1000}k`}
            />
             <Tooltip
                cursor={{ fill: 'hsl(var(--secondary))' }}
                content={({ active, payload }) => {
                if (active && payload && payload.length) {
                    return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-1 gap-1.5">
                            <span className="text-sm text-muted-foreground">{payload[0].payload.name}</span>
                            <span className="font-bold">
                                {formatCurrency(payload[0].value as number, 'USD')}
                            </span>
                        </div>
                    </div>
                    )
                }
                return null
                }}
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
