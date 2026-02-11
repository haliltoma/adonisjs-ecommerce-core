import { Head, router } from '@inertiajs/react'
import {
  Check,
  ExternalLink,
  Plug,
  Settings,
  X,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

interface Integration {
  id: string
  name: string
  description: string
  category: string
  isEnabled: boolean
  isConfigured: boolean
  icon?: string
}

interface Props {
  integrations: Integration[]
  categories: string[]
}

export default function IntegrationsPage({ integrations, categories }: Props) {
  const toggleIntegration = (id: string, isEnabled: boolean) => {
    router.patch(`/admin/settings/integrations/${id}`, { isEnabled: !isEnabled })
  }

  const grouped = categories.reduce<Record<string, Integration[]>>((acc, cat) => {
    acc[cat] = integrations.filter((i) => i.category === cat)
    return acc
  }, {})

  return (
    <AdminLayout title="Integrations" description="Connect your store with external services">
      <Head title="Integrations - Admin" />
      <div className="animate-fade-in space-y-8">
        {Object.entries(grouped).map(([category, items]) => (
          items.length > 0 && (
            <div key={category} className="space-y-4">
              <h2 className="text-lg font-semibold capitalize">{category.replace(/_/g, ' ')}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((integration) => (
                  <Card key={integration.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                            <Plug className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{integration.name}</CardTitle>
                            <CardDescription className="text-xs">{integration.description}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {integration.isConfigured ? (
                            <Badge variant="outline" className="text-[10px] gap-1">
                              <Check className="h-3 w-3 text-emerald-500" />Configured
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] gap-1">
                              <X className="h-3 w-3 text-muted-foreground" />Not configured
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.get(`/admin/settings/integrations/${integration.id}`)}>
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Switch
                            checked={integration.isEnabled}
                            onCheckedChange={() => toggleIntegration(integration.id, integration.isEnabled)}
                            disabled={!integration.isConfigured}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        ))}
        {integrations.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Plug className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No integrations available</h3>
              <p className="text-muted-foreground text-sm">Install plugins to add integrations.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
