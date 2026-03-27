import { z } from "zod"
export const productVariantSchema = z.object({ name: z.string().min(1, "Name is required"), priceDiff: z.number().int("Must be an integer (cents)") })
export const productSchema = z.object({ name: z.string().min(1, "Name is required"), description: z.string().default(""), categoryId: z.string().uuid("Select a category"), basePrice: z.number().int().min(0, "Price must be >= 0"), imageUrl: z.string().url().optional().or(z.literal("")), active: z.boolean().default(true), variants: z.array(productVariantSchema).default([]) })
export type ProductFormValues = z.infer<typeof productSchema>
export const categorySchema = z.object({ name: z.string().min(1, "Name is required") })
export type CategoryFormValues = z.infer<typeof categorySchema>
