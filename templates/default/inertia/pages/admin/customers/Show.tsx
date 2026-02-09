import { Head, Link } from '@inertiajs/react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  ShoppingBag,
  DollarSign,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
} from 'lucide-react'

interface Props {
  customer: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    fullName: string
    phone: string | null
    avatarUrl: string | null
    status: string
    acceptsMarketing: boolean
    totalOrders: number
    totalSpent: number
    lastOrderAt: string | null
    tags: any
    notes: string | null
    groupId: string | null
    group: { id: string; name: string } | null
    emailVerifiedAt: string | null
    createdAt: string
    updatedAt: string
  }
  orders: {
    data: {
      id: string
      orderNumber: string
      total: number
      status: string
      paymentStatus: string
      createdAt: string
    }[]
    meta: { total: number; perPage: number; currentPage: number; lastPage: number }
  }
  addresses: {
    id: string
    type: string
    isDefault: boolean
    firstName: string
    lastName: string
    company: string | null
    address1: string
    address2: string | null
    city: string
    state: string
    postalCode: string
    country: string
    phone: string | null
  }[]
}

export default function Show({ customer, orders, addresses }: Props) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'secondary'
      case 'banned':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'success'
      case 'processing':
        return 'default'
      case 'pending':
        return 'warning'
      case 'cancelled':
      case 'refunded':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'success'
      case 'pending':
        return 'warning'
      case 'failed':
      case 'refunded':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <AdminLayout
      title={customer.fullName}
      description={`Customer details for ${customer.email}`}
      actions={
        <div className="flex gap-2">
          <Link href="/admin/customers">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customers
            </Button>
          </Link>
          <Link href={`/admin/customers/${customer.id}/edit`}>
            <Button className="tracking-wide">
              <Edit className="mr-2 h-4 w-4" />
              Edit Customer
            </Button>
          </Link>
        </div>
      }
    >
      <Head title={`Customer: ${customer.fullName}`} />

      <div className="space-y-6 animate-fade-in">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 animate-fade-up delay-100">
            <CardHeader>
              <CardTitle className="font-display text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={customer.avatarUrl || undefined} alt={customer.fullName} />
                  <AvatarFallback className="font-display text-lg">{getInitials(customer.fullName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-display text-2xl">{customer.fullName}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant={getStatusColor(customer.status)}>{customer.status}</Badge>
                      {customer.group && <Badge variant="outline">{customer.group.name}</Badge>}
                      {customer.acceptsMarketing && (
                        <Badge variant="secondary">Accepts Marketing</Badge>
                      )}
                      {customer.emailVerifiedAt && (
                        <Badge variant="success">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Email Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 pt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${customer.email}`}
                        className="text-accent hover:underline underline-offset-4"
                      >
                        {customer.email}
                      </a>
                    </div>
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${customer.phone}`} className="text-accent hover:underline underline-offset-4">
                          {customer.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground text-[11px] tracking-wide">
                        Joined {formatDate(customer.createdAt)}
                      </span>
                    </div>
                  </div>

                  {customer.notes && (
                    <div className="pt-2">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Notes</p>
                      <p className="mt-1 text-sm text-muted-foreground">{customer.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="animate-fade-up delay-200">
              <CardHeader>
                <CardTitle className="font-display text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-[11px] uppercase tracking-wide">
                    <ShoppingBag className="h-4 w-4" />
                    <span>Total Orders</span>
                  </div>
                  <p className="mt-1 font-display text-2xl">{customer.totalOrders}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-[11px] uppercase tracking-wide">
                    <DollarSign className="h-4 w-4" />
                    <span>Total Spent</span>
                  </div>
                  <p className="mt-1 font-display text-2xl">{formatCurrency(customer.totalSpent)}</p>
                </div>
                {customer.lastOrderAt && (
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground text-[11px] uppercase tracking-wide">
                      <Calendar className="h-4 w-4" />
                      <span>Last Order</span>
                    </div>
                    <p className="mt-1 text-sm">{formatDate(customer.lastOrderAt)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="animate-fade-up delay-300">
          <CardHeader>
            <CardTitle className="font-display text-lg">Orders</CardTitle>
            <CardDescription>
              {orders.meta.total} {orders.meta.total === 1 ? 'order' : 'orders'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.data.length > 0 ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.data.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium font-mono text-sm">{order.orderNumber}</TableCell>
                        <TableCell className="text-muted-foreground text-[11px] tracking-wide">{formatDate(order.createdAt)}</TableCell>
                        <TableCell className="font-display">{formatCurrency(order.total)}</TableCell>
                        <TableCell>
                          <Badge variant={getOrderStatusColor(order.status)}>{order.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPaymentStatusColor(order.paymentStatus)}>
                            {order.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="ghost" size="sm" className="text-accent hover:underline underline-offset-4">
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {orders.meta.lastPage > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-[11px] tracking-wide">
                      Showing {(orders.meta.currentPage - 1) * orders.meta.perPage + 1} to{' '}
                      {Math.min(orders.meta.currentPage * orders.meta.perPage, orders.meta.total)}{' '}
                      of {orders.meta.total} orders
                    </p>
                    <div className="flex gap-2">
                      {orders.meta.currentPage > 1 && (
                        <Link
                          href={`/admin/customers/${customer.id}?page=${orders.meta.currentPage - 1}`}
                        >
                          <Button variant="outline" size="sm">
                            Previous
                          </Button>
                        </Link>
                      )}
                      {orders.meta.currentPage < orders.meta.lastPage && (
                        <Link
                          href={`/admin/customers/${customer.id}?page=${orders.meta.currentPage + 1}`}
                        >
                          <Button variant="outline" size="sm">
                            Next
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-up delay-400">
          <CardHeader>
            <CardTitle className="font-display text-lg">Addresses</CardTitle>
            <CardDescription>
              {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {addresses.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="rounded-lg border border-border/60 p-4 space-y-2 hover:border-accent/40 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium capitalize">{address.type}</span>
                      </div>
                      {address.isDefault && <Badge className="bg-accent text-accent-foreground">Default</Badge>}
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="font-medium">
                        {address.firstName} {address.lastName}
                      </p>
                      {address.company && <p className="text-muted-foreground">{address.company}</p>}
                      <p>{address.address1}</p>
                      {address.address2 && <p>{address.address2}</p>}
                      <p>
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p>{address.country}</p>
                      {address.phone && <p className="text-muted-foreground text-[11px] tracking-wide">{address.phone}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No addresses added</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
