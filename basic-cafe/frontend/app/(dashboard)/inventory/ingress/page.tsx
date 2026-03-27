import { IngressForm } from "@/components/inventory/ingress-form"
export default function InventoryIngressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Stock Ingress</h1>
        <p className="mt-1 text-sm text-muted-foreground">Record incoming stock from a supplier</p>
      </div>
      <IngressForm />
    </div>
  )
}
