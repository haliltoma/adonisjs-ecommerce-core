import { Link } from '@inertiajs/react'
import { Heart, Package, ShoppingBag, Trash2 } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import Seo from '@/components/shared/Seo'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface WishlistItem {
  id: string
  product: {
    id: string
    title: string
    slug: string
    price: number
    compareAtPrice: number | null
    thumbnail: string | null
    isOnSale: boolean
    discountPercentage: number | null
    inStock: boolean
  }
}

interface Props {
  items: WishlistItem[]
}

export default function Wishlist({ items }: Props) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <StorefrontLayout>
      <Seo
        title="My Wishlist"
        description="View your saved items and wishlist."
        storeName="AdonisCommerce"
        baseUrl={baseUrl}
        canonical={`${baseUrl}/wishlist`}
      />

      {/* Hero */}
      <section className="relative py-20 grain">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-up">
            <Heart className="text-accent mx-auto mb-3 h-8 w-8" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
              Saved Items
            </span>
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight mt-3">
              My Wishlist
            </h1>
            <p className="text-muted-foreground mt-3">
              {items.length > 0
                ? `${items.length} item${items.length !== 1 ? 's' : ''} saved`
                : 'Your wishlist is empty'}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {items.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, idx) => (
              <Card
                key={item.id}
                className={`card-hover group relative overflow-hidden border-0 shadow-sm animate-fade-up delay-${Math.min((idx + 1) * 100, 700)}`}
              >
                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-background/80 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Remove from wishlist</span>
                </Button>

                <Link href={`/products/${item.product.slug}`}>
                  <div className="bg-muted relative overflow-hidden rounded-t-xl img-zoom">
                    <AspectRatio ratio={1}>
                      {item.product.thumbnail ? (
                        <img
                          src={item.product.thumbnail}
                          alt={item.product.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="text-muted-foreground h-12 w-12" />
                        </div>
                      )}
                    </AspectRatio>
                    {item.product.isOnSale && item.product.discountPercentage && (
                      <Badge className="absolute left-3 top-3 bg-accent text-accent-foreground">
                        -{item.product.discountPercentage}%
                      </Badge>
                    )}
                    {!item.product.inStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                        <Badge variant="secondary">Out of Stock</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-medium group-hover:text-accent transition-colors line-clamp-2">
                      {item.product.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-semibold">
                        {formatCurrency(item.product.price)}
                      </span>
                      {item.product.compareAtPrice &&
                        item.product.compareAtPrice > item.product.price && (
                          <span className="text-muted-foreground text-sm line-through">
                            {formatCurrency(item.product.compareAtPrice)}
                          </span>
                        )}
                    </div>
                  </CardContent>
                </Link>

                {/* Add to Cart */}
                <div className="px-6 pb-6">
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={!item.product.inStock}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    {item.product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-border/60 animate-fade-up delay-200">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <Heart className="text-muted-foreground h-16 w-16" />
              <h3 className="font-display mt-6 text-xl">Your wishlist is empty</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                Save your favorite items to your wishlist by clicking the heart icon on any
                product. Your wishlist makes it easy to find and purchase items you love.
              </p>
              <Button asChild className="mt-6" size="lg">
                <Link href="/products">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Browse Products
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </StorefrontLayout>
  )
}
