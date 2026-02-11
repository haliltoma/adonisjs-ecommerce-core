import * as React from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TagInputProps {
  value?: string[]
  onChange?: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  className?: string
  disabled?: boolean
  suggestions?: string[]
}

function TagInput({
  value = [],
  onChange,
  placeholder = 'Add tag...',
  maxTags,
  className,
  disabled,
  suggestions = [],
}: TagInputProps) {
  const [input, setInput] = React.useState('')
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const filtered = React.useMemo(() => {
    if (!input.trim()) return []
    return suggestions.filter(
      (s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
    )
  }, [input, suggestions, value])

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (!trimmed) return
    if (value.includes(trimmed)) return
    if (maxTags && value.length >= maxTags) return
    onChange?.([...value, trimmed])
    setInput('')
    setShowSuggestions(false)
  }

  const removeTag = (index: number) => {
    onChange?.(value.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value.length - 1)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'border-input bg-background flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border px-3 py-1.5 shadow-xs',
          'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag, index) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            {!disabled && (
              <button
                type="button"
                className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                onClick={(e) => {
                  e.stopPropagation()
                  removeTag(index)
                }}
              >
                <X className="size-3" />
              </button>
            )}
          </Badge>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setShowSuggestions(true)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 200)
            if (input.trim()) addTag(input)
          }}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={disabled || (maxTags !== undefined && value.length >= maxTags)}
          className="bg-transparent text-sm outline-none flex-1 min-w-[80px] placeholder:text-muted-foreground"
        />
      </div>
      {showSuggestions && filtered.length > 0 && (
        <div className="bg-popover absolute top-full left-0 z-50 mt-1 w-full rounded-md border shadow-md max-h-40 overflow-y-auto">
          {filtered.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent"
              onMouseDown={(e) => {
                e.preventDefault()
                addTag(suggestion)
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export { TagInput }
export type { TagInputProps }
