import type { CheckoutSummary } from "@/lib/api/checkout"
import { formatCurrency } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
export function BillSummary({ summary }: { summary: CheckoutSummary }) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">{summary.items.map((item, i) => (<div key={i} className="flex items-center justify-between text-sm"><span className="text-zinc-400">{item.name} × {item.quantity}</span><span className="text-white">{formatCurrency(item.total)}</span></div>))}</div>
      <Separator className="bg-zinc-800" />
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between"><span className="text-zinc-400">Subtotal</span><span className="text-white">{formatCurrency(summary.subtotal)}</span></div>
        {summary.discount > 0 && <div className="flex justify-between"><span className="text-emerald-400">Discount</span><span className="text-emerald-400">-{formatCurrency(summary.discount)}</span></div>}
        <div className="flex justify-between"><span className="text-zinc-400">Tax</span><span className="text-white">{formatCurrency(summary.tax)}</span></div>
      </div>
      <Separator className="bg-zinc-800" />
      <div className="flex justify-between text-lg font-bold"><span className="text-white">Total</span><span className="text-indigo-400">{formatCurrency(summary.total)}</span></div>
    </div>
  )
}
