import { Badge } from "@/components/ui/badge"
import type { DealStatus } from "@/lib/api/deals"

const config: Record<DealStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
  won: { label: "Won", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  lost: { label: "Lost", className: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
}

export function DealStatusBadge({ status }: { status: DealStatus }) {
  const { label, className } = config[status]
  return <Badge variant="outline" className={className}>{label}</Badge>
}
