import { useState } from 'react'
import { Link } from '@inertiajs/react'
import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/stores/cart-store'
import { formatCurrency } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'

interface QuickViewProduct {
  id: string
  title: string
  slug: string
  price: number
  compareAtPrice?: number | null
  description?: string
  images: string[]
  variants: Array<{
    id: string
    title: string
    price: number
    sku?: string
    inStock: boolean
  }>
}

interface QuickViewModalProps {
  product: QuickViewProduct | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickViewModal({ product, open, onOpenChange }: QuickViewModalProps) {
  const { t } = useTranslation()
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [currentImage, setCurrentImage] = useState(0)
  const addItem = useCartStore((s) => s.addItem)

  if (!product) return null

  const variant = product.variants[selectedVariant] || product.variants[0]

  const handleAddToCart = () => {
    if (!variant || !variant.inStock) return
    addItem({
      id: `${product.id}-${variant.id}`,
      productId: product.id,
      variantId: variant.id,
      title: product.title,
      variantTitle: variant.title,
      price: variant.price,
      compareAtPrice: product.compareAtPrice,
      image: product.images[0] || null,
      sku: variant.sku,
      quantity,
    })
    onOpenChange(false)
    setQuantity(1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="relative bg-muted aspect-square">
            {product.images.length > 0 ? (
              <>
                <img
                  src={product.images[currentImage]}
                  alt={product.title}
                  className="object-cover w-full h-full"
                />
                {product.images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {product.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImage(i)}
                        className={`size-2 rounded-full transition-colors ${i === currentImage ? 'bg-foreground' : 'bg-foreground/30'}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                {t('storefront.quickView.noImage')}
              </div>
            )}
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <Badge className="absolute top-3 left-3" variant="destructive">{t('storefront.quickView.sale')}</Badge>
            )}
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col">
            <DialogHeader className="text-left">
              <DialogTitle className="text-lg">{product.title}</DialogTitle>
            </DialogHeader>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xl font-bold">{formatCurrency(variant?.price || product.price)}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-muted-foreground text-sm line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-muted-foreground text-sm mt-3 line-clamp-3">{product.description}</p>
            )}

            {/* Variants */}
            {product.variants.length > 1 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">{t('storefront.quickView.variant')}</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v, i) => (
                    <Button
                      key={v.id}
                      variant={i === selectedVariant ? 'default' : 'outline'}
                      size="sm"
                      disabled={!v.inStock}
                      onClick={() => setSelectedVariant(i)}
                    >
                      {v.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-4 flex items-center gap-3">
              <p className="text-sm font-medium">{t('storefront.quickView.qty')}</p>
              <div className="flex items-center border rounded-md">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-10 text-center text-sm tabular-nums">{quantity}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="mt-auto pt-6 space-y-2">
              <Button
                className="w-full"
                disabled={!variant?.inStock}
                onClick={handleAddToCart}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                {variant?.inStock ? t('storefront.quickView.addToCart') : t('storefront.quickView.outOfStock')}
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/products/${product.slug}`}>{t('storefront.quickView.viewFullDetails')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
