import Link from "next/link"
import type { Order } from "@/lib/api/orders"
import { OrderStatusBadge } from "./order-status-badge"
import { formatCurrency, formatRelativeTime } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Hash, Clock, ShoppingBag } from "lucide-react"
export function OrderCard({ order }: { order: Order }) {
  const total = order.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  return (
    <Link href={`/orders/${order.id}`}>
      <Card className="flex flex-col gap-3 p-4 bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2"><Hash className="h-4 w-4 text-zinc-500" /><span className="font-mono text-sm text-zinc-400">{order.id.slice(0, 8)}</span></div>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="text-sm font-medium text-white">{order.table ? `Table ${order.table.number}` : "Takeout"}</div>
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <div className="flex items-center gap-1"><ShoppingBag className="h-3.5 w-3.5" /><span>{order.items.length} items</span></div>
          <span className="font-medium text-white">{formatCurrency(total)}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-zinc-500"><Clock className="h-3 w-3" /><span>{formatRelativeTime(order.openedAt)}</span></div>
      </Card>
    </Link>
  )
}
