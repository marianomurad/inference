"use client"
import { type Table, type TableStatus, updateTableStatus } from "@/lib/api/tables"
import { TableStatusBadge } from "./table-status-badge"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/api/query-keys"
import { toast } from "sonner"
const statusAccent: Record<TableStatus, string> = {
  available: "border-l-4 border-l-emerald-500",
  occupied:  "border-l-4 border-l-orange-500",
  reserved:  "border-l-4 border-l-blue-500",
  cleaning:  "border-l-4 border-l-muted-foreground",
}
const statuses: TableStatus[] = ["available", "occupied", "reserved", "cleaning"]
interface TableCardProps { table: Table; onClick?: (table: Table) => void }
export function TableCard({ table, onClick }: TableCardProps) {
  const queryClient = useQueryClient()
  const { mutate: changeStatus } = useMutation({
    mutationFn: (status: TableStatus) => updateTableStatus(table.id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.tables() }); toast.success("Table status updated") },
    onError: () => toast.error("Failed to update status"),
  })
  return (
    <Card className={cn("relative flex flex-col gap-3 p-4 cursor-pointer hover:shadow-md transition-shadow", statusAccent[table.status] ?? "")} onClick={() => onClick?.(table)}>
      <div className="flex items-start justify-between">
        <span className="text-lg font-bold text-foreground">Table {table.number}</span>
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary transition-colors outline-none" onClick={(e) => e.stopPropagation()}>
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {statuses.filter((s) => s !== table.status).map((s) => (
              <DropdownMenuItem key={s} onClick={(e) => { e.stopPropagation(); changeStatus(s) }} className="capitalize">
                Mark as {s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Users className="h-3.5 w-3.5" /><span>{table.capacity} seats</span>
      </div>
      <TableStatusBadge status={table.status} />
    </Card>
  )
}
