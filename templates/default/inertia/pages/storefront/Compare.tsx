import { Head, Link } from '@inertiajs/react'
import { ShoppingBag, Trash2, X } from 'lucide-react'
import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import { Button } from '@/components/ui/button'
import { useCompareStore } from '@/stores/compare-store'
import { useCartStore } from '@/stores/cart-store'
import { formatCurrency } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'

export default function ComparePage() {
  const { t } = useTranslation()
  const items = useCompareStore((s) => s.items)
  const removeItem = useCompareStore((s) => s.removeItem)
  const clearCompare = useCompareStore((s) => s.clearCompare)
  const addToCart = useCartStore((s) => s.addItem)

  // Gather all unique attribute keys
  const attributeKeys = Array.from(
    new Set(items.flatMap((item) => Object.keys(item.attributes || {})))
  )

  return (
    <StorefrontLayout>
      <Head title={t('storefront.comparePage.title')} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">{t('storefront.comparePage.title')}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t('storefront.comparePage.selectedCount', { count: String(items.length) })}
            </p>
          </div>
          {items.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearCompare}>
              {t('storefront.comparePage.clearAll')}
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-medium">{t('storefront.comparePage.noProducts')}</p>
            <p className="text-muted-foreground text-sm mt-1">{t('storefront.comparePage.noProductsDesc')}</p>
            <Button className="mt-4" asChild>
              <Link href="/products">{t('storefront.comparePage.browseProducts')}</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr>
                  <th className="text-left p-3 w-40 text-sm font-medium text-muted-foreground">{t('storefront.comparePage.product')}</th>
                  {items.map((item) => (
                    <th key={item.productId} className="p-3 text-center min-w-[200px]">
                      <div className="relative">
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="absolute -top-1 -right-1 bg-muted rounded-full p-1 hover:bg-destructive hover:text-white transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <Link href={`/products/${item.slug}`}>
                          <div className="aspect-square rounded-lg overflow-hidden bg-muted mx-auto w-40 mb-3">
                            {item.image ? (
                              <img src={item.image} alt={item.title} className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">{t('storefront.comparePage.noImage')}</div>
                            )}
                          </div>
                          <p className="text-sm font-medium hover:underline underline-offset-4">{item.title}</p>
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-3 text-sm font-medium text-muted-foreground">{t('storefront.comparePage.price')}</td>
                  {items.map((item) => (
                    <td key={item.productId} className="p-3 text-center text-lg font-bold">
                      {formatCurrency(item.price)}
                    </td>
                  ))}
                </tr>
                {attributeKeys.map((key) => (
                  <tr key={key} className="border-t">
                    <td className="p-3 text-sm font-medium text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</td>
                    {items.map((item) => (
                      <td key={item.productId} className="p-3 text-center text-sm">
                        {item.attributes?.[key] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t">
                  <td className="p-3" />
                  {items.map((item) => (
                    <td key={item.productId} className="p-3 text-center">
                      <Button size="sm" onClick={() => addToCart({
                        id: item.id,
                        productId: item.productId,
                        variantId: item.id,
                        title: item.title,
                        price: item.price,
                        image: item.image,
                      })}>
                        <ShoppingBag className="mr-1 h-3.5 w-3.5" />
                        {t('storefront.comparePage.addToCart')}
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </StorefrontLayout>
  )
}
