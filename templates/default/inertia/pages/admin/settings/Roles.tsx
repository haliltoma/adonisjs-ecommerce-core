import { Head, router, useForm } from '@inertiajs/react'
import { useState } from 'react'
import {
  Edit,
  MoreHorizontal,
  Plus,
  Shield,
  Trash,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Role {
  id: number
  name: string
  slug: string
  description: string | null
  permissions: string[]
  userCount: number
  isSystem: boolean
}

interface Props {
  roles: Role[]
  availablePermissions: Record<string, string[]>
}

export default function RolesPage({ roles, availablePermissions }: Props) {
  const [showCreate, setShowCreate] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const form = useForm({ name: '', description: '', permissions: [] as string[] })

  const togglePermission = (perm: string) => {
    const perms = form.data.permissions.includes(perm)
      ? form.data.permissions.filter((p) => p !== perm)
      : [...form.data.permissions, perm]
    form.setData('permissions', perms)
  }

  const openCreate = () => {
    form.reset()
    setEditingRole(null)
    setShowCreate(true)
  }

  const openEdit = (role: Role) => {
    form.setData({ name: role.name, description: role.description || '', permissions: role.permissions })
    setEditingRole(role)
    setShowCreate(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingRole) {
      form.patch(`/admin/settings/roles/${editingRole.id}`, {
        onSuccess: () => { setShowCreate(false); form.reset() },
      })
    } else {
      form.post('/admin/settings/roles', {
        onSuccess: () => { setShowCreate(false); form.reset() },
      })
    }
  }

  const deleteRole = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete the role "${name}"?`)) {
      router.delete(`/admin/settings/roles/${id}`)
    }
  }

  return (
    <AdminLayout
      title="Roles & Permissions"
      description="Manage admin roles and their permissions"
      actions={
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />Add Role
        </Button>
      }
    >
      <Head title="Roles - Admin" />
      <div className="animate-fade-in">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Role</TableHead>
                  <TableHead className="text-xs">Permissions</TableHead>
                  <TableHead className="text-xs">Users</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Shield className="text-muted-foreground h-8 w-8" />
                        <p className="text-muted-foreground text-sm">No roles defined</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{role.name}</p>
                            {role.description && <p className="text-muted-foreground text-[11px]">{role.description}</p>}
                            {role.isSystem && <Badge variant="outline" className="text-[10px] mt-0.5">System</Badge>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map((p) => (
                            <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                          ))}
                          {role.permissions.length > 3 && (
                            <Badge variant="outline" className="text-[10px]">+{role.permissions.length - 3}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{role.userCount} users</TableCell>
                      <TableCell>
                        {!role.isSystem && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(role)}>
                                <Edit className="mr-2 h-4 w-4" />Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => deleteRole(role.id, role.name)}>
                                <Trash className="mr-2 h-4 w-4" />Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
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
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingRole ? 'Edit Role' : 'Add Role'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Role Name</Label>
              <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="e.g. Editor" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} placeholder="What can this role do?" rows={2} />
            </div>
            <div className="space-y-3">
              <Label>Permissions</Label>
              {Object.entries(availablePermissions).map(([group, perms]) => (
                <div key={group} className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground capitalize">{group}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {perms.map((perm) => (
                      <label key={perm} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox checked={form.data.permissions.includes(perm)} onCheckedChange={() => togglePermission(perm)} />
                        {perm.split('.').pop()?.replace(/_/g, ' ')}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={form.processing}>{editingRole ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
