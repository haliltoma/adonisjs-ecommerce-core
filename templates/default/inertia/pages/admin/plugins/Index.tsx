import { Head, router } from '@inertiajs/react'
import {
  Check,
  Package,
  Plug,
  Settings,
  Trash,
  X,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

interface Plugin {
  id: string
  name: string
  description: string
  version: string
  author: string
  isActive: boolean
  isInstalled: boolean
  hasSettings: boolean
}

interface Props {
  plugins: Plugin[]
}

export default function PluginsIndex({ plugins }: Props) {
  const togglePlugin = (id: string, isActive: boolean) => {
    router.patch(`/admin/plugins/${id}`, { isActive: !isActive })
  }

  const uninstallPlugin = (id: string, name: string) => {
    if (confirm(`Are you sure you want to uninstall "${name}"?`)) {
      router.delete(`/admin/plugins/${id}`)
    }
  }

  return (
    <AdminLayout title="Plugins" description="Manage installed plugins and extensions">
      <Head title="Plugins - Admin" />
      <div className="animate-fade-in">
        {plugins.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No plugins installed</h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
                Plugins extend your store's functionality. Install plugins to add features like payment providers, shipping carriers, and more.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plugins.map((plugin) => (
              <Card key={plugin.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                        <Plug className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{plugin.name}</CardTitle>
                        <CardDescription className="text-xs">{plugin.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>v{plugin.version}</span>
                    <span>by {plugin.author}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Badge variant={plugin.isActive ? 'default' : 'secondary'} className="text-[10px]">
                        {plugin.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {plugin.hasSettings && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.get(`/admin/plugins/${plugin.id}/settings`)}>
                          <Settings className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => uninstallPlugin(plugin.id, plugin.name)}>
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                      <Switch checked={plugin.isActive} onCheckedChange={() => togglePlugin(plugin.id, plugin.isActive)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
