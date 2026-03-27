import { apiClient } from "./client"
import type { TaskFilters } from "./query-keys"

export type Task = {
  id: string
  title: string
  dueDate: string
  done: boolean
  contactId?: string
  contactName?: string
  dealId?: string
  dealTitle?: string
  assigneeId: string
  assigneeName: string
  createdAt: string
}

export type CreateTaskPayload = {
  title: string
  dueDate: string
  contactId?: string
  dealId?: string
  assigneeId?: string
}

export async function getTasks(filters?: TaskFilters): Promise<Task[]> {
  const searchParams: Record<string, string> = {}
  if (filters?.assigneeId) searchParams.assigneeId = filters.assigneeId
  if (filters?.contactId) searchParams.contactId = filters.contactId
  if (filters?.dealId) searchParams.dealId = filters.dealId
  if (filters?.done !== undefined) searchParams.done = String(filters.done)
  return apiClient.get("tasks", { searchParams }).json<Task[]>()
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  return apiClient.post("tasks", { json: payload }).json<Task>()
}

export async function completeTask(id: string, done: boolean): Promise<Task> {
  return apiClient.patch(`tasks/${id}/done`, { json: { done } }).json<Task>()
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`tasks/${id}`)
}
