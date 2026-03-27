"use client"
import { use, useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { getCheckoutSummary, confirmCheckout, type PaymentMethod } from "@/lib/api/checkout"
import { BillSummary } from "@/components/checkout/bill-summary"
import { PaymentMethodSelector } from "@/components/checkout/payment-method-selector"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
export default function CheckoutPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params)
  const [method, setMethod] = useState<PaymentMethod>("cash")
  const [paid, setPaid] = useState(false)
  const { data: summary, isLoading } = useQuery({ queryKey: ["checkout", orderId], queryFn: () => getCheckoutSummary(orderId) })
  const { mutate: confirm, isPending } = useMutation({ mutationFn: () => confirmCheckout(orderId, { method }), onSuccess: () => { setPaid(true); toast.success("Payment confirmed!") }, onError: () => toast.error("Payment failed. Please try again.") })
  if (isLoading) return <LoadingSpinner />
  if (!summary) return <div className="text-muted-foreground">Order not found</div>
  if (paid) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50"><CheckCircle2 className="h-10 w-10 text-emerald-600" /></div>
      <h2 className="text-2xl font-bold text-foreground">Payment Complete</h2>
      <p className="mt-2 text-muted-foreground">Thank you! The order has been marked as paid.</p>
      <Button className="mt-6" onClick={() => (window.location.href = "/tables")}>Back to Tables</Button>
    </div>
  )
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
      <Card className="p-5"><BillSummary summary={summary} /></Card>
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Payment Method</h2>
        <PaymentMethodSelector value={method} onChange={setMethod} />
      </div>
      <Button className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => confirm()} disabled={isPending}>{isPending ? "Processing..." : "Confirm Payment"}</Button>
    </div>
  )
}
