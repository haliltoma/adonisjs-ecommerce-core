import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Announcement {
  id: string
  text: string
  link?: string
  bgColor?: string
  textColor?: string
}

interface AnnouncementBarProps {
  announcements: Announcement[]
  className?: string
}

export function AnnouncementBar({ announcements, className }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [current, setCurrent] = useState(0)

  const visible = announcements.filter((a) => !dismissed.has(a.id))
  if (visible.length === 0) return null

  const announcement = visible[current % visible.length]

  const dismiss = () => {
    setDismissed((prev) => new Set(prev).add(announcement.id))
  }

  const content = (
    <span className="text-xs font-medium tracking-widest uppercase">
      {announcement.text}
    </span>
  )

  return (
    <div
      className={cn('relative py-2.5 text-center', className)}
      style={{
        backgroundColor: announcement.bgColor || undefined,
        color: announcement.textColor || undefined,
      }}
    >
      <div className="mx-auto max-w-7xl px-8">
        {announcement.link ? (
          <a href={announcement.link} className="hover:underline underline-offset-2">
            {content}
          </a>
        ) : (
          content
        )}
      </div>
      <button
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
