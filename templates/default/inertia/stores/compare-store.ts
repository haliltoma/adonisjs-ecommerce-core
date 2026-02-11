import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CompareItem {
  id: string
  productId: string
  title: string
  slug: string
  price: number
  image?: string | null
  attributes?: Record<string, string>
}

interface CompareState {
  items: CompareItem[]
  maxItems: number

  addItem: (item: CompareItem) => boolean
  removeItem: (productId: string) => void
  isInCompare: (productId: string) => boolean
  clearCompare: () => void
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      maxItems: 4,

      addItem: (item) => {
        const state = get()
        if (state.items.length >= state.maxItems) return false
        if (state.items.some((i) => i.productId === item.productId)) return false

        set({ items: [...state.items, item] })
        return true
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }))
      },

      isInCompare: (productId) => get().items.some((i) => i.productId === productId),

      clearCompare: () => set({ items: [] }),
    }),
    {
      name: 'commerce-compare',
    }
  )
)
