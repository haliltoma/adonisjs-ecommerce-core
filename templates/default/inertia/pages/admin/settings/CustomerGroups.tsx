import { Head, router, useForm } from '@inertiajs/react'
import { useState } from 'react'
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Trash,
  UsersRound,
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

interface CustomerGroup {
  id: string
  name: string
  slug: string
  description: string | null
  discountPercentage: number
  isActive: boolean
  isDefault: boolean
  customersCount: number
  createdAt: string
}

interface Props {
  customerGroups: {
    data: CustomerGroup[]
    meta: { total: number; currentPage: number; lastPage: number }
  }
}

export default function CustomerGroups({ customerGroups }: Props) {
  const [showDialog, setShowDialog] = useState(false)
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null)

  const { data, setData, post, patch, processing, reset } = useForm({
    name: '',
    description: '',
    discountPercentage: 0,
    isActive: true,
    isDefault: false,
  })

  const openCreate = () => {
    setEditingGroup(null)
    reset()
    setData('isActive', true)
    setShowDialog(true)
  }

  const openEdit = (group: CustomerGroup) => {
    setEditingGroup(group)
    setData({
      name: group.name,
      description: group.description || '',
      discountPercentage: group.discountPercentage,
      isActive: group.isActive,
      isDefault: group.isDefault,
    })
    setShowDialog(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingGroup) {
      patch(`/admin/settings/customer-groups/${editingGroup.id}`, {
        onSuccess: () => {
          setShowDialog(false)
          reset()
        },
      })
    } else {
      post('/admin/settings/customer-groups', {
        onSuccess: () => {
          setShowDialog(false)
          reset()
        },
      })
    }
  }

  const handleDelete = (groupId: string) => {
    if (confirm('Are you sure? Customers in this group will be unassigned.')) {
      router.delete(`/admin/settings/customer-groups/${groupId}`)
    }
  }

  return (
    <AdminLayout
      title="Customer Groups"
      description="Organize customers into groups for targeted pricing and promotions"
      actions={
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Group
        </Button>
      }
    >
      <Head title="Customer Groups - Settings" />

      <div className="animate-fade-in space-y-6">
        {customerGroups.data.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UsersRound className="h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-medium">No customer groups</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create customer groups for targeted discounts, price lists, and promotions.
              </p>
              <Button onClick={openCreate} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create first group
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Customer Groups</CardTitle>
              <CardDescription>{customerGroups.meta.total} group(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Customers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerGroups.data.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell>
                        <div>
                          <span className="font-medium">{group.name}</span>
                          {group.isDefault && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        {group.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                            {group.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {group.discountPercentage > 0 ? (
                          <Badge variant="secondary">{group.discountPercentage}% off</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{group.customersCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={group.isActive ? 'default' : 'secondary'}>
                          {group.isActive ? 'Active' : 'Inactive'}
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
                            <DropdownMenuItem onClick={() => openEdit(group)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(group.id)}
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
              {editingGroup ? 'Edit Customer Group' : 'Create Customer Group'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="e.g. VIP, Wholesale, Gold Members"
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
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountPercentage">Group Discount (%)</Label>
              <Input
                id="discountPercentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={data.discountPercentage}
                onChange={(e) => setData('discountPercentage', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Automatic discount applied to all orders from customers in this group.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={data.isActive}
                  onCheckedChange={(v) => setData('isActive', v)}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefault"
                  checked={data.isDefault}
                  onCheckedChange={(v) => setData('isDefault', v)}
                />
                <Label htmlFor="isDefault">Default group</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? 'Saving...' : editingGroup ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
