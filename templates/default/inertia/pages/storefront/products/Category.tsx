import { Link, router } from '@inertiajs/react'
import { useState } from 'react'
import { Package, X } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import { useTranslation } from '@/hooks/use-translation'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
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
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
}

interface Subcategory {
  id: string
  name: string
  slug: string
  imageUrl: string | null
}

interface BreadcrumbItem {
  name: string
  slug: string
}

interface Props {
  category: Category
  products: {
    data: Product[]
    meta: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
    }
  }
  filters: {
    sortBy?: string
    minPrice?: number
    maxPrice?: number
  }
  breadcrumb: BreadcrumbItem[]
  subcategories: Subcategory[]
}

export default function CategoryPage({
  category,
  products,
  filters,
  breadcrumb,
  subcategories,
}: Props) {
  const { t } = useTranslation()
  const [localFilters, setLocalFilters] = useState({
    minPrice: filters.minPrice?.toString() || '',
    maxPrice: filters.maxPrice?.toString() || '',
  })

  const categoryUrl = `/category/${category.slug}`

  const applyFilters = () => {
    router.get(
      categoryUrl,
      {
        ...filters,
        minPrice: localFilters.minPrice || undefined,
        maxPrice: localFilters.maxPrice || undefined,
      },
      { preserveState: true }
    )
  }

  const clearFilters = () => {
    setLocalFilters({ minPrice: '', maxPrice: '' })
    router.get(categoryUrl, {}, { preserveState: true })
  }

  const hasActiveFilters = filters.minPrice || filters.maxPrice

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const storeName = 'AdonisCommerce'

  return (
    <StorefrontLayout>
      <CollectionListSeo
        title={category.name}
        description={
          category.description ||
          t('storefront.categoryPage.productsCount', { count: products.meta.total })
        }
        storeName={storeName}
        baseUrl={baseUrl}
        image={category.imageUrl || products.data[0]?.thumbnail || undefined}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6 animate-fade-in">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">{t('storefront.categoryPage.home')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/products">{t('storefront.categoryPage.products')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumb.map((item) => (
              <span key={item.slug} className="contents">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/category/${item.slug}`}>{item.name}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </span>
            ))}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{category.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Category Header */}
        <div className="mb-10 animate-fade-up">
          {category.imageUrl && (
            <div className="mb-6 overflow-hidden rounded-2xl img-zoom">
              <AspectRatio ratio={3}>
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="h-full w-full object-cover"
                />
              </AspectRatio>
            </div>
          )}
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
            {t('storefront.categoryPage.collection')}
          </span>
          <h1 className="font-display text-3xl tracking-tight mt-2">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground mt-2">{category.description}</p>
          )}
        </div>

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div className="mb-12 animate-fade-up delay-100">
            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground">{t('storefront.categoryPage.subcategories')}</span>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/category/${sub.slug}`}
                  className="group flex items-center gap-3 rounded-lg border border-border/60 p-4 transition-all hover:border-accent/50 card-hover"
                >
                  {sub.imageUrl ? (
                    <img
                      src={sub.imageUrl}
                      alt={sub.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="bg-secondary flex h-12 w-12 items-center justify-center rounded-lg">
                      <Package className="text-muted-foreground h-6 w-6" />
                    </div>
                  )}
                  <span className="font-display group-hover:text-accent transition-colors">
                    {sub.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between pb-4 animate-fade-up delay-200">
          <p className="text-muted-foreground text-sm">
            {t('storefront.categoryPage.productsCount', { count: products.meta.total })}
          </p>
          <Select
            value={filters.sortBy || 'newest'}
            onValueChange={(value) =>
              router.get(
                categoryUrl,
                { ...filters, sort: value },
                { preserveState: true }
              )
            }
          >
            <SelectTrigger className="w-44 border-border/60">
              <SelectValue placeholder={t('storefront.categoryPage.sortBy')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t('storefront.categoryPage.newest')}</SelectItem>
              <SelectItem value="price-asc">{t('storefront.categoryPage.priceLowHigh')}</SelectItem>
              <SelectItem value="price-desc">{t('storefront.categoryPage.priceHighLow')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator className="mb-8 bg-border/60" />

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block animate-fade-up delay-200">
            <div className="sticky top-24 space-y-6">
              {/* Price Range */}
              <div>
                <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground">{t('storefront.categoryPage.priceRange')}</h3>
                <div className="mt-4 space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder={t('storefront.categoryPage.min')}
                      value={localFilters.minPrice}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, minPrice: e.target.value })
                      }
                      className="h-9 border-border/60"
                    />
                    <span className="text-muted-foreground flex items-center">-</span>
                    <Input
                      type="number"
                      placeholder={t('storefront.categoryPage.max')}
                      value={localFilters.maxPrice}
                      onChange={(e) =>
                        setLocalFilters({ ...localFilters, maxPrice: e.target.value })
                      }
                      className="h-9 border-border/60"
                    />
                  </div>
                  <Button size="sm" className="w-full" onClick={applyFilters}>
                    {t('storefront.categoryPage.apply')}
                  </Button>
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <>
                  <Separator className="bg-border/60" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive w-full"
                    onClick={clearFilters}
                  >
                    <X className="mr-2 h-4 w-4" />
                    {t('storefront.categoryPage.clearFilters')}
                  </Button>
                </>
              )}
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {products.data.length > 0 ? (
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
                          <AspectRatio ratio={1}>
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
                          <h3 className="group-hover:text-accent font-medium transition-colors">
                            {product.title}
                          </h3>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="font-semibold">
                              {formatCurrency(product.price)}
                            </span>
                            {product.compareAtPrice &&
                              product.compareAtPrice > product.price && (
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
                          categoryUrl,
                          { ...filters, page: products.meta.currentPage - 1 },
                          { preserveState: true }
                        )
                      }
                    >
                      {t('storefront.categoryPage.previous')}
                    </Button>
                    <span className="text-muted-foreground px-4 text-sm">
                      {t('storefront.categoryPage.pageOf', { current: products.meta.currentPage, total: products.meta.lastPage })}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border/60"
                      disabled={products.meta.currentPage >= products.meta.lastPage}
                      onClick={() =>
                        router.get(
                          categoryUrl,
                          { ...filters, page: products.meta.currentPage + 1 },
                          { preserveState: true }
                        )
                      }
                    >
                      {t('storefront.categoryPage.next')}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="border-dashed border-border/60 animate-fade-up delay-300">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Package className="text-muted-foreground h-12 w-12" />
                  <h3 className="font-display mt-4 text-lg">{t('storefront.categoryPage.noProducts')}</h3>
                  <p className="text-muted-foreground mt-1">
                    {t('storefront.categoryPage.noProductsDesc')}
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/products">{t('storefront.categoryPage.browseAll')}</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </StorefrontLayout>
  )
}
