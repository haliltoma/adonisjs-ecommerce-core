import { Head, Link, router } from '@inertiajs/react'
import { Home, MapPin, MessageSquare, Package, ShoppingBag, Star, User } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import { useTranslation } from '@/hooks/use-translation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

interface Review {
  id: string
  rating: number
  title: string | null
  content: string | null
  status: 'pending' | 'approved' | 'rejected'
  isVerifiedPurchase: boolean
  helpfulCount: number
  product: {
    id: string
    title: string
    slug: string
    thumbnail: string | null
  } | null
  createdAt: string
}

interface Props {
  reviews: {
    data: Review[]
    meta: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
    }
  }
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-muted text-muted'
          }`}
        />
      ))}
    </div>
  )
}

export default function AccountReviews({ reviews }: Props) {
  const { t } = useTranslation()

  return (
    <StorefrontLayout>
      <Head title={t('storefront.reviewsPage.myReviews')} />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
          {/* Sidebar */}
          <aside className="animate-fade-up mb-8 lg:mb-0">
            <nav className="space-y-1">
              <Button variant="ghost" asChild className="w-full justify-start text-muted-foreground hover:text-foreground">
                <Link href="/account">
                  <Home className="mr-3 h-4 w-4" />
                  {t('storefront.reviewsPage.dashboard')}
                </Link>
              </Button>
              <Button variant="ghost" asChild className="w-full justify-start text-muted-foreground hover:text-foreground">
                <Link href="/account/orders">
                  <ShoppingBag className="mr-3 h-4 w-4" />
                  {t('storefront.reviewsPage.orders')}
                </Link>
              </Button>
              <Button variant="secondary" asChild className="w-full justify-start">
                <Link href="/account/reviews">
                  <MessageSquare className="mr-3 h-4 w-4" />
                  {t('storefront.reviewsPage.reviews')}
                </Link>
              </Button>
              <Button variant="ghost" asChild className="w-full justify-start text-muted-foreground hover:text-foreground">
                <Link href="/account/addresses">
                  <MapPin className="mr-3 h-4 w-4" />
                  {t('storefront.reviewsPage.addresses')}
                </Link>
              </Button>
              <Button variant="ghost" asChild className="w-full justify-start text-muted-foreground hover:text-foreground">
                <Link href="/account/profile">
                  <User className="mr-3 h-4 w-4" />
                  {t('storefront.reviewsPage.profile')}
                </Link>
              </Button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <div className="animate-fade-up delay-100">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">{t('storefront.reviewsPage.feedback')}</span>
              <h1 className="font-display text-3xl tracking-tight mt-2">{t('storefront.reviewsPage.myReviews')}</h1>
              <p className="text-muted-foreground mt-2">{t('storefront.reviewsPage.reviewsCount', { count: String(reviews.meta.total) })}</p>
            </div>

            {reviews.data.length > 0 ? (
              <div className="mt-8 space-y-6">
                {reviews.data.map((review, index) => (
                  <Card key={review.id} className={`animate-fade-up delay-${Math.min((index + 2) * 100, 700)} border-border/60 overflow-hidden`}>
                    <CardHeader className="bg-muted/30 flex flex-row flex-wrap items-center justify-between gap-4 space-y-0 py-4">
                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-muted/50 h-12 w-12 flex-shrink-0 overflow-hidden rounded">
                            {review.product?.thumbnail ? (
                              <img
                                src={review.product.thumbnail}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package className="text-muted-foreground/60 h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            {review.product ? (
                              <Link
                                href={`/products/${review.product.slug}`}
                                className="font-medium text-sm hover:text-accent transition-colors"
                              >
                                {review.product.title}
                              </Link>
                            ) : (
                              <span className="font-medium text-sm text-muted-foreground">
                                {t('storefront.reviewsPage.productRemoved')}
                              </span>
                            )}
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={statusVariants[review.status] || 'secondary'}>
                          {t(`storefront.reviewsPage.status.${review.status}`)}
                        </Badge>
                        {review.isVerifiedPurchase && (
                          <Badge variant="outline" className="text-[10px]">
                            {t('storefront.reviewsPage.verifiedPurchase')}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="py-5">
                      <div className="flex items-center gap-3 mb-3">
                        <StarRating rating={review.rating} />
                        {review.title && (
                          <span className="font-medium text-sm">{review.title}</span>
                        )}
                      </div>
                      {review.content && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {review.content}
                        </p>
                      )}
                      {review.helpfulCount > 0 && (
                        <p className="text-xs text-muted-foreground mt-3">
                          {t('storefront.reviewsPage.helpfulCount', { count: String(review.helpfulCount) })}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* Pagination */}
                {reviews.meta.lastPage > 1 && (
                  <div className="animate-fade-in flex items-center justify-center gap-2 pt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border/60 tracking-wide"
                      disabled={reviews.meta.currentPage <= 1}
                      onClick={() =>
                        router.get(
                          '/account/reviews',
                          { page: reviews.meta.currentPage - 1 },
                          { preserveState: true }
                        )
                      }
                    >
                      {t('storefront.reviewsPage.previous')}
                    </Button>
                    <span className="text-muted-foreground px-4 text-sm">
                      {t('storefront.reviewsPage.pageOf', { current: String(reviews.meta.currentPage), total: String(reviews.meta.lastPage) })}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border/60 tracking-wide"
                      disabled={reviews.meta.currentPage >= reviews.meta.lastPage}
                      onClick={() =>
                        router.get(
                          '/account/reviews',
                          { page: reviews.meta.currentPage + 1 },
                          { preserveState: true }
                        )
                      }
                    >
                      {t('storefront.reviewsPage.next')}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Card className="animate-fade-up delay-200 mt-8 border-dashed border-border/60">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <MessageSquare className="text-muted-foreground/40 h-12 w-12" />
                  <h3 className="font-display mt-4 text-lg tracking-tight">{t('storefront.reviewsPage.noReviewsYet')}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {t('storefront.reviewsPage.noReviewsDesc')}
                  </p>
                  <Button asChild className="mt-6 h-11 tracking-wide">
                    <Link href="/products">{t('storefront.reviewsPage.browseProducts')}</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </StorefrontLayout>
  )
}
