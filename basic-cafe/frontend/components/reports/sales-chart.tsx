"use client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"
interface SalesChartProps { data: { date: string; revenue: number }[] }
export function SalesChart({ data }: SalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 12 }} />
        <YAxis tickFormatter={(v: number) => formatCurrency(v)} tick={{ fill: "#71717a", fontSize: 12 }} />
        <Tooltip formatter={(value) => [formatCurrency(Number(value ?? 0)), "Revenue"]} contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }} labelStyle={{ color: "#a1a1aa" }} />
        <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
