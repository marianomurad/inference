import { z } from "zod"

export const dealSchema = z.object({
  title: z.string().min(1, "Title is required"),
  stageId: z.string().min(1, "Stage is required"),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  value: z.number().int().nonnegative("Value must be non-negative"),
  closeDate: z.string().optional(),
  notes: z.string().optional(),
})

export type DealFormValues = z.infer<typeof dealSchema>
