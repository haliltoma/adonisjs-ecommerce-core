import { Head, router, useForm } from '@inertiajs/react'
import { useState } from 'react'
import {
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Trash,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate, formatDateTime } from '@/lib/utils'

interface Campaign {
  id: string
  name: string
  subject: string
  status: 'draft' | 'scheduled' | 'sent' | 'sending'
  recipientCount: number
  openRate: number | null
  clickRate: number | null
  scheduledAt: string | null
  sentAt: string | null
  createdAt: string
}

interface Props {
  campaigns: {
    data: Campaign[]
    meta: { total: number; perPage: number; currentPage: number; lastPage: number }
  }
}

export default function EmailCampaignsPage({ campaigns }: Props) {
  const [showCreate, setShowCreate] = useState(false)
  const form = useForm({ name: '', subject: '', body: '' })

  const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (status === 'sent') return 'default'
    if (status === 'sending') return 'secondary'
    if (status === 'scheduled') return 'outline'
    return 'secondary'
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    form.post('/admin/marketing/email-campaigns', {
      onSuccess: () => {
        setShowCreate(false)
        form.reset()
      },
    })
  }

  return (
    <AdminLayout
      title="Email Campaigns"
      description={`${campaigns.meta.total} campaigns`}
      actions={
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />New Campaign
        </Button>
      }
    >
      <Head title="Email Campaigns - Admin" />
      <div className="animate-fade-in">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Campaign</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Recipients</TableHead>
                  <TableHead className="text-xs">Open Rate</TableHead>
                  <TableHead className="text-xs">Click Rate</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Mail className="text-muted-foreground h-8 w-8" />
                        <p className="text-muted-foreground text-sm">No campaigns yet</p>
                        <Button size="sm" variant="outline" onClick={() => setShowCreate(true)}>Create your first campaign</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.data.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <p className="text-sm font-medium">{campaign.name}</p>
                        <p className="text-muted-foreground text-[11px]">{campaign.subject}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(campaign.status)} className="text-[11px]">
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{campaign.recipientCount}</TableCell>
                      <TableCell className="text-sm">{campaign.openRate !== null ? `${campaign.openRate}%` : '-'}</TableCell>
                      <TableCell className="text-sm">{campaign.clickRate !== null ? `${campaign.clickRate}%` : '-'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {campaign.sentAt ? formatDateTime(campaign.sentAt) : formatDate(campaign.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {campaign.status === 'draft' && (
                              <DropdownMenuItem onClick={() => router.post(`/admin/marketing/email-campaigns/${campaign.id}/send`)}>
                                <Send className="mr-2 h-4 w-4" />Send now
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => router.delete(`/admin/marketing/email-campaigns/${campaign.id}`)}>
                              <Trash className="mr-2 h-4 w-4" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Email Campaign</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Campaign Name</Label>
              <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="e.g. Summer Sale" />
            </div>
            <div className="space-y-2">
              <Label>Email Subject</Label>
              <Input value={form.data.subject} onChange={(e) => form.setData('subject', e.target.value)} placeholder="e.g. Don't miss our summer deals!" />
            </div>
            <div className="space-y-2">
              <Label>Email Body</Label>
              <Textarea value={form.data.body} onChange={(e) => form.setData('body', e.target.value)} placeholder="Write your email content..." rows={5} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={form.processing}>Create Campaign</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
