"use client"
import type { Table } from "@/lib/api/tables"
import { TableCard } from "./table-card"
import { createOrder } from "@/lib/api/orders"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/api/query-keys"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
export function FloorMap({ tables }: { tables: Table[] }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { mutate: startOrder } = useMutation({
    mutationFn: (tableId: string) => createOrder({ tableId }),
    onSuccess: (order) => { queryClient.invalidateQueries({ queryKey: queryKeys.orders() }); queryClient.invalidateQueries({ queryKey: queryKeys.tables() }); toast.success("Order created"); router.push(`/orders/${order.id}`) },
    onError: () => toast.error("Failed to create order"),
  })
  const handleClick = (table: Table) => {
    if (table.status === "available") startOrder(table.id)
    else if (table.status === "occupied") router.push(`/orders?tableId=${table.id}`)
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {tables.map((t) => <TableCard key={t.id} table={t} onClick={handleClick} />)}
    </div>
  )
}
