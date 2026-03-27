"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, Users } from "lucide-react"
import { getContacts } from "@/lib/api/contacts"
import { queryKeys } from "@/lib/api/query-keys"
import { ContactTable } from "@/components/contacts/contact-table"
import { ContactForm } from "@/components/contacts/contact-form"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ContactsPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.contacts({ search, status }),
    queryFn: () => getContacts({ search: search || undefined, status: status || undefined }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Contacts</h1>
          <p className="text-zinc-400 text-sm mt-1">{data?.length ?? 0} contacts</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Contact
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Search contacts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-zinc-900 border-zinc-800 w-64"
        />
        <Select value={status || "all"} onValueChange={(v) => setStatus((v ?? "") === "all" ? "" : (v ?? ""))}>
          <SelectTrigger className="bg-zinc-900 border-zinc-800 w-36">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="prospect">Prospect</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="churned">Churned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : data && data.length > 0 ? (
        <ContactTable data={data} />
      ) : (
        <EmptyState
          icon={Users}
          title="No contacts found"
          description="Create your first contact to get started"
          action={
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> New Contact
            </Button>
          }
        />
      )}

      <ContactForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  )
}
