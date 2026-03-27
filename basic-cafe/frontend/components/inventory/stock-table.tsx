"use client"
import type { InventoryItem } from "@/lib/api/inventory"
import { DataTable } from "@/components/shared/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
const columns: ColumnDef<InventoryItem>[] = [
  { accessorKey: "name", header: "Item", cell: ({ row }) => (<div className="flex items-center gap-2">{row.original.currentStock <= row.original.minStock && <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />}<span className="font-medium text-white">{row.original.name}</span></div>) },
  { accessorKey: "unit", header: "Unit", cell: ({ getValue }) => <span className="text-zinc-400">{getValue() as string}</span> },
  { accessorKey: "currentStock", header: "In Stock", cell: ({ row }) => { const isLow = row.original.currentStock <= row.original.minStock; return <span className={cn("font-mono font-medium", isLow ? "text-amber-400" : "text-white")}>{row.original.currentStock}</span> } },
  { accessorKey: "minStock", header: "Min Stock", cell: ({ getValue }) => <span className="font-mono text-zinc-400">{getValue() as number}</span> },
  { id: "status", header: "Status", cell: ({ row }) => { const isLow = row.original.currentStock <= row.original.minStock; return isLow ? <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">Low Stock</Badge> : <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">OK</Badge> } },
]
export function StockTable({ items }: { items: InventoryItem[] }) {
  return <DataTable columns={columns} data={items} searchKey="name" searchPlaceholder="Search inventory..." />
}
