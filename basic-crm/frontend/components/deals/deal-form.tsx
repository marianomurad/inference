"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { dealSchema, type DealFormValues } from "@/lib/schemas/deal.schema"
import { createDeal, getDealStages } from "@/lib/api/deals"
import { queryKeys } from "@/lib/api/query-keys"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface DealFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DealForm({ open, onOpenChange }: DealFormProps) {
  const qc = useQueryClient()
  const { data: stages } = useQuery({ queryKey: queryKeys.dealStages(), queryFn: getDealStages })
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
  })
  const stageId = watch("stageId")

  const mutation = useMutation({
    mutationFn: (data: DealFormValues) => createDeal(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.deals() })
      toast.success("Deal created")
      reset()
      onOpenChange(false)
    },
    onError: () => toast.error("Failed to create deal"),
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-zinc-900 border-zinc-800 text-white w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-white">New Deal</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input className="bg-zinc-800 border-zinc-700" {...register("title")} />
            {errors.title && <p className="text-rose-400 text-xs">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Stage</Label>
            <Select value={stageId ?? ""} onValueChange={(v) => setValue("stageId", v ?? "")}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                {stages?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.stageId && <p className="text-rose-400 text-xs">{errors.stageId.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Value (cents)</Label>
            <Input type="number" className="bg-zinc-800 border-zinc-700" {...register("value")} />
            {errors.value && <p className="text-rose-400 text-xs">{errors.value.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Close Date</Label>
            <Input type="date" className="bg-zinc-800 border-zinc-700" {...register("closeDate")} />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea className="bg-zinc-800 border-zinc-700" {...register("notes")} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 border-zinc-700" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating…" : "Create Deal"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
