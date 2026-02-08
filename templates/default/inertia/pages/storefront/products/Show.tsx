import { Link, router } from '@inertiajs/react'
import { useState } from 'react'
import { ChevronRight, Minus, Package, Plus, Star } from 'lucide-react'

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

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumb.map((item) => (
              <BreadcrumbItem key={item.slug}>
                <BreadcrumbSeparator />
                <BreadcrumbLink asChild>
                  <Link href={`/category/${item.slug}`}>{item.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            ))}
            <BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbPage>{product.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Images */}
          <div>
            <div className="bg-muted overflow-hidden rounded-xl">
              <AspectRatio ratio={1}>
                {product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImageIndex].url}
                    alt={product.images[selectedImageIndex].alt || product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="text-muted-foreground h-16 w-16" />
                  </div>
                )}
              </AspectRatio>
            </div>
            {product.images.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`bg-muted h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                      index === selectedImageIndex
                        ? 'ring-primary ring-2 ring-offset-2'
                        : 'hover:opacity-80'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="mt-8 lg:mt-0">
            {product.vendor && (
              <p className="text-muted-foreground text-sm uppercase tracking-wide">
                {product.vendor}
              </p>
            )}
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              {product.title}
            </h1>

            {/* Reviews summary */}
            {reviewStats.total > 0 && (
              <div className="mt-4 flex items-center gap-2">
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
            <div className="mt-6 flex items-center gap-3">
              <span className="text-3xl font-bold">{formatCurrency(price)}</span>
              {isOnSale && compareAtPrice && (
                <>
                  <span className="text-muted-foreground text-xl line-through">
                    {formatCurrency(compareAtPrice)}
                  </span>
                  <Badge variant="destructive">
                    Save {Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}%
                  </Badge>
                </>
              )}
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-muted-foreground mt-4">
                {product.shortDescription}
              </p>
            )}

            <Separator className="my-6" />

            {/* Options */}
            {product.options.length > 0 && (
              <div className="space-y-6">
                {product.options.map((option) => (
                  <div key={option.id}>
                    <label className="text-sm font-medium">{option.name}</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {option.values.map((value) => (
                        <Button
                          key={value}
                          variant={
                            selectedOptions[option.name] === value
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
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
            <div className="mt-6 flex gap-4">
              <div className="flex items-center rounded-md border">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-none"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-none"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="lg"
                className="flex-1"
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
              <p className="text-muted-foreground mt-4 text-sm">
                SKU: {selectedVariant?.sku || product.sku}
              </p>
            )}

            {/* Categories and Tags */}
            <div className="mt-8 space-y-4 border-t pt-6">
              {product.categories.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    Categories:
                  </span>
                  {product.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      className="text-primary text-sm hover:underline"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
              {product.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground text-sm">Tags:</span>
                  {product.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary">
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
          <section className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight">Description</h2>
            <div
              className="prose prose-neutral mt-4 max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </section>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight">
              Customer Reviews
            </h2>
            <div className="mt-8 space-y-6">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
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
                        <Badge variant="secondary" className="text-xs">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                    {review.title && (
                      <h4 className="mt-2 font-semibold">{review.title}</h4>
                    )}
                    {review.content && (
                      <p className="text-muted-foreground mt-2">
                        {review.content}
                      </p>
                    )}
                    <p className="text-muted-foreground mt-3 text-sm">
                      {review.customerName} ·{' '}
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
          <section className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight">
              You May Also Like
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.slug}`}
                  className="group"
                >
                  <Card className="overflow-hidden border-0 shadow-none">
                    <div className="bg-muted relative overflow-hidden rounded-xl">
                      <AspectRatio ratio={3 / 4}>
                        {relatedProduct.thumbnail ? (
                          <img
                            src={relatedProduct.thumbnail}
                            alt={relatedProduct.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="text-muted-foreground h-12 w-12" />
                          </div>
                        )}
                      </AspectRatio>
                      {relatedProduct.isOnSale &&
                        relatedProduct.discountPercentage && (
                          <Badge
                            variant="destructive"
                            className="absolute left-3 top-3"
                          >
                            -{relatedProduct.discountPercentage}%
                          </Badge>
                        )}
                    </div>
                    <CardContent className="px-0 pt-4">
                      <h3 className="group-hover:text-primary font-medium transition-colors">
                        {relatedProduct.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="font-semibold">
                          {formatCurrency(relatedProduct.price)}
                        </span>
                        {relatedProduct.compareAtPrice &&
                          relatedProduct.compareAtPrice > relatedProduct.price && (
                            <span className="text-muted-foreground text-sm line-through">
                              {formatCurrency(relatedProduct.compareAtPrice)}
                            </span>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </StorefrontLayout>
  )
}
