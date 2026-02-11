import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  variantId: string
  title: string
  variantTitle?: string
  price: number
  compareAtPrice?: number | null
  quantity: number
  image?: string | null
  sku?: string
  maxQuantity?: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  isLoading: boolean

  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  setLoading: (loading: boolean) => void

  // Computed
  totalItems: () => number
  subtotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,

      addItem: (item) => {
        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.variantId === item.variantId)

          if (existingIndex >= 0) {
            const updated = [...state.items]
            const existing = updated[existingIndex]
            const newQty = existing.quantity + (item.quantity || 1)
            updated[existingIndex] = {
              ...existing,
              quantity: item.maxQuantity ? Math.min(newQty, item.maxQuantity) : newQty,
            }
            return { items: updated, isOpen: true }
          }

          return {
            items: [...state.items, { ...item, quantity: item.quantity || 1 }],
            isOpen: true,
          }
        })
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }))
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setLoading: (loading) => set({ isLoading: loading }),

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: 'commerce-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
