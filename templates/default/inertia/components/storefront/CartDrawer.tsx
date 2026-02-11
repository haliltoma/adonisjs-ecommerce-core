import { Link } from '@inertiajs/react'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/stores/cart-store'
import { formatCurrency } from '@/lib/utils'
import { useTranslation } from '@/hooks/use-translation'

export function CartDrawer() {
  const { t } = useTranslation()
  const items = useCartStore((s) => s.items)
  const isOpen = useCartStore((s) => s.isOpen)
  const closeCart = useCartStore((s) => s.closeCart)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const subtotal = useCartStore((s) => s.subtotal)

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            {t('storefront.cartDrawer.title')} ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">{t('storefront.cartDrawer.emptyTitle')}</p>
            <p className="text-muted-foreground text-sm mt-1">{t('storefront.cartDrawer.emptySubtitle')}</p>
            <Button className="mt-4" onClick={closeCart} asChild>
              <Link href="/products">{t('storefront.cartDrawer.continueShopping')}</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto -mx-6 px-6 py-2 space-y-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3">
                  {item.image ? (
                    <div className="h-20 w-20 shrink-0 rounded-md overflow-hidden bg-muted">
                      <img src={item.image} alt={item.title} className="object-cover w-full h-full" />
                    </div>
                  ) : (
                    <div className="h-20 w-20 shrink-0 rounded-md bg-muted flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    {item.variantTitle && (
                      <p className="text-muted-foreground text-xs">{item.variantTitle}</p>
                    )}
                    <p className="text-sm font-medium mt-1">{formatCurrency(item.price)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-md">
                        <button
                          className="p-1 hover:bg-muted"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs tabular-nums">{item.quantity}</span>
                        <button
                          className="p-1 hover:bg-muted"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        className="text-muted-foreground hover:text-destructive p-1"
                        onClick={() => removeItem(item.variantId)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <SheetFooter className="flex-col gap-3 pt-4">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium">{t('storefront.cartDrawer.subtotal')}</span>
                <span className="text-lg font-bold">{formatCurrency(subtotal())}</span>
              </div>
              <p className="text-muted-foreground text-xs">{t('storefront.cartDrawer.shippingNote')}</p>
              <Button className="w-full" asChild onClick={closeCart}>
                <Link href="/checkout">{t('storefront.cartDrawer.checkout')}</Link>
              </Button>
              <Button variant="outline" className="w-full" onClick={closeCart} asChild>
                <Link href="/cart">{t('storefront.cartDrawer.viewCart')}</Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
