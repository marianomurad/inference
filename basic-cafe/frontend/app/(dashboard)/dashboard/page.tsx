"use client"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/api/query-keys"
import { getTables } from "@/lib/api/tables"
import { getOrders } from "@/lib/api/orders"
import { getLowStock } from "@/lib/api/inventory"
import { MetricCard } from "@/components/reports/metric-card"
import { OrderCard } from "@/components/orders/order-card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Grid3X3, ClipboardList, TrendingUp, AlertTriangle, Plus } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
export default function DashboardPage() {
  const { data: tables = [] } = useQuery({ queryKey: queryKeys.tables(), queryFn: getTables, refetchInterval: 30_000 })
  const { data: orders = [], isLoading } = useQuery({ queryKey: queryKeys.orders({ status: "open" }), queryFn: () => getOrders({ status: "open" }), refetchInterval: 30_000 })
  const { data: lowStock = [] } = useQuery({ queryKey: queryKeys.inventory(), queryFn: getLowStock, refetchInterval: 60_000 })
  const availableTables = tables.filter((t) => t.status === "available").length
  const openOrders = orders.filter((o) => o.status === "open" || o.status === "ready")
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/tables"><Button variant="outline" size="sm" className="gap-2"><Grid3X3 className="h-4 w-4" /> View Tables</Button></Link>
          <Link href="/orders"><Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> New Order</Button></Link>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard title="Open Orders" value={String(openOrders.length)} icon={ClipboardList} />
        <MetricCard title="Available Tables" value={`${availableTables}/${tables.length}`} icon={Grid3X3} />
        <MetricCard title="Revenue Today" value={formatCurrency(0)} icon={TrendingUp} />
        <MetricCard title="Low Stock Alerts" value={String(lowStock.length)} icon={AlertTriangle} />
      </div>
      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Open Orders</h2>
        {isLoading ? <LoadingSpinner /> : <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{openOrders.slice(0, 8).map((order) => <OrderCard key={order.id} order={order} />)}</div>}
      </div>
    </div>
  )
}
