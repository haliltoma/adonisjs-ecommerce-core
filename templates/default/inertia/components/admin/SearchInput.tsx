import * as React from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  title: string
  description?: string
  href?: string
  icon?: React.ReactNode
  category?: string
}

interface SearchInputProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSearch?: (query: string) => void
  results?: SearchResult[]
  onSelect?: (result: SearchResult) => void
  isLoading?: boolean
  placeholder?: string
  className?: string
}

function SearchInput({
  open: controlledOpen,
  onOpenChange,
  onSearch,
  results = [],
  onSelect,
  isLoading,
  placeholder = 'Search...',
  className,
}: SearchInputProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  const isOpen = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  // CMD+K shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(!isOpen)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, setOpen])

  React.useEffect(() => {
    if (isOpen) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    onSearch?.(value)
  }

  const grouped = React.useMemo(() => {
    const map = new Map<string, SearchResult[]>()
    for (const result of results) {
      const cat = result.category || 'Results'
      const group = map.get(cat) || []
      group.push(result)
      map.set(cat, group)
    }
    return map
  }, [results])

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'border-input bg-background text-muted-foreground inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm shadow-xs hover:bg-accent',
          className
        )}
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">{placeholder}</span>
        <kbd className="bg-muted pointer-events-none ml-auto hidden rounded border px-1.5 py-0.5 text-[10px] font-medium sm:inline">
          {navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'}K
        </kbd>
      </button>

      {/* Search dialog */}
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden">
          <div className="flex items-center border-b px-3">
            <Search className="text-muted-foreground size-4 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleChange}
              placeholder={placeholder}
              className="flex-1 bg-transparent py-3 px-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            {isLoading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
            {query && !isLoading && (
              <button onClick={() => { setQuery(''); onSearch?.('') }}>
                <X className="size-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {query && (
            <div className="max-h-[300px] overflow-y-auto p-2">
              {results.length === 0 && !isLoading && (
                <p className="text-muted-foreground text-center py-6 text-sm">No results found.</p>
              )}
              {Array.from(grouped.entries()).map(([category, items]) => (
                <div key={category}>
                  <p className="text-muted-foreground text-xs font-medium px-2 py-1.5">
                    {category}
                  </p>
                  {items.map((result) => (
                    <button
                      key={result.id}
                      className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
                      onClick={() => {
                        onSelect?.(result)
                        setOpen(false)
                      }}
                    >
                      {result.icon && (
                        <span className="text-muted-foreground shrink-0">{result.icon}</span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{result.title}</p>
                        {result.description && (
                          <p className="text-muted-foreground text-xs truncate">
                            {result.description}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export { SearchInput }
export type { SearchInputProps, SearchResult }
