import { Head, router, useForm } from '@inertiajs/react'
import { useState } from 'react'
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  MoreHorizontal,
  Play,
  Plus,
  ScrollText,
  Trash,
  Webhook,
  X,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDateTime } from '@/lib/utils'

interface WebhookEndpoint {
  id: string
  url: string
  secret: string
  events: string[]
  isActive: boolean
  lastTriggeredAt: string | null
  failureCount: number
  createdAt: string
}

interface WebhookLogEntry {
  id: string
  event: string
  status: string
  responseStatus: number | null
  attempts: number
  createdAt: string
}

interface Props {
  webhooks: WebhookEndpoint[]
  availableEvents: string[]
}

const eventCategories: Record<string, string[]> = {
  'Orders': ['order.created', 'order.updated', 'order.cancelled', 'order.fulfilled'],
  'Products': ['product.created', 'product.updated', 'product.deleted'],
  'Customers': ['customer.created', 'customer.updated'],
  'Inventory': ['inventory.low_stock', 'inventory.updated'],
  'Payments': ['payment.completed', 'payment.failed', 'payment.refunded'],
}

export default function WebhooksPage({ webhooks, availableEvents }: Props) {
  const [showCreate, setShowCreate] = useState(false)
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({})
  const [testingId, setTestingId] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null)
  const [logsModal, setLogsModal] = useState<{ id: string; url: string } | null>(null)
  const [logs, setLogs] = useState<WebhookLogEntry[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const form = useForm({ url: '', events: [] as string[] })

  const toggleEvent = (event: string) => {
    const events = form.data.events.includes(event)
      ? form.data.events.filter((e) => e !== event)
      : [...form.data.events, event]
    form.setData('events', events)
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    form.post('/admin/settings/webhooks', {
      onSuccess: () => { setShowCreate(false); form.reset() },
    })
  }

  const toggleActive = (id: string, isActive: boolean) => {
    router.patch(`/admin/settings/webhooks/${id}`, { isActive: !isActive })
  }

  const deleteWebhook = (id: string) => {
    if (confirm('Are you sure you want to delete this webhook?')) {
      router.delete(`/admin/settings/webhooks/${id}`)
    }
  }

  const testWebhook = async (id: string) => {
    setTestingId(id)
    setTestResult(null)
    try {
      const res = await fetch(`/admin/settings/webhooks/${id}/test`, { method: 'POST', headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      const data = await res.json()
      setTestResult({
        id,
        success: data.success,
        message: data.success
          ? `Delivered in ${data.durationMs}ms (HTTP ${data.statusCode})`
          : data.error || 'Delivery failed',
      })
    } catch {
      setTestResult({ id, success: false, message: 'Network error' })
    } finally {
      setTestingId(null)
    }
  }

  const viewLogs = async (id: string, url: string) => {
    setLogsModal({ id, url })
    setLoadingLogs(true)
    try {
      const res = await fetch(`/admin/settings/webhooks/${id}/logs`)
      const data = await res.json()
      setLogs(data.logs || [])
    } catch {
      setLogs([])
    } finally {
      setLoadingLogs(false)
    }
  }

  return (
    <AdminLayout title="Webhooks" description="Manage webhook endpoints for external integrations">
      <Head title="Webhooks - Admin" />
      <div className="animate-fade-in space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />Add Endpoint
          </Button>
        </div>

        {webhooks.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-2 text-center">
                <Webhook className="text-muted-foreground h-10 w-10" />
                <h3 className="text-lg font-semibold">No webhooks configured</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Webhooks allow you to receive real-time notifications about events in your store.
                </p>
                <Button className="mt-2" onClick={() => setShowCreate(true)}>Add your first webhook</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">URL</TableHead>
                    <TableHead className="text-xs">Events</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Secret</TableHead>
                    <TableHead className="text-xs">Last Triggered</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((wh) => (
                    <TableRow key={wh.id}>
                      <TableCell>
                        <p className="text-sm font-mono truncate max-w-[250px]">{wh.url}</p>
                        {testResult?.id === wh.id && (
                          <p className={`text-[10px] mt-0.5 ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                            {testResult.message}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {wh.events.slice(0, 2).map((e) => (
                            <Badge key={e} variant="secondary" className="text-[10px]">{e}</Badge>
                          ))}
                          {wh.events.length > 2 && (
                            <Badge variant="outline" className="text-[10px]">+{wh.events.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={wh.isActive ? 'default' : 'secondary'} className="text-[11px]">
                          {wh.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {wh.failureCount > 0 && (
                          <p className="text-destructive text-[10px] mt-0.5">{wh.failureCount} failures</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <code className="text-[11px]">{showSecret[wh.id] ? wh.secret : '••••••••'}</code>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowSecret((s) => ({ ...s, [wh.id]: !s[wh.id] }))}>
                            {showSecret[wh.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {wh.lastTriggeredAt ? formatDateTime(wh.lastTriggeredAt) : 'Never'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => testWebhook(wh.id)} disabled={testingId === wh.id}>
                              {testingId === wh.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                              Send test
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => viewLogs(wh.id, wh.url)}>
                              <ScrollText className="mr-2 h-4 w-4" />View logs
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => toggleActive(wh.id, wh.isActive)}>
                              {wh.isActive ? <X className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                              {wh.isActive ? 'Disable' : 'Enable'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(wh.secret)}>
                              <Copy className="mr-2 h-4 w-4" />Copy secret
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => deleteWebhook(wh.id)}>
                              <Trash className="mr-2 h-4 w-4" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Signature Verification</CardTitle>
            <CardDescription className="text-xs">
              All webhook payloads are signed with HMAC-SHA256. Verify deliveries by computing
              the signature of the raw request body using your webhook secret and comparing
              it to the <code className="bg-muted px-1 rounded text-[11px]">X-Webhook-Signature</code> header.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
{`const crypto = require('crypto');

function verifyWebhook(body, secret, signature) {
  const expected = 'sha256=' +
    crypto.createHmac('sha256', secret)
      .update(body)
      .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}`}
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Webhook Endpoint</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Endpoint URL</Label>
              <Input value={form.data.url} onChange={(e) => form.setData('url', e.target.value)} placeholder="https://example.com/webhooks" type="url" />
            </div>
            <div className="space-y-3">
              <Label>Events</Label>
              {Object.entries(eventCategories).map(([category, events]) => (
                <div key={category} className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">{category}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {events.filter((e) => availableEvents.includes(e)).map((event) => (
                      <label key={event} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox checked={form.data.events.includes(event)} onCheckedChange={() => toggleEvent(event)} />
                        {event}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={form.processing || !form.data.url || form.data.events.length === 0}>Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Logs Dialog */}
      <Dialog open={!!logsModal} onOpenChange={() => setLogsModal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Delivery Logs</DialogTitle>
            <p className="text-xs text-muted-foreground font-mono truncate">{logsModal?.url}</p>
          </DialogHeader>
          {loadingLogs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No delivery logs yet</div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Event</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">HTTP</TableHead>
                    <TableHead className="text-xs">Attempts</TableHead>
                    <TableHead className="text-xs">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell><Badge variant="outline" className="text-[10px]">{log.event}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={log.status === 'success' ? 'default' : log.status === 'pending' ? 'secondary' : 'destructive'} className="text-[10px]">
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{log.responseStatus || '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{log.attempts}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
