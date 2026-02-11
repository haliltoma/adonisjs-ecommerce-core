import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    value: number
    label?: string
  }
  description?: string
  className?: string
}

function StatsCard({ title, value, icon, trend, description, className }: StatsCardProps) {
  const trendDirection = trend ? (trend.value > 0 ? 'up' : trend.value < 0 ? 'down' : 'neutral') : null

  return (
    <Card className={cn('', className)}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
          </div>
          {icon && (
            <div className="bg-muted rounded-lg p-2.5 text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
        {(trend || description) && (
          <div className="mt-3 flex items-center gap-2">
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-xs font-medium',
                  trendDirection === 'up' && 'text-emerald-600 dark:text-emerald-400',
                  trendDirection === 'down' && 'text-red-600 dark:text-red-400',
                  trendDirection === 'neutral' && 'text-muted-foreground'
                )}
              >
                {trendDirection === 'up' && <TrendingUp className="size-3.5" />}
                {trendDirection === 'down' && <TrendingDown className="size-3.5" />}
                {trendDirection === 'neutral' && <Minus className="size-3.5" />}
                {trend.value > 0 ? '+' : ''}
                {trend.value}%
              </span>
            )}
            {(trend?.label || description) && (
              <span className="text-muted-foreground text-xs">
                {trend?.label || description}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { StatsCard }
export type { StatsCardProps }
