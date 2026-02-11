import { Head, Link } from '@inertiajs/react'
import {
  Mail,
  Megaphone,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/admin/StatsCard'

interface Props {
  stats: {
    abandonedCarts: number
    abandonedRevenue: number
    emailSubscribers: number
    conversionRate: number
  }
}

export default function MarketingIndex({ stats }: Props) {
  return (
    <AdminLayout title="Marketing" description="Manage your marketing campaigns and tools">
      <Head title="Marketing - Admin" />
      <div className="animate-fade-in space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Abandoned Carts"
            value={stats.abandonedCarts}
            icon={<ShoppingCart className="size-5" />}
          />
          <StatsCard
            title="Abandoned Revenue"
            value={`$${stats.abandonedRevenue.toLocaleString()}`}
            icon={<TrendingUp className="size-5" />}
          />
          <StatsCard
            title="Email Subscribers"
            value={stats.emailSubscribers}
            icon={<Users className="size-5" />}
          />
          <StatsCard
            title="Conversion Rate"
            value={`${stats.conversionRate}%`}
            icon={<Megaphone className="size-5" />}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/marketing/abandoned-carts">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <ShoppingCart className="text-muted-foreground size-8 mb-2" />
                <CardTitle className="text-base">Abandoned Carts</CardTitle>
                <CardDescription>
                  View and recover abandoned shopping carts. Send recovery emails to customers.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/marketing/email-campaigns">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <Mail className="text-muted-foreground size-8 mb-2" />
                <CardTitle className="text-base">Email Campaigns</CardTitle>
                <CardDescription>
                  Create and manage email marketing campaigns for your customers.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/discounts">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <Megaphone className="text-muted-foreground size-8 mb-2" />
                <CardTitle className="text-base">Discount Codes</CardTitle>
                <CardDescription>
                  Create discount codes and promotions to drive sales.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </AdminLayout>
  )
}
