import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
interface MetricCardProps { title: string; value: string; icon: LucideIcon; trend?: string; trendUp?: boolean }
export function MetricCard({ title, value, icon: Icon, trend, trendUp }: MetricCardProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
          {trend && <p className={cn("mt-1 text-xs", trendUp ? "text-emerald-400" : "text-rose-400")}>{trend}</p>}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10"><Icon className="h-5 w-5 text-indigo-400" /></div>
      </div>
    </Card>
  )
}
