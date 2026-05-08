'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/lib/calculations';

interface Props {
  data: { month: string; income: number; expenses: number; net: number }[];
  symbol: string;
}

export function CashFlowChart({ data, symbol }: Props) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barSize={12} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip
          formatter={(value: number) => formatCurrency(value, symbol)}
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
        />
        <Bar dataKey="income" fill="#34d399" radius={[4, 4, 0, 0]} name="Income" />
        <Bar dataKey="expenses" fill="#f472b6" radius={[4, 4, 0, 0]} name="Expenses" />
      </BarChart>
    </ResponsiveContainer>
  );
}
