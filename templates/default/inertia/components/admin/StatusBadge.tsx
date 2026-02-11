import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type StatusType =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'default'
  | 'pending'

const statusStyles: Record<StatusType, string> = {
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  warning: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  error: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
  info: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  pending: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  default: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
}

const statusDots: Record<StatusType, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  pending: 'bg-gray-400',
  default: 'bg-gray-400',
}

interface StatusBadgeProps {
  status: StatusType
  label: string
  showDot?: boolean
  className?: string
}

const statusMap: Record<string, StatusType> = {
  active: 'success',
  published: 'success',
  completed: 'success',
  paid: 'success',
  delivered: 'success',
  fulfilled: 'success',
  approved: 'success',
  pending: 'pending',
  processing: 'info',
  shipped: 'info',
  in_progress: 'info',
  on_hold: 'warning',
  low_stock: 'warning',
  refunded: 'warning',
  partial: 'warning',
  cancelled: 'error',
  failed: 'error',
  out_of_stock: 'error',
  rejected: 'error',
  draft: 'default',
  inactive: 'default',
  archived: 'default',
}

function resolveStatus(status: string): StatusType {
  return statusMap[status.toLowerCase().replace(/[\s-]/g, '_')] || 'default'
}

function StatusBadge({ status, label, showDot = true, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(statusStyles[status], 'gap-1.5 font-medium', className)}
    >
      {showDot && (
        <span className={cn('size-1.5 rounded-full', statusDots[status])} />
      )}
      {label}
    </Badge>
  )
}

function AutoStatusBadge({
  status,
  showDot = true,
  className,
}: {
  status: string
  showDot?: boolean
  className?: string
}) {
  const resolvedType = resolveStatus(status)
  const label = status.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return (
    <StatusBadge
      status={resolvedType}
      label={label}
      showDot={showDot}
      className={className}
    />
  )
}

export { StatusBadge, AutoStatusBadge, resolveStatus }
export type { StatusBadgeProps, StatusType }
