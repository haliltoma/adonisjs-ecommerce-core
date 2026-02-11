import { useState } from 'react'
import { router } from '@inertiajs/react'
import { ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'

interface FilterOption {
  value: string
  label: string
  count?: number
}

interface FilterGroup {
  key: string
  label: string
  type: 'checkbox' | 'range'
  options?: FilterOption[]
  min?: number
  max?: number
}

interface ProductFilterSidebarProps {
  filters: FilterGroup[]
  activeFilters: Record<string, string[]>
  basePath: string
  className?: string
}

export function ProductFilterSidebar({
  filters,
  activeFilters,
  basePath,
  className,
}: ProductFilterSidebarProps) {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')

  const toggleCollapse = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleFilter = (key: string, value: string) => {
    const current = activeFilters[key] || []
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]

    const params: Record<string, string | string[]> = { ...activeFilters }
    if (updated.length > 0) {
      params[key] = updated
    } else {
      delete params[key]
    }

    router.get(basePath, params as Record<string, string>, { preserveState: true })
  }

  const applyPriceRange = () => {
    const params: Record<string, string | string[]> = { ...activeFilters }
    if (priceMin) params.price_min = priceMin
    else delete params.price_min
    if (priceMax) params.price_max = priceMax
    else delete params.price_max
    router.get(basePath, params as Record<string, string>, { preserveState: true })
  }

  const clearAll = () => {
    router.get(basePath, {}, { preserveState: true })
  }

  const hasActiveFilters = Object.values(activeFilters).some((v) => v.length > 0)

  return (
    <aside className={cn('space-y-6', className)}>
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t('storefront.filterSidebar.filters')}</span>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearAll}>
            {t('storefront.filterSidebar.clearAll')}
          </Button>
        </div>
      )}

      {filters.map((group) => (
        <div key={group.key}>
          <button
            onClick={() => toggleCollapse(group.key)}
            className="flex w-full items-center justify-between py-1"
          >
            <span className="text-sm font-medium">{group.label}</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                collapsed.has(group.key) && '-rotate-90'
              )}
            />
          </button>

          {!collapsed.has(group.key) && (
            <div className="mt-2 space-y-1.5">
              {group.type === 'checkbox' &&
                group.options?.map((opt) => {
                  const isActive = (activeFilters[group.key] || []).includes(opt.value)
                  return (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 cursor-pointer text-sm"
                    >
                      <Checkbox
                        checked={isActive}
                        onCheckedChange={() => toggleFilter(group.key, opt.value)}
                      />
                      <span className={cn(!isActive && 'text-muted-foreground')}>
                        {opt.label}
                      </span>
                      {opt.count !== undefined && (
                        <span className="text-muted-foreground text-xs ml-auto">
                          ({opt.count})
                        </span>
                      )}
                    </label>
                  )
                })}

              {group.type === 'range' && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder={t('storefront.filterSidebar.min')}
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="text-sm h-8"
                  />
                  <span className="text-muted-foreground text-xs">-</span>
                  <Input
                    type="number"
                    placeholder={t('storefront.filterSidebar.max')}
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="text-sm h-8"
                  />
                  <Button size="sm" variant="outline" className="h-8 shrink-0" onClick={applyPriceRange}>
                    {t('storefront.filterSidebar.go')}
                  </Button>
                </div>
              )}
            </div>
          )}

          <Separator className="mt-4" />
        </div>
      ))}
    </aside>
  )
}
