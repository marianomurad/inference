"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/api/query-keys"
import { getProducts, deleteProduct, type Product } from "@/lib/api/products"
import { DataTable } from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ColumnDef } from "@tanstack/react-table"
import { formatCurrency } from "@/lib/utils"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
export default function ProductsPage() {
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { data: products = [], isLoading } = useQuery({ queryKey: queryKeys.products(), queryFn: () => getProducts() })
  const { mutate: remove } = useMutation({ mutationFn: deleteProduct, onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.products() }); toast.success("Product deleted"); setDeleteId(null) }, onError: () => toast.error("Failed to delete product") })
  const columns: ColumnDef<Product>[] = [
    { accessorKey: "name", header: "Name", cell: ({ getValue }) => <span className="font-medium text-white">{getValue() as string}</span> },
    { accessorKey: "category", header: "Category", cell: ({ row }) => <span className="text-zinc-400">{row.original.category?.name ?? "—"}</span> },
    { accessorKey: "basePrice", header: "Price", cell: ({ getValue }) => <span className="font-mono text-white">{formatCurrency(getValue() as number)}</span> },
    { accessorKey: "active", header: "Status", cell: ({ getValue }) => getValue() ? <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Active</Badge> : <Badge variant="outline" className="bg-zinc-500/20 text-zinc-400 border-zinc-500/30">Inactive</Badge> },
    { id: "actions", cell: ({ row }) => <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-rose-400" onClick={() => setDeleteId(row.original.id)}><Trash2 className="h-3.5 w-3.5" /></Button> },
  ]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4" /> Add Product</Button>
      </div>
      {isLoading ? <LoadingSpinner /> : <DataTable columns={columns} data={products} searchKey="name" searchPlaceholder="Search products..." />}
      <ConfirmDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} title="Delete product?" description="This action cannot be undone." confirmLabel="Delete" onConfirm={() => deleteId && remove(deleteId)} destructive />
    </div>
  )
}
