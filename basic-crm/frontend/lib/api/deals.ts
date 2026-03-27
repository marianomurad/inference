import { apiClient } from "./client"
import type { DealFilters } from "./query-keys"

export type DealStatus = "open" | "won" | "lost"

export type DealStage = {
  id: string
  name: string
  position: number
  color: string
}

export type Deal = {
  id: string
  title: string
  stageId: string
  stageName: string
  ownerId: string
  ownerName: string
  contactId?: string
  contactName?: string
  companyId?: string
  companyName?: string
  value: number
  closeDate?: string
  status: DealStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export type CreateDealPayload = {
  title: string
  stageId: string
  contactId?: string
  companyId?: string
  value: number
  closeDate?: string
  notes?: string
}

export async function getDeals(filters?: DealFilters): Promise<Deal[]> {
  const searchParams: Record<string, string> = {}
  if (filters?.owner) searchParams.owner = filters.owner
  if (filters?.status) searchParams.status = filters.status
  if (filters?.stage) searchParams.stage = filters.stage
  return apiClient.get("deals", { searchParams }).json<Deal[]>()
}

export async function getDeal(id: string): Promise<Deal> {
  return apiClient.get(`deals/${id}`).json<Deal>()
}

export async function getDealStages(): Promise<DealStage[]> {
  return apiClient.get("deal-stages").json<DealStage[]>()
}

export async function createDeal(payload: CreateDealPayload): Promise<Deal> {
  return apiClient.post("deals", { json: payload }).json<Deal>()
}

export async function updateDeal(id: string, payload: Partial<CreateDealPayload>): Promise<Deal> {
  return apiClient.put(`deals/${id}`, { json: payload }).json<Deal>()
}

export async function moveDealStage(id: string, stageId: string): Promise<Deal> {
  return apiClient.patch(`deals/${id}/stage`, { json: { stageId } }).json<Deal>()
}

export async function setDealStatus(id: string, status: DealStatus): Promise<Deal> {
  return apiClient.patch(`deals/${id}`, { json: { status } }).json<Deal>()
}

export async function deleteDeal(id: string): Promise<void> {
  await apiClient.delete(`deals/${id}`)
}
