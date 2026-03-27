"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { PipelineReport } from "@/lib/api/reports"
import { formatCurrency } from "@/lib/utils"

export function PipelineChart({ data }: { data: PipelineReport }) {
  const chartData = data.stages.map((s) => ({
    name: s.stageName,
    value: s.totalValue,
    count: s.dealCount,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 80, right: 20 }}>
        <XAxis
          type="number"
          tickFormatter={(v) => formatCurrency(Number(v))}
          tick={{ fill: "#71717a", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis type="category" dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value)), "Value"]}
          contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
          labelStyle={{ color: "#fff" }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={`hsl(${239 + i * 15}, 70%, ${60 - i * 5}%)`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
