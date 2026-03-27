"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { WonLostReport } from "@/lib/api/reports"
import { formatCurrency } from "@/lib/utils"

export function WonLostChart({ data }: { data: WonLostReport }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data.periods} margin={{ right: 20 }}>
        <XAxis dataKey="period" tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => formatCurrency(Number(v))} tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value))]}
          contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
          labelStyle={{ color: "#fff" }}
        />
        <Legend wrapperStyle={{ color: "#a1a1aa", fontSize: 12 }} />
        <Line type="monotone" dataKey="wonValue" name="Won" stroke="#34d399" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="lostValue" name="Lost" stroke="#f87171" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
