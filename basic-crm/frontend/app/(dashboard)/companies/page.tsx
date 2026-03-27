"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, Building2 } from "lucide-react"
import { getCompanies } from "@/lib/api/companies"
import { queryKeys } from "@/lib/api/query-keys"
import { CompanyTable } from "@/components/companies/company-table"
import { CompanyForm } from "@/components/companies/company-form"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function CompaniesPage() {
  const [search, setSearch] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.companies({ search }),
    queryFn: () => getCompanies({ search: search || undefined }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Companies</h1>
          <p className="text-zinc-400 text-sm mt-1">{data?.length ?? 0} companies</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Company
        </Button>
      </div>

      <Input
        placeholder="Search companies…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-zinc-900 border-zinc-800 w-64"
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : data && data.length > 0 ? (
        <CompanyTable data={data} />
      ) : (
        <EmptyState
          icon={Building2}
          title="No companies found"
          action={
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> New Company
            </Button>
          }
        />
      )}

      <CompanyForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  )
}
