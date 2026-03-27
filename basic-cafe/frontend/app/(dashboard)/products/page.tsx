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
    { accessorKey: "name", header: "Name", cell: ({ getValue }) => <span className="font-medium text-foreground">{getValue() as string}</span> },
    { accessorKey: "category", header: "Category", cell: ({ row }) => <span className="text-muted-foreground">{row.original.category?.name ?? "—"}</span> },
    { accessorKey: "basePrice", header: "Price", cell: ({ getValue }) => <span className="font-mono font-medium text-foreground">{formatCurrency(getValue() as number)}</span> },
    { accessorKey: "active", header: "Status", cell: ({ getValue }) => getValue() ? <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge> : <Badge variant="outline" className="bg-secondary text-muted-foreground">Inactive</Badge> },
    { id: "actions", cell: ({ row }) => <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(row.original.id)}><Trash2 className="h-3.5 w-3.5" /></Button> },
  ]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Products</h1>
        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Product</Button>
      </div>
      {isLoading ? <LoadingSpinner /> : <DataTable columns={columns} data={products} searchKey="name" searchPlaceholder="Search products..." />}
      <ConfirmDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} title="Delete product?" description="This action cannot be undone." confirmLabel="Delete" onConfirm={() => deleteId && remove(deleteId)} destructive />
    </div>
  )
}
