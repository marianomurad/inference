"use client"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/api/query-keys"
import { getSalesReport, getTopProducts } from "@/lib/api/reports"
import { MetricCard } from "@/components/reports/metric-card"
import { SalesChart } from "@/components/reports/sales-chart"
import { TopProductsTable } from "@/components/reports/top-products-table"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, ShoppingBag, Receipt, Tag } from "lucide-react"
import { useState } from "react"
import { subDays, format } from "date-fns"
const presets = [{ label: "Today", days: 0 }, { label: "Week", days: 7 }, { label: "Month", days: 30 }]
export default function ReportsPage() {
  const [days, setDays] = useState(7)
  const from = format(subDays(new Date(), days), "yyyy-MM-dd")
  const to = format(new Date(), "yyyy-MM-dd")
  const params = { from, to }
  const { data: sales, isLoading } = useQuery({ queryKey: queryKeys.reports(params), queryFn: () => getSalesReport(params) })
  const { data: topProducts = [] } = useQuery({ queryKey: [...queryKeys.reports(params), "top-products"], queryFn: () => getTopProducts({ ...params, limit: 10 }) })
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <div className="flex gap-1 rounded-lg border border-zinc-800 p-1">{presets.map((p) => <Button key={p.label} variant={days === p.days ? "secondary" : "ghost"} size="sm" onClick={() => setDays(p.days)} className="text-xs">{p.label}</Button>)}</div>
      </div>
      {isLoading ? <LoadingSpinner /> : sales ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard title="Total Revenue" value={formatCurrency(sales.totalRevenue)} icon={TrendingUp} />
            <MetricCard title="Total Orders" value={String(sales.totalOrders)} icon={ShoppingBag} />
            <MetricCard title="Avg Ticket" value={formatCurrency(sales.avgTicket)} icon={Receipt} />
            <MetricCard title="Top Category" value={sales.topCategory || "—"} icon={Tag} />
          </div>
          <Card className="bg-zinc-900 border-zinc-800 p-5"><h2 className="mb-4 text-base font-semibold text-white">Revenue Over Time</h2><SalesChart data={sales.revenueByDay} /></Card>
          <Card className="bg-zinc-900 border-zinc-800 p-5"><h2 className="mb-4 text-base font-semibold text-white">Top Products</h2><TopProductsTable data={topProducts} /></Card>
        </>
      ) : null}
    </div>
  )
}
