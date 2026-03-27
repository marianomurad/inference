import { z } from "zod"
export const createOrderSchema = z.object({ tableId: z.string().uuid().optional(), notes: z.string().default("") })
export const addOrderItemSchema = z.object({ productId: z.string().uuid("Select a product"), variantId: z.string().uuid().optional(), quantity: z.number().int().positive("Quantity must be > 0"), notes: z.string().default("") })
export type CreateOrderFormValues = z.infer<typeof createOrderSchema>
export type AddOrderItemFormValues = z.infer<typeof addOrderItemSchema>
