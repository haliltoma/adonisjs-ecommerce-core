import { Head, router, useForm } from '@inertiajs/react'
import { useState } from 'react'
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Radio,
  Trash,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface SalesChannel {
  id: string
  name: string
  description: string | null
  isActive: boolean
  productsCount: number
  createdAt: string
}

interface Props {
  salesChannels: {
    data: SalesChannel[]
    meta: { total: number; currentPage: number; lastPage: number }
  }
}

export default function SalesChannels({ salesChannels }: Props) {
  const [showDialog, setShowDialog] = useState(false)
  const [editingChannel, setEditingChannel] = useState<SalesChannel | null>(null)

  const { data, setData, post, patch, processing, reset } = useForm({
    name: '',
    description: '',
    isActive: true,
  })

  const openCreate = () => {
    setEditingChannel(null)
    reset()
    setData('isActive', true)
    setShowDialog(true)
  }

  const openEdit = (channel: SalesChannel) => {
    setEditingChannel(channel)
    setData({
      name: channel.name,
      description: channel.description || '',
      isActive: channel.isActive,
    })
    setShowDialog(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingChannel) {
      patch(`/admin/settings/sales-channels/${editingChannel.id}`, {
        onSuccess: () => {
          setShowDialog(false)
          reset()
        },
      })
    } else {
      post('/admin/settings/sales-channels', {
        onSuccess: () => {
          setShowDialog(false)
          reset()
        },
      })
    }
  }

  const handleDelete = (channelId: string) => {
    if (confirm('Are you sure? This will remove the channel from all products.')) {
      router.delete(`/admin/settings/sales-channels/${channelId}`)
    }
  }

  return (
    <AdminLayout
      title="Sales Channels"
      description="Manage where your products are sold"
      actions={
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Channel
        </Button>
      }
    >
      <Head title="Sales Channels - Settings" />

      <div className="animate-fade-in space-y-6">
        {salesChannels.data.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Radio className="h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-medium">No sales channels</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create sales channels to control where your products appear (e.g. Online Store, Mobile App, POS).
              </p>
              <Button onClick={openCreate} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create first channel
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Sales Channels</CardTitle>
              <CardDescription>{salesChannels.meta.total} channel(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesChannels.data.map((channel) => (
                    <TableRow key={channel.id}>
                      <TableCell className="font-medium">{channel.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {channel.description || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{channel.productsCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={channel.isActive ? 'default' : 'secondary'}>
                          {channel.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(channel)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(channel.id)}
                              className="text-destructive"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
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
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingChannel ? 'Edit Sales Channel' : 'Create Sales Channel'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Channel Name</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="e.g. Online Store, Mobile App"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Optional description"
                rows={3}
              />
            </div>

            {editingChannel && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={data.isActive}
                  onCheckedChange={(v) => setData('isActive', v)}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? 'Saving...' : editingChannel ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
