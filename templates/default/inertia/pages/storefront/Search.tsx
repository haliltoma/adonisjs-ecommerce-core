import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import { Filter, Package, Search as SearchIcon, X } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
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
  const [searchQuery, setSearchQuery] = useState(query)
  const [selectedSort, setSelectedSort] = useState(filters.sortBy || 'relevance')
  const [selectedCategory, setSelectedCategory] = useState(filters.categoryId || '')
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice?.toString() || '',
    max: filters.maxPrice?.toString() || '',
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
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
              {query ? 'Search Results' : 'Discover'}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl tracking-tight mt-3">
              {query ? `Results for "${query}"` : 'Search Products'}
            </h1>
            {query && (
              <p className="text-muted-foreground mt-2">
                {products.meta.total} {products.meta.total === 1 ? 'result' : 'results'} found
              </p>
            )}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-2xl animate-fade-up delay-100">
            <div className="relative">
              <SearchIcon className="text-muted-foreground absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="h-12 pl-12 pr-28 border-border/60 focus:border-accent focus:ring-accent/20"
              />
              <Button type="submit" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2">
                Search
              </Button>
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
                <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground">Filters</h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-accent hover:text-accent/80">
                    Clear all
                  </Button>
                )}
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-3">Category</h4>
                  <div className="space-y-1">
                    <Button
                      variant={!selectedCategory ? 'secondary' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory('')}
                    >
                      All Categories
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
                <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-3">Price Range</h4>
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
                    Apply
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
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="font-display">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {categories.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-3">Category</h4>
                        <div className="space-y-1">
                          <Button
                            variant={!selectedCategory ? 'secondary' : 'ghost'}
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => setSelectedCategory('')}
                          >
                            All Categories
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
                      <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-3">Price Range</h4>
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
                        Clear
                      </Button>
                      <Button className="flex-1" onClick={applyFilters}>
                        Apply
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
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results */}
            {!query ? (
              <Card className="border-dashed border-border/60 animate-fade-up delay-300">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <SearchIcon className="text-muted-foreground h-12 w-12" />
                  <h2 className="font-display mt-4 text-xl">Start your search</h2>
                  <p className="text-muted-foreground mt-1">
                    Enter a search term to find products
                  </p>
                </CardContent>
              </Card>
            ) : products.data.length === 0 ? (
              <Card className="border-dashed border-border/60 animate-fade-up delay-300">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Package className="text-muted-foreground h-12 w-12" />
                  <h2 className="font-display mt-4 text-xl">No results found</h2>
                  <p className="text-muted-foreground mt-1">
                    Try adjusting your search or filters
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/products">Browse All Products</Link>
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
                      Previous
                    </Button>
                    <span className="text-muted-foreground px-4 text-sm">
                      Page {products.meta.currentPage} of {products.meta.lastPage}
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
                      Next
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
