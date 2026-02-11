import { Head, router, useForm, usePage } from '@inertiajs/react'
import { Ban, Copy, Key, Plus, Trash2 } from 'lucide-react'
import { FormEvent, useState } from 'react'

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDateTime } from '@/lib/utils'

interface ApiKeyItem {
  id: string
  title: string
  type: 'publishable' | 'secret'
  prefix: string
  last4: string
  isRevoked: boolean
  revokedAt: string | null
  lastUsedAt: string | null
  createdBy: { id: string; name: string } | null
  salesChannels: { id: string; name: string }[]
  createdAt: string
}

interface Props {
  apiKeys: ApiKeyItem[]
  salesChannels: { id: string; name: string }[]
}

export default function ApiKeys({ apiKeys, salesChannels }: Props) {
  const { props } = usePage()
  const flash = (props as any).flash || {}
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [copiedToken, setCopiedToken] = useState(false)

  const form = useForm({
    title: '',
    type: 'publishable' as 'publishable' | 'secret',
    salesChannelIds: [] as string[],
  })

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    form.post('/admin/settings/api-keys', {
      onSuccess: () => {
        setIsCreateOpen(false)
        form.reset()
      },
    })
  }

  const handleRevoke = (id: string) => {
    if (confirm('Are you sure you want to revoke this API key? This cannot be undone.')) {
      router.post(`/admin/settings/api-keys/${id}/revoke`)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this API key?')) {
      router.delete(`/admin/settings/api-keys/${id}`)
    }
  }

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token)
    setCopiedToken(true)
    setTimeout(() => setCopiedToken(false), 2000)
  }

  const publishableKeys = apiKeys.filter((k) => k.type === 'publishable')
  const secretKeys = apiKeys.filter((k) => k.type === 'secret')

  return (
    <AdminLayout
      title="API Keys"
      description="Manage publishable and secret API keys for your store"
      actions={
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle className="font-display">Create API Key</DialogTitle>
                <DialogDescription>
                  The key will only be shown once after creation. Make sure to copy it.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Title
                  </Label>
                  <Input
                    placeholder="e.g. Storefront Key"
                    value={form.data.title}
                    onChange={(e) => form.setData('title', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Type
                  </Label>
                  <Select value={form.data.type} onValueChange={(val: 'publishable' | 'secret') => form.setData('type', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publishable">Publishable (client-side)</SelectItem>
                      <SelectItem value="secret">Secret (server-side)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.data.type === 'publishable' && salesChannels.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Sales Channels (optional)
                    </Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {salesChannels.map((sc) => (
                        <label key={sc.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={form.data.salesChannelIds.includes(sc.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                form.setData('salesChannelIds', [...form.data.salesChannelIds, sc.id])
                              } else {
                                form.setData('salesChannelIds', form.data.salesChannelIds.filter((id) => id !== sc.id))
                              }
                            }}
                            className="rounded border-border"
                          />
                          {sc.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!form.data.title || form.processing}>
                  Create Key
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <Head title="API Keys - Admin" />

      <div className="space-y-6 animate-fade-in">
        {/* New Token Alert */}
        {flash.newToken && (
          <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950 animate-fade-up">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="font-medium text-green-800 dark:text-green-200">
                  API key created! Copy this key now — it won't be shown again.
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-green-100 dark:bg-green-900 px-3 py-2 font-mono text-sm break-all">
                    {flash.newToken}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyToken(flash.newToken)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {copiedToken ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Publishable Keys */}
        <Card className="animate-fade-up delay-100">
          <CardHeader>
            <CardTitle className="font-display text-lg">Publishable API Keys</CardTitle>
            <CardDescription>
              Used in client-side code (storefronts, mobile apps). Safe to expose publicly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {publishableKeys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No publishable API keys created yet.
              </div>
            ) : (
              <div className="space-y-3">
                {publishableKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{key.title}</span>
                        {key.isRevoked && <Badge variant="destructive">Revoked</Badge>}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-muted-foreground text-sm">
                        <span className="font-mono">{key.prefix}...{key.last4}</span>
                        {key.lastUsedAt && (
                          <span className="text-[11px] tracking-wide">Last used: {formatDateTime(key.lastUsedAt)}</span>
                        )}
                        {key.salesChannels.length > 0 && (
                          <span className="text-[11px] tracking-wide">
                            Channels: {key.salesChannels.map((sc) => sc.name).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!key.isRevoked && (
                        <Button variant="ghost" size="icon" onClick={() => handleRevoke(key.id)}>
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(key.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Secret Keys */}
        <Card className="animate-fade-up delay-200">
          <CardHeader>
            <CardTitle className="font-display text-lg">Secret API Keys</CardTitle>
            <CardDescription>
              Used in server-side code only. Never expose these keys in client-side code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {secretKeys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No secret API keys created yet.
              </div>
            ) : (
              <div className="space-y-3">
                {secretKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{key.title}</span>
                        {key.isRevoked && <Badge variant="destructive">Revoked</Badge>}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-muted-foreground text-sm">
                        <span className="font-mono">{key.prefix}...{key.last4}</span>
                        {key.createdBy && (
                          <span className="text-[11px] tracking-wide">By: {key.createdBy.name}</span>
                        )}
                        <span className="text-[11px] tracking-wide">{formatDateTime(key.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!key.isRevoked && (
                        <Button variant="ghost" size="icon" onClick={() => handleRevoke(key.id)}>
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(key.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
