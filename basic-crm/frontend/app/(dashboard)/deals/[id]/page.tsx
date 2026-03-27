"use client"

import { use, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { getDeal, getDealStages, setDealStatus } from "@/lib/api/deals"
import { getActivities } from "@/lib/api/activities"
import { getTasks } from "@/lib/api/tasks"
import { queryKeys } from "@/lib/api/query-keys"
import { DealStatusBadge } from "@/components/deals/deal-status-badge"
import { ActivityTimeline } from "@/components/activities/activity-timeline"
import { ActivityForm } from "@/components/activities/activity-form"
import { TaskList } from "@/components/tasks/task-list"
import { TaskForm } from "@/components/tasks/task-form"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const qc = useQueryClient()
  const [isActivityOpen, setIsActivityOpen] = useState(false)
  const [isTaskOpen, setIsTaskOpen] = useState(false)

  const { data: deal, isLoading } = useQuery({
    queryKey: queryKeys.deal(id),
    queryFn: () => getDeal(id),
  })

  const { data: stages } = useQuery({
    queryKey: queryKeys.dealStages(),
    queryFn: getDealStages,
  })

  const { data: activities = [] } = useQuery({
    queryKey: queryKeys.activities({ dealId: id }),
    queryFn: () => getActivities({ dealId: id }),
  })

  const { data: tasks = [] } = useQuery({
    queryKey: queryKeys.tasks({ dealId: id }),
    queryFn: () => getTasks({ dealId: id }),
  })

  const statusMutation = useMutation({
    mutationFn: (status: "won" | "lost") => setDealStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.deal(id) })
      qc.invalidateQueries({ queryKey: queryKeys.deals() })
    },
    onError: () => toast.error("Failed to update deal status"),
  })

  if (isLoading) return <LoadingSpinner />
  if (!deal) return <p className="text-zinc-400">Deal not found</p>

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/deals" className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors">
        <ArrowLeft className="h-4 w-4" /> Deals
      </Link>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-white">{deal.title}</h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-emerald-400 text-xl font-semibold">{formatCurrency(deal.value)}</span>
                <span className="text-zinc-400 text-sm">{deal.stageName}</span>
                <DealStatusBadge status={deal.status} />
              </div>
              <div className="mt-3 text-sm text-zinc-400 space-y-1">
                {deal.contactName && <p>Contact: <Link href={`/contacts/${deal.contactId}`} className="text-indigo-400 hover:underline">{deal.contactName}</Link></p>}
                {deal.companyName && <p>Company: <Link href={`/companies/${deal.companyId}`} className="text-indigo-400 hover:underline">{deal.companyName}</Link></p>}
                {deal.closeDate && <p>Close date: {formatDate(deal.closeDate)}</p>}
                <p>Owner: {deal.ownerName}</p>
              </div>
            </div>
            {deal.status === "open" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => statusMutation.mutate("won")}
                  disabled={statusMutation.isPending}
                >
                  Mark Won
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-rose-700 text-rose-400 hover:bg-rose-900/20"
                  onClick={() => statusMutation.mutate("lost")}
                  disabled={statusMutation.isPending}
                >
                  Mark Lost
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="activities">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="activities">Activities ({activities.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          {deal.notes && <TabsTrigger value="info">Info</TabsTrigger>}
        </TabsList>

        <TabsContent value="activities" className="mt-4">
          <div className="flex justify-end mb-3">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsActivityOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Log Activity
            </Button>
          </div>
          <ActivityTimeline activities={activities} />
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <div className="flex justify-end mb-3">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsTaskOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> New Task
            </Button>
          </div>
          <TaskList tasks={tasks} />
        </TabsContent>

        {deal.notes && (
          <TabsContent value="info" className="mt-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-zinc-200 text-sm whitespace-pre-wrap">{deal.notes}</p>
            </div>
          </TabsContent>
        )}
      </Tabs>

      <ActivityForm open={isActivityOpen} onOpenChange={setIsActivityOpen} dealId={id} />
      <TaskForm open={isTaskOpen} onOpenChange={setIsTaskOpen} dealId={id} />
    </div>
  )
}
