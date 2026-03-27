import { z } from "zod"
export const inventoryItemSchema = z.object({ name: z.string().min(1, "Name is required"), unit: z.string().min(1, "Unit is required"), minStock: z.number().min(0, "Min stock must be >= 0") })
export const stockIngressSchema = z.object({ inventoryItemId: z.string().uuid("Select an item"), quantity: z.number().positive("Quantity must be > 0"), costPerUnit: z.number().int().min(0, "Cost must be >= 0"), supplier: z.string().min(1, "Supplier is required"), receivedAt: z.string().optional() })
export type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>
export type StockIngressFormValues = z.infer<typeof stockIngressSchema>
