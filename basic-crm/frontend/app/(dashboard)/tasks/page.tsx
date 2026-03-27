"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, CheckSquare } from "lucide-react"
import { getTasks } from "@/lib/api/tasks"
import { queryKeys } from "@/lib/api/query-keys"
import { TaskList } from "@/components/tasks/task-list"
import { TaskForm } from "@/components/tasks/task-form"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"

export default function TasksPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.tasks(),
    queryFn: () => getTasks(),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-zinc-400 text-sm mt-1">{data?.filter((t) => !t.done).length ?? 0} open tasks</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Task
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : data && data.length > 0 ? (
        <TaskList tasks={data} />
      ) : (
        <EmptyState
          icon={CheckSquare}
          title="No tasks yet"
          description="Create tasks to track your follow-ups"
          action={<Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsFormOpen(true)}><Plus className="h-4 w-4 mr-2" />New Task</Button>}
        />
      )}

      <TaskForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  )
}
