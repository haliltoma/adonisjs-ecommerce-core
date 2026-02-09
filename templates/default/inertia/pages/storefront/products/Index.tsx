import { Link, router } from '@inertiajs/react'
import { useState } from 'react'
import { Filter, Package, SlidersHorizontal, X } from 'lucide-react'

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
import { CollectionListSeo } from '@/components/shared/Seo'

interface Product {
  id: string
  title: string
  slug: string
  price: number
  compareAtPrice: number | null
  thumbnail: string | null
  isOnSale: boolean
  discountPercentage: number | null
  vendor: string | null
}

interface Category {
  id: string
  name: string
  slug: string
  productCount: number
}

interface Props {
  products: {
    data: Product[]
    meta: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
    }
  }
  categories: Category[]
  filters: {
    categoryId?: string
    minPrice?: number
    maxPrice?: number
    sort?: string
    search?: string
  }
  priceRange: {
    min: number
    max: number
  }
}

export default function ProductsIndex({
  products,
  categories,
  filters,
  priceRange,
}: Props) {
  const [localFilters, setLocalFilters] = useState({
    minPrice: filters.minPrice?.toString() || '',
    maxPrice: filters.maxPrice?.toString() || '',
  })

  const applyFilters = () => {
    router.get(
      '/products',
      {
        ...filters,
        minPrice: localFilters.minPrice || undefined,
        maxPrice: localFilters.maxPrice || undefined,
      },
      { preserveState: true }
    )
  }

  const handleSortChange = (value: string) => {
    router.get(
      '/products',
      { ...filters, sort: value === 'featured' ? undefined : value },
      { preserveState: true }
    )
  }

  const handleCategoryChange = (categoryId?: string) => {
    router.get(
      '/products',
      { ...filters, categoryId },
      { preserveState: true }
    )
  }

  const clearFilters = () => {
    setLocalFilters({ minPrice: '', maxPrice: '' })
    router.get('/products', {}, { preserveState: true })
  }

  const hasActiveFilters =
    filters.categoryId || filters.minPrice || filters.maxPrice

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const storeName = 'AdonisCommerce'

  return (
    <StorefrontLayout>
      <CollectionListSeo
        title="All Products"
        description={`Browse our collection of ${products.meta.total} premium products. Find the perfect item with free shipping on orders over $100.`}
        storeName={storeName}
        baseUrl={baseUrl}
        image={products.data[0]?.thumbnail || undefined}
      />

      {/* Page Header */}
      <section className="border-b bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <span className="animate-fade-up text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                Our Collection
              </span>
              <h1 className="animate-fade-up delay-100 font-display text-4xl tracking-tight sm:text-5xl mt-3">
                Products
              </h1>
              <p className="animate-fade-up delay-200 text-muted-foreground mt-3 text-sm leading-relaxed">
                Explore {products.meta.total} carefully curated pieces for modern living
              </p>
            </div>
            <div className="animate-fade-up delay-300 flex items-center gap-3">
              {/* Mobile Filters */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="font-display text-xl">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <FilterContent
                      categories={categories}
                      filters={filters}
                      localFilters={localFilters}
                      setLocalFilters={setLocalFilters}
                      priceRange={priceRange}
                      onCategoryChange={handleCategoryChange}
                      onApplyFilters={applyFilters}
                      onClearFilters={clearFilters}
                      hasActiveFilters={hasActiveFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort Select */}
              <Select
                value={filters.sort || 'featured'}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-48 rounded-lg border-border/60 bg-background text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="name_asc">Name: A-Z</SelectItem>
                  <SelectItem value="name_desc">Name: Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
          {/* Desktop Filters */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <FilterContent
                categories={categories}
                filters={filters}
                localFilters={localFilters}
                setLocalFilters={setLocalFilters}
                priceRange={priceRange}
                onCategoryChange={handleCategoryChange}
                onApplyFilters={applyFilters}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {products.data.length > 0 ? (
              <>
                <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                  {products.data.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>

                {/* Pagination */}
                {products.meta.lastPage > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg px-5"
                      disabled={products.meta.currentPage <= 1}
                      onClick={() =>
                        router.get(
                          '/products',
                          { ...filters, page: products.meta.currentPage - 1 },
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
                      className="rounded-lg px-5"
                      disabled={
                        products.meta.currentPage >= products.meta.lastPage
                      }
                      onClick={() =>
                        router.get(
                          '/products',
                          { ...filters, page: products.meta.currentPage + 1 },
                          { preserveState: true }
                        )
                      }
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="border-dashed rounded-xl">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                    <Package className="text-muted-foreground h-8 w-8" />
                  </div>
                  <h3 className="mt-6 font-display text-xl">
                    No products found
                  </h3>
                  <p className="text-muted-foreground mt-2 max-w-sm leading-relaxed">
                    Try adjusting your filters or search terms to discover something new.
                  </p>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-6 rounded-lg"
                      onClick={clearFilters}
                    >
                      Clear all filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </StorefrontLayout>
  )
}

function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className={`group card-hover block animate-fade-up delay-${Math.min((index % 6 + 1) * 100, 700)}`}
    >
      <div className="relative overflow-hidden rounded-xl bg-muted img-zoom">
        <AspectRatio ratio={3 / 4}>
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
              <Package className="text-muted-foreground/30 h-12 w-12" />
            </div>
          )}
        </AspectRatio>
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.isOnSale && product.discountPercentage && (
            <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold text-white tracking-wide">
              -{product.discountPercentage}%
            </span>
          )}
        </div>
      </div>
      <div className="pt-4">
        {product.vendor && (
          <p className="text-muted-foreground text-[11px] tracking-[0.1em] uppercase">
            {product.vendor}
          </p>
        )}
        <h3 className="mt-1 text-sm font-medium leading-snug group-hover:underline underline-offset-4 decoration-foreground/30">
          {product.title}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-semibold">{formatCurrency(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-muted-foreground text-xs line-through">
              {formatCurrency(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

interface FilterContentProps {
  categories: Category[]
  filters: Props['filters']
  localFilters: { minPrice: string; maxPrice: string }
  setLocalFilters: (filters: { minPrice: string; maxPrice: string }) => void
  priceRange: Props['priceRange']
  onCategoryChange: (categoryId?: string) => void
  onApplyFilters: () => void
  onClearFilters: () => void
  hasActiveFilters: boolean | string | number | undefined
}

function FilterContent({
  categories,
  filters,
  localFilters,
  setLocalFilters,
  priceRange,
  onCategoryChange,
  onApplyFilters,
  onClearFilters,
  hasActiveFilters,
}: FilterContentProps) {
  return (
    <>
      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-accent">
            Browse
          </span>
          <h3 className="font-display text-lg tracking-tight mt-1">Categories</h3>
          <div className="mt-4 space-y-0.5">
            <button
              type="button"
              onClick={() => onCategoryChange(undefined)}
              className={`group/cat flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                !filters.categoryId
                  ? 'bg-secondary font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              }`}
            >
              <span className="relative">
                All Products
                <span
                  className={`absolute -bottom-0.5 left-0 h-px bg-foreground transition-all duration-300 ${
                    !filters.categoryId ? 'w-full' : 'w-0 group-hover/cat:w-full'
                  }`}
                />
              </span>
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`group/cat flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  filters.categoryId === category.id
                    ? 'bg-secondary font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`}
              >
                <span className="relative">
                  {category.name}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px bg-foreground transition-all duration-300 ${
                      filters.categoryId === category.id ? 'w-full' : 'w-0 group-hover/cat:w-full'
                    }`}
                  />
                </span>
                <span className="text-[11px] text-muted-foreground/70 tabular-nums">
                  {category.productCount}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <Separator className="opacity-50" />

      {/* Price Range */}
      <div>
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-accent">
          Filter
        </span>
        <h3 className="font-display text-lg tracking-tight mt-1">Price Range</h3>
        <p className="text-muted-foreground mt-2 text-xs">
          {formatCurrency(priceRange.min)} - {formatCurrency(priceRange.max)}
        </p>
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={localFilters.minPrice}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, minPrice: e.target.value })
              }
              className="h-9 rounded-lg"
            />
            <span className="text-muted-foreground flex items-center text-sm">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={localFilters.maxPrice}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, maxPrice: e.target.value })
              }
              className="h-9 rounded-lg"
            />
          </div>
          <Button size="sm" className="w-full rounded-lg" onClick={onApplyFilters}>
            Apply Price Filter
          </Button>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <>
          <Separator className="opacity-50" />
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground w-full rounded-lg"
            onClick={onClearFilters}
          >
            <X className="mr-2 h-4 w-4" />
            Clear all filters
          </Button>
        </>
      )}
    </>
  )
}
