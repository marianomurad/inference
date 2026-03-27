import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { TableStatus } from "@/lib/api/tables"
const config: Record<TableStatus, { label: string; className: string }> = {
  available: { label: "Available", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  occupied: { label: "Occupied", className: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  reserved: { label: "Reserved", className: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
  cleaning: { label: "Cleaning", className: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" },
}
export function TableStatusBadge({ status }: { status: TableStatus }) {
  const { label, className } = config[status]
  return <Badge variant="outline" className={cn("font-medium", className)}>{label}</Badge>
}
