"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { activitySchema, type ActivityFormValues } from "@/lib/schemas/activity.schema"
import { createActivity } from "@/lib/api/activities"
import { queryKeys } from "@/lib/api/query-keys"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface ActivityFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contactId?: string
  dealId?: string
}

export function ActivityForm({ open, onOpenChange, contactId, dealId }: ActivityFormProps) {
  const qc = useQueryClient()
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      type: "note",
      occurredAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      contactId,
      dealId,
    },
  })

  const type = watch("type")

  const mutation = useMutation({
    mutationFn: (data: ActivityFormValues) => createActivity(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.activities() })
      if (contactId) qc.invalidateQueries({ queryKey: queryKeys.contactActivities(contactId) })
      if (dealId) qc.invalidateQueries({ queryKey: queryKeys.deal(dealId) })
      toast.success("Activity logged")
      reset()
      onOpenChange(false)
    },
    onError: () => toast.error("Failed to log activity"),
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-zinc-900 border-zinc-800 text-white w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-white">Log Activity</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setValue("type", (v ?? "note") as ActivityFormValues["type"])}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="note">Note</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input className="bg-zinc-800 border-zinc-700" {...register("subject")} />
            {errors.subject && <p className="text-rose-400 text-xs">{errors.subject.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea rows={4} className="bg-zinc-800 border-zinc-700" {...register("body")} />
          </div>
          <div className="space-y-2">
            <Label>Date & Time</Label>
            <Input type="datetime-local" className="bg-zinc-800 border-zinc-700" {...register("occurredAt")} />
            {errors.occurredAt && <p className="text-rose-400 text-xs">{errors.occurredAt.message}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 border-zinc-700" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={mutation.isPending}>
              {mutation.isPending ? "Logging…" : "Log Activity"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
