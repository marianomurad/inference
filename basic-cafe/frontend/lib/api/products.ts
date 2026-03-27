import { apiClient } from "./client"
export interface Category { id: string; name: string }
export interface ProductVariant { id: string; productId: string; name: string; priceDiff: number }
export interface Product { id: string; categoryId: string; category: Category; name: string; description: string; basePrice: number; imageUrl: string; active: boolean; variants: ProductVariant[] }
export interface CreateProductRequest { categoryId: string; name: string; description: string; basePrice: number; imageUrl?: string; active?: boolean; variants?: { name: string; priceDiff: number }[] }
export interface ProductFilters { search?: string; categoryId?: string; active?: boolean }
export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  const searchParams = new URLSearchParams()
  if (filters?.search) searchParams.set("search", filters.search)
  if (filters?.categoryId) searchParams.set("categoryId", filters.categoryId)
  if (filters?.active !== undefined) searchParams.set("active", String(filters.active))
  return apiClient.get("products", { searchParams }).json<Product[]>()
}
export async function getProduct(id: string): Promise<Product> { return apiClient.get(`products/${id}`).json<Product>() }
export async function createProduct(data: CreateProductRequest): Promise<Product> { return apiClient.post("products", { json: data }).json<Product>() }
export async function updateProduct(id: string, data: Partial<CreateProductRequest>): Promise<Product> { return apiClient.put(`products/${id}`, { json: data }).json<Product>() }
export async function deleteProduct(id: string): Promise<void> { await apiClient.delete(`products/${id}`) }
export async function getCategories(): Promise<Category[]> { return apiClient.get("categories").json<Category[]>() }
export async function createCategory(name: string): Promise<Category> { return apiClient.post("categories", { json: { name } }).json<Category>() }
