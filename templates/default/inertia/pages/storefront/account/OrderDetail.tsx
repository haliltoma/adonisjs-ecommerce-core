import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, Package, Truck } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'

interface OrderItem {
  title: string
  variantTitle: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Fulfillment {
  status: string
  trackingNumber: string | null
  trackingUrl: string | null
  carrier: string | null
  shippedAt: string | null
  deliveredAt: string | null
}

interface Address {
  firstName: string
  lastName: string
  company?: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  countryCode: string
  phone?: string
}

interface Order {
  id: string
  orderNumber: string
  email: string
  status: string
  paymentStatus: string
  fulfillmentStatus: string
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
  fulfillments: Fulfillment[]
  createdAt: string
}

interface Props {
  order: Order
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  confirmed: 'default',
  processing: 'default',
  shipped: 'default',
  delivered: 'default',
  cancelled: 'destructive',
  refunded: 'destructive',
  paid: 'default',
  unpaid: 'secondary',
  unfulfilled: 'secondary',
  partial: 'outline',
  fulfilled: 'default',
}

export default function OrderDetail({ order }: Props) {
  const formatAddress = (address: Address) => {
    if (!address) return null
    const lines = [
      `${address.firstName} ${address.lastName}`,
      address.company,
      address.addressLine1,
      address.addressLine2,
      `${address.city}, ${address.state} ${address.postalCode}`,
      address.countryCode,
    ].filter(Boolean)
    return lines
  }

  return (
    <StorefrontLayout>
      <Head title={`Order #${order.orderNumber}`} />

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="animate-fade-up mb-8">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
            <Link href="/account/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        </div>

        <div className="animate-fade-up delay-100 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">Order Details</span>
            <h1 className="font-display text-3xl tracking-tight mt-2">
              Order #{order.orderNumber}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant={statusVariants[order.status] || 'secondary'}>
              {order.status}
            </Badge>
            <Badge variant={statusVariants[order.paymentStatus] || 'secondary'}>
              {order.paymentStatus}
            </Badge>
          </div>
        </div>

        {/* Order Items */}
        <Card className="animate-fade-up delay-200 mt-8 border-border/60">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-xl tracking-tight">
              <Package className="h-5 w-5 text-accent" />
              Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border/40">
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Product</TableHead>
                  <TableHead className="text-center text-xs uppercase tracking-wider text-muted-foreground">Qty</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground">Price</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items?.map((item, index) => (
                  <TableRow key={index} className="border-border/40">
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{item.title}</div>
                        {item.variantTitle && (
                          <div className="text-muted-foreground text-xs mt-0.5">
                            {item.variantTitle}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm">{item.quantity}</TableCell>
                    <TableCell className="text-right text-sm">
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {formatCurrency(item.totalPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Separator className="my-4 bg-border/40" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-green-600">
                    -{formatCurrency(order.discountTotal)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatCurrency(order.shippingTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(order.taxTotal)}</span>
              </div>
              <Separator className="bg-border/40" />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="font-display">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fulfillments */}
        {order.fulfillments && order.fulfillments.length > 0 && (
          <Card className="animate-fade-up delay-300 mt-6 border-border/60">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2 text-xl tracking-tight">
                <Truck className="h-5 w-5 text-accent" />
                Shipping Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.fulfillments.map((fulfillment, index) => (
                <div key={index} className="rounded-lg border border-border/60 p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant={statusVariants[fulfillment.status] || 'secondary'}>
                      {fulfillment.status}
                    </Badge>
                    {fulfillment.carrier && (
                      <span className="text-muted-foreground text-xs uppercase tracking-wider">
                        {fulfillment.carrier}
                      </span>
                    )}
                  </div>
                  {fulfillment.trackingNumber && (
                    <p className="mt-2 text-sm">
                      Tracking:{' '}
                      {fulfillment.trackingUrl ? (
                        <a
                          href={fulfillment.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline"
                        >
                          {fulfillment.trackingNumber}
                        </a>
                      ) : (
                        <span className="font-mono">{fulfillment.trackingNumber}</span>
                      )}
                    </p>
                  )}
                  <div className="text-muted-foreground mt-2 space-y-1 text-xs">
                    {fulfillment.shippedAt && (
                      <p>Shipped: {formatDate(fulfillment.shippedAt)}</p>
                    )}
                    {fulfillment.deliveredAt && (
                      <p>Delivered: {formatDate(fulfillment.deliveredAt)}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Addresses */}
        <div className="animate-fade-up delay-400 mt-6 grid gap-6 sm:grid-cols-2">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="font-display text-base tracking-tight">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              {order.shippingAddress ? (
                <div className="text-sm leading-relaxed text-muted-foreground">
                  {formatAddress(order.shippingAddress)?.map((line, i) => (
                    <p key={i} className={i === 0 ? 'font-medium text-foreground' : ''}>{line}</p>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No shipping address</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="font-display text-base tracking-tight">Billing Address</CardTitle>
            </CardHeader>
            <CardContent>
              {order.billingAddress ? (
                <div className="text-sm leading-relaxed text-muted-foreground">
                  {formatAddress(order.billingAddress)?.map((line, i) => (
                    <p key={i} className={i === 0 ? 'font-medium text-foreground' : ''}>{line}</p>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No billing address</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </StorefrontLayout>
  )
}
