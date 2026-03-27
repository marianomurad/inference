"use client"

import { useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { moveDealStage, type Deal, type DealStage } from "@/lib/api/deals"
import { queryKeys } from "@/lib/api/query-keys"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Calendar, User } from "lucide-react"
import { formatDate } from "@/lib/utils"

function SortableDealCard({ deal }: { deal: Deal }) {
  const router = useRouter()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-zinc-600 transition-colors"
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest("[data-no-navigate]")) {
          router.push(`/deals/${deal.id}`)
        }
      }}
    >
      <p className="text-white text-sm font-medium truncate">{deal.title}</p>
      {deal.companyName && <p className="text-zinc-400 text-xs mt-0.5 truncate">{deal.companyName}</p>}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-emerald-400 text-sm font-semibold">{formatCurrency(deal.value)}</span>
        {deal.closeDate && (
          <span className="text-zinc-500 text-xs flex items-center gap-1">
            <Calendar className="h-3 w-3" />{formatDate(deal.closeDate)}
          </span>
        )}
      </div>
      <div className="mt-1 flex items-center gap-1 text-zinc-500 text-xs">
        <User className="h-3 w-3" />{deal.ownerName}
      </div>
    </div>
  )
}

function DroppableColumn({ stage, deals }: { stage: DealStage; deals: Deal[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0)

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-64 shrink-0 rounded-xl border transition-colors ${
        isOver ? "border-indigo-500 bg-indigo-500/5" : "border-zinc-800 bg-zinc-900/50"
      }`}
    >
      <div className="px-3 py-2.5 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <span className="text-white text-sm font-medium">{stage.name}</span>
          <span className="text-zinc-500 text-xs bg-zinc-800 px-2 py-0.5 rounded-full">{deals.length}</span>
        </div>
        <p className="text-emerald-400 text-xs mt-0.5">{formatCurrency(totalValue)}</p>
      </div>
      <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 p-2 space-y-2 min-h-[100px] overflow-y-auto max-h-[calc(100vh-220px)]">
          {deals.map((deal) => <SortableDealCard key={deal.id} deal={deal} />)}
        </div>
      </SortableContext>
    </div>
  )
}

interface PipelineBoardProps {
  stages: DealStage[]
  deals: Deal[]
}

export function PipelineBoard({ stages, deals }: PipelineBoardProps) {
  const qc = useQueryClient()
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const moveMutation = useMutation({
    mutationFn: ({ dealId, stageId }: { dealId: string; stageId: string }) => moveDealStage(dealId, stageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.deals() }),
    onError: () => toast.error("Failed to move deal"),
  })

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    setActiveId(null)
    if (!over) return
    const deal = deals.find((d) => d.id === String(active.id))
    if (!deal) return
    const targetStageId = stages.find((s) => s.id === String(over.id))?.id
      ?? deals.find((d) => d.id === String(over.id))?.stageId
    if (!targetStageId || targetStageId === deal.stageId) return
    moveMutation.mutate({ dealId: deal.id, stageId: targetStageId })
  }

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) : null

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <DroppableColumn
            key={stage.id}
            stage={stage}
            deals={deals.filter((d) => d.stageId === stage.id && d.status === "open")}
          />
        ))}
      </div>
      <DragOverlay>
        {activeDeal && (
          <div className="bg-zinc-800 border border-indigo-500 rounded-lg p-3 w-64 shadow-2xl rotate-2 opacity-90">
            <p className="text-white text-sm font-medium truncate">{activeDeal.title}</p>
            <span className="text-emerald-400 text-sm font-semibold">{formatCurrency(activeDeal.value)}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
