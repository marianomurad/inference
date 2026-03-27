import { z } from "zod"

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  industry: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  employeeCount: z.number().int().positive().optional(),
  annualRevenue: z.number().int().nonnegative().optional(),
})

export type CompanyFormValues = z.infer<typeof companySchema>
