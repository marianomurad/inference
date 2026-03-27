"use client"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/api/query-keys"
import { getTables } from "@/lib/api/tables"
import { FloorMap } from "@/components/tables/floor-map"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { EmptyState } from "@/components/shared/empty-state"
import { Grid3X3 } from "lucide-react"
export default function TablesPage() {
  const { data: tables = [], isLoading } = useQuery({ queryKey: queryKeys.tables(), queryFn: getTables })
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Floor Map</h1>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Available</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" />Occupied</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" />Reserved</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-secondary border border-border" />Cleaning</span>
        </div>
      </div>
      {isLoading ? <LoadingSpinner /> : tables.length === 0 ? <EmptyState icon={Grid3X3} title="No tables yet" description="Add tables to see your floor map" /> : <FloorMap tables={tables} />}
    </div>
  )
}
