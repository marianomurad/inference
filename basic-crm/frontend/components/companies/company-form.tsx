"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { companySchema, type CompanyFormValues } from "@/lib/schemas/company.schema"
import { createCompany } from "@/lib/api/companies"
import { queryKeys } from "@/lib/api/query-keys"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface CompanyFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompanyForm({ open, onOpenChange }: CompanyFormProps) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
  })

  const mutation = useMutation({
    mutationFn: (data: CompanyFormValues) => createCompany(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.companies() })
      toast.success("Company created")
      reset()
      onOpenChange(false)
    },
    onError: () => toast.error("Failed to create company"),
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-zinc-900 border-zinc-800 text-white w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-white">New Company</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input className="bg-zinc-800 border-zinc-700" {...register("name")} />
            {errors.name && <p className="text-rose-400 text-xs">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Industry</Label>
            <Input className="bg-zinc-800 border-zinc-700" {...register("industry")} />
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input type="url" className="bg-zinc-800 border-zinc-700" placeholder="https://" {...register("website")} />
            {errors.website && <p className="text-rose-400 text-xs">{errors.website.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Employees</Label>
              <Input type="number" className="bg-zinc-800 border-zinc-700" {...register("employeeCount")} />
            </div>
            <div className="space-y-2">
              <Label>Revenue (cents)</Label>
              <Input type="number" className="bg-zinc-800 border-zinc-700" {...register("annualRevenue")} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 border-zinc-700" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating…" : "Create Company"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
