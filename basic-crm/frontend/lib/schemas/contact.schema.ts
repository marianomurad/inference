import { z } from "zod"

export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  companyId: z.string().optional(),
  status: z.enum(["lead", "prospect", "customer", "churned"]),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

export type ContactFormValues = z.infer<typeof contactSchema>
