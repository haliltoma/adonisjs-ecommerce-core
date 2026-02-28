import { Head, Link } from '@inertiajs/react'
import {
  ArrowDown,
  ArrowUp,
  Clock,
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

interface ChartDataPoint {
  date: string
  revenue: number
  orders: number
}

interface Counts {
  totalCustomers: number
  totalProducts: number
  pendingOrders: number
  newCustomersThisMonth: number
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
  revenueChart: ChartDataPoint[]
  counts: Counts
}

const CHART_COLOR = '#d4872e'
const CHART_COLOR_SOFT = '#e9b96e'

export default function Dashboard({
  stats,
  recentOrders,
  lowStockProducts,
  topProducts,
  revenueChart,
  counts,
}: Props) {
  const chartData = (revenueChart || []).map((d) => ({
    date: d.date,
    revenue: Number(d.revenue) || 0,
    orders: Number(d.orders) || 0,
  }))
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

  const statCards = [
    {
      title: "Today's Revenue",
      icon: DollarSign,
      value: formatCurrency(stats.today.revenue),
      change: revenueChange,
      sub: 'from yesterday',
    },
    {
      title: "Today's Orders",
      icon: ShoppingCart,
      value: stats.today.orderCount.toString(),
      change: ordersChange,
      sub: 'from yesterday',
    },
    {
      title: 'Monthly Revenue',
      icon: TrendingUp,
      value: formatCurrency(stats.monthly.revenue),
      change: null,
      sub: `${stats.monthly.orderCount} orders this month`,
    },
    {
      title: 'Avg Order Value',
      icon: Package,
      value: formatCurrency(stats.monthly.averageOrderValue),
      change: null,
      sub: 'This month',
    },
  ]

  const secondaryCards = [
    {
      title: 'Total Customers',
      icon: Users,
      value: counts.totalCustomers.toLocaleString(),
      sub: `${counts.newCustomersThisMonth} new this month`,
      href: '/admin/customers',
    },
    {
      title: 'Active Products',
      icon: Package,
      value: counts.totalProducts.toLocaleString(),
      sub: `${lowStockProducts.length} low stock`,
      href: '/admin/products',
    },
    {
      title: 'Pending Orders',
      icon: Clock,
      value: counts.pendingOrders.toLocaleString(),
      sub: 'Awaiting processing',
      href: '/admin/orders?status=pending',
    },
    {
      title: 'Weekly Revenue',
      icon: TrendingUp,
      value: formatCurrency(stats.weekly.revenue),
      sub: `${stats.weekly.orderCount} orders this week`,
      href: '/admin/analytics/sales?period=7d',
    },
  ]

  return (
    <AdminLayout>
      <Head title="Dashboard - Admin" />

      <div className="space-y-6 animate-fade-in">
        {/* Welcome */}
        <div>
          <h1 className="font-display text-2xl tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Overview of your store performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, i) => (
            <Card key={stat.title} className={`animate-fade-up delay-${(i + 1) * 100}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="text-muted-foreground/50 h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="font-display text-2xl tracking-tight">
                  {stat.value}
                </div>
                <p className="text-muted-foreground flex items-center text-xs mt-1">
                  {stat.change !== null ? (
                    <>
                      {stat.change >= 0 ? (
                        <ArrowUp className="mr-1 h-3 w-3 text-emerald-600" />
                      ) : (
                        <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                      )}
                      <span className={stat.change >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                        {Math.abs(stat.change).toFixed(1)}%
                      </span>
                      <span className="ml-1">{stat.sub}</span>
                    </>
                  ) : (
                    stat.sub
                  )}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {secondaryCards.map((stat, i) => (
            <Link key={stat.title} href={stat.href} className="block">
              <Card className={`animate-fade-up delay-${(i + 5) * 100} transition-colors hover:border-accent/40`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="text-muted-foreground/50 h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="font-display text-2xl tracking-tight">
                    {stat.value}
                  </div>
                  <p className="text-muted-foreground text-xs mt-1">
                    {stat.sub}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="animate-fade-up delay-500">
            <CardHeader>
              <CardTitle className="text-base">Revenue Overview</CardTitle>
              <CardDescription>Daily revenue for the past 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLOR} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={CHART_COLOR} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e0db" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9a948e' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#9a948e' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#faf8f5',
                        border: '1px solid #e5e0db',
                        borderRadius: '8px',
                        fontSize: '13px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={CHART_COLOR}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-600">
            <CardHeader>
              <CardTitle className="text-base">Orders Overview</CardTitle>
              <CardDescription>Daily orders for the past 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e0db" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9a948e' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#9a948e' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#faf8f5',
                        border: '1px solid #e5e0db',
                        borderRadius: '8px',
                        fontSize: '13px',
                      }}
                    />
                    <Bar
                      dataKey="orders"
                      fill={CHART_COLOR_SOFT}
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
                <CardTitle className="text-base">Recent Orders</CardTitle>
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
                    <TableHead className="text-xs">Order</TableHead>
                    <TableHead className="text-xs">Customer</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-right text-xs">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.slice(0, 5).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-sm font-medium hover:underline underline-offset-4"
                        >
                          {order.orderNumber}
                        </Link>
                        <div className="text-muted-foreground text-[11px] mt-0.5">
                          {formatDateTime(order.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{order.customerName}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.status)} className="text-[11px]">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
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
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
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
                <p className="text-muted-foreground text-sm py-4 text-center">
                  No low stock items
                </p>
              ) : (
                <div className="space-y-4">
                  {lowStockProducts.slice(0, 4).map((product) => (
                    <div key={product.id} className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-sm font-medium hover:underline underline-offset-4"
                        >
                          {product.title}
                        </Link>
                        <div className="mt-1.5 space-y-1">
                          {product.variants.map((variant) => (
                            <div
                              key={variant.id}
                              className="text-muted-foreground flex items-center justify-between text-xs"
                            >
                              <span>{variant.sku || variant.title}</span>
                              <Badge
                                variant={variant.quantity <= 5 ? 'destructive' : 'secondary'}
                                className="ml-2 text-[11px]"
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
              <CardTitle className="text-base">Top Selling Products</CardTitle>
              <CardDescription>Best performing products this month</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/analytics/products">View report</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Product</TableHead>
                  <TableHead className="text-right text-xs">Units Sold</TableHead>
                  <TableHead className="text-right text-xs">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((product, index) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                          {index + 1}
                        </span>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-sm font-medium hover:underline underline-offset-4"
                        >
                          {product.title}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {product.total_sold}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
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
