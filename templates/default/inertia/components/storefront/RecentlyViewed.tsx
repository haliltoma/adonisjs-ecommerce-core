import { useEffect, useState } from 'react'
import { Link } from '@inertiajs/react'
import { formatCurrency } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'

interface RecentProduct {
  id: string
  title: string
  slug: string
  price: number
  image?: string | null
}

const STORAGE_KEY = 'recently-viewed'
const MAX_ITEMS = 8

export function addToRecentlyViewed(product: RecentProduct) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as RecentProduct[]
    const filtered = stored.filter((p) => p.id !== product.id)
    filtered.unshift(product)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)))
  } catch {}
}

export function getRecentlyViewed(): RecentProduct[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

interface RecentlyViewedProps {
  excludeId?: string
  className?: string
}

export function RecentlyViewed({ excludeId, className }: RecentlyViewedProps) {
  const { t } = useTranslation()
  const [products, setProducts] = useState<RecentProduct[]>([])

  useEffect(() => {
    const items = getRecentlyViewed().filter((p) => p.id !== excludeId)
    setProducts(items)
  }, [excludeId])

  if (products.length === 0) return null

  return (
    <section className={className}>
      <h2 className="text-lg font-semibold mb-4">{t('storefront.recentlyViewed.title')}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.slice(0, 5).map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group"
          >
            <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-2">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                  {t('storefront.recentlyViewed.noImage')}
                </div>
              )}
            </div>
            <p className="text-sm font-medium truncate group-hover:underline underline-offset-4">
              {product.title}
            </p>
            <p className="text-sm text-muted-foreground">{formatCurrency(product.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
