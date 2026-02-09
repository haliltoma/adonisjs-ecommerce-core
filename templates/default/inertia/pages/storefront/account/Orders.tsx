import { Head, Link, router } from '@inertiajs/react'
import { Home, MapPin, Package, ShoppingBag, User } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'

interface OrderItem {
  id: string
  title: string
  variantTitle: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  thumbnail: string | null
}

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  fulfillmentStatus: string
  subtotal: number
  discountTotal: number
  shippingTotal: number
  taxTotal: number
  total: number
  itemCount: number
  items: OrderItem[]
  createdAt: string
}

interface Props {
  orders: {
    data: Order[]
    meta: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
    }
  }
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  processing: 'default',
  shipped: 'default',
  delivered: 'default',
  cancelled: 'destructive',
  refunded: 'outline',
}

export default function AccountOrders({ orders }: Props) {
  return (
    <StorefrontLayout>
      <Head title="My Orders" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
          {/* Sidebar */}
          <aside className="animate-fade-up mb-8 lg:mb-0">
            <nav className="space-y-1">
              <Button variant="ghost" asChild className="w-full justify-start text-muted-foreground hover:text-foreground">
                <Link href="/account">
                  <Home className="mr-3 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="secondary" asChild className="w-full justify-start">
                <Link href="/account/orders">
                  <ShoppingBag className="mr-3 h-4 w-4" />
                  Orders
                </Link>
              </Button>
              <Button variant="ghost" asChild className="w-full justify-start text-muted-foreground hover:text-foreground">
                <Link href="/account/addresses">
                  <MapPin className="mr-3 h-4 w-4" />
                  Addresses
                </Link>
              </Button>
              <Button variant="ghost" asChild className="w-full justify-start text-muted-foreground hover:text-foreground">
                <Link href="/account/profile">
                  <User className="mr-3 h-4 w-4" />
                  Profile
                </Link>
              </Button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <div className="animate-fade-up delay-100">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">Your Orders</span>
              <h1 className="font-display text-3xl tracking-tight mt-2">Order History</h1>
              <p className="text-muted-foreground mt-2">{orders.meta.total} orders</p>
            </div>

            {orders.data.length > 0 ? (
              <div className="mt-8 space-y-6">
                {orders.data.map((order, index) => (
                  <Card key={order.id} className={`animate-fade-up delay-${(index + 2) * 100} border-border/60 overflow-hidden`}>
                    <CardHeader className="bg-muted/30 flex flex-row flex-wrap items-center justify-between gap-4 space-y-0 py-4">
                      <div className="flex flex-wrap items-center gap-6">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">Order number</p>
                          <p className="font-display text-base tracking-tight">#{order.orderNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">Date placed</p>
                          <p className="text-sm font-medium">{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total amount</p>
                          <p className="text-sm font-medium">{formatCurrency(order.total)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={statusVariants[order.status] || 'secondary'}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        <Button variant="ghost" size="sm" asChild className="text-accent hover:text-accent/80">
                          <Link href={`/account/orders/${order.id}`}>View Order</Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ul className="divide-y divide-border/40">
                        {order.items.slice(0, 3).map((item) => (
                          <li key={item.id} className="flex gap-4 px-6 py-4">
                            <div className="bg-muted/50 h-16 w-16 flex-shrink-0 overflow-hidden rounded">
                              {item.thumbnail ? (
                                <img
                                  src={item.thumbnail}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Package className="text-muted-foreground/60 h-6 w-6" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.title}</p>
                              {item.variantTitle && (
                                <p className="text-muted-foreground text-xs mt-0.5">
                                  {item.variantTitle}
                                </p>
                              )}
                              <p className="text-muted-foreground mt-1 text-xs">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <p className="font-medium text-sm">
                              {formatCurrency(item.totalPrice)}
                            </p>
                          </li>
                        ))}
                        {order.items.length > 3 && (
                          <li className="text-muted-foreground px-6 py-3 text-center text-xs">
                            + {order.items.length - 3} more items
                          </li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                ))}

                {/* Pagination */}
                {orders.meta.lastPage > 1 && (
                  <div className="animate-fade-in flex items-center justify-center gap-2 pt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border/60 tracking-wide"
                      disabled={orders.meta.currentPage <= 1}
                      onClick={() =>
                        router.get(
                          '/account/orders',
                          { page: orders.meta.currentPage - 1 },
                          { preserveState: true }
                        )
                      }
                    >
                      Previous
                    </Button>
                    <span className="text-muted-foreground px-4 text-sm">
                      Page {orders.meta.currentPage} of {orders.meta.lastPage}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border/60 tracking-wide"
                      disabled={orders.meta.currentPage >= orders.meta.lastPage}
                      onClick={() =>
                        router.get(
                          '/account/orders',
                          { page: orders.meta.currentPage + 1 },
                          { preserveState: true }
                        )
                      }
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Card className="animate-fade-up delay-200 mt-8 border-dashed border-border/60">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingBag className="text-muted-foreground/40 h-12 w-12" />
                  <h3 className="font-display mt-4 text-lg tracking-tight">No orders yet</h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    When you place orders, they will appear here.
                  </p>
                  <Button asChild className="mt-6 h-11 tracking-wide">
                    <Link href="/products">Start Shopping</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </StorefrontLayout>
  )
}
