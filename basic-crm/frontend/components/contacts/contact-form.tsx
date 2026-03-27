"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { contactSchema, type ContactFormValues } from "@/lib/schemas/contact.schema"
import { createContact, type Contact } from "@/lib/api/contacts"
import { queryKeys } from "@/lib/api/query-keys"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface ContactFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactForm({ open, onOpenChange }: ContactFormProps) {
  const qc = useQueryClient()
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { status: "lead" },
  })

  const status = watch("status")

  const mutation = useMutation({
    mutationFn: (data: ContactFormValues) => createContact(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.contacts() })
      toast.success("Contact created")
      reset()
      onOpenChange(false)
    },
    onError: () => toast.error("Failed to create contact"),
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-zinc-900 border-zinc-800 text-white w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-white">New Contact</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input className="bg-zinc-800 border-zinc-700" {...register("firstName")} />
              {errors.firstName && <p className="text-rose-400 text-xs">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input className="bg-zinc-800 border-zinc-700" {...register("lastName")} />
              {errors.lastName && <p className="text-rose-400 text-xs">{errors.lastName.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" className="bg-zinc-800 border-zinc-700" {...register("email")} />
            {errors.email && <p className="text-rose-400 text-xs">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input className="bg-zinc-800 border-zinc-700" {...register("phone")} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setValue("status", (v ?? "lead") as ContactFormValues["status"])}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="churned">Churned</SelectItem>
              </SelectContent>
            </Select>
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
              {mutation.isPending ? "Creating…" : "Create Contact"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
