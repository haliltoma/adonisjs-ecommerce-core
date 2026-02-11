import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import { ArrowLeft, Minus, Package, Plus, ShoppingBag, Trash2, X } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'

interface CartItem {
  id: string
  productId: string
  variantId: string | null
  title: string
  variantTitle: string | null
  sku: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  thumbnail: string | null
  productSlug: string
}

interface Cart {
  id: string
  itemCount: number
  subtotal: number
  discountTotal: number
  discountCode: string | null
  taxTotal: number
  total: number
  currency: string
  items: CartItem[]
}

interface Props {
  cart: Cart
}

export default function CartPage({ cart }: Props) {
  const [discountCode, setDiscountCode] = useState('')
  const [applyingDiscount, setApplyingDiscount] = useState(false)
  const { t, currency } = useTranslation()
  const cur = cart?.currency || currency

  const updateQuantity = (itemId: string, quantity: number) => {
    router.patch(`/cart/item/${itemId}`, { quantity }, { preserveScroll: true })
  }

  const removeItem = (itemId: string) => {
    router.delete(`/cart/item/${itemId}`, { preserveScroll: true })
  }

  const applyDiscount = () => {
    if (!discountCode.trim()) return
    setApplyingDiscount(true)
    router.post(
      '/cart/discount',
      { code: discountCode },
      {
        preserveScroll: true,
        onFinish: () => setApplyingDiscount(false),
      }
    )
  }

  const removeDiscount = () => {
    router.delete('/cart/discount', { preserveScroll: true })
  }

  if (!cart || cart.items.length === 0) {
    return (
      <StorefrontLayout>
        <Head title="Cart" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="animate-fade-up">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">{t('storefront.cartPage.yourBag')}</span>
            <h1 className="font-display text-3xl tracking-tight mt-2">{t('storefront.cartPage.shoppingCart')}</h1>
          </div>
          <div className="mt-16 flex flex-col items-center justify-center py-16 text-center animate-fade-up delay-200">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-border">
              <ShoppingBag className="text-muted-foreground/50 h-8 w-8" />
            </div>
            <h2 className="mt-6 font-display text-xl">{t('storefront.emptyCart')}</h2>
            <p className="text-muted-foreground mt-2 text-sm max-w-sm">
              {t('storefront.cartPage.emptyDesc')}
            </p>
            <Button asChild className="mt-8 px-8" size="lg">
              <Link href="/products">{t('storefront.continueShopping')}</Link>
            </Button>
          </div>
        </div>
      </StorefrontLayout>
    )
  }

  return (
    <StorefrontLayout>
      <Head title="Cart" />
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="animate-fade-up">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">{t('storefront.cartPage.yourBag')}</span>
          <h1 className="font-display text-3xl tracking-tight mt-2">{t('storefront.cartPage.shoppingCart')}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {cart.itemCount} {cart.itemCount === 1 ? t('storefront.cartPage.item') : t('storefront.cartPage.items')}
          </p>
        </div>

        <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-7">
            <div className="divide-y">
              {cart.items.map((item, i) => (
                <div key={item.id} className={`flex gap-6 py-6 animate-fade-up delay-${Math.min((i + 1) * 100, 500)}`}>
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-muted img-zoom"
                  >
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
                        <Package className="text-muted-foreground/30 h-8 w-8" />
                      </div>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <div>
                        <Link
                          href={`/products/${item.productSlug}`}
                          className="font-medium hover:underline underline-offset-4 decoration-foreground/30"
                        >
                          {item.title}
                        </Link>
                        {item.variantTitle && (
                          <p className="text-muted-foreground mt-1 text-sm">
                            {item.variantTitle}
                          </p>
                        )}
                        {item.sku && (
                          <p className="text-muted-foreground mt-0.5 text-[11px] tracking-wide uppercase">
                            SKU: {item.sku}
                          </p>
                        )}
                      </div>
                      <p className="font-display text-lg">
                        {formatCurrency(item.totalPrice, cur)}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex items-center rounded-lg border">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none rounded-l-lg"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-10 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none rounded-r-lg"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive text-xs"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        {t('storefront.cartPage.remove')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="ghost" asChild className="mt-6 text-sm">
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('storefront.continueShopping')}
              </Link>
            </Button>
          </div>

          {/* Order Summary */}
          <div className="mt-12 lg:col-span-5 lg:mt-0">
            <Card className="animate-fade-up delay-300 sticky top-[88px]">
              <CardHeader>
                <CardTitle className="font-display text-lg">{t('storefront.cartPage.orderSummary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('storefront.subtotal')}</span>
                  <span className="font-medium">{formatCurrency(cart.subtotal, cur)}</span>
                </div>

                {cart.discountTotal > 0 && (
                  <div className="flex justify-between text-sm text-emerald-700">
                    <span className="flex items-center gap-2">
                      {t('storefront.cartPage.discount')}
                      {cart.discountCode && (
                        <Badge variant="secondary" className="text-[10px]">
                          {cart.discountCode}
                        </Badge>
                      )}
                    </span>
                    <span className="font-medium">
                      -{formatCurrency(cart.discountTotal, cur)}
                    </span>
                  </div>
                )}

                {cart.taxTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('storefront.tax')}</span>
                    <span className="font-medium">{formatCurrency(cart.taxTotal, cur)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between items-baseline">
                  <span className="font-display text-lg">{t('storefront.total')}</span>
                  <span className="font-display text-xl">{formatCurrency(cart.total, cur)}</span>
                </div>

                {/* Discount Code */}
                {!cart.discountCode ? (
                  <div className="pt-3">
                    <label className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                      {t('storefront.cartPage.discountCode')}
                    </label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        placeholder={t('storefront.cartPage.enterCode')}
                        className="flex-1 text-sm"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={applyDiscount}
                        disabled={applyingDiscount}
                      >
                        {applyingDiscount ? t('storefront.cartPage.applying') : t('storefront.cartPage.apply')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/20">
                    <div>
                      <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400">
                        Code: {cart.discountCode}
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-500">
                        -{formatCurrency(cart.discountTotal, cur)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-emerald-600 hover:text-emerald-700"
                      onClick={removeDiscount}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex-col gap-3">
                <Button asChild className="w-full h-12 text-sm tracking-wide" size="lg">
                  <Link href="/checkout">{t('storefront.checkout')}</Link>
                </Button>
                <p className="text-muted-foreground text-center text-xs">
                  {t('storefront.cartPage.shippingCalc')}
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  )
}
