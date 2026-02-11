import { Head, router } from '@inertiajs/react'
import {
  Calendar,
  Users,
  UserPlus,
  UserCheck,
  TrendingUp,
  BarChart3,
} from 'lucide-react'
import {
  BarChart as RechartsBarChart,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface CustomerData {
  id: string
  name: string
  email: string
  orderCount: number
  totalSpent: number
  avgOrder: number
  lastOrder: string | null
  joinedAt: string | null
}

interface Props {
  period: string
  customers: CustomerData[]
  summary: {
    totalCustomers: number
    newCustomersCount: number
    returningCustomersCount: number
    avgLifetimeValue: number
  }
}

export default function CustomerAnalytics({ period, customers, summary }: Props) {
  const handlePeriodChange = (newPeriod: string) => {
    router.get('/admin/analytics/customers', { period: newPeriod })
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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString()
  }

  return (
    <AdminLayout
      title="Customer Analytics"
      description="Understand your customer base and buying behavior"
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
              <div className="font-display text-2xl">{summary.totalCustomers.toLocaleString()}</div>
              <p className="text-muted-foreground text-xs">All registered customers</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-100 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">New Customers</CardTitle>
              <UserPlus className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">{summary.newCustomersCount.toLocaleString()}</div>
              <p className="text-muted-foreground text-xs">Joined in period</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-200 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Returning Customers</CardTitle>
              <UserCheck className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">{summary.returningCustomersCount.toLocaleString()}</div>
              <p className="text-muted-foreground text-xs">Repeat purchasers</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-300 card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Avg Lifetime Value</CardTitle>
              <TrendingUp className="h-4 w-4" style={{ color: '#d4872e' }} />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl">{formatCurrency(summary.avgLifetimeValue)}</div>
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
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium">{customer.name}</div>
                          <div className="text-muted-foreground text-xs">{customer.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm">{customer.orderCount}</TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatCurrency(customer.totalSpent)}
                      </TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(customer.avgOrder)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(customer.lastOrder)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card className="animate-fade-up delay-300">
          <CardHeader>
            <CardTitle className="font-display text-lg">Customer Segments</CardTitle>
            <CardDescription>Distribution by purchase frequency</CardDescription>
          </CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <div className="flex h-48 items-center justify-center rounded-lg" style={{ backgroundColor: '#faf8f5' }}>
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-8 w-8" style={{ color: '#e9b96e' }} />
                  <p className="text-muted-foreground text-sm">No segment data available</p>
                </div>
              </div>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={(() => {
                      const segments = { 'One-time': 0, 'Occasional': 0, 'Regular': 0, 'Loyal': 0 }
                      customers.forEach((c) => {
                        const orders = c.orderCount || 0
                        if (orders <= 1) segments['One-time'] += 1
                        else if (orders <= 3) segments['Occasional'] += 1
                        else if (orders <= 8) segments['Regular'] += 1
                        else segments['Loyal'] += 1
                      })
                      return Object.entries(segments).map(([segment, count]) => ({
                        segment,
                        count,
                      }))
                    })()}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis
                      dataKey="segment"
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
                      formatter={(value: number) => [value, 'Customers']}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {['#d4872e', '#e9b96e', '#c46a1a', '#b8860b'].map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
