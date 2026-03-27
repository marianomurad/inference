import { apiClient } from "./client"
import type { Product, ProductVariant } from "./products"
export type OrderStatus = "open" | "ready" | "delivered" | "paid" | "cancelled"
export interface OrderItem { id: string; orderId: string; productId: string; product: Product; variantId?: string; variant?: ProductVariant; quantity: number; unitPrice: number; notes: string }
export interface Order { id: string; tableId?: string; table?: { id: string; number: number }; waiterId: string; status: OrderStatus; items: OrderItem[]; notes: string; openedAt: string; closedAt?: string }
export interface OrderFilters { status?: string; waiterId?: string; from?: string; to?: string }
export interface CreateOrderRequest { tableId?: string; notes?: string }
export interface AddOrderItemRequest { productId: string; variantId?: string; quantity: number; notes?: string }
export async function getOrders(filters?: OrderFilters): Promise<Order[]> {
  const searchParams = new URLSearchParams()
  if (filters?.status) searchParams.set("status", filters.status)
  if (filters?.waiterId) searchParams.set("waiterId", filters.waiterId)
  if (filters?.from) searchParams.set("from", filters.from)
  if (filters?.to) searchParams.set("to", filters.to)
  return apiClient.get("orders", { searchParams }).json<Order[]>()
}
export async function getOrder(id: string): Promise<Order> { return apiClient.get(`orders/${id}`).json<Order>() }
export async function createOrder(data: CreateOrderRequest): Promise<Order> { return apiClient.post("orders", { json: data }).json<Order>() }
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> { return apiClient.patch(`orders/${id}/status`, { json: { status } }).json<Order>() }
export async function addOrderItem(orderId: string, item: AddOrderItemRequest): Promise<Order> { return apiClient.post(`orders/${orderId}/items`, { json: item }).json<Order>() }
export async function removeOrderItem(orderId: string, itemId: string): Promise<Order> { return apiClient.delete(`orders/${orderId}/items/${itemId}`).json<Order>() }
