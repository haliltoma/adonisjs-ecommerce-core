import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface RecentlyViewedItem {
  id: string
  productId: string
  title: string
  slug: string
  price: number
  image?: string | null
  viewedAt: number
}

interface RecentlyViewedState {
  items: RecentlyViewedItem[]
  maxItems: number

  addItem: (item: Omit<RecentlyViewedItem, 'viewedAt'>) => void
  getItems: (excludeId?: string) => RecentlyViewedItem[]
  clearHistory: () => void
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      maxItems: 20,

      addItem: (item) => {
        set((state) => {
          const filtered = state.items.filter((i) => i.productId !== item.productId)
          return {
            items: [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, state.maxItems),
          }
        })
      },

      getItems: (excludeId) => {
        const items = get().items
        if (excludeId) return items.filter((i) => i.productId !== excludeId)
        return items
      },

      clearHistory: () => set({ items: [] }),
    }),
    {
      name: 'commerce-recently-viewed',
    }
  )
)
