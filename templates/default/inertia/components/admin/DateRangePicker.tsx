import * as React from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface DateRange {
  from: string
  to: string
}

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange) => void
  className?: string
  disabled?: boolean
}

const presets: { label: string; getValue: () => DateRange }[] = [
  {
    label: 'Today',
    getValue: () => {
      const today = new Date().toISOString().split('T')[0]
      return { from: today, to: today }
    },
  },
  {
    label: 'Last 7 days',
    getValue: () => {
      const to = new Date()
      const from = new Date(to)
      from.setDate(from.getDate() - 6)
      return { from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] }
    },
  },
  {
    label: 'Last 30 days',
    getValue: () => {
      const to = new Date()
      const from = new Date(to)
      from.setDate(from.getDate() - 29)
      return { from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] }
    },
  },
  {
    label: 'This month',
    getValue: () => {
      const now = new Date()
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from: from.toISOString().split('T')[0], to: now.toISOString().split('T')[0] }
    },
  },
  {
    label: 'Last month',
    getValue: () => {
      const now = new Date()
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const to = new Date(now.getFullYear(), now.getMonth(), 0)
      return { from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] }
    },
  },
]

function DateRangePicker({
  value,
  onChange,
  className,
  disabled,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const formatDisplay = () => {
    if (!value?.from && !value?.to) return 'Select date range'
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
    const from = value.from ? new Date(value.from + 'T00:00:00').toLocaleDateString('en-US', opts) : ''
    const to = value.to ? new Date(value.to + 'T00:00:00').toLocaleDateString('en-US', opts) : ''
    if (from === to) return from
    return `${from} - ${to}`
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Button
        variant="outline"
        type="button"
        disabled={disabled}
        className="w-full justify-start text-left font-normal"
        onClick={() => setOpen(!open)}
      >
        <CalendarDays className="mr-2 size-4" />
        <span className={cn(!value?.from && 'text-muted-foreground')}>
          {formatDisplay()}
        </span>
      </Button>
      {open && (
        <div className="bg-popover absolute top-full left-0 z-50 mt-1 rounded-md border p-3 shadow-md min-w-[300px]">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">From</label>
                <Input
                  type="date"
                  value={value?.from || ''}
                  onChange={(e) => onChange?.({ from: e.target.value, to: value?.to || e.target.value })}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">To</label>
                <Input
                  type="date"
                  value={value?.to || ''}
                  onChange={(e) => onChange?.({ from: value?.from || e.target.value, to: e.target.value })}
                  className="text-sm"
                />
              </div>
            </div>
            <div className="border-t pt-2">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Quick select</p>
              <div className="flex flex-wrap gap-1">
                {presets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    type="button"
                    className="h-7 text-xs"
                    onClick={() => {
                      onChange?.(preset.getValue())
                      setOpen(false)
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { DateRangePicker }
export type { DateRangePickerProps, DateRange }
