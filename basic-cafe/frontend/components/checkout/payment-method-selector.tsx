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
        <button key={method.value} onClick={() => onChange(method.value)} className={cn("flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors", value === method.value ? "border-indigo-500 bg-indigo-500/10 text-white" : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600")}>
          <method.icon className="h-6 w-6" />
          <span className="text-sm font-medium">{method.label}</span>
        </button>
      ))}
    </div>
  )
}
