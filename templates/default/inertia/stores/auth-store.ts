import { create } from 'zustand'

interface Customer {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string | null
}

interface AuthState {
  customer: Customer | null
  isAuthenticated: boolean
  isLoading: boolean

  setCustomer: (customer: Customer | null) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  customer: null,
  isAuthenticated: false,
  isLoading: false,

  setCustomer: (customer) => set({ customer, isAuthenticated: !!customer }),
  clearAuth: () => set({ customer: null, isAuthenticated: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}))
