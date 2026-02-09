import { Head, router } from '@inertiajs/react'
import {
  Calendar,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
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

interface Props {
  period: string
  data: any[]
}

export default function SalesAnalytics({ period, data }: Props) {
  const handlePeriodChange = (newPeriod: string) => {
    router.get('/admin/analytics/sales', { period: newPeriod })
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
      title="Sales Analytics"
      description="Detailed sales performance and revenue insights"
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
              <div className="font-display text-2xl">$0.00</div>
              <div className="text-muted-foreground flex items-center text-xs">
                <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                No data yet
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-100 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">0</div>
              <div className="text-muted-foreground flex items-center text-xs">
                <ArrowDownRight className="mr-1 h-3 w-3 text-gray-400" />
                No data yet
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-200 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Average Order Value</CardTitle>
              <TrendingUp className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">$0.00</div>
              <p className="text-muted-foreground text-xs">Per order average</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-300 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Conversion Rate</CardTitle>
              <BarChart3 className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">0%</div>
              <p className="text-muted-foreground text-xs">Visitors to customers</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart Placeholder */}
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
                <p className="text-muted-foreground text-sm">
                  No sales data available for this period
                </p>
                <p className="text-muted-foreground text-xs">
                  Sales will appear here once orders are placed
                </p>
              </div>
            ) : (
              <div className="h-64" />
            )}
          </CardContent>
        </Card>

        {/* Additional Insights */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="animate-fade-up delay-300">
            <CardHeader>
              <CardTitle className="font-display text-lg">Sales by Channel</CardTitle>
              <CardDescription>Revenue breakdown by sales channel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-center justify-center rounded-lg" style={{ backgroundColor: '#faf8f5' }}>
                <p className="text-muted-foreground text-sm">No channel data available</p>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-400">
            <CardHeader>
              <CardTitle className="font-display text-lg">Payment Methods</CardTitle>
              <CardDescription>Most used payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-center justify-center rounded-lg" style={{ backgroundColor: '#faf8f5' }}>
                <p className="text-muted-foreground text-sm">No payment data available</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
