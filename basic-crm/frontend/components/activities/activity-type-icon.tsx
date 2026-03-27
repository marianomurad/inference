import { Phone, Mail, CalendarDays, StickyNote } from "lucide-react"
import type { ActivityType } from "@/lib/api/activities"
import { cn } from "@/lib/utils"

const config: Record<ActivityType, { icon: typeof Phone; color: string }> = {
  call: { icon: Phone, color: "text-emerald-400" },
  email: { icon: Mail, color: "text-indigo-400" },
  meeting: { icon: CalendarDays, color: "text-amber-400" },
  note: { icon: StickyNote, color: "text-zinc-400" },
}

export function ActivityTypeIcon({ type, className }: { type: ActivityType; className?: string }) {
  const { icon: Icon, color } = config[type]
  return <Icon className={cn("h-4 w-4", color, className)} />
}
