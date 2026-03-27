"use client"
import type { OrderItem } from "@/lib/api/orders"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
interface OrderItemRowProps { item: OrderItem; onRemove?: (itemId: string) => void; editable?: boolean }
export function OrderItemRow({ item, onRemove, editable = false }: OrderItemRowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  return (
    <>
      <div className="flex items-center gap-3 py-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground truncate">{item.product.name}</div>
          {item.variant && <div className="text-xs text-muted-foreground">{item.variant.name}</div>}
          {item.notes && <div className="text-xs text-muted-foreground italic">{item.notes}</div>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-muted-foreground">×{item.quantity}</span>
          <span className="text-sm font-medium text-foreground w-20 text-right">{formatCurrency(item.unitPrice * item.quantity)}</span>
          {editable && onRemove && <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setConfirmOpen(true)}><Trash2 className="h-3.5 w-3.5" /></Button>}
        </div>
      </div>
      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} title="Remove item?" description={`Remove ${item.product.name} from this order?`} confirmLabel="Remove" onConfirm={() => onRemove?.(item.id)} destructive />
    </>
  )
}
