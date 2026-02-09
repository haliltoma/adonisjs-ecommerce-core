import { Head, router } from '@inertiajs/react'
import {
  Calendar,
  Users,
  UserPlus,
  UserCheck,
  TrendingUp,
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
  customers: any[]
}

export default function CustomerAnalytics({ period, customers }: Props) {
  const handlePeriodChange = (newPeriod: string) => {
    router.get('/admin/analytics/customers', { period: newPeriod })
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
      title="Customer Analytics"
      description="Understand your customer base and buying behavior"
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
      <Head title="Customer Analytics - Admin" />

      <div className="animate-fade-in space-y-6">
        <Badge variant="outline" className="bg-accent/10 text-sm">
          {getPeriodLabel(period)}
        </Badge>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="animate-fade-up card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Customers</CardTitle>
              <Users className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">0</div>
              <p className="text-muted-foreground text-xs">All registered customers</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-100 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">New Customers</CardTitle>
              <UserPlus className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">0</div>
              <p className="text-muted-foreground text-xs">Joined in period</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-200 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Returning Customers</CardTitle>
              <UserCheck className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">0</div>
              <p className="text-muted-foreground text-xs">Repeat purchasers</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-300 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Avg Lifetime Value</CardTitle>
              <TrendingUp className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">$0.00</div>
              <p className="text-muted-foreground text-xs">Revenue per customer</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Customers */}
        <Card className="animate-fade-up delay-200">
          <CardHeader>
            <CardTitle className="font-display text-lg">Top Customers</CardTitle>
            <CardDescription>
              Customers ranked by total spending during the selected period
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Customer</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground">Orders</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground">Total Spent</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground">Avg Order</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Last Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8" style={{ color: '#e9b96e' }} />
                        <p className="text-muted-foreground text-sm">
                          No customer data available for this period
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Customer analytics will appear once orders are placed
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer: any) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium">{customer.name}</div>
                          <div className="text-muted-foreground text-xs">{customer.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm">{customer.orderCount}</TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        ${customer.totalSpent}
                      </TableCell>
                      <TableCell className="text-right text-sm">${customer.avgOrder}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {customer.lastOrder}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Additional Insights */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="animate-fade-up delay-300">
            <CardHeader>
              <CardTitle className="font-display text-lg">Customer Growth</CardTitle>
              <CardDescription>New customer registrations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-center justify-center rounded-lg" style={{ backgroundColor: '#faf8f5' }}>
                <div className="flex flex-col items-center gap-2">
                  <BarChart3 className="h-8 w-8" style={{ color: '#e9b96e' }} />
                  <p className="text-muted-foreground text-sm">No growth data available</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-400">
            <CardHeader>
              <CardTitle className="font-display text-lg">Customer Segments</CardTitle>
              <CardDescription>Distribution by purchase frequency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-center justify-center rounded-lg" style={{ backgroundColor: '#faf8f5' }}>
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-8 w-8" style={{ color: '#e9b96e' }} />
                  <p className="text-muted-foreground text-sm">No segment data available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
