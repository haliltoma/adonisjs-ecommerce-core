import { Head, router, useForm } from '@inertiajs/react'
import { ArrowLeft, Save } from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface Props {
  pluginId: string
  settings: Record<string, unknown>
}

export default function PluginSettings({ pluginId, settings }: Props) {
  const form = useForm<Record<string, unknown>>(settings)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    form.patch(`/admin/plugins/${pluginId}`, {
      preserveScroll: true,
    })
  }

  return (
    <AdminLayout title="Plugin Settings" description="Configure plugin options">
      <Head title="Plugin Settings - Admin" />

      <div className="animate-fade-in max-w-2xl">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          onClick={() => router.get('/admin/plugins')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Plugins
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Plugin Configuration</CardTitle>
            <CardDescription>
              Adjust the settings for this plugin. Changes are saved immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(settings).length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">
                This plugin has no configurable settings.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {Object.entries(settings).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                    </Label>
                    {typeof value === 'boolean' ? (
                      <Switch
                        id={key}
                        checked={!!form.data[key]}
                        onCheckedChange={(checked) => form.setData(key, checked)}
                      />
                    ) : (
                      <Input
                        id={key}
                        value={String(form.data[key] ?? '')}
                        onChange={(e) => form.setData(key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={form.processing}>
                    <Save className="mr-2 h-4 w-4" />
                    {form.processing ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
