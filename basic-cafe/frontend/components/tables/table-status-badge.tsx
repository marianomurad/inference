import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { TableStatus } from "@/lib/api/tables"
const config: Record<TableStatus, { label: string; className: string }> = {
  available: { label: "Available", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  occupied:  { label: "Occupied",  className: "bg-orange-50 text-orange-700 border-orange-200" },
  reserved:  { label: "Reserved",  className: "bg-blue-50 text-blue-700 border-blue-200" },
  cleaning:  { label: "Cleaning",  className: "bg-secondary text-muted-foreground border-border" },
}
export function TableStatusBadge({ status }: { status: TableStatus }) {
  const entry = config[status] ?? config.available
  return <Badge variant="outline" className={cn("font-medium text-xs", entry.className)}>{entry.label}</Badge>
}
