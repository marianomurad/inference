"use client"
import type { PaymentMethod } from "@/lib/api/checkout"
import { cn } from "@/lib/utils"
import { Banknote, CreditCard, QrCode } from "lucide-react"
import type { ElementType } from "react"
const methods: { value: PaymentMethod; label: string; icon: ElementType }[] = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "qr", label: "QR", icon: QrCode },
]
interface PaymentMethodSelectorProps { value: PaymentMethod; onChange: (value: PaymentMethod) => void }
export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {methods.map((method) => (
        <button key={method.value} onClick={() => onChange(method.value)} className={cn("flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors font-medium text-sm", value === method.value ? "border-foreground bg-foreground text-background" : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground")}>
          <method.icon className="h-6 w-6" />
          <span>{method.label}</span>
        </button>
      ))}
    </div>
  )
}
