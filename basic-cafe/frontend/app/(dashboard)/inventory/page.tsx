"use client"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/api/query-keys"
import { getInventory } from "@/lib/api/inventory"
import { StockTable } from "@/components/inventory/stock-table"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Boxes, Plus, PackagePlus } from "lucide-react"
import Link from "next/link"
export default function InventoryPage() {
  const { data: items = [], isLoading } = useQuery({ queryKey: queryKeys.inventory(), queryFn: getInventory })
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-2"><Plus className="h-4 w-4" /> Add Item</Button>
          <Link href="/inventory/ingress"><Button size="sm" className="gap-2"><PackagePlus className="h-4 w-4" /> Stock Ingress</Button></Link>
        </div>
      </div>
      {isLoading ? <LoadingSpinner /> : items.length === 0 ? <EmptyState icon={Boxes} title="No inventory items" description="Add items to start tracking stock" /> : <StockTable items={items} />}
    </div>
  )
}
