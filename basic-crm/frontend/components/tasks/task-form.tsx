"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { taskSchema, type TaskFormValues } from "@/lib/schemas/task.schema"
import { createTask } from "@/lib/api/tasks"
import { queryKeys } from "@/lib/api/query-keys"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contactId?: string
  dealId?: string
}

export function TaskForm({ open, onOpenChange, contactId, dealId }: TaskFormProps) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      dueDate: format(new Date(), "yyyy-MM-dd"),
      contactId,
      dealId,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: TaskFormValues) => createTask(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks() })
      toast.success("Task created")
      reset()
      onOpenChange(false)
    },
    onError: () => toast.error("Failed to create task"),
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-zinc-900 border-zinc-800 text-white w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-white">New Task</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input className="bg-zinc-800 border-zinc-700" {...register("title")} />
            {errors.title && <p className="text-rose-400 text-xs">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input type="date" className="bg-zinc-800 border-zinc-700" {...register("dueDate")} />
            {errors.dueDate && <p className="text-rose-400 text-xs">{errors.dueDate.message}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 border-zinc-700" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating…" : "Create Task"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
