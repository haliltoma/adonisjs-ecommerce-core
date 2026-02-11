import { Head, router, useForm } from '@inertiajs/react'
import { ChevronRight, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { FormEvent, useState } from 'react'

import AdminLayout from '@/components/admin/AdminLayout'
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
import { Textarea } from '@/components/ui/textarea'

interface ReturnReason {
  id: string
  value: string
  label: string
  description: string | null
  sortOrder: number
  children?: ReturnReason[]
}

interface Props {
  reasons: ReturnReason[]
}

export default function ReturnReasons({ reasons }: Props) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingReason, setEditingReason] = useState<ReturnReason | null>(null)

  const createForm = useForm({
    value: '',
    label: '',
    description: '',
    parentId: '',
  })

  const editForm = useForm({
    label: '',
    description: '',
    sortOrder: 0,
  })

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    createForm.post('/admin/settings/return-reasons', {
      onSuccess: () => {
        setIsCreateOpen(false)
        createForm.reset()
      },
    })
  }

  const handleEdit = (e: FormEvent) => {
    e.preventDefault()
    if (!editingReason) return
    editForm.patch(`/admin/settings/return-reasons/${editingReason.id}`, {
      onSuccess: () => {
        setEditingReason(null)
        editForm.reset()
      },
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this return reason?')) {
      router.delete(`/admin/settings/return-reasons/${id}`)
    }
  }

  const openEdit = (reason: ReturnReason) => {
    setEditingReason(reason)
    editForm.setData({
      label: reason.label,
      description: reason.description || '',
      sortOrder: reason.sortOrder,
    })
  }

  return (
    <AdminLayout
      title="Return Reasons"
      description="Manage reasons customers can select when requesting a return"
      actions={
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Reason
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle className="font-display">Add Return Reason</DialogTitle>
                <DialogDescription>
                  Create a new reason that customers can choose when initiating a return.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Value (unique identifier)
                  </Label>
                  <Input
                    placeholder="e.g. wrong_size"
                    value={createForm.data.value}
                    onChange={(e) => createForm.setData('value', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Label
                  </Label>
                  <Input
                    placeholder="e.g. Wrong Size"
                    value={createForm.data.label}
                    onChange={(e) => createForm.setData('label', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Description
                  </Label>
                  <Textarea
                    placeholder="Describe when this reason should be used..."
                    value={createForm.data.description}
                    onChange={(e) => createForm.setData('description', e.target.value)}
                    rows={2}
                  />
                </div>
                {reasons.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Parent Reason (optional)
                    </Label>
                    <Select
                      value={createForm.data.parentId}
                      onValueChange={(val) => createForm.setData('parentId', val === 'none' ? '' : val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="None (top-level reason)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (top-level)</SelectItem>
                        {reasons.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!createForm.data.value || !createForm.data.label || createForm.processing}>
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <Head title="Return Reasons - Admin" />

      <div className="space-y-6 animate-fade-in">
        {reasons.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <RotateCcw className="mb-4 h-12 w-12 text-muted-foreground" />
              <CardTitle className="mb-2 font-display">No Return Reasons</CardTitle>
              <CardDescription className="mb-6 text-center">
                Add return reasons so customers can explain why they're returning items.
              </CardDescription>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Reason
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Return Reasons</CardTitle>
              <CardDescription>{reasons.length} top-level reasons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reasons.map((reason) => (
                  <div key={reason.id}>
                    <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{reason.label}</div>
                          <span className="text-muted-foreground font-mono text-xs">{reason.value}</span>
                        </div>
                        {reason.description && (
                          <div className="text-muted-foreground text-sm mt-0.5">
                            {reason.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(reason)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(reason.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {/* Children */}
                    {reason.children && reason.children.length > 0 && (
                      <div className="ml-8 mt-2 space-y-2">
                        {reason.children.map((child) => (
                          <div
                            key={child.id}
                            className="flex items-center justify-between rounded-lg border border-border/40 p-3"
                          >
                            <div className="flex items-center gap-2">
                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
                              <div>
                                <div className="font-medium text-sm">{child.label}</div>
                                <span className="text-muted-foreground font-mono text-xs">{child.value}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEdit(child)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(child.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingReason} onOpenChange={(open) => !open && setEditingReason(null)}>
        <DialogContent>
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle className="font-display">Edit Return Reason</DialogTitle>
              <DialogDescription>
                Update the return reason details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Label
                </Label>
                <Input
                  value={editForm.data.label}
                  onChange={(e) => editForm.setData('label', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Description
                </Label>
                <Textarea
                  value={editForm.data.description}
                  onChange={(e) => editForm.setData('description', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Sort Order
                </Label>
                <Input
                  type="number"
                  value={editForm.data.sortOrder}
                  onChange={(e) => editForm.setData('sortOrder', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingReason(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editForm.processing}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
