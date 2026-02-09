import { ReactNode } from 'react'
import { Bell, Search } from 'lucide-react'

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

export default function AdminLayout({
  children,
  title,
  description,
  actions,
}: AdminLayoutProps) {
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
      </SidebarInset>
    </SidebarProvider>
  )
}
