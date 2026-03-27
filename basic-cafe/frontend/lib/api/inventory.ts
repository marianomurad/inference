import { apiClient } from "./client"
export interface InventoryItem { id: string; name: string; unit: string; currentStock: number; minStock: number }
export interface StockEntry { id: string; inventoryItemId: string; quantity: number; costPerUnit: number; supplier: string; receivedBy: string; receivedAt: string }
export interface StockIngressRequest { quantity: number; costPerUnit: number; supplier: string; receivedAt?: string }
export async function getInventory(): Promise<InventoryItem[]> { return apiClient.get("inventory").json<InventoryItem[]>() }
export async function getInventoryItem(id: string): Promise<InventoryItem> { return apiClient.get(`inventory/${id}`).json<InventoryItem>() }
export async function getLowStock(): Promise<InventoryItem[]> { return apiClient.get("inventory/low-stock").json<InventoryItem[]>() }
export async function createInventoryItem(data: { name: string; unit: string; minStock: number }): Promise<InventoryItem> { return apiClient.post("inventory", { json: data }).json<InventoryItem>() }
export async function addStockEntry(itemId: string, data: StockIngressRequest): Promise<StockEntry> { return apiClient.post(`inventory/${itemId}/entries`, { json: data }).json<StockEntry>() }
export async function getStockEntries(itemId: string): Promise<StockEntry[]> { return apiClient.get(`inventory/${itemId}/entries`).json<StockEntry[]>() }
