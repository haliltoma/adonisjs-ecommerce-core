import { Link, useForm } from '@inertiajs/react'
import { ArrowRight, Package, RefreshCw, Shield, Truck } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
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
  imageUrl: string | null
  productCount?: number
}

interface Collection {
  id: string
  name: string
  slug: string
  imageUrl: string | null
}

interface Banner {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string
  linkUrl: string | null
}

interface Props {
  store: { name: string; logoUrl: string | null }
  banners: Banner[]
  featuredProducts: ProductCard[]
  newArrivals: ProductCard[]
  collections: Collection[]
  categories: Category[]
}

export default function Home({
  store,
  banners,
  featuredProducts,
  newArrivals,
  collections,
  categories,
}: Props) {
  return (
    <StorefrontLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <Badge variant="secondary" className="mb-4 w-fit">
                New Collection
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                {banners[0]?.title || 'Discover Quality Products'}
              </h1>
              <p className="text-muted-foreground mt-6 text-lg">
                {banners[0]?.subtitle ||
                  'Explore our curated collection of premium products designed for modern living.'}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link href={banners[0]?.linkUrl || '/products'}>
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/collections">View Collections</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <AspectRatio ratio={4 / 3} className="overflow-hidden rounded-xl bg-muted">
                {banners[0]?.imageUrl ? (
                  <img
                    src={banners[0].imageUrl}
                    alt={banners[0].title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="text-muted-foreground h-16 w-16" />
                  </div>
                )}
              </AspectRatio>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Shop by Category</h2>
                <p className="text-muted-foreground mt-1">Browse our most popular categories</p>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/categories">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.slice(0, 4).map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="group relative overflow-hidden rounded-xl"
                >
                  <AspectRatio ratio={1} className="bg-muted">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="text-muted-foreground h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                      {category.productCount && (
                        <p className="text-sm text-white/80">{category.productCount} products</p>
                      )}
                    </div>
                  </AspectRatio>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Featured Products</h2>
                <p className="text-muted-foreground mt-1">Hand-picked just for you</p>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/products?featured=true">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Banner */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="overflow-hidden bg-primary text-primary-foreground">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <Badge variant="secondary" className="mb-4">
                Limited Time Offer
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Up to 40% Off Sale
              </h2>
              <p className="mt-4 max-w-xl text-primary-foreground/80">
                Discover our seasonal collection with exclusive discounts on premium products.
              </p>
              <Button size="lg" variant="secondary" className="mt-8" asChild>
                <Link href="/products?sale=true">
                  Shop the Sale
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">New Arrivals</h2>
                <p className="text-muted-foreground mt-1">The latest additions to our collection</p>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/products?sort=newest">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {newArrivals.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} showNew />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Collections */}
      {collections.length > 0 && (
        <section className="bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight">Our Collections</h2>
              <p className="text-muted-foreground mt-1">Explore curated product collections</p>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {collections.slice(0, 3).map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collection/${collection.slug}`}
                  className="group relative overflow-hidden rounded-xl"
                >
                  <AspectRatio ratio={16 / 9} className="bg-muted">
                    {collection.imageUrl ? (
                      <img
                        src={collection.imageUrl}
                        alt={collection.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="text-muted-foreground h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <Badge variant="secondary" className="mb-2">
                        Collection
                      </Badge>
                      <h3 className="text-xl font-semibold text-white">{collection.name}</h3>
                    </div>
                  </AspectRatio>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <NewsletterSection />

      {/* Features */}
      <section className="border-t py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <Truck className="text-primary h-6 w-6" />
              </div>
              <h3 className="font-semibold">Free Shipping</h3>
              <p className="text-muted-foreground mt-1 text-sm">On orders over $100</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <RefreshCw className="text-primary h-6 w-6" />
              </div>
              <h3 className="font-semibold">Easy Returns</h3>
              <p className="text-muted-foreground mt-1 text-sm">30-day return policy</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <Shield className="text-primary h-6 w-6" />
              </div>
              <h3 className="font-semibold">Secure Payment</h3>
              <p className="text-muted-foreground mt-1 text-sm">256-bit SSL encryption</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <Package className="text-primary h-6 w-6" />
              </div>
              <h3 className="font-semibold">Quality Products</h3>
              <p className="text-muted-foreground mt-1 text-sm">Carefully curated selection</p>
            </div>
          </div>
        </div>
      </section>
    </StorefrontLayout>
  )
}

function ProductCard({
  product,
  showNew = false,
}: {
  product: ProductCard
  showNew?: boolean
}) {
  return (
    <Link href={`/products/${product.slug}`} className="group">
      <Card className="overflow-hidden border-0 shadow-none">
        <div className="relative overflow-hidden rounded-xl bg-muted">
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
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {showNew && <Badge>New</Badge>}
            {product.isOnSale && product.discountPercentage && (
              <Badge variant="destructive">-{product.discountPercentage}%</Badge>
            )}
          </div>
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

function NewsletterSection() {
  const { data, setData, post, processing, wasSuccessful } = useForm({
    email: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/newsletter/subscribe')
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="border-0 bg-muted/50">
          <CardContent className="flex flex-col items-center p-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight">Stay Updated</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Subscribe to our newsletter for exclusive offers, new arrivals, and style tips.
            </p>
            {wasSuccessful ? (
              <p className="mt-6 text-green-600">Thank you for subscribing!</p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 flex w-full max-w-md gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" disabled={processing}>
                  {processing ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
