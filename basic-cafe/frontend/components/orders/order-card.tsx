import Link from "next/link"
import type { Order } from "@/lib/api/orders"
import { OrderStatusBadge } from "./order-status-badge"
import { formatCurrency, formatRelativeTime } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Clock, ShoppingBag } from "lucide-react"
export function OrderCard({ order }: { order: Order }) {
  const total = order.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  return (
    <Link href={`/orders/${order.id}`}>
      <Card className="flex flex-col gap-3 p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between">
          <span className="font-mono text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">{order.id.slice(0, 8)}</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="text-sm font-semibold text-foreground">{order.table ? `Table ${order.table.number}` : "Takeout"}</div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground"><ShoppingBag className="h-3.5 w-3.5" /><span>{order.items.length} items</span></div>
          <span className="font-semibold text-foreground">{formatCurrency(total)}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /><span>{formatRelativeTime(order.openedAt)}</span></div>
      </Card>
    </Link>
  )
}
