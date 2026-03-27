import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/lib/api/orders"
const config: Record<OrderStatus, { label: string; className: string }> = {
  open:      { label: "Open",      className: "bg-blue-50 text-blue-700 border-blue-200" },
  ready:     { label: "Ready",     className: "bg-amber-50 text-amber-700 border-amber-200" },
  delivered: { label: "Delivered", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  paid:      { label: "Paid",      className: "bg-secondary text-muted-foreground border-border" },
  cancelled: { label: "Cancelled", className: "bg-red-50 text-red-700 border-red-200" },
}
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const entry = config[status] ?? config.open
  return <Badge variant="outline" className={cn("font-medium text-xs", entry.className)}>{entry.label}</Badge>
}
