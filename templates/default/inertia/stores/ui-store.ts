import { create } from 'zustand'

interface UIState {
  // Sidebar
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // Mobile menu
  mobileMenuOpen: boolean
  toggleMobileMenu: () => void
  closeMobileMenu: () => void

  // Search
  searchOpen: boolean
  searchQuery: string
  openSearch: () => void
  closeSearch: () => void
  setSearchQuery: (query: string) => void

  // Toast notifications
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void

  // Modal
  activeModal: string | null
  modalData: Record<string, unknown>
  openModal: (name: string, data?: Record<string, unknown>) => void
  closeModal: () => void
}

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

let toastId = 0

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  mobileMenuOpen: false,
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),

  searchOpen: false,
  searchQuery: '',
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false, searchQuery: '' }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  toasts: [],
  addToast: (toast) => {
    const id = String(++toastId)
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))

    // Auto-remove after duration
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
      }, duration)
    }
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  activeModal: null,
  modalData: {},
  openModal: (name, data = {}) => set({ activeModal: name, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: {} }),
}))
