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
      { ...filters, sort: value || undefined },
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

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {products.meta.total} products available
            </p>
          </div>
          <div className="flex items-center gap-3">
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
                  <SheetTitle>Filters</SheetTitle>
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
              value={filters.sort || ''}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="name_asc">Name: A-Z</SelectItem>
                <SelectItem value="name_desc">Name: Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <div className="pt-8 lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
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
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {products.data.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {products.meta.lastPage > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
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
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Package className="text-muted-foreground h-12 w-12" />
                  <h3 className="mt-4 text-lg font-semibold">
                    No products found
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Try adjusting your filters or search terms.
                  </p>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
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

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="group">
      <Card className="overflow-hidden border-0 shadow-none">
        <div className="bg-muted relative overflow-hidden rounded-xl">
          <AspectRatio ratio={3 / 4}>
            {product.thumbnail ? (
              <img
                src={product.thumbnail}
                alt={product.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="text-muted-foreground h-12 w-12" />
              </div>
            )}
          </AspectRatio>
          {product.isOnSale && product.discountPercentage && (
            <Badge variant="destructive" className="absolute left-3 top-3">
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
          <h3 className="group-hover:text-primary mt-1 font-medium transition-colors">
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
          <h3 className="text-sm font-semibold">Categories</h3>
          <div className="mt-3 space-y-1">
            <Button
              variant={!filters.categoryId ? 'secondary' : 'ghost'}
              size="sm"
              className="w-full justify-start"
              onClick={() => onCategoryChange(undefined)}
            >
              All Products
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={filters.categoryId === category.id ? 'secondary' : 'ghost'}
                size="sm"
                className="w-full justify-between"
                onClick={() => onCategoryChange(category.id)}
              >
                <span>{category.name}</span>
                <span className="text-muted-foreground text-xs">
                  {category.productCount}
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold">Price Range</h3>
        <p className="text-muted-foreground mt-1 text-xs">
          {formatCurrency(priceRange.min)} - {formatCurrency(priceRange.max)}
        </p>
        <div className="mt-3 space-y-3">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={localFilters.minPrice}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, minPrice: e.target.value })
              }
              className="h-9"
            />
            <span className="text-muted-foreground flex items-center">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={localFilters.maxPrice}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, maxPrice: e.target.value })
              }
              className="h-9"
            />
          </div>
          <Button size="sm" className="w-full" onClick={onApplyFilters}>
            Apply
          </Button>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <>
          <Separator />
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive w-full"
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
