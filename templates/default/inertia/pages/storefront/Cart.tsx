import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import { ArrowLeft, Minus, Package, Plus, ShoppingBag, Trash2, X } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'

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
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
          <Card className="mt-12 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="text-muted-foreground h-16 w-16" />
              <h2 className="mt-4 text-xl font-semibold">Your cart is empty</h2>
              <p className="text-muted-foreground mt-2">
                Browse our products and add items to your cart.
              </p>
              <Button asChild className="mt-6">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </StorefrontLayout>
    )
  }

  return (
    <StorefrontLayout>
      <Head title="Cart" />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
        <p className="text-muted-foreground mt-1">
          {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
        </p>

        <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-7">
            <div className="divide-y">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-6 py-6">
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="bg-muted h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg"
                  >
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="text-muted-foreground h-8 w-8" />
                      </div>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <div>
                        <Link
                          href={`/products/${item.productSlug}`}
                          className="hover:text-primary font-medium transition-colors"
                        >
                          {item.title}
                        </Link>
                        {item.variantTitle && (
                          <p className="text-muted-foreground mt-1 text-sm">
                            {item.variantTitle}
                          </p>
                        )}
                        {item.sku && (
                          <p className="text-muted-foreground mt-1 text-xs">
                            SKU: {item.sku}
                          </p>
                        )}
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(item.totalPrice)}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex items-center rounded-md border">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-10 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="ghost" asChild className="mt-6">
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>

          {/* Order Summary */}
          <div className="mt-12 lg:col-span-5 lg:mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(cart.subtotal)}
                  </span>
                </div>

                {cart.discountTotal > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-2">
                      Discount
                      {cart.discountCode && (
                        <Badge variant="secondary" className="text-xs">
                          {cart.discountCode}
                        </Badge>
                      )}
                    </span>
                    <span className="font-medium">
                      -{formatCurrency(cart.discountTotal)}
                    </span>
                  </div>
                )}

                {cart.taxTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">
                      {formatCurrency(cart.taxTotal)}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-semibold">
                    {formatCurrency(cart.total)}
                  </span>
                </div>

                {/* Discount Code */}
                {!cart.discountCode ? (
                  <div className="pt-4">
                    <label className="text-sm font-medium">Discount Code</label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        placeholder="Enter code"
                        className="flex-1"
                      />
                      <Button
                        variant="secondary"
                        onClick={applyDiscount}
                        disabled={applyingDiscount}
                      >
                        {applyingDiscount ? 'Applying...' : 'Apply'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-950/20">
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-400">
                        Code applied: {cart.discountCode}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-500">
                        -{formatCurrency(cart.discountTotal)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-green-600 hover:text-green-700"
                      onClick={removeDiscount}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <Button asChild className="w-full" size="lg">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <p className="text-muted-foreground text-center text-sm">
                  Shipping calculated at checkout
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  )
}
