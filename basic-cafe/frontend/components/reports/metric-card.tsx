import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
interface MetricCardProps { title: string; value: string; icon: LucideIcon; trend?: string; trendUp?: boolean }
export function MetricCard({ title, value, icon: Icon, trend, trendUp }: MetricCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          {trend && <p className={cn("mt-1 text-xs font-medium", trendUp ? "text-emerald-600" : "text-destructive")}>{trend}</p>}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
      </div>
    </Card>
  )
}
