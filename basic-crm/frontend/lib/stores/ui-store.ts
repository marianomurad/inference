import { create } from "zustand"

interface UIState {
  dealsViewMode: "kanban" | "list"
  setDealsViewMode: (mode: "kanban" | "list") => void
  isGlobalSearchOpen: boolean
  openGlobalSearch: () => void
  closeGlobalSearch: () => void
  isCreateContactOpen: boolean
  setCreateContactOpen: (open: boolean) => void
  isCreateDealOpen: boolean
  setCreateDealOpen: (open: boolean) => void
  isCreateCompanyOpen: boolean
  setCreateCompanyOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()((set) => ({
  dealsViewMode: "kanban",
  setDealsViewMode: (mode) => set({ dealsViewMode: mode }),
  isGlobalSearchOpen: false,
  openGlobalSearch: () => set({ isGlobalSearchOpen: true }),
  closeGlobalSearch: () => set({ isGlobalSearchOpen: false }),
  isCreateContactOpen: false,
  setCreateContactOpen: (open) => set({ isCreateContactOpen: open }),
  isCreateDealOpen: false,
  setCreateDealOpen: (open) => set({ isCreateDealOpen: open }),
  isCreateCompanyOpen: false,
  setCreateCompanyOpen: (open) => set({ isCreateCompanyOpen: open }),
}))
