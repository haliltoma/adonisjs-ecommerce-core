import { Head, Link } from '@inertiajs/react'
import { DollarSign, Heart, Home, LogOut, MapPin, Package, ShoppingBag, User } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  itemCount: number
  createdAt: string
}

interface Customer {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  createdAt: string
}

interface Props {
  customer: Customer
  recentOrders: Order[]
  stats: {
    totalOrders: number
    totalSpent: number
  }
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  processing: 'default',
  shipped: 'default',
  delivered: 'default',
  cancelled: 'destructive',
}

export default function AccountIndex({ customer, recentOrders, stats }: Props) {
  const getFullName = () => {
    if (customer.firstName || customer.lastName) {
      return `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
    }
    return 'Customer'
  }

  const getInitials = () => {
    const name = getFullName()
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <StorefrontLayout>
      <Head title="My Account" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
          {/* Sidebar */}
          <aside className="mb-8 lg:mb-0">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Avatar className="mx-auto h-20 w-20">
                    <AvatarFallback className="text-2xl">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="mt-4 text-lg font-semibold">{getFullName()}</h2>
                  <p className="text-muted-foreground text-sm">{customer.email}</p>
                </div>

                <Separator className="my-6" />

                <nav className="space-y-1">
                  <Button variant="secondary" asChild className="w-full justify-start">
                    <Link href="/account">
                      <Home className="mr-3 h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild className="w-full justify-start">
                    <Link href="/account/orders">
                      <ShoppingBag className="mr-3 h-4 w-4" />
                      Orders
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild className="w-full justify-start">
                    <Link href="/account/addresses">
                      <MapPin className="mr-3 h-4 w-4" />
                      Addresses
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild className="w-full justify-start">
                    <Link href="/account/wishlist">
                      <Heart className="mr-3 h-4 w-4" />
                      Wishlist
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild className="w-full justify-start">
                    <Link href="/account/profile">
                      <User className="mr-3 h-4 w-4" />
                      Profile
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    asChild
                    className="text-destructive hover:text-destructive w-full justify-start"
                  >
                    <Link href="/account/logout" method="post" as="button">
                      <LogOut className="mr-3 h-4 w-4" />
                      Logout
                    </Link>
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {customer.firstName || 'Customer'}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your account.
            </p>

            {/* Stats */}
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <Card>
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                    <Package className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Total Orders</p>
                    <p className="text-2xl font-bold">{stats.totalOrders}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Total Spent</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(stats.totalSpent)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card className="mt-12">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/account/orders">View all</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentOrders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">#{order.orderNumber}</div>
                              <div className="text-muted-foreground text-sm">
                                {order.itemCount} items
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariants[order.status] || 'secondary'}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(order.total)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/account/orders/${order.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ShoppingBag className="text-muted-foreground h-12 w-12" />
                    <h3 className="mt-4 font-medium">No orders yet</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Start shopping to see your orders here.
                    </p>
                    <Button asChild className="mt-4">
                      <Link href="/products">Browse Products</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </StorefrontLayout>
  )
}
