import { apiClient } from "./client"
export type TableStatus = "available" | "occupied" | "reserved" | "cleaning"
export interface Table { id: string; number: number; capacity: number; status: TableStatus; posX: number; posY: number }
export interface CreateTableRequest { number: number; capacity: number; posX?: number; posY?: number }
export async function getTables(): Promise<Table[]> { return apiClient.get("tables").json<Table[]>() }
export async function getTable(id: string): Promise<Table> { return apiClient.get(`tables/${id}`).json<Table>() }
export async function createTable(data: CreateTableRequest): Promise<Table> { return apiClient.post("tables", { json: data }).json<Table>() }
export async function updateTable(id: string, data: Partial<CreateTableRequest>): Promise<Table> { return apiClient.put(`tables/${id}`, { json: data }).json<Table>() }
export async function updateTableStatus(id: string, status: TableStatus): Promise<Table> { return apiClient.patch(`tables/${id}/status`, { json: { status } }).json<Table>() }
export async function deleteTable(id: string): Promise<void> { await apiClient.delete(`tables/${id}`) }
