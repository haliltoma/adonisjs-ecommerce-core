import { Head, router } from '@inertiajs/react'
import {
  Calendar,
  Package,
  TrendingUp,
  ShoppingCart,
  BarChart3,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

interface ProductData {
  id: string
  title: string
  slug: string
  unitsSold: number
  revenue: number
  orderCount: number
}

interface CategoryData {
  category: string
  unitsSold: number
  revenue: number
}

interface Props {
  period: string
  products: ProductData[]
  categoryPerformance: CategoryData[]
  summary: {
    totalSold: number
    totalRevenue: number
  }
}

export default function ProductAnalytics({ period, products, categoryPerformance, summary }: Props) {
  const handlePeriodChange = (newPeriod: string) => {
    router.get('/admin/analytics/products', { period: newPeriod })
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

  const formatCurrency = (value: number | null | undefined) =>
    `$${(Number(value) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <AdminLayout
      title="Product Analytics"
      description="Track product performance and sales"
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
      <Head title="Product Analytics - Admin" />

      <div className="animate-fade-in space-y-6">
        <Badge variant="outline" className="bg-accent/10 text-sm">
          {getPeriodLabel(period)}
        </Badge>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="animate-fade-up card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Units Sold</CardTitle>
              <Package className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">{(Number(summary.totalSold) || 0).toLocaleString()}</div>
              <p className="text-muted-foreground text-xs">Units sold in period</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-100 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Product Revenue</CardTitle>
              <TrendingUp className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">{formatCurrency(summary.totalRevenue)}</div>
              <p className="text-muted-foreground text-xs">Revenue from products</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-200 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Unique Products</CardTitle>
              <ShoppingCart className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">{products.length}</div>
              <p className="text-muted-foreground text-xs">Products with sales</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-300 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Avg Revenue/Product</CardTitle>
              <BarChart3 className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">
                {formatCurrency(products.length > 0 ? summary.totalRevenue / products.length : 0)}
              </div>
              <p className="text-muted-foreground text-xs">Per product average</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Products Table */}
        <Card className="animate-fade-up delay-200">
          <CardHeader>
            <CardTitle className="font-display text-lg">Top Selling Products</CardTitle>
            <CardDescription>
              Products ranked by revenue during the selected period
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Product</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground">Units Sold</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground">Revenue</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground">Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <BarChart3 className="h-8 w-8" style={{ color: '#e9b96e' }} />
                        <p className="text-muted-foreground text-sm">
                          No product data available for this period
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Product analytics will appear once sales are recorded
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="text-sm font-medium">{product.title}</TableCell>
                      <TableCell className="text-right text-sm">{product.unitsSold.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(product.revenue)}</TableCell>
                      <TableCell className="text-right text-sm">{product.orderCount}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card className="animate-fade-up delay-300">
          <CardHeader>
            <CardTitle className="font-display text-lg">Category Performance</CardTitle>
            <CardDescription>
              Sales breakdown by product category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(!categoryPerformance || categoryPerformance.length === 0) ? (
              <div className="flex h-64 items-center justify-center rounded-lg" style={{ backgroundColor: '#faf8f5' }}>
                <div className="flex flex-col items-center gap-2">
                  <BarChart3 className="h-8 w-8" style={{ color: '#e9b96e' }} />
                  <p className="text-muted-foreground text-sm">No category performance data available</p>
                </div>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryPerformance}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 12, fill: '#888' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e5e5' }}
                    />
                    <YAxis
                      yAxisId="revenue"
                      tick={{ fontSize: 12, fill: '#888' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <YAxis
                      yAxisId="units"
                      orientation="right"
                      tick={{ fontSize: 12, fill: '#888' }}
                      tickLine={false}
                      axisLine={false}
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
                        if (name === 'revenue') return [`$${value.toLocaleString()}`, 'Revenue']
                        return [value, 'Units Sold']
                      }}
                    />
                    <Bar yAxisId="revenue" dataKey="revenue" fill="#d4872e" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="units" dataKey="unitsSold" fill="#e9b96e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
