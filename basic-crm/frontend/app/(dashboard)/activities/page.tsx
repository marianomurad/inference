"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, Activity } from "lucide-react"
import { getActivities } from "@/lib/api/activities"
import { queryKeys } from "@/lib/api/query-keys"
import { ActivityTimeline } from "@/components/activities/activity-timeline"
import { ActivityForm } from "@/components/activities/activity-form"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ActivitiesPage() {
  const [type, setType] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.activities({ type }),
    queryFn: () => getActivities({ type: type || undefined }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Activities</h1>
          <p className="text-zinc-400 text-sm mt-1">{data?.length ?? 0} activities</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Log Activity
        </Button>
      </div>

      <Select value={type || "all"} onValueChange={(v) => setType((v ?? "") === "all" ? "" : (v ?? ""))}>
        <SelectTrigger className="bg-zinc-900 border-zinc-800 w-40">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-800">
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="call">Calls</SelectItem>
          <SelectItem value="email">Emails</SelectItem>
          <SelectItem value="meeting">Meetings</SelectItem>
          <SelectItem value="note">Notes</SelectItem>
        </SelectContent>
      </Select>

      {isLoading ? (
        <LoadingSpinner />
      ) : data && data.length > 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <ActivityTimeline activities={data} />
        </div>
      ) : (
        <EmptyState
          icon={Activity}
          title="No activities found"
          action={<Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsFormOpen(true)}><Plus className="h-4 w-4 mr-2" />Log Activity</Button>}
        />
      )}

      <ActivityForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  )
}
