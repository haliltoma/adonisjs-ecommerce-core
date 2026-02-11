import { Head, Link, router } from '@inertiajs/react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Filter, Package, Search as SearchIcon, X } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import { useTranslation } from '@/hooks/use-translation'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { formatCurrency } from '@/lib/utils'

interface ProductCard {
  id: string
  title: string
  slug: string
  price: number
  compareAtPrice: number | null
  thumbnail: string | null
  isOnSale: boolean
  discountPercentage: number | null
  vendor?: string
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Meta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
}

interface Props {
  query: string
  products: { data: ProductCard[]; meta: Meta }
  filters: {
    sortBy?: string
    categoryId?: string
    minPrice?: number
    maxPrice?: number
  }
  categories: Category[]
}

export default function Search({ query, products, filters, categories }: Props) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState(query)
  const [selectedSort, setSelectedSort] = useState(filters.sortBy || 'relevance')
  const [selectedCategory, setSelectedCategory] = useState(filters.categoryId || '')
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice?.toString() || '',
    max: filters.maxPrice?.toString() || '',
  })
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const fetchSuggestions = useCallback((value: string) => {
    if (suggestionsTimerRef.current) clearTimeout(suggestionsTimerRef.current)
    if (value.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    suggestionsTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/search/suggestions?q=${encodeURIComponent(value)}`)
        const data = await res.json()
        setSuggestions(data.suggestions || [])
        setShowSuggestions((data.suggestions || []).length > 0)
      } catch {
        setSuggestions([])
      }
    }, 200)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    fetchSuggestions(e.target.value)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    setShowSuggestions(false)
    router.get('/search', { q: suggestion })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestions(false)
    applyFilters()
  }

  const applyFilters = () => {
    const params: Record<string, any> = { q: searchQuery }
    if (selectedSort !== 'relevance') params.sort = selectedSort
    if (selectedCategory) params.category = selectedCategory
    if (priceRange.min) params.minPrice = priceRange.min
    if (priceRange.max) params.maxPrice = priceRange.max

    router.get('/search', params, { preserveState: true })
  }

  const clearFilters = () => {
    setSelectedSort('relevance')
    setSelectedCategory('')
    setPriceRange({ min: '', max: '' })
    router.get('/search', { q: searchQuery })
  }

  const hasActiveFilters = selectedCategory || priceRange.min || priceRange.max

  return (
    <StorefrontLayout>
      <Head title={query ? `Search: ${query}` : 'Search'} />

      {/* Search Header */}
      <section className="relative py-16 grain">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-up">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
              {query ? t('storefront.searchPage.searchResults') : t('storefront.searchPage.discover')}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl tracking-tight mt-3">
              {query ? t('storefront.searchPage.resultsFor', { query }) : t('storefront.searchPage.searchProducts')}
            </h1>
            {query && (
              <p className="text-muted-foreground mt-2">
                {t('storefront.searchPage.resultsCount', { count: products.meta.total, label: products.meta.total === 1 ? t('storefront.searchPage.result') : t('storefront.searchPage.results') })}
              </p>
            )}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-2xl animate-fade-up delay-100">
            <div className="relative" ref={searchContainerRef}>
              <SearchIcon className="text-muted-foreground absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
              <Input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder={t('storefront.searchPage.searchPlaceholder')}
                className="h-12 pl-12 pr-28 border-border/60 focus:border-accent focus:ring-accent/20"
                autoComplete="off"
              />
              <Button type="submit" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2">
                {t('storefront.searchPage.search')}
              </Button>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border bg-background shadow-lg">
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted/50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      <SearchIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters - Desktop */}
          <aside className="hidden lg:block animate-fade-up delay-200">
            <div className="sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground">{t('storefront.searchPage.filters')}</h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-accent hover:text-accent/80">
                    {t('storefront.searchPage.clearAll')}
                  </Button>
                )}
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-3">{t('storefront.searchPage.category')}</h4>
                  <div className="space-y-1">
                    <Button
                      variant={!selectedCategory ? 'secondary' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory('')}
                    >
                      {t('storefront.searchPage.allCategories')}
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? 'secondary' : 'ghost'}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="bg-border/60" />

              {/* Price Range */}
              <div>
                <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-3">{t('storefront.searchPage.priceRange')}</h4>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="h-9 border-border/60"
                    />
                    <span className="text-muted-foreground flex items-center">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="h-9 border-border/60"
                    />
                  </div>
                  <Button size="sm" className="w-full" onClick={applyFilters}>
                    {t('storefront.searchPage.apply')}
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          {/* Products */}
          <div className="lg:col-span-3">
            {/* Sort & Mobile Filter Toggle */}
            <div className="mb-6 flex items-center justify-between animate-fade-up delay-200">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden border-border/60">
                    <Filter className="mr-2 h-4 w-4" />
                    {t('storefront.searchPage.filters')}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="font-display">{t('storefront.searchPage.filters')}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {categories.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-3">{t('storefront.searchPage.category')}</h4>
                        <div className="space-y-1">
                          <Button
                            variant={!selectedCategory ? 'secondary' : 'ghost'}
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => setSelectedCategory('')}
                          >
                            {t('storefront.searchPage.allCategories')}
                          </Button>
                          {categories.map((category) => (
                            <Button
                              key={category.id}
                              variant={selectedCategory === category.id ? 'secondary' : 'ghost'}
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => setSelectedCategory(category.id)}
                            >
                              {category.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator className="bg-border/60" />

                    <div>
                      <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-3">{t('storefront.searchPage.priceRange')}</h4>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Min"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                            className="h-9 border-border/60"
                          />
                          <span className="text-muted-foreground flex items-center">-</span>
                          <Input
                            type="number"
                            placeholder="Max"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                            className="h-9 border-border/60"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" className="flex-1 border-border/60" onClick={clearFilters}>
                        {t('storefront.searchPage.clear')}
                      </Button>
                      <Button className="flex-1" onClick={applyFilters}>
                        {t('storefront.searchPage.apply')}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <Select
                value={selectedSort}
                onValueChange={(value) => {
                  setSelectedSort(value)
                  const params: Record<string, any> = { q: searchQuery }
                  if (value !== 'relevance') params.sort = value
                  if (selectedCategory) params.category = selectedCategory
                  if (priceRange.min) params.minPrice = priceRange.min
                  if (priceRange.max) params.maxPrice = priceRange.max
                  router.get('/search', params, { preserveState: true })
                }}
              >
                <SelectTrigger className="w-44 border-border/60">
                  <SelectValue placeholder={t('storefront.searchPage.sortBy')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">{t('storefront.searchPage.sortRelevance')}</SelectItem>
                  <SelectItem value="newest">{t('storefront.searchPage.sortNewest')}</SelectItem>
                  <SelectItem value="price-asc">{t('storefront.searchPage.sortPriceLowHigh')}</SelectItem>
                  <SelectItem value="price-desc">{t('storefront.searchPage.sortPriceHighLow')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results */}
            {!query ? (
              <Card className="border-dashed border-border/60 animate-fade-up delay-300">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <SearchIcon className="text-muted-foreground h-12 w-12" />
                  <h2 className="font-display mt-4 text-xl">{t('storefront.searchPage.startSearch')}</h2>
                  <p className="text-muted-foreground mt-1">
                    {t('storefront.searchPage.startSearchDesc')}
                  </p>
                </CardContent>
              </Card>
            ) : products.data.length === 0 ? (
              <Card className="border-dashed border-border/60 animate-fade-up delay-300">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Package className="text-muted-foreground h-12 w-12" />
                  <h2 className="font-display mt-4 text-xl">{t('storefront.searchPage.noResults')}</h2>
                  <p className="text-muted-foreground mt-1">
                    {t('storefront.searchPage.noResultsDesc')}
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/products">{t('storefront.searchPage.browseAll')}</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {products.data.map((product, idx) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className={`group animate-fade-up delay-${Math.min((idx + 2) * 100, 700)}`}
                    >
                      <Card className="card-hover overflow-hidden border-0 shadow-none">
                        <div className="bg-muted relative overflow-hidden rounded-xl img-zoom">
                          <AspectRatio ratio={3 / 4}>
                            {product.thumbnail ? (
                              <img
                                src={product.thumbnail}
                                alt={product.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Package className="text-muted-foreground h-12 w-12" />
                              </div>
                            )}
                          </AspectRatio>
                          {product.isOnSale && product.discountPercentage && (
                            <Badge className="absolute left-3 top-3 bg-accent text-accent-foreground">
                              -{product.discountPercentage}%
                            </Badge>
                          )}
                        </div>
                        <CardContent className="px-0 pt-4">
                          {product.vendor && (
                            <p className="text-muted-foreground text-xs uppercase tracking-wide">
                              {product.vendor}
                            </p>
                          )}
                          <h3 className="group-hover:text-accent mt-1 font-medium transition-colors">
                            {product.title}
                          </h3>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="font-semibold">{formatCurrency(product.price)}</span>
                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                              <span className="text-muted-foreground text-sm line-through">
                                {formatCurrency(product.compareAtPrice)}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {products.meta.lastPage > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border/60"
                      disabled={products.meta.currentPage <= 1}
                      onClick={() =>
                        router.get(
                          '/search',
                          {
                            q: query,
                            page: products.meta.currentPage - 1,
                            ...(selectedSort !== 'relevance' && { sort: selectedSort }),
                            ...(selectedCategory && { category: selectedCategory }),
                          },
                          { preserveState: true }
                        )
                      }
                    >
                      {t('storefront.searchPage.previous')}
                    </Button>
                    <span className="text-muted-foreground px-4 text-sm">
                      {t('storefront.searchPage.pageOf', { current: products.meta.currentPage, total: products.meta.lastPage })}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border/60"
                      disabled={products.meta.currentPage >= products.meta.lastPage}
                      onClick={() =>
                        router.get(
                          '/search',
                          {
                            q: query,
                            page: products.meta.currentPage + 1,
                            ...(selectedSort !== 'relevance' && { sort: selectedSort }),
                            ...(selectedCategory && { category: selectedCategory }),
                          },
                          { preserveState: true }
                        )
                      }
                    >
                      {t('storefront.searchPage.next')}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </StorefrontLayout>
  )
}
