import { ReactNode, useEffect, useState, useCallback } from 'react'
import { usePage } from '@inertiajs/react'
import { Bell, Search, CheckCircle2, XCircle, X, Sun, Moon } from 'lucide-react'

import { AppSidebar } from '@/components/admin/AppSidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

interface AdminLayoutProps {
  children: ReactNode
  title?: string
  description?: string
  actions?: ReactNode
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-top-2 fade-in duration-300 ${
        type === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
          : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 shrink-0" />
      )}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-auto shrink-0 opacity-60 hover:opacity-100">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('admin-theme', theme)
  }, [theme, mounted])

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggle }
}

export default function AdminLayout({
  children,
  title,
  description,
  actions,
}: AdminLayoutProps) {
  const { props } = usePage<{ flash?: { success?: string; error?: string; errors?: Record<string, string> } }>()
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([])
  const { theme, toggle: toggleTheme } = useTheme()

  useEffect(() => {
    const flash = props.flash
    if (!flash) return

    const newToasts: typeof toasts = []
    if (flash.success) {
      newToasts.push({ id: Date.now(), message: flash.success, type: 'success' })
    }
    if (flash.error) {
      newToasts.push({ id: Date.now() + 1, message: flash.error, type: 'error' })
    }
    if (flash.errors) {
      Object.values(flash.errors).forEach((msg, i) => {
        newToasts.push({ id: Date.now() + 2 + i, message: msg, type: 'error' })
      })
    }

    if (newToasts.length) {
      setToasts((prev) => [...prev, ...newToasts])
    }
  }, [props.flash])

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>

          {/* Search */}
          <div className="flex flex-1 items-center gap-2">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search..."
                className="bg-secondary/50 border-0 pl-8 text-sm h-9"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="bg-accent absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-semibold text-white">
                3
              </span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {title && (
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h1 className="font-display text-2xl tracking-tight">{title}</h1>
                {description && (
                  <p className="text-muted-foreground text-sm mt-0.5">{description}</p>
                )}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          )}
          <div className="p-6">{children}</div>
        </main>

        {/* Toast notifications */}
        {toasts.length > 0 && (
          <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
            {toasts.map((toast) => (
              <Toast
                key={toast.id}
                message={toast.message}
                type={toast.type}
                onClose={() => removeToast(toast.id)}
              />
            ))}
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
