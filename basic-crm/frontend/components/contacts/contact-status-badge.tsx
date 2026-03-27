import { Badge } from "@/components/ui/badge"
import type { ContactStatus } from "@/lib/api/contacts"

const config: Record<ContactStatus, { label: string; className: string }> = {
  lead: { label: "Lead", className: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
  prospect: { label: "Prospect", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  customer: { label: "Customer", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  churned: { label: "Churned", className: "bg-zinc-700 text-zinc-400 border-zinc-600" },
}

export function ContactStatusBadge({ status }: { status: ContactStatus }) {
  const { label, className } = config[status]
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}
