"use client"

import { useQuery } from "@tanstack/react-query"
import { Users, Building2, TrendingUp, Trophy, CheckSquare, Activity as ActivityIcon } from "lucide-react"
import { getDashboard } from "@/lib/api/reports"
import { queryKeys } from "@/lib/api/query-keys"
import { MetricCard } from "@/components/reports/metric-card"
import { ActivityTimeline } from "@/components/activities/activity-timeline"
import { TaskList } from "@/components/tasks/task-list"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import type { Activity } from "@/lib/api/activities"
import type { Task } from "@/lib/api/tasks"

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.dashboard(),
    queryFn: getDashboard,
    refetchInterval: 60_000,
  })

  if (isLoading) return <LoadingSpinner />

  const tasksDueToday: Task[] = (data?.tasksDueToday ?? []).map((t) => ({
    ...t,
    contactId: t.contactId ?? undefined,
    contactName: t.contactName ?? undefined,
    dealId: t.dealId ?? undefined,
    dealTitle: t.dealTitle ?? undefined,
  }))

  const recentActivities: Activity[] = (data?.recentActivities ?? []).map((a) => ({
    ...a,
    type: a.type as Activity["type"],
    contactId: a.contactId ?? undefined,
    contactName: a.contactName ?? undefined,
    dealId: a.dealId ?? undefined,
    dealTitle: a.dealTitle ?? undefined,
    body: a.body ?? undefined,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">Welcome back. Here&apos;s what&apos;s happening.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Contacts"
          value={data?.totalContacts ?? 0}
          icon={Users}
        />
        <MetricCard
          title="Total Companies"
          value={data?.totalCompanies ?? 0}
          icon={Building2}
        />
        <MetricCard
          title="Open Deals"
          value={data?.openDeals ?? 0}
          subtitle={formatCurrency(data?.openDealsValue ?? 0)}
          icon={TrendingUp}
        />
        <MetricCard
          title="Won This Month"
          value={data?.wonThisMonth ?? 0}
          subtitle={formatCurrency(data?.wonThisMonthValue ?? 0)}
          icon={Trophy}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-indigo-400" />
              Tasks Due Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasksDueToday.length === 0 ? (
              <p className="text-zinc-500 text-sm">No tasks due today.</p>
            ) : (
              <TaskList tasks={tasksDueToday} />
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <ActivityIcon className="h-4 w-4 text-indigo-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityTimeline activities={recentActivities.slice(0, 8)} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
