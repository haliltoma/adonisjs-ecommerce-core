import { Head, Link } from '@inertiajs/react'
import { CheckCircle2, Package } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import { useTranslation } from '@/hooks/use-translation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/lib/utils'

interface OrderItem {
  title: string
  variantTitle: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Address {
  firstName?: string
  lastName?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  countryCode?: string
}

interface Order {
  id: string
  orderNumber: string
  email: string
  status: string
  paymentStatus: string
  subtotal: number
  discountTotal: number
  shippingTotal: number
  taxTotal: number
  total: number
  currency: string
  billingAddress: Address
  shippingAddress: Address
  shippingMethod: string
  items: OrderItem[]
  createdAt: string
}

interface Props {
  order: Order
}

export default function Confirmation({ order }: Props) {
  const { t } = useTranslation()

  const formatAddress = (address: Address) => {
    if (!address) return null
    return [
      address.firstName && address.lastName
        ? `${address.firstName} ${address.lastName}`
        : null,
      address.addressLine1,
      address.addressLine2,
      `${address.city || ''}, ${address.state || ''} ${address.postalCode || ''}`.trim(),
      address.countryCode,
    ].filter(Boolean)
  }

  return (
    <StorefrontLayout>
      <Head title={t('storefront.confirmationPage.orderConfirmed')} />

      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
        {/* Success Header */}
        <div className="text-center animate-fade-up">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
            <CheckCircle2 className="h-10 w-10 text-accent" />
          </div>
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mt-6 block">{t('storefront.confirmationPage.orderConfirmed')}</span>
          <h1 className="font-display text-3xl tracking-tight mt-2">
            {t('storefront.confirmationPage.thankYou')}
          </h1>
          <p className="text-muted-foreground mt-3">
            {t('storefront.confirmationPage.orderPlacedSuccess', { orderNumber: order.orderNumber })}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('storefront.confirmationPage.confirmationEmail')}{' '}
            <span className="font-medium">{order.email}</span>
          </p>
        </div>

        {/* Order Summary */}
        <Card className="mt-12 animate-fade-up delay-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-accent" />
              {t('storefront.confirmationPage.orderSummary')}
            </CardTitle>
            <div className="flex gap-2">
              <Badge className="bg-accent text-accent-foreground text-[10px] uppercase tracking-wider">{order.status}</Badge>
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{order.paymentStatus}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className={`flex items-center justify-between text-sm animate-fade-up delay-${Math.min((index + 3) * 100, 600)}`}>
                  <div>
                    <span className="font-medium">{item.title}</span>
                    {item.variantTitle && (
                      <span className="text-muted-foreground"> - {item.variantTitle}</span>
                    )}
                    <span className="text-muted-foreground text-xs ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-display">{formatCurrency(item.totalPrice)}</span>
                </div>
              ))}
            </div>

            <Separator className="my-5" />

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('storefront.confirmationPage.subtotal')}</span>
                <span className="font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('storefront.confirmationPage.discount')}</span>
                  <span className="text-emerald-700 font-medium">
                    -{formatCurrency(order.discountTotal)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('storefront.confirmationPage.shipping')}</span>
                <span className="font-medium">{formatCurrency(order.shippingTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('storefront.confirmationPage.tax')}</span>
                <span className="font-medium">{formatCurrency(order.taxTotal)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-baseline pt-1">
                <span className="font-display text-lg">{t('storefront.confirmationPage.total')}</span>
                <span className="font-display text-xl">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Addresses */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 animate-fade-up delay-400">
          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">{t('storefront.confirmationPage.delivery')}</span>
                <CardTitle className="font-display text-base mt-1">{t('storefront.confirmationPage.shippingAddress')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm leading-relaxed text-muted-foreground">
                  {formatAddress(order.shippingAddress)?.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {order.billingAddress && (
            <Card>
              <CardHeader>
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">{t('storefront.confirmationPage.billing')}</span>
                <CardTitle className="font-display text-base mt-1">{t('storefront.confirmationPage.billingAddress')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm leading-relaxed text-muted-foreground">
                  {formatAddress(order.billingAddress)?.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center animate-fade-up delay-500">
          <Button asChild className="h-12 px-8 tracking-wide" size="lg">
            <Link href="/products">{t('storefront.confirmationPage.continueShopping')}</Link>
          </Button>
          <Button variant="outline" asChild className="h-12 px-8 tracking-wide" size="lg">
            <Link href={`/account/orders/${order.id}`}>{t('storefront.confirmationPage.viewOrderDetails')}</Link>
          </Button>
        </div>

        <p className="text-muted-foreground mt-8 text-center text-xs tracking-wide animate-fade-in delay-600">
          {t('storefront.confirmationPage.placedOn')} {formatDate(order.createdAt)}
        </p>
      </div>
    </StorefrontLayout>
  )
}
