import { Head, router } from '@inertiajs/react'
import {
  Calendar,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  BarChart3,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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

interface Props {
  period: string
  data: Array<{ date: string; revenue: number; orders: number; discounts: number }>
  summary: {
    totalRevenue: number
    totalOrders: number
    totalDiscounts: number
    averageOrderValue: number
  }
  paymentMethods: Array<{ method: string; count: number; revenue: number }>
}

export default function SalesAnalytics({ period, data, summary, paymentMethods }: Props) {
  const handlePeriodChange = (newPeriod: string) => {
    router.get('/admin/analytics/sales', { period: newPeriod })
  }

  const getPeriodLabel = (periodValue: string) => {
    switch (periodValue) {
      case '7d': return 'Last 7 Days'
      case '30d': return 'Last 30 Days'
      case '90d': return 'Last 90 Days'
      case '1y': return 'Last Year'
      default: return 'Last 30 Days'
    }
  }

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <AdminLayout
      title="Sales Analytics"
      description="Detailed sales performance and revenue insights"
      actions={
        <div className="flex items-center gap-2">
          <Calendar className="text-muted-foreground h-4 w-4" />
          <div className="flex gap-1 rounded-lg border p-1">
            {['7d', '30d', '90d', '1y'].map((p) => (
              <Button
                key={p}
                variant={period === p ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handlePeriodChange(p)}
              >
                {p.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      }
    >
      <Head title="Sales Analytics - Admin" />

      <div className="animate-fade-in space-y-6">
        <Badge variant="outline" className="bg-accent/10 text-sm">
          {getPeriodLabel(period)}
        </Badge>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="animate-fade-up card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">{formatCurrency(summary.totalRevenue)}</div>
              {summary.totalDiscounts > 0 && (
                <p className="text-muted-foreground text-xs">
                  {formatCurrency(summary.totalDiscounts)} in discounts
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-100 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">{summary.totalOrders.toLocaleString()}</div>
              <p className="text-muted-foreground text-xs">Paid orders in period</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-200 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Average Order Value</CardTitle>
              <TrendingUp className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">{formatCurrency(summary.averageOrderValue)}</div>
              <p className="text-muted-foreground text-xs">Per order average</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-300 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Daily Average</CardTitle>
              <BarChart3 className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">
                {formatCurrency(data.length > 0 ? summary.totalRevenue / data.length : 0)}
              </div>
              <p className="text-muted-foreground text-xs">Revenue per day</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="animate-fade-up delay-200">
          <CardHeader>
            <CardTitle className="font-display text-lg">Revenue Over Time</CardTitle>
            <CardDescription>
              Daily revenue breakdown for the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg" style={{ backgroundColor: '#faf8f5' }}>
                <BarChart3 className="h-12 w-12" style={{ color: '#e9b96e' }} />
                <p className="text-muted-foreground text-sm">No sales data available for this period</p>
                <p className="text-muted-foreground text-xs">Sales will appear here once orders are placed</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4872e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#d4872e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: '#888' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e5e5' }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#888' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e5e5',
                        borderRadius: '8px',
                        fontSize: '13px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'revenue') return [`$${Number(value).toLocaleString()}`, 'Revenue']
                        if (name === 'orders') return [value, 'Orders']
                        return [value, name]
                      }}
                      labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#d4872e"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Insights */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="animate-fade-up delay-300">
            <CardHeader>
              <CardTitle className="font-display text-lg">Orders by Day</CardTitle>
              <CardDescription>Order volume over the period</CardDescription>
            </CardHeader>
            <CardContent>
              {data.length === 0 ? (
                <div className="flex h-48 items-center justify-center rounded-lg" style={{ backgroundColor: '#faf8f5' }}>
                  <p className="text-muted-foreground text-sm">No order data available</p>
                </div>
              ) : (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: '#888' }}
                        tickLine={false}
                        axisLine={{ stroke: '#e5e5e5' }}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: '#888' }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e5e5',
                          borderRadius: '8px',
                          fontSize: '13px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        }}
                        formatter={(value: number) => [value, 'Orders']}
                      />
                      <Bar dataKey="orders" fill="#d4872e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-400">
            <CardHeader>
              <CardTitle className="font-display text-lg">Payment Methods</CardTitle>
              <CardDescription>Most used payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              {(!paymentMethods || paymentMethods.length === 0) ? (
                <div className="flex h-48 items-center justify-center rounded-lg" style={{ backgroundColor: '#faf8f5' }}>
                  <p className="text-muted-foreground text-sm">No payment data available</p>
                </div>
              ) : (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={paymentMethods}
                      margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 12, fill: '#888' }}
                        tickLine={false}
                        axisLine={{ stroke: '#e5e5e5' }}
                      />
                      <YAxis
                        type="category"
                        dataKey="method"
                        tick={{ fontSize: 12, fill: '#888' }}
                        tickLine={false}
                        axisLine={false}
                        width={75}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e5e5',
                          borderRadius: '8px',
                          fontSize: '13px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        }}
                        formatter={(value: number, name: string) => {
                          if (name === 'count') return [value, 'Orders']
                          return [`$${Number(value).toLocaleString()}`, 'Revenue']
                        }}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {paymentMethods.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={['#d4872e', '#e9b96e', '#c46a1a', '#b8860b', '#8B7355'][index % 5]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
