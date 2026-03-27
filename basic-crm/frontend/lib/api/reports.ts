import { apiClient } from "./client"
import type { ReportParams } from "./query-keys"

export type PipelineReport = {
  stages: Array<{ stageId: string; stageName: string; dealCount: number; totalValue: number }>
}

export type ActivityReport = {
  breakdown: Array<{ type: string; count: number }>
  total: number
}

export type WonLostReport = {
  periods: Array<{ period: string; won: number; lost: number; wonValue: number; lostValue: number }>
}

export type DashboardStats = {
  totalContacts: number
  totalCompanies: number
  openDeals: number
  openDealsValue: number
  wonThisMonth: number
  wonThisMonthValue: number
  tasksDueToday: Array<{ id: string; title: string; dueDate: string; contactName?: string; dealTitle?: string; assigneeId: string; assigneeName: string; done: boolean; contactId?: string; dealId?: string; createdAt: string }>
  recentActivities: Array<{ id: string; type: string; subject: string; contactName?: string; dealTitle?: string; userName: string; occurredAt: string; userId: string; body?: string; contactId?: string; dealId?: string; createdAt: string }>
  pipelineByStage: Array<{ stageId: string; stageName: string; dealCount: number; totalValue: number }>
}

export async function getDashboard(): Promise<DashboardStats> {
  return apiClient.get("dashboard").json<DashboardStats>()
}

export async function getPipelineReport(params: ReportParams): Promise<PipelineReport> {
  return apiClient.get("reports/pipeline", { searchParams: params as Record<string, string> }).json<PipelineReport>()
}

export async function getActivityReport(params: ReportParams): Promise<ActivityReport> {
  return apiClient.get("reports/activities", { searchParams: params as Record<string, string> }).json<ActivityReport>()
}

export async function getWonLostReport(params: ReportParams): Promise<WonLostReport> {
  return apiClient.get("reports/won-lost", { searchParams: params as Record<string, string> }).json<WonLostReport>()
}
