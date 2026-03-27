"use client"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/api/query-keys"
import { getOrders } from "@/lib/api/orders"
import { OrderCard } from "@/components/orders/order-card"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { EmptyState } from "@/components/shared/empty-state"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClipboardList } from "lucide-react"
import { useState } from "react"
const statusOptions = [{ value: "all", label: "All Statuses" }, { value: "open", label: "Open" }, { value: "ready", label: "Ready" }, { value: "delivered", label: "Delivered" }, { value: "paid", label: "Paid" }, { value: "cancelled", label: "Cancelled" }]
export default function OrdersPage() {
  const [status, setStatus] = useState("all")
  const filters = status !== "all" ? { status } : undefined
  const { data: orders = [], isLoading } = useQuery({ queryKey: queryKeys.orders(filters), queryFn: () => getOrders(filters) })
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <Select value={status} onValueChange={(value) => setStatus(value ?? "all")}><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent>{statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
      </div>
      {isLoading ? <LoadingSpinner /> : orders.length === 0 ? <EmptyState icon={ClipboardList} title="No orders found" description="Orders will appear here" /> : <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{orders.map((o) => <OrderCard key={o.id} order={o} />)}</div>}
    </div>
  )
}
