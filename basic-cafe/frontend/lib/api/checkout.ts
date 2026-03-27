import { apiClient } from "./client"
export type PaymentMethod = "cash" | "card" | "qr"
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded"
export interface CheckoutRequest { method: PaymentMethod; discountCode?: string }
export interface Payment { id: string; orderId: string; amount: number; method: PaymentMethod; provider: string; providerRef: string; status: PaymentStatus; createdAt: string }
export interface CheckoutSummary { orderId: string; items: { name: string; quantity: number; unitPrice: number; total: number }[]; subtotal: number; tax: number; discount: number; total: number }
export async function getCheckoutSummary(orderId: string): Promise<CheckoutSummary> { return apiClient.get(`orders/${orderId}/checkout`).json<CheckoutSummary>() }
export async function confirmCheckout(orderId: string, data: CheckoutRequest): Promise<Payment> { return apiClient.post(`orders/${orderId}/confirm`, { json: data }).json<Payment>() }
export async function refundPayment(paymentId: string, amount?: number): Promise<Payment> { return apiClient.post(`payments/${paymentId}/refund`, { json: { amount } }).json<Payment>() }
