
'use client';

import { useMemo, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


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
              {formatCurrency(payload[0].value, 'USD')}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// For Labeled Pie chart
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
  const radius = outerRadius + 25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);
  const sx = cx + (outerRadius + 5) * cos;
  const sy = cy + (outerRadius + 5) * sin;
  const mx = cx + (outerRadius + 15) * cos;
  const my = cy + (outerRadius + 15) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 12;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  if (percent < 0.025) return null;

  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke="hsl(var(--muted-foreground))" fill="none" />
      <circle cx={sx} cy={sy} r={2} fill="hsl(var(--muted-foreground))" stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 6} y={ey} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))" fontSize={10}>
        {name}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 6} y={ey} dy={12} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))" fontSize={10}>
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};


export default function SpendingBreakdown({ transactions }: SpendingBreakdownProps) {
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'radar' | 'line' | 'area' | 'detailed-pie'>('pie');

  const { data, totalExpenses } = useMemo(() => {
    const expenseData = transactions
      .filter(t => t.type === 'expense' && t.currency === 'USD')
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

  const renderChart = () => {
    switch (chartType) {
      case 'detailed-pie':
        return (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={100} 
                tick={{ fontSize: 12 }} 
                tickLine={false} 
                axisLine={false} 
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Radar name="Spending" dataKey="value" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 25 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }} stroke="hsl(var(--muted-foreground))" interval={0} height={40} />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--chart-1))" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 25 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }} stroke="hsl(var(--muted-foreground))" interval={0} height={40} />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
      default:
        return (
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
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle>Spending Breakdown</CardTitle>
            <Select value={chartType} onValueChange={(value) => setChartType(value as any)}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pie">Donut Chart</SelectItem>
                <SelectItem value="detailed-pie">Detailed Pie</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="radar">Radar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
              </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
        <div className="mt-4 space-y-3">
            {data.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-muted-foreground">{entry.name}</span>
                    </div>
                    <div className="font-medium text-right">
                        <span className="text-foreground">{formatCurrency(entry.value, 'USD')}</span>
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
