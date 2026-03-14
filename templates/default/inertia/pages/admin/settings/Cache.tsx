import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Database, Image, Package, ShoppingCart, BarChart3, Trash2 } from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const cacheScopes = [
  {
    key: 'products',
    label: 'Products',
    description: 'Clear cached product listings, details, and search results.',
    icon: Package,
  },
  {
    key: 'categories',
    label: 'Categories & Navigation',
    description: 'Clear cached category trees and navigation menus.',
    icon: Database,
  },
  {
    key: 'orders',
    label: 'Orders',
    description: 'Clear cached order data and statistics.',
    icon: ShoppingCart,
  },
  {
    key: 'analytics',
    label: 'Analytics',
    description: 'Clear cached analytics and dashboard metrics.',
    icon: BarChart3,
  },
  {
    key: 'all',
    label: 'All Cache',
    description: 'Clear all cached data for this store. This may temporarily slow down your store.',
    icon: Trash2,
  },
]

export default function Cache() {
  const [clearing, setClearing] = useState<string | null>(null)

  function handleClear(scope: string) {
    setClearing(scope)
    router.post(
      '/admin/settings/cache/clear',
      { scope },
      {
        preserveScroll: true,
        onFinish: () => setClearing(null),
      }
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Cache Management"
          description="Clear cached data to see the latest changes on your store."
        />

        <div className="grid gap-4 md:grid-cols-2">
          {cacheScopes.map((scope) => (
            <Card key={scope.key}>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <scope.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{scope.label}</CardTitle>
                  <CardDescription className="text-sm">{scope.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant={scope.key === 'all' ? 'destructive' : 'outline'}
                  size="sm"
                  disabled={clearing !== null}
                  onClick={() => handleClear(scope.key)}
                >
                  {clearing === scope.key ? 'Clearing...' : 'Clear'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
