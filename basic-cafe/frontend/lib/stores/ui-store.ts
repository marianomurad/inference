import { create } from "zustand"
export interface OrderDraftItem { productId: string; productName: string; variantId?: string; variantName?: string; quantity: number; unitPrice: number; notes: string }
interface UIStore {
  activeTableId: string | null
  setActiveTable: (id: string | null) => void
  isAddItemSheetOpen: boolean
  openAddItemSheet: () => void
  closeAddItemSheet: () => void
  activeOrderId: string | null
  setActiveOrderId: (id: string | null) => void
  orderDraft: OrderDraftItem[]
  addDraftItem: (item: OrderDraftItem) => void
  removeDraftItem: (productId: string) => void
  clearDraft: () => void
}
export const useUIStore = create<UIStore>()((set) => ({
  activeTableId: null,
  setActiveTable: (id) => set({ activeTableId: id }),
  isAddItemSheetOpen: false,
  openAddItemSheet: () => set({ isAddItemSheetOpen: true }),
  closeAddItemSheet: () => set({ isAddItemSheetOpen: false }),
  activeOrderId: null,
  setActiveOrderId: (id) => set({ activeOrderId: id }),
  orderDraft: [],
  addDraftItem: (item) => set((state) => {
    const existing = state.orderDraft.find((d) => d.productId === item.productId && d.variantId === item.variantId)
    if (existing) {
      return { orderDraft: state.orderDraft.map((d) => d.productId === item.productId && d.variantId === item.variantId ? { ...d, quantity: d.quantity + item.quantity } : d) }
    }
    return { orderDraft: [...state.orderDraft, item] }
  }),
  removeDraftItem: (productId) => set((state) => ({ orderDraft: state.orderDraft.filter((d) => d.productId !== productId) })),
  clearDraft: () => set({ orderDraft: [] }),
}))
