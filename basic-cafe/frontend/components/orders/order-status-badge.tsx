import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/lib/api/orders"
const config: Record<OrderStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
  ready: { label: "Ready", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  delivered: { label: "Delivered", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  paid: { label: "Paid", className: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" },
  cancelled: { label: "Cancelled", className: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
}
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = config[status]
  return <Badge variant="outline" className={cn("font-medium", className)}>{label}</Badge>
}
