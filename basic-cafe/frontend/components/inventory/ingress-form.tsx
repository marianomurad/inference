"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { stockIngressSchema, type StockIngressFormValues } from "@/lib/schemas/inventory.schema"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/api/query-keys"
import { getInventory, addStockEntry } from "@/lib/api/inventory"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
export function IngressForm() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: items = [] } = useQuery({ queryKey: queryKeys.inventory(), queryFn: getInventory })
  const form = useForm<StockIngressFormValues>({ resolver: zodResolver(stockIngressSchema), defaultValues: { quantity: 1, costPerUnit: 0, supplier: "" } })
  const { mutate, isPending } = useMutation({
    mutationFn: (data: StockIngressFormValues) => addStockEntry(data.inventoryItemId, { quantity: data.quantity, costPerUnit: data.costPerUnit, supplier: data.supplier, receivedAt: data.receivedAt }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.inventory() }); toast.success("Stock updated successfully"); router.push("/inventory") },
    onError: () => toast.error("Failed to update stock"),
  })
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutate(data))} className="space-y-5 max-w-lg">
        <FormField control={form.control} name="inventoryItemId" render={({ field }) => (<FormItem><FormLabel>Inventory Item</FormLabel><Select onValueChange={(v) => field.onChange(v ?? "")} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger></FormControl><SelectContent>{items.map((item) => <SelectItem key={item.id} value={item.id}>{item.name} ({item.unit})</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="quantity" render={({ field }) => (<FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="costPerUnit" render={({ field }) => (<FormItem><FormLabel>Cost per Unit (cents)</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value, 10))} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <FormField control={form.control} name="supplier" render={({ field }) => (<FormItem><FormLabel>Supplier</FormLabel><FormControl><Input placeholder="Supplier name" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <div className="flex gap-3">
          <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700">{isPending ? "Saving..." : "Record Ingress"}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </Form>
  )
}
