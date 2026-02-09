import { Link, router } from '@inertiajs/react'
import { useState } from 'react'
import { Minus, Plus, Star } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
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
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { ProductSeo } from '@/components/shared/Seo'

interface Variant {
  id: string
  title: string
  sku: string | null
  price: number
  compareAtPrice: number | null
  option1: string | null
  option2: string | null
  option3: string | null
  inventoryQuantity: number
  trackInventory: boolean
  allowBackorder: boolean
  position: number
  isAvailable: boolean
}

interface ProductOption {
  id: string
  name: string
  values: string[]
  position: number
}

interface ProductImage {
  id: string
  url: string
  alt: string | null
  position: number
}

interface Review {
  id: string
  rating: number
  title: string | null
  content: string | null
  isVerifiedPurchase: boolean
  customerName: string
  createdAt: string
}

interface ReviewStats {
  total: number
  average: number
  five_star: number
  four_star: number
  three_star: number
  two_star: number
  one_star: number
}

interface Product {
  id: string
  title: string
  slug: string
  description: string | null
  shortDescription: string | null
  price: number | null
  compareAtPrice: number | null
  isOnSale: boolean
  discountPercentage: number | null
  sku: string | null
  type: string
  vendor: string | null
  variants: Variant[]
  options: ProductOption[]
  images: ProductImage[]
  categories: Array<{ id: string; name: string; slug: string }>
  tags: Array<{ id: string; name: string }>
}

interface RelatedProduct {
  id: string
  title: string
  slug: string
  price: number
  compareAtPrice: number | null
  thumbnail: string | null
  isOnSale: boolean
  discountPercentage: number | null
}

interface Props {
  product: Product
  relatedProducts: RelatedProduct[]
  reviews: Review[]
  reviewStats: ReviewStats
  breadcrumb: Array<{ name: string; slug: string }>
}

function buildOptionsFromVariant(
  variant: Variant | undefined,
  options: ProductOption[]
): Record<string, string> {
  if (!variant) return {}
  const result: Record<string, string> = {}
  options.forEach((opt, idx) => {
    const optionKey = `option${idx + 1}` as 'option1' | 'option2' | 'option3'
    const value = variant[optionKey]
    if (value) {
      result[opt.name] = value
    }
  })
  return result
}

function findVariantByOptions(
  variants: Variant[],
  selectedOptions: Record<string, string>,
  productOptions: ProductOption[]
): Variant | undefined {
  return variants.find((v) => {
    return productOptions.every((opt, idx) => {
      const optionKey = `option${idx + 1}` as 'option1' | 'option2' | 'option3'
      return v[optionKey] === selectedOptions[opt.name]
    })
  })
}

export default function ProductShow({
  product,
  relatedProducts,
  reviews,
  reviewStats,
  breadcrumb,
}: Props) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () => {
      const defaultVariant =
        product.variants.find((v) => v.position === 0) || product.variants[0]
      return buildOptionsFromVariant(defaultVariant, product.options)
    }
  )
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)

  const selectedVariant = findVariantByOptions(
    product.variants,
    selectedOptions,
    product.options
  )

  const price = selectedVariant?.price ?? product.price ?? 0
  const compareAtPrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice
  const isOnSale = compareAtPrice != null && compareAtPrice > price

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }))
  }

  const addToCart = () => {
    setAddingToCart(true)
    router.post(
      '/cart/add',
      {
        productId: product.id,
        variantId: selectedVariant?.id,
        quantity,
      },
      {
        preserveScroll: true,
        onFinish: () => setAddingToCart(false),
      }
    )
  }

  const isAvailable = selectedVariant?.isAvailable ?? true

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const storeName = 'AdonisCommerce'

  return (
    <StorefrontLayout>
      <ProductSeo
        product={{
          title: product.title,
          slug: product.slug,
          description: product.description || undefined,
          shortDescription: product.shortDescription || undefined,
          price: price,
          compareAtPrice: compareAtPrice,
          sku: product.sku || undefined,
          vendor: product.vendor || undefined,
          images: product.images.map((img) => ({
            url: img.url,
            alt: img.alt || undefined,
          })),
          categories: product.categories,
          inStock: isAvailable,
          rating:
            reviewStats.total > 0
              ? {
                  value: reviewStats.average,
                  count: reviewStats.total,
                }
              : undefined,
        }}
        storeName={storeName}
        baseUrl={baseUrl}
        breadcrumbs={breadcrumb}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb className="animate-fade-up mb-10">
          <BreadcrumbList className="text-xs tracking-wide text-muted-foreground/70">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="transition-colors hover:text-foreground">
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumb.map((item) => (
              <span key={item.slug} className="contents">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href={`/category/${item.slug}`}
                      className="transition-colors hover:text-foreground"
                    >
                      {item.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </span>
            ))}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground/50">
                {product.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="lg:grid lg:grid-cols-12 lg:gap-16">
          {/* Images */}
          <div className="animate-fade-up delay-100 lg:col-span-7">
            <div className="overflow-hidden rounded-2xl bg-muted">
              <AspectRatio ratio={4 / 5}>
                {product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImageIndex].url}
                    alt={product.images[selectedImageIndex].alt || product.title}
                    className="h-full w-full object-cover transition-all duration-500 ease-out"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
                    <div className="h-20 w-20 rounded-full bg-muted-foreground/10" />
                  </div>
                )}
              </AspectRatio>
            </div>
            {product.images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 overflow-hidden rounded-xl transition-all duration-300 ${
                      index === selectedImageIndex
                        ? 'ring-2 ring-accent ring-offset-2 ring-offset-background'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="h-20 w-20 overflow-hidden bg-muted sm:h-24 sm:w-24">
                      <img
                        src={image.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="mt-10 lg:col-span-5 lg:mt-0">
            {product.vendor && (
              <p className="animate-fade-up delay-200 text-[11px] font-semibold tracking-[0.2em] uppercase text-accent">
                {product.vendor}
              </p>
            )}
            <h1 className="animate-fade-up delay-200 font-display mt-2 text-4xl tracking-tight sm:text-5xl leading-[1.1]">
              {product.title}
            </h1>

            {/* Reviews summary */}
            {reviewStats.total > 0 && (
              <div className="animate-fade-up delay-300 mt-5 flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(reviewStats.average)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-muted text-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground text-sm">
                  {reviewStats.average.toFixed(1)} ({reviewStats.total} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="animate-fade-up delay-300 mt-8 flex items-baseline gap-4">
              <span className="font-display text-4xl tracking-tight">
                {formatCurrency(price)}
              </span>
              {isOnSale && compareAtPrice && (
                <>
                  <span className="text-muted-foreground text-lg line-through">
                    {formatCurrency(compareAtPrice)}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-white tracking-wide">
                    Save {Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="animate-fade-up delay-400 text-muted-foreground mt-6 text-[15px] leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            <Separator className="my-8" />

            {/* Options */}
            {product.options.length > 0 && (
              <div className="animate-fade-up delay-400 space-y-7">
                {product.options.map((option) => (
                  <div key={option.id}>
                    <label className="text-xs font-semibold tracking-[0.1em] uppercase text-foreground/70">
                      {option.name}
                    </label>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {option.values.map((value) => (
                        <Button
                          key={value}
                          variant={
                            selectedOptions[option.name] === value
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          className="rounded-full px-5"
                          onClick={() => handleOptionChange(option.name, value)}
                        >
                          {value}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
                <Separator />
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="animate-fade-up delay-500 mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-xs font-semibold tracking-[0.1em] uppercase text-foreground/70">
                  Quantity
                </label>
                <div className="flex items-center rounded-full border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-10 text-center text-sm font-medium tabular-nums">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <Button
                size="lg"
                className="w-full h-14 text-[15px] font-semibold tracking-wide rounded-full"
                onClick={addToCart}
                disabled={!isAvailable || addingToCart}
              >
                {addingToCart
                  ? 'Adding...'
                  : isAvailable
                    ? 'Add to Cart'
                    : 'Out of Stock'}
              </Button>
            </div>

            {/* SKU */}
            {(selectedVariant?.sku || product.sku) && (
              <p className="animate-fade-up delay-500 text-muted-foreground mt-6 text-xs tracking-wide">
                SKU: {selectedVariant?.sku || product.sku}
              </p>
            )}

            {/* Categories and Tags */}
            <div className="animate-fade-up delay-600 mt-10 space-y-4 border-t pt-8">
              {product.categories.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground">
                    Categories:
                  </span>
                  {product.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      className="text-sm text-foreground/70 underline underline-offset-4 decoration-foreground/20 hover:text-foreground hover:decoration-foreground/50 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
              {product.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground">
                    Tags:
                  </span>
                  {product.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="rounded-full font-normal">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <section className="animate-fade-up mt-24">
            <div className="max-w-3xl">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                Details
              </span>
              <h2 className="font-display text-3xl tracking-tight mt-2">
                Description
              </h2>
              <div
                className="prose prose-neutral mt-6 max-w-none text-[15px] leading-relaxed text-foreground/80"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          </section>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="mt-24">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
              Feedback
            </span>
            <h2 className="font-display text-3xl tracking-tight mt-2">
              Customer Reviews
            </h2>
            <div className="mt-10 space-y-6">
              {reviews.map((review, i) => (
                <Card
                  key={review.id}
                  className={`animate-fade-up border-border/50 ${i < 7 ? `delay-${(i + 1) * 100}` : ''}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-muted text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      {review.isVerifiedPurchase && (
                        <Badge variant="secondary" className="rounded-full text-[10px] tracking-wide">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                    {review.title && (
                      <h4 className="mt-3 font-semibold">{review.title}</h4>
                    )}
                    {review.content && (
                      <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">
                        {review.content}
                      </p>
                    )}
                    <p className="text-muted-foreground/60 mt-4 text-xs tracking-wide">
                      {review.customerName} &middot;{' '}
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-24 pb-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                  Explore
                </span>
                <h2 className="font-display text-3xl tracking-tight mt-2">
                  You May Also Like
                </h2>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct, i) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.slug}`}
                  className={`group card-hover block animate-fade-up ${i < 4 ? `delay-${(i + 1) * 100}` : ''}`}
                >
                  <div className="relative overflow-hidden rounded-xl bg-muted img-zoom">
                    <AspectRatio ratio={3 / 4}>
                      {relatedProduct.thumbnail ? (
                        <img
                          src={relatedProduct.thumbnail}
                          alt={relatedProduct.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
                          <div className="h-12 w-12 rounded-full bg-muted-foreground/10" />
                        </div>
                      )}
                    </AspectRatio>
                    {relatedProduct.isOnSale &&
                      relatedProduct.discountPercentage && (
                        <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold text-white tracking-wide">
                          -{relatedProduct.discountPercentage}%
                        </span>
                      )}
                  </div>
                  <div className="pt-4">
                    <h3 className="text-sm font-medium leading-snug group-hover:underline underline-offset-4 decoration-foreground/30">
                      {relatedProduct.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {formatCurrency(relatedProduct.price)}
                      </span>
                      {relatedProduct.compareAtPrice &&
                        relatedProduct.compareAtPrice > relatedProduct.price && (
                          <span className="text-muted-foreground text-xs line-through">
                            {formatCurrency(relatedProduct.compareAtPrice)}
                          </span>
                        )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </StorefrontLayout>
  )
}
