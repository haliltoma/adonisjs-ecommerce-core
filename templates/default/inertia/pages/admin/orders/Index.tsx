import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import {
  CreditCard,
  Download,
  Package,
  Search,
  ShoppingCart,
  Truck,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDateTime, debounce } from '@/lib/utils'

interface Order {
  id: string
  orderNumber: string
  customer: { id?: string; name?: string; email: string }
  total: number
  currency: string
  status: string
  paymentStatus: string
  fulfillmentStatus: string
  itemCount: number
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
  filters: {
    status?: string
    paymentStatus?: string
    fulfillmentStatus?: string
    search?: string
    dateFrom?: string
    dateTo?: string
  }
}

export default function OrdersIndex({ orders, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '')

  const debouncedSearch = debounce((value: string) => {
    router.get(
      '/admin/orders',
      { ...filters, search: value, page: 1 },
      { preserveState: true }
    )
  }, 300)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    debouncedSearch(e.target.value)
  }

  const handleFilterChange = (key: string, value: string) => {
    router.get(
      '/admin/orders',
      { ...filters, [key]: value || undefined, page: 1 },
      { preserveState: true }
    )
  }

  const getStatusVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return 'default'
      case 'shipped':
      case 'processing':
      case 'confirmed':
        return 'secondary'
      case 'cancelled':
      case 'refunded':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getPaymentVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'paid':
        return 'default'
      case 'authorized':
      case 'pending':
        return 'secondary'
      case 'failed':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getFulfillmentVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'fulfilled':
        return 'default'
      case 'partially_fulfilled':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <AdminLayout
      title="Orders"
      description={`Manage your ${orders.meta.total} orders`}
      actions={
        <Button variant="outline" asChild>
          <Link href="/admin/orders/export">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Link>
        </Button>
      }
    >
      <Head title="Orders - Admin" />

      <div className="animate-fade-in">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
                <Input
                  placeholder="Search orders..."
                  value={search}
                  onChange={handleSearchChange}
                  className="bg-secondary/50 border-0 pl-8 text-sm h-9"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('status', value === 'all' ? '' : value)
                  }
                >
                  <SelectTrigger className="w-[140px] h-9 text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.paymentStatus || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange(
                      'paymentStatus',
                      value === 'all' ? '' : value
                    )
                  }
                >
                  <SelectTrigger className="w-[140px] h-9 text-sm">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All payments</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.fulfillmentStatus || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange(
                      'fulfillmentStatus',
                      value === 'all' ? '' : value
                    )
                  }
                >
                  <SelectTrigger className="w-[160px] h-9 text-sm">
                    <SelectValue placeholder="Fulfillment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All fulfillment</SelectItem>
                    <SelectItem value="unfulfilled">Unfulfilled</SelectItem>
                    <SelectItem value="partially_fulfilled">
                      Partially Fulfilled
                    </SelectItem>
                    <SelectItem value="fulfilled">Fulfilled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Order</TableHead>
                  <TableHead className="text-xs">Customer</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Payment</TableHead>
                  <TableHead className="text-xs">Fulfillment</TableHead>
                  <TableHead className="text-right text-xs">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingCart className="text-muted-foreground h-8 w-8" />
                        <p className="text-muted-foreground text-sm">
                          No orders found
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.data.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-sm font-medium hover:underline underline-offset-4"
                        >
                          {order.orderNumber}
                        </Link>
                        <p className="text-muted-foreground text-[11px] mt-0.5">
                          {formatDateTime(order.createdAt)}
                        </p>
                      </TableCell>
                      <TableCell>
                        {order.customer.name ? (
                          <div>
                            <p className="text-sm font-medium">{order.customer.name}</p>
                            <p className="text-muted-foreground text-[11px] mt-0.5">
                              {order.customer.email}
                            </p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">
                            {order.customer.email}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.status)} className="text-[11px]">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CreditCard className="text-muted-foreground h-3 w-3" />
                          <Badge variant={getPaymentVariant(order.paymentStatus)} className="text-[11px]">
                            {order.paymentStatus.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Truck className="text-muted-foreground h-3 w-3" />
                          <Badge
                            variant={getFulfillmentVariant(order.fulfillmentStatus)}
                            className="text-[11px]"
                          >
                            {order.fulfillmentStatus.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-medium">
                          {formatCurrency(order.total, order.currency)}
                        </span>
                        <p className="text-muted-foreground text-[11px] mt-0.5">
                          {order.itemCount} items
                        </p>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {orders.meta.lastPage > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-muted-foreground text-xs">
                  Page {orders.meta.currentPage} of {orders.meta.lastPage}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={orders.meta.currentPage <= 1}
                    onClick={() =>
                      router.get('/admin/orders', {
                        ...filters,
                        page: orders.meta.currentPage - 1,
                      })
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={orders.meta.currentPage >= orders.meta.lastPage}
                    onClick={() =>
                      router.get('/admin/orders', {
                        ...filters,
                        page: orders.meta.currentPage + 1,
                      })
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
