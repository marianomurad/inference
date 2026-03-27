import { apiClient } from "./client"
export interface ReportParams { from: string; to: string }
export interface SalesReport { totalRevenue: number; totalOrders: number; avgTicket: number; topCategory: string; revenueByDay: { date: string; revenue: number }[]; ordersByHour: { hour: number; count: number }[] }
export interface TopProduct { productId: string; name: string; quantity: number; revenue: number }
export async function getSalesReport(params: ReportParams): Promise<SalesReport> { return apiClient.get("reports/sales", { searchParams: params as unknown as Record<string, string> }).json<SalesReport>() }
export async function getTopProducts(params: ReportParams & { limit?: number }): Promise<TopProduct[]> { return apiClient.get("reports/top-products", { searchParams: params as unknown as Record<string, string> }).json<TopProduct[]>() }
