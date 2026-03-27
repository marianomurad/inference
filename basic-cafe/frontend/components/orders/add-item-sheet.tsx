"use client"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/api/query-keys"
import { getProducts } from "@/lib/api/products"
import { addOrderItem } from "@/lib/api/orders"
import { formatCurrency } from "@/lib/utils"
import { useState } from "react"
import { toast } from "sonner"
import { Minus, Plus, Search } from "lucide-react"
interface AddItemSheetProps { open: boolean; onOpenChange: (open: boolean) => void; orderId: string }
export function AddItemSheet({ open, onOpenChange, orderId }: AddItemSheetProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedVariantId, setSelectedVariantId] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const { data: products = [] } = useQuery({ queryKey: queryKeys.products({ search }), queryFn: () => getProducts({ search, active: true }) })
  const selectedProduct = products.find((p) => p.id === selectedProductId)
  const { mutate: addItem, isPending } = useMutation({
    mutationFn: () => addOrderItem(orderId, { productId: selectedProductId, variantId: selectedVariantId || undefined, quantity, notes }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.order(orderId) }); toast.success("Item added"); setSelectedProductId(""); setSelectedVariantId(""); setQuantity(1); setNotes(""); onOpenChange(false) },
    onError: () => toast.error("Failed to add item"),
  })
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[480px]">
        <SheetHeader><SheetTitle className="text-foreground">Add Item</SheetTitle></SheetHeader>
        <div className="mt-6 space-y-5">
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {products.map((product) => (
              <button key={product.id} onClick={() => { setSelectedProductId(product.id); setSelectedVariantId("") }} className={`rounded-lg border p-3 text-left transition-colors ${selectedProductId === product.id ? "border-foreground bg-secondary" : "border-border bg-background hover:border-foreground"}`}>
                <div className="text-sm font-medium text-foreground truncate">{product.name}</div>
                <div className="text-xs text-muted-foreground">{formatCurrency(product.basePrice)}</div>
              </button>
            ))}
          </div>
          {selectedProduct && selectedProduct.variants.length > 0 && (
            <div className="space-y-2">
              <Label>Variant</Label>
              <Select value={selectedVariantId} onValueChange={(v) => setSelectedVariantId(v ?? "")}>
                <SelectTrigger><SelectValue placeholder="Select variant" /></SelectTrigger>
                <SelectContent>{selectedProduct.variants.map((v) => <SelectItem key={v.id} value={v.id}>{v.name} (+{formatCurrency(v.priceDiff)})</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Quantity</Label>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-8 w-8"><Minus className="h-3 w-3" /></Button>
              <span className="w-8 text-center text-foreground font-medium">{quantity}</span>
              <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)} className="h-8 w-8"><Plus className="h-3 w-3" /></Button>
            </div>
          </div>
          <div className="space-y-2"><Label>Notes (optional)</Label><Input placeholder="e.g. No sugar" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          <Button className="w-full" disabled={!selectedProductId || isPending} onClick={() => addItem()}>Add to Order</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
