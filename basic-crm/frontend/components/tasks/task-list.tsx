"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { completeTask, type Task } from "@/lib/api/tasks"
import { queryKeys } from "@/lib/api/query-keys"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"
import { isAfter, isBefore, isToday, parseISO, startOfDay } from "date-fns"
import Link from "next/link"
import { CheckSquare, Square, Calendar } from "lucide-react"

function TaskItem({ task }: { task: Task }) {
  const qc = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => completeTask(task.id, !task.done),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tasks() }),
    onError: () => toast.error("Failed to update task"),
  })

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${task.done ? "opacity-50 border-zinc-800" : "border-zinc-700 bg-zinc-900/50"}`}>
      <button onClick={() => mutation.mutate()} className="mt-0.5 shrink-0 text-zinc-400 hover:text-indigo-400 transition-colors">
        {task.done ? <CheckSquare className="h-4 w-4 text-emerald-400" /> : <Square className="h-4 w-4" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${task.done ? "line-through text-zinc-500" : "text-white"}`}>{task.title}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(task.dueDate)}</span>
          {task.contactName && <Link href={`/contacts/${task.contactId}`} className="text-indigo-400 hover:underline">{task.contactName}</Link>}
          {task.dealTitle && <Link href={`/deals/${task.dealId}`} className="text-indigo-400 hover:underline">{task.dealTitle}</Link>}
        </div>
      </div>
    </div>
  )
}

interface TaskGroup {
  label: string
  color: string
  tasks: Task[]
}

export function TaskList({ tasks }: { tasks: Task[] }) {
  const today = startOfDay(new Date())

  const groups: TaskGroup[] = [
    {
      label: "Overdue",
      color: "text-rose-400",
      tasks: tasks.filter((t) => !t.done && isBefore(parseISO(t.dueDate), today)),
    },
    {
      label: "Today",
      color: "text-amber-400",
      tasks: tasks.filter((t) => !t.done && isToday(parseISO(t.dueDate))),
    },
    {
      label: "Upcoming",
      color: "text-zinc-300",
      tasks: tasks.filter((t) => !t.done && isAfter(parseISO(t.dueDate), today) && !isToday(parseISO(t.dueDate))),
    },
    {
      label: "Done",
      color: "text-zinc-500",
      tasks: tasks.filter((t) => t.done),
    },
  ]

  return (
    <div className="space-y-6">
      {groups.map((group) =>
        group.tasks.length > 0 ? (
          <div key={group.label}>
            <h3 className={`text-sm font-semibold mb-2 ${group.color}`}>
              {group.label} ({group.tasks.length})
            </h3>
            <div className="space-y-2">
              {group.tasks.map((t) => <TaskItem key={t.id} task={t} />)}
            </div>
          </div>
        ) : null
      )}
    </div>
  )
}
