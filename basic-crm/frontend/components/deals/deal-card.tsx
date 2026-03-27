import { formatCurrency, formatDate } from "@/lib/utils"
import type { Deal } from "@/lib/api/deals"
import { useRouter } from "next/navigation"
import { Calendar, User } from "lucide-react"

export function DealCard({ deal }: { deal: Deal }) {
  const router = useRouter()
  return (
    <div
      className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 cursor-pointer hover:border-zinc-600 transition-colors"
      onClick={() => router.push(`/deals/${deal.id}`)}
    >
      <p className="text-white text-sm font-medium truncate">{deal.title}</p>
      {deal.companyName && <p className="text-zinc-400 text-xs mt-0.5 truncate">{deal.companyName}</p>}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-emerald-400 text-sm font-semibold">{formatCurrency(deal.value)}</span>
        {deal.closeDate && (
          <span className="text-zinc-500 text-xs flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(deal.closeDate)}
          </span>
        )}
      </div>
      <div className="mt-1 flex items-center gap-1 text-zinc-500 text-xs">
        <User className="h-3 w-3" />
        {deal.ownerName}
      </div>
    </div>
  )
}
