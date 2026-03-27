import { z } from "zod"

export const activitySchema = z.object({
  type: z.enum(["call", "email", "meeting", "note"]),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  occurredAt: z.string().min(1, "Date is required"),
})

export type ActivityFormValues = z.infer<typeof activitySchema>
