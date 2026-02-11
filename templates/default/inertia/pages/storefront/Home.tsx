import { Link, useForm } from '@inertiajs/react'
import { ArrowRight, Package, RefreshCw, Shield, Truck } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import { HomeSeo } from '@/components/shared/Seo'
import { useTranslation } from '@/hooks/use-translation'
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
  const { t } = useTranslation()

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <StorefrontLayout>
      <HomeSeo
        storeName={store.name}
        baseUrl={baseUrl}
        logoUrl={store.logoUrl}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
            <div className="flex flex-col justify-center">
              <span className="animate-fade-up text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                {t('storefront.home.heroLabel')}
              </span>
              <h1 className="animate-fade-up delay-100 font-display text-5xl tracking-tight sm:text-6xl lg:text-7xl mt-4 leading-[1.05]">
                {banners[0]?.title || t('storefront.home.heroDefaultTitle')}
              </h1>
              <p className="animate-fade-up delay-200 text-muted-foreground mt-6 text-lg leading-relaxed max-w-lg">
                {banners[0]?.subtitle ||
                  t('storefront.home.heroDefaultSubtitle')}
              </p>
              <div className="animate-fade-up delay-300 mt-10 flex flex-wrap gap-4">
                <Button size="lg" className="px-8" asChild>
                  <Link href={banners[0]?.linkUrl || '/products'}>
                    {t('storefront.home.shopNow')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="px-8" asChild>
                  <Link href="/collections">{t('storefront.home.viewCollections')}</Link>
                </Button>
              </div>
            </div>
            <div className="animate-fade-up delay-300 relative">
              <div className="overflow-hidden rounded-2xl bg-muted aspect-[4/3]">
                {banners[0]?.imageUrl ? (
                  <img
                    src={banners[0].imageUrl}
                    alt={banners[0].title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
                    <Package className="text-muted-foreground/40 h-20 w-20" />
                  </div>
                )}
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-4 -right-4 h-full w-full rounded-2xl border border-border -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">{t('storefront.home.categoriesBrowse')}</span>
                <h2 className="font-display text-3xl tracking-tight mt-2">{t('storefront.home.categoriesTitle')}</h2>
              </div>
              <Button variant="ghost" className="text-sm" asChild>
                <Link href="/categories">
                  {t('storefront.home.viewAll')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {categories.slice(0, 4).map((category, i) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className={`group relative overflow-hidden rounded-xl img-zoom animate-fade-up delay-${(i + 1) * 100}`}
                >
                  <AspectRatio ratio={1} className="bg-muted">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
                        <Package className="text-muted-foreground/30 h-14 w-14" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                      {category.productCount !== undefined && category.productCount > 0 && (
                        <p className="text-sm text-white/70 mt-0.5">{t('storefront.home.productsCount', { count: category.productCount })}</p>
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
        <section className="py-20 bg-secondary/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">{t('storefront.home.featuredLabel')}</span>
                <h2 className="font-display text-3xl tracking-tight mt-2">{t('storefront.home.featuredTitle')}</h2>
              </div>
              <Button variant="ghost" className="text-sm" asChild>
                <Link href="/products?featured=true">
                  {t('storefront.home.viewAll')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.slice(0, 8).map((product, i) => (
                <ProductCardComponent key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Banner */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-foreground text-background grain">
            <div className="relative z-10 flex flex-col items-center justify-center p-12 sm:p-16 text-center">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-background/60">
                {t('storefront.home.bannerLabel')}
              </span>
              <h2 className="font-display text-4xl tracking-tight mt-4 sm:text-5xl">
                {t('storefront.home.bannerTitle')}
              </h2>
              <p className="mt-4 max-w-xl text-background/70 leading-relaxed">
                {t('storefront.home.bannerSubtitle')}
              </p>
              <Button size="lg" variant="secondary" className="mt-8 px-8" asChild>
                <Link href="/products?sale=true">
                  {t('storefront.home.shopTheSale')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">{t('storefront.home.newArrivalsLabel')}</span>
                <h2 className="font-display text-3xl tracking-tight mt-2">{t('storefront.home.newArrivalsTitle')}</h2>
              </div>
              <Button variant="ghost" className="text-sm" asChild>
                <Link href="/products?sort=newest">
                  {t('storefront.home.viewAll')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {newArrivals.slice(0, 4).map((product, i) => (
                <ProductCardComponent key={product.id} product={product} showNew index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Collections */}
      {collections.length > 0 && (
        <section className="py-20 bg-secondary/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">{t('storefront.home.collectionsLabel')}</span>
              <h2 className="font-display text-3xl tracking-tight mt-2">{t('storefront.home.collectionsTitle')}</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {collections.slice(0, 3).map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.slug}`}
                  className="group relative overflow-hidden rounded-xl img-zoom"
                >
                  <AspectRatio ratio={16 / 9} className="bg-muted">
                    {collection.imageUrl ? (
                      <img
                        src={collection.imageUrl}
                        alt={collection.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
                        <Package className="text-muted-foreground/30 h-14 w-14" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/60">
                        {t('storefront.home.collectionBadge')}
                      </span>
                      <h3 className="text-xl font-semibold text-white mt-1">{collection.name}</h3>
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
            {[
              { icon: Truck, title: t('storefront.home.featureFreeShipping'), desc: t('storefront.home.featureFreeShippingDesc') },
              { icon: RefreshCw, title: t('storefront.home.featureEasyReturns'), desc: t('storefront.home.featureEasyReturnsDesc') },
              { icon: Shield, title: t('storefront.home.featureSecurePayment'), desc: t('storefront.home.featureSecurePaymentDesc') },
              { icon: Package, title: t('storefront.home.featureQualityProducts'), desc: t('storefront.home.featureQualityProductsDesc') },
            ].map((feature) => (
              <div key={feature.title} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border">
                  <feature.icon className="text-foreground/70 h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold tracking-wide">{feature.title}</h3>
                <p className="text-muted-foreground mt-1 text-xs">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </StorefrontLayout>
  )
}

function ProductCardComponent({
  product,
  showNew = false,
  index = 0,
}: {
  product: ProductCard
  showNew?: boolean
  index?: number
}) {
  const { t } = useTranslation()

  return (
    <Link href={`/products/${product.slug}`} className="group card-hover block">
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
          {showNew && (
            <span className="inline-flex items-center rounded-full bg-foreground px-2.5 py-0.5 text-[10px] font-semibold text-background tracking-wide uppercase">
              {t('storefront.home.newBadge')}
            </span>
          )}
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

function NewsletterSection() {
  const { t } = useTranslation()
  const { data, setData, post, processing, wasSuccessful } = useForm({
    email: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/newsletter/subscribe')
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-secondary/60 grain">
          <div className="relative z-10 flex flex-col items-center p-12 sm:p-16 text-center">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">{t('storefront.home.newsletterLabel')}</span>
            <h2 className="font-display text-3xl tracking-tight mt-3">{t('storefront.home.newsletterTitle')}</h2>
            <p className="text-muted-foreground mt-3 max-w-md leading-relaxed">
              {t('storefront.home.newsletterSubtitle')}
            </p>
            {wasSuccessful ? (
              <p className="mt-6 text-sm font-medium text-accent">{t('storefront.home.newsletterSuccess')}</p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 flex w-full max-w-md gap-2">
                <Input
                  type="email"
                  placeholder={t('storefront.home.newsletterPlaceholder')}
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  required
                  className="flex-1 bg-background"
                />
                <Button type="submit" disabled={processing}>
                  {processing ? t('storefront.home.newsletterJoining') : t('storefront.home.newsletterSubscribe')}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
