import { ActivityTypeIcon } from "./activity-type-icon"
import type { Activity } from "@/lib/api/activities"
import { formatRelativeTime } from "@/lib/utils"

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return <p className="text-zinc-500 text-sm py-4">No activities yet.</p>
  }

  return (
    <div className="space-y-0">
      {activities.map((a, i) => (
        <div key={a.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
              <ActivityTypeIcon type={a.type} className="h-3.5 w-3.5" />
            </div>
            {i < activities.length - 1 && <div className="w-px flex-1 bg-zinc-800 my-1" />}
          </div>
          <div className="pb-4 flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-white text-sm font-medium truncate">{a.subject}</p>
              <span className="text-zinc-500 text-xs shrink-0">{formatRelativeTime(a.occurredAt)}</span>
            </div>
            {a.contactName && <p className="text-zinc-400 text-xs">{a.contactName}</p>}
            {a.body && <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{a.body}</p>}
            <p className="text-zinc-600 text-xs mt-0.5">{a.userName}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
