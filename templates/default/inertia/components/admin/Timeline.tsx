import * as React from 'react'
import { cn } from '@/lib/utils'

interface TimelineEvent {
  id: string
  title: string
  description?: string
  date: string
  icon?: React.ReactNode
  status?: 'completed' | 'current' | 'upcoming'
}

interface TimelineProps {
  events: TimelineEvent[]
  className?: string
}

function Timeline({ events, className }: TimelineProps) {
  return (
    <div className={cn('relative', className)}>
      {events.map((event, index) => {
        const isLast = index === events.length - 1
        const status = event.status || 'completed'

        return (
          <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Connector line */}
            {!isLast && (
              <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
            )}

            {/* Dot */}
            <div className="relative shrink-0">
              {event.icon ? (
                <div
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full border-2',
                    status === 'completed' && 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
                    status === 'current' && 'border-primary bg-primary/10 text-primary',
                    status === 'upcoming' && 'border-muted-foreground/30 bg-muted text-muted-foreground'
                  )}
                >
                  {event.icon}
                </div>
              ) : (
                <div
                  className={cn(
                    'mt-1.5 size-3 rounded-full border-2 ml-[5px]',
                    status === 'completed' && 'border-emerald-500 bg-emerald-500',
                    status === 'current' && 'border-primary bg-primary',
                    status === 'upcoming' && 'border-muted-foreground/30 bg-background'
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-start justify-between gap-2">
                <p
                  className={cn(
                    'text-sm font-medium',
                    status === 'upcoming' && 'text-muted-foreground'
                  )}
                >
                  {event.title}
                </p>
                <time className="text-muted-foreground text-xs shrink-0 tabular-nums">
                  {event.date}
                </time>
              </div>
              {event.description && (
                <p className="text-muted-foreground text-xs mt-0.5">{event.description}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { Timeline }
export type { TimelineProps, TimelineEvent }
