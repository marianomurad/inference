"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getCompany } from "@/lib/api/companies"
import { getContacts } from "@/lib/api/contacts"
import { getDeals } from "@/lib/api/deals"
import { getActivities } from "@/lib/api/activities"
import { queryKeys } from "@/lib/api/query-keys"
import { CompanyProfileCard } from "@/components/companies/company-profile-card"
import { ContactStatusBadge } from "@/components/contacts/contact-status-badge"
import { DealStatusBadge } from "@/components/deals/deal-status-badge"
import { ActivityTimeline } from "@/components/activities/activity-timeline"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data: company, isLoading } = useQuery({
    queryKey: queryKeys.company(id),
    queryFn: () => getCompany(id),
  })

  const { data: contacts = [] } = useQuery({
    queryKey: queryKeys.companyContacts(id),
    queryFn: () => getContacts(),
    select: (data) => data.filter((c) => c.companyId === id),
  })

  const { data: deals = [] } = useQuery({
    queryKey: queryKeys.companyDeals(id),
    queryFn: () => getDeals(),
    select: (data) => data.filter((d) => d.companyId === id),
  })

  const { data: activities = [] } = useQuery({
    queryKey: queryKeys.activities({ contactId: id }),
    queryFn: () => getActivities(),
  })

  if (isLoading) return <LoadingSpinner />
  if (!company) return <p className="text-zinc-400">Company not found</p>

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/companies" className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors">
        <ArrowLeft className="h-4 w-4" /> Companies
      </Link>

      <CompanyProfileCard company={company} />

      <Tabs defaultValue="contacts">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
          <TabsTrigger value="deals">Deals ({deals.length})</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="mt-4 space-y-2">
          {contacts.map((c) => (
            <Link key={c.id} href={`/contacts/${c.id}`} className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors">
              <div>
                <p className="text-white text-sm font-medium">{c.firstName} {c.lastName}</p>
                <p className="text-zinc-500 text-xs">{c.email}</p>
              </div>
              <ContactStatusBadge status={c.status} />
            </Link>
          ))}
        </TabsContent>

        <TabsContent value="deals" className="mt-4 space-y-2">
          {deals.map((deal) => (
            <Link key={deal.id} href={`/deals/${deal.id}`} className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors">
              <div>
                <p className="text-white text-sm font-medium">{deal.title}</p>
                <p className="text-zinc-500 text-xs">{deal.stageName}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 text-sm">{formatCurrency(deal.value)}</span>
                <DealStatusBadge status={deal.status} />
              </div>
            </Link>
          ))}
        </TabsContent>

        <TabsContent value="activities" className="mt-4">
          <ActivityTimeline activities={activities} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
