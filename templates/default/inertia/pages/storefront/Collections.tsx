import { Link } from '@inertiajs/react'
import { FolderOpen, Package } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import Seo from '@/components/shared/Seo'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
}

interface Props {
  categories: Category[]
}

export default function Collections({ categories }: Props) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <StorefrontLayout>
      <Seo
        title="Collections"
        description="Browse our collections and find the perfect products for you."
        storeName="AdonisCommerce"
        baseUrl={baseUrl}
        canonical={`${baseUrl}/collections`}
      />

      {/* Hero */}
      <section className="relative py-20 grain">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-up">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
              Curated For You
            </span>
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight mt-3">
              Collections
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Browse our curated collections to find exactly what you're looking for.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {categories.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, idx) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className={`group animate-fade-up delay-${Math.min((idx + 1) * 100, 700)}`}
              >
                <Card className="card-hover overflow-hidden border-0 shadow-sm">
                  <div className="bg-muted relative overflow-hidden rounded-t-xl img-zoom">
                    <AspectRatio ratio={16 / 9}>
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-secondary/50">
                          <FolderOpen className="text-muted-foreground h-12 w-12" />
                        </div>
                      )}
                    </AspectRatio>
                  </div>
                  <CardContent className="pt-5">
                    <h2 className="font-display group-hover:text-accent text-lg transition-colors">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm">
                        {category.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-border/60 animate-fade-up delay-200">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <Package className="text-muted-foreground h-12 w-12" />
              <h3 className="font-display mt-4 text-lg">No collections yet</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                Collections will appear here once they are set up. In the meantime, browse all of our products.
              </p>
              <Button asChild className="mt-6">
                <Link href="/products">Browse All Products</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </StorefrontLayout>
  )
}
