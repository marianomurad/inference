import { z } from "zod"

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  dueDate: z.string().min(1, "Due date is required"),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  assigneeId: z.string().optional(),
})

export type TaskFormValues = z.infer<typeof taskSchema>
