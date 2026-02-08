import { Head, Link } from '@inertiajs/react'
import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  AlertTriangle,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDateTime } from '@/lib/utils'

interface Stats {
  orderCount: number
  revenue: number
  averageOrderValue: number
}

interface RecentOrder {
  id: string
  orderNumber: string
  customerName: string
  total: number
  status: string
  paymentStatus: string
  createdAt: string
}

interface LowStockProduct {
  id: string
  title: string
  variants: Array<{
    id: string
    title: string
    sku: string
    quantity: number
  }>
}

interface Props {
  user: { displayName: string; email: string }
  stats: {
    today: Stats
    yesterday: Stats
    weekly: Stats
    monthly: Stats
  }
  recentOrders: RecentOrder[]
  lowStockProducts: LowStockProduct[]
  topProducts: Array<{
    id: string
    title: string
    total_sold: number
    total_revenue: number
  }>
}

// Sample chart data
const revenueData = [
  { date: 'Mon', revenue: 2400 },
  { date: 'Tue', revenue: 1398 },
  { date: 'Wed', revenue: 9800 },
  { date: 'Thu', revenue: 3908 },
  { date: 'Fri', revenue: 4800 },
  { date: 'Sat', revenue: 3800 },
  { date: 'Sun', revenue: 4300 },
]

const ordersData = [
  { date: 'Mon', orders: 12 },
  { date: 'Tue', orders: 8 },
  { date: 'Wed', orders: 24 },
  { date: 'Thu', orders: 15 },
  { date: 'Fri', orders: 18 },
  { date: 'Sat', orders: 22 },
  { date: 'Sun', orders: 16 },
]

export default function Dashboard({
  stats,
  recentOrders,
  lowStockProducts,
  topProducts,
}: Props) {
  const calcChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const revenueChange = calcChange(stats.today.revenue, stats.yesterday.revenue)
  const ordersChange = calcChange(
    stats.today.orderCount,
    stats.yesterday.orderCount
  )

  const getStatusVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return 'default'
      case 'shipped':
      case 'processing':
        return 'secondary'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <AdminLayout>
      <Head title="Dashboard - Admin" />

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Revenue
              </CardTitle>
              <DollarSign className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.today.revenue)}
              </div>
              <p className="text-muted-foreground flex items-center text-xs">
                {revenueChange >= 0 ? (
                  <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span
                  className={
                    revenueChange >= 0 ? 'text-green-500' : 'text-red-500'
                  }
                >
                  {Math.abs(revenueChange).toFixed(1)}%
                </span>
                <span className="ml-1">from yesterday</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Orders
              </CardTitle>
              <ShoppingCart className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today.orderCount}</div>
              <p className="text-muted-foreground flex items-center text-xs">
                {ordersChange >= 0 ? (
                  <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span
                  className={
                    ordersChange >= 0 ? 'text-green-500' : 'text-red-500'
                  }
                >
                  {Math.abs(ordersChange).toFixed(1)}%
                </span>
                <span className="ml-1">from yesterday</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Revenue
              </CardTitle>
              <TrendingUp className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.monthly.revenue)}
              </div>
              <p className="text-muted-foreground text-xs">
                {stats.monthly.orderCount} orders this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Order Value
              </CardTitle>
              <Package className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.monthly.averageOrderValue)}
              </div>
              <p className="text-muted-foreground text-xs">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Daily revenue for the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="date"
                      className="text-muted-foreground text-xs"
                    />
                    <YAxis className="text-muted-foreground text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders Overview</CardTitle>
              <CardDescription>Daily orders for the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ordersData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="date"
                      className="text-muted-foreground text-xs"
                    />
                    <YAxis className="text-muted-foreground text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar
                      dataKey="orders"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest orders from your store</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/orders">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.slice(0, 5).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                        <div className="text-muted-foreground text-xs">
                          {formatDateTime(order.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(order.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Low Stock Alerts
                </CardTitle>
                <CardDescription>Products that need restocking</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/inventory">Manage</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No low stock items
                </p>
              ) : (
                <div className="space-y-4">
                  {lowStockProducts.slice(0, 4).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-start justify-between"
                    >
                      <div>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="font-medium hover:underline"
                        >
                          {product.title}
                        </Link>
                        <div className="mt-1 space-y-0.5">
                          {product.variants.map((variant) => (
                            <div
                              key={variant.id}
                              className="text-muted-foreground flex items-center justify-between text-xs"
                            >
                              <span>{variant.sku || variant.title}</span>
                              <Badge
                                variant={
                                  variant.quantity <= 5
                                    ? 'destructive'
                                    : 'secondary'
                                }
                                className="ml-2"
                              >
                                {variant.quantity} left
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>
                Best performing products this month
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/analytics/products">View report</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Units Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((product, index) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium">
                          {index + 1}
                        </span>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="font-medium hover:underline"
                        >
                          {product.title}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {product.total_sold}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(product.total_revenue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
