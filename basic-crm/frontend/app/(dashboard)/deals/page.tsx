"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, TrendingUp, LayoutGrid, List } from "lucide-react"
import { getDeals, getDealStages } from "@/lib/api/deals"
import { queryKeys } from "@/lib/api/query-keys"
import { PipelineBoard } from "@/components/deals/pipeline-board"
import { DealTable } from "@/components/deals/deal-table"
import { DealForm } from "@/components/deals/deal-form"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Button } from "@/components/ui/button"
import { useUIStore } from "@/lib/stores/ui-store"

export default function DealsPage() {
  const viewMode = useUIStore((s) => s.dealsViewMode)
  const setViewMode = useUIStore((s) => s.setDealsViewMode)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const { data: deals, isLoading: dealsLoading } = useQuery({
    queryKey: queryKeys.deals(),
    queryFn: () => getDeals(),
  })

  const { data: stages, isLoading: stagesLoading } = useQuery({
    queryKey: queryKeys.dealStages(),
    queryFn: getDealStages,
  })

  const isLoading = dealsLoading || stagesLoading

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Deals</h1>
          <p className="text-zinc-400 text-sm mt-1">{deals?.length ?? 0} deals</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-zinc-800 overflow-hidden">
            <button
              className={`px-3 py-1.5 text-sm transition-colors ${viewMode === "kanban" ? "bg-indigo-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"}`}
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              className={`px-3 py-1.5 text-sm transition-colors ${viewMode === "list" ? "bg-indigo-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"}`}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Deal
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : deals && deals.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No deals yet"
          description="Create your first deal to start tracking your pipeline"
          action={<Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsFormOpen(true)}><Plus className="h-4 w-4 mr-2" /> New Deal</Button>}
        />
      ) : viewMode === "kanban" ? (
        <PipelineBoard stages={stages ?? []} deals={deals ?? []} />
      ) : (
        <DealTable data={deals ?? []} />
      )}

      <DealForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  )
}
