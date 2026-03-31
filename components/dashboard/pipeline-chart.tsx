"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface PipelineChartProps {
  data: { stage: string; count: number; value: number }[]
}

function formatUSD(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`
  return `$${n}`
}

export function PipelineChart({ data }: PipelineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <YAxis tickFormatter={formatUSD} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={50} />
        <Tooltip
          formatter={(value, name) => [
            name === 'value' ? formatUSD(Number(value)) : value,
            name === 'value' ? 'Deal Value' : 'Count'
          ]}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
        />
        <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]} name="value" />
      </BarChart>
    </ResponsiveContainer>
  )
}
