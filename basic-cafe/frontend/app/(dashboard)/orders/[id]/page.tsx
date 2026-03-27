"use client"
import { use, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/api/query-keys"
import { getOrder, updateOrderStatus, removeOrderItem, type OrderStatus } from "@/lib/api/orders"
import { OrderItemRow } from "@/components/orders/order-item-row"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { AddItemSheet } from "@/components/orders/add-item-sheet"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, CreditCard } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
const statusFlow: Partial<Record<OrderStatus, OrderStatus>> = { open: "ready", ready: "delivered" }
const statusActionLabel: Partial<Record<OrderStatus, string>> = { open: "Mark Ready", ready: "Mark Delivered" }
export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const queryClient = useQueryClient()
  const [addItemOpen, setAddItemOpen] = useState(false)
  const { data: order, isLoading } = useQuery({ queryKey: queryKeys.order(id), queryFn: () => getOrder(id) })
  const { mutate: changeStatus, isPending: statusPending } = useMutation({ mutationFn: (status: OrderStatus) => updateOrderStatus(id, status), onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.order(id) }); toast.success("Order status updated") }, onError: () => toast.error("Failed to update status") })
  const { mutate: removeItem } = useMutation({ mutationFn: (itemId: string) => removeOrderItem(id, itemId), onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.order(id) }), onError: () => toast.error("Failed to remove item") })
  if (isLoading) return <LoadingSpinner />
  if (!order) return <div className="text-muted-foreground">Order not found</div>
  const total = order.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const nextStatus = statusFlow[order.status]
  const isEditable = order.status === "open"
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{order.table ? `Table ${order.table.number}` : "Takeout"}</h1>
          <p className="text-sm text-muted-foreground font-mono mt-0.5">{order.id}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(order.openedAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Items</h2>
          {isEditable && <Button size="sm" variant="outline" onClick={() => setAddItemOpen(true)} className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Item</Button>}
        </div>
        <div className="divide-y divide-border">
          {order.items.map((item) => <OrderItemRow key={item.id} item={item} editable={isEditable} onRemove={removeItem} />)}
          {order.items.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No items yet</p>}
        </div>
        <Separator className="my-3" />
        <div className="flex justify-between text-lg font-bold">
          <span className="text-muted-foreground">Total</span>
          <span className="text-foreground">{formatCurrency(total)}</span>
        </div>
      </div>
      <div className="flex gap-3">
        {nextStatus && <Button onClick={() => changeStatus(nextStatus)} disabled={statusPending} className="flex-1">{statusActionLabel[order.status]}</Button>}
        {order.status === "delivered" && (
          <Link href={`/checkout/${order.id}`} className="flex-1">
            <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"><CreditCard className="h-4 w-4" /> Proceed to Checkout</Button>
          </Link>
        )}
      </div>
      <AddItemSheet open={addItemOpen} onOpenChange={setAddItemOpen} orderId={id} />
    </div>
  )
}
