import type { CheckoutSummary } from "@/lib/api/checkout"
import { formatCurrency } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
export function BillSummary({ summary }: { summary: CheckoutSummary }) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {summary.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
            <span className="font-medium text-foreground">{formatCurrency(item.total)}</span>
          </div>
        ))}
      </div>
      <Separator />
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">{formatCurrency(summary.subtotal)}</span></div>
        {summary.discount > 0 && <div className="flex justify-between"><span className="text-emerald-600">Discount</span><span className="text-emerald-600">-{formatCurrency(summary.discount)}</span></div>}
        <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="text-foreground">{formatCurrency(summary.tax)}</span></div>
      </div>
      <Separator />
      <div className="flex justify-between text-lg font-bold">
        <span className="text-foreground">Total</span>
        <span className="text-accent">{formatCurrency(summary.total)}</span>
      </div>
    </div>
  )
}
