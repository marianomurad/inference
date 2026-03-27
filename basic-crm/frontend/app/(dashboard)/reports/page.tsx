"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { BarChart3, TrendingUp, Users, Activity } from "lucide-react"
import { getPipelineReport, getWonLostReport, getActivityReport } from "@/lib/api/reports"
import { queryKeys } from "@/lib/api/query-keys"
import { MetricCard } from "@/components/reports/metric-card"
import { PipelineChart } from "@/components/reports/pipeline-chart"
import { WonLostChart } from "@/components/reports/won-lost-chart"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"

const RANGES = ["week", "month", "quarter"] as const
type Range = (typeof RANGES)[number]

export default function ReportsPage() {
  const [range, setRange] = useState<Range>("month")
  const params = { range }

  const { data: pipeline, isLoading: p1 } = useQuery({
    queryKey: queryKeys.reports({ ...params, type: "pipeline" } as unknown as { range: string }),
    queryFn: () => getPipelineReport(params),
  })

  const { data: wonLost, isLoading: p2 } = useQuery({
    queryKey: queryKeys.reports({ ...params, type: "won-lost" } as unknown as { range: string }),
    queryFn: () => getWonLostReport(params),
  })

  const { data: activityReport, isLoading: p3 } = useQuery({
    queryKey: queryKeys.reports({ ...params, type: "activities" } as unknown as { range: string }),
    queryFn: () => getActivityReport(params),
  })

  const isLoading = p1 || p2 || p3

  const totalPipelineValue = pipeline?.stages.reduce((s, st) => s + st.totalValue, 0) ?? 0
  const totalDeals = pipeline?.stages.reduce((s, st) => s + st.dealCount, 0) ?? 0
  const wonCount = wonLost?.periods.reduce((s, p) => s + p.won, 0) ?? 0
  const totalActivities = activityReport?.total ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <Select value={range} onValueChange={(v) => setRange((v ?? "month") as Range)}>
          <SelectTrigger className="bg-zinc-900 border-zinc-800 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Pipeline Value" value={formatCurrency(totalPipelineValue)} icon={BarChart3} />
            <MetricCard title="Open Deals" value={totalDeals} icon={TrendingUp} />
            <MetricCard title="Won Deals" value={wonCount} icon={Users} />
            <MetricCard title="Activities" value={totalActivities} icon={Activity} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pipeline && (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-base">Pipeline by Stage</CardTitle>
                </CardHeader>
                <CardContent>
                  <PipelineChart data={pipeline} />
                </CardContent>
              </Card>
            )}
            {wonLost && (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-base">Won vs Lost</CardTitle>
                </CardHeader>
                <CardContent>
                  <WonLostChart data={wonLost} />
                </CardContent>
              </Card>
            )}
          </div>

          {activityReport && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white text-base">Activity Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 flex-wrap">
                  {activityReport.breakdown.map((b) => (
                    <div key={b.type} className="text-center">
                      <p className="text-2xl font-bold text-white">{b.count}</p>
                      <p className="text-zinc-400 text-sm capitalize">{b.type}s</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
