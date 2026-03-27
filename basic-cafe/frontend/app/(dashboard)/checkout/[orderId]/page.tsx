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
  if (!summary) return <div className="text-zinc-400">Order not found</div>
  if (paid) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20"><CheckCircle2 className="h-10 w-10 text-emerald-400" /></div>
      <h2 className="text-2xl font-bold text-white">Payment Complete</h2>
      <p className="mt-2 text-zinc-400">Thank you! The order has been marked as paid.</p>
      <Button className="mt-6 bg-indigo-600 hover:bg-indigo-700" onClick={() => (window.location.href = "/tables")}>Back to Tables</Button>
    </div>
  )
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-white">Checkout</h1>
      <Card className="bg-zinc-900 border-zinc-800 p-5"><BillSummary summary={summary} /></Card>
      <div className="space-y-3"><h2 className="text-base font-semibold text-white">Payment Method</h2><PaymentMethodSelector value={method} onChange={setMethod} /></div>
      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-semibold" onClick={() => confirm()} disabled={isPending}>{isPending ? "Processing..." : "Confirm Payment"}</Button>
    </div>
  )
}
