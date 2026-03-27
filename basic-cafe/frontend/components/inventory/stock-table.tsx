"use client"
import type { InventoryItem } from "@/lib/api/inventory"
import { DataTable } from "@/components/shared/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
const columns: ColumnDef<InventoryItem>[] = [
  { accessorKey: "name", header: "Item", cell: ({ row }) => (<div className="flex items-center gap-2">{row.original.currentStock <= row.original.minStock && <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />}<span className="font-medium text-foreground">{row.original.name}</span></div>) },
  { accessorKey: "unit", header: "Unit", cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() as string}</span> },
  { accessorKey: "currentStock", header: "In Stock", cell: ({ row }) => { const isLow = row.original.currentStock <= row.original.minStock; return <span className={cn("font-mono font-medium", isLow ? "text-amber-600" : "text-foreground")}>{row.original.currentStock}</span> } },
  { accessorKey: "minStock", header: "Min Stock", cell: ({ getValue }) => <span className="font-mono text-muted-foreground">{getValue() as number}</span> },
  { id: "status", header: "Status", cell: ({ row }) => { const isLow = row.original.currentStock <= row.original.minStock; return isLow ? <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Low Stock</Badge> : <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">OK</Badge> } },
]
export function StockTable({ items }: { items: InventoryItem[] }) {
  return <DataTable columns={columns} data={items} searchKey="name" searchPlaceholder="Search inventory..." />
}
