import { Head, router } from '@inertiajs/react'
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Calendar,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Props {
  period: string
  salesByDay: { date: string; revenue: number; orders: number }[]
  newCustomers: number
  returningCustomers: any[]
  topCategories: { name: string; revenue: number }[]
}

export default function Analytics({
  period,
  salesByDay,
  newCustomers,
  returningCustomers,
  topCategories,
}: Props) {
  const totalRevenue = salesByDay.reduce((sum, day) => sum + day.revenue, 0)
  const totalOrders = salesByDay.reduce((sum, day) => sum + day.orders, 0)
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const handlePeriodChange = (newPeriod: string) => {
    router.get('/admin/analytics', { period: newPeriod })
  }

  const getPeriodLabel = (periodValue: string) => {
    switch (periodValue) {
      case '7d':
        return 'Last 7 Days'
      case '30d':
        return 'Last 30 Days'
      case '90d':
        return 'Last 90 Days'
      case '1y':
        return 'Last Year'
      default:
        return 'Last 7 Days'
    }
  }

  return (
    <AdminLayout
      title="Analytics"
      description="View detailed sales and performance analytics"
      actions={
        <div className="flex items-center gap-2">
          <Calendar className="text-muted-foreground h-4 w-4" />
          <div className="flex gap-1 rounded-lg border p-1">
            <Button
              variant={period === '7d' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handlePeriodChange('7d')}
            >
              7D
            </Button>
            <Button
              variant={period === '30d' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handlePeriodChange('30d')}
            >
              30D
            </Button>
            <Button
              variant={period === '90d' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handlePeriodChange('90d')}
            >
              90D
            </Button>
            <Button
              variant={period === '1y' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handlePeriodChange('1y')}
            >
              1Y
            </Button>
          </div>
        </div>
      }
    >
      <Head title="Analytics - Admin" />

      <div className="animate-fade-in space-y-6">
        {/* Period Info */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-accent/10 text-sm">
            {getPeriodLabel(period)}
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="animate-fade-up card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">
                {formatCurrency(totalRevenue)}
              </div>
              <p className="text-muted-foreground text-xs">
                For the selected period
              </p>
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-100 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">{totalOrders}</div>
              <p className="text-muted-foreground text-xs">
                Orders placed in period
              </p>
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-200 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">New Customers</CardTitle>
              <Users className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">{newCustomers}</div>
              <p className="text-muted-foreground text-xs">
                First time customers
              </p>
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-300 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Avg Order Value</CardTitle>
              <TrendingUp className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">
                {formatCurrency(averageOrderValue)}
              </div>
              <p className="text-muted-foreground text-xs">
                Per order average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sales by Day */}
        <Card className="animate-fade-up delay-200">
          <CardHeader>
            <CardTitle className="font-display text-lg">Sales by Day</CardTitle>
            <CardDescription>
              Daily breakdown of revenue and orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Date</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground">Orders</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground">Revenue</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground">Avg Order Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesByDay.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground text-center text-sm">
                      No sales data available for this period
                    </TableCell>
                  </TableRow>
                ) : (
                  salesByDay.map((day) => {
                    const avgValue = day.orders > 0 ? day.revenue / day.orders : 0
                    return (
                      <TableRow key={day.date}>
                        <TableCell className="text-sm font-medium">
                          {formatDate(day.date)}
                        </TableCell>
                        <TableCell className="text-right text-sm">{day.orders}</TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {formatCurrency(day.revenue)}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {formatCurrency(avgValue)}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Categories and Returning Customers */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Top Categories */}
          <Card className="animate-fade-up delay-300">
            <CardHeader>
              <CardTitle className="font-display text-lg">Top Categories</CardTitle>
              <CardDescription>
                Categories by revenue for this period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topCategories.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No category data available
                </p>
              ) : (
                <div className="space-y-4">
                  {topCategories.map((category, index) => {
                    const percentage =
                      totalRevenue > 0
                        ? (category.revenue / totalRevenue) * 100
                        : 0
                    return (
                      <div key={category.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium" style={{ backgroundColor: '#e9b96e', color: '#3d2e1a' }}>
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium">{category.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-display text-sm">
                              {formatCurrency(category.revenue)}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: '#e5e0db' }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${percentage}%`, backgroundColor: '#d4872e' }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Returning Customers */}
          <Card className="animate-fade-up delay-400">
            <CardHeader>
              <CardTitle className="font-display text-lg">Returning Customers</CardTitle>
              <CardDescription>
                Customers who made repeat purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              {returningCustomers.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No returning customers in this period
                </p>
              ) : (
                <div className="space-y-4">
                  {returningCustomers.slice(0, 5).map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium">{customer.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {customer.email}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-sm">
                          {customer.orderCount || 0} orders
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {formatCurrency(customer.totalSpent || 0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
