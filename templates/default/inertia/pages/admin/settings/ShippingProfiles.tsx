import { Head, router, useForm } from '@inertiajs/react'
import { Package, Pencil, Plus, Trash2 } from 'lucide-react'
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

interface ShippingProfileItem {
  id: string
  name: string
  type: string
  productsCount: number
  createdAt: string
}

interface Props {
  profiles: ShippingProfileItem[]
}

export default function ShippingProfiles({ profiles }: Props) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<ShippingProfileItem | null>(null)

  const createForm = useForm({ name: '', type: 'custom' })
  const editForm = useForm({ name: '', type: 'custom' })

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    createForm.post('/admin/settings/shipping-profiles', {
      onSuccess: () => {
        setIsCreateOpen(false)
        createForm.reset()
      },
    })
  }

  const handleEdit = (e: FormEvent) => {
    e.preventDefault()
    if (!editingProfile) return
    editForm.patch(`/admin/settings/shipping-profiles/${editingProfile.id}`, {
      onSuccess: () => {
        setEditingProfile(null)
        editForm.reset()
      },
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this shipping profile? Products will be unassigned.')) {
      router.delete(`/admin/settings/shipping-profiles/${id}`)
    }
  }

  const openEdit = (profile: ShippingProfileItem) => {
    setEditingProfile(profile)
    editForm.setData({ name: profile.name, type: profile.type })
  }

  return (
    <AdminLayout
      title="Shipping Profiles"
      description="Group products with shared shipping requirements"
      actions={
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Profile
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle className="font-display">Create Shipping Profile</DialogTitle>
                <DialogDescription>Group products that share shipping requirements.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</Label>
                  <Input
                    placeholder="e.g. Default Shipping"
                    value={createForm.data.name}
                    onChange={(e) => createForm.setData('name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Type</Label>
                  <Select value={createForm.data.type} onValueChange={(val) => createForm.setData('type', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="gift_card">Gift Card</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={!createForm.data.name || createForm.processing}>Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <Head title="Shipping Profiles - Admin" />

      <div className="space-y-6 animate-fade-in">
        {profiles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="mb-4 h-12 w-12 text-muted-foreground" />
              <CardTitle className="mb-2 font-display">No Shipping Profiles</CardTitle>
              <CardDescription className="mb-6 text-center">
                Create shipping profiles to group products with shared shipping needs.
              </CardDescription>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Profile
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Shipping Profiles</CardTitle>
              <CardDescription>{profiles.length} profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 p-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{profile.name}</span>
                        <Badge variant="outline">{profile.type}</Badge>
                      </div>
                      <div className="text-muted-foreground text-sm mt-0.5">
                        {profile.productsCount} products
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(profile)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(profile.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingProfile} onOpenChange={(open) => !open && setEditingProfile(null)}>
        <DialogContent>
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle className="font-display">Edit Shipping Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</Label>
                <Input
                  value={editForm.data.name}
                  onChange={(e) => editForm.setData('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Type</Label>
                <Select value={editForm.data.type} onValueChange={(val) => editForm.setData('type', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="gift_card">Gift Card</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingProfile(null)}>Cancel</Button>
              <Button type="submit" disabled={editForm.processing}>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
