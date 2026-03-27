"use client"

import { use, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getContact } from "@/lib/api/contacts"
import { getActivities } from "@/lib/api/activities"
import { getDeals } from "@/lib/api/deals"
import { getTasks } from "@/lib/api/tasks"
import { queryKeys } from "@/lib/api/query-keys"
import { ContactProfileCard } from "@/components/contacts/contact-profile-card"
import { ActivityTimeline } from "@/components/activities/activity-timeline"
import { ActivityForm } from "@/components/activities/activity-form"
import { TaskList } from "@/components/tasks/task-list"
import { TaskForm } from "@/components/tasks/task-form"
import { DealStatusBadge } from "@/components/deals/deal-status-badge"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [isActivityOpen, setIsActivityOpen] = useState(false)
  const [isTaskOpen, setIsTaskOpen] = useState(false)

  const { data: contact, isLoading } = useQuery({
    queryKey: queryKeys.contact(id),
    queryFn: () => getContact(id),
  })

  const { data: activities = [] } = useQuery({
    queryKey: queryKeys.contactActivities(id),
    queryFn: () => getActivities({ contactId: id }),
  })

  const { data: deals = [] } = useQuery({
    queryKey: queryKeys.contactDeals(id),
    queryFn: () => getDeals(),
    select: (data) => data.filter((d) => d.contactId === id),
  })

  const { data: tasks = [] } = useQuery({
    queryKey: queryKeys.contactTasks(id),
    queryFn: () => getTasks({ contactId: id }),
  })

  if (isLoading) return <LoadingSpinner />
  if (!contact) return <p className="text-zinc-400">Contact not found</p>

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/contacts" className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors">
        <ArrowLeft className="h-4 w-4" /> Contacts
      </Link>

      <ContactProfileCard contact={contact} />

      {contact.notes && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-zinc-400 text-sm font-medium mb-1">Notes</p>
          <p className="text-zinc-200 text-sm whitespace-pre-wrap">{contact.notes}</p>
        </div>
      )}

      <Tabs defaultValue="activities">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="activities">Activities ({activities.length})</TabsTrigger>
          <TabsTrigger value="deals">Deals ({deals.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="mt-4">
          <div className="flex justify-end mb-3">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsActivityOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Log Activity
            </Button>
          </div>
          <ActivityTimeline activities={activities} />
        </TabsContent>

        <TabsContent value="deals" className="mt-4 space-y-2">
          {deals.map((deal) => (
            <Link key={deal.id} href={`/deals/${deal.id}`} className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors">
              <div>
                <p className="text-white text-sm font-medium">{deal.title}</p>
                <p className="text-zinc-500 text-xs">{deal.stageName}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 text-sm font-semibold">{formatCurrency(deal.value)}</span>
                <DealStatusBadge status={deal.status} />
              </div>
            </Link>
          ))}
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <div className="flex justify-end mb-3">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsTaskOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> New Task
            </Button>
          </div>
          <TaskList tasks={tasks} />
        </TabsContent>
      </Tabs>

      <ActivityForm open={isActivityOpen} onOpenChange={setIsActivityOpen} contactId={id} />
      <TaskForm open={isTaskOpen} onOpenChange={setIsTaskOpen} contactId={id} />
    </div>
  )
}
