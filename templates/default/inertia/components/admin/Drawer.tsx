import * as React from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  side?: 'left' | 'right'
  className?: string
}

function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  side = 'right',
  className,
}: DrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className={cn('flex flex-col overflow-y-auto', className)}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 py-4">{children}</div>
        {footer && (
          <SheetFooter className="border-t pt-4">
            {footer}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}

export { Drawer }
export type { DrawerProps }
