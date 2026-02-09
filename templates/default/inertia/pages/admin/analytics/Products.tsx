import { Head, router } from '@inertiajs/react'
import {
  Calendar,
  Package,
  TrendingUp,
  Eye,
  ShoppingCart,
  BarChart3,
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

interface Props {
  period: string
  products: any[]
}

export default function ProductAnalytics({ period, products }: Props) {
  const handlePeriodChange = (newPeriod: string) => {
    router.get('/admin/analytics/products', { period: newPeriod })
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
        return 'Last 30 Days'
    }
  }

  return (
    <AdminLayout
      title="Product Analytics"
      description="Track product performance, views, and sales"
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
      <Head title="Product Analytics - Admin" />

      <div className="animate-fade-in space-y-6">
        <Badge variant="outline" className="bg-accent/10 text-sm">
          {getPeriodLabel(period)}
        </Badge>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="animate-fade-up card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Products Sold</CardTitle>
              <Package className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">0</div>
              <p className="text-muted-foreground text-xs">Units sold in period</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-100 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Product Views</CardTitle>
              <Eye className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">0</div>
              <p className="text-muted-foreground text-xs">Total product page views</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-200 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Add-to-Cart Rate</CardTitle>
              <ShoppingCart className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">0%</div>
              <p className="text-muted-foreground text-xs">Views to add-to-cart</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-300 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Product Revenue</CardTitle>
              <TrendingUp className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">$0.00</div>
              <p className="text-muted-foreground text-xs">Revenue from products</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Products Table */}
        <Card className="animate-fade-up delay-200">
          <CardHeader>
            <CardTitle className="font-display text-lg">Top Selling Products</CardTitle>
            <CardDescription>
              Products ranked by units sold during the selected period
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Product</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground">Units Sold</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground">Revenue</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground">Views</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground">Conversion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
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
                  products.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell className="text-sm font-medium">{product.title}</TableCell>
                      <TableCell className="text-right text-sm">{product.unitsSold}</TableCell>
                      <TableCell className="text-right text-sm">${product.revenue}</TableCell>
                      <TableCell className="text-right text-sm">{product.views}</TableCell>
                      <TableCell className="text-right text-sm">{product.conversion}%</TableCell>
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
            <div className="flex h-32 items-center justify-center rounded-lg" style={{ backgroundColor: '#faf8f5' }}>
              <p className="text-muted-foreground text-sm">No category performance data available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
