import { Head, router, useForm } from '@inertiajs/react'
import { useState } from 'react'
import {
  Edit,
  MoreHorizontal,
  Plus,
  Shield,
  Trash,
  UserPlus,
  Users as UsersIcon,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils'

interface AdminUser {
  id: number
  fullName: string
  email: string
  roleName: string | null
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

interface Role {
  id: number
  name: string
}

interface Props {
  users: AdminUser[]
  roles: Role[]
}

export default function UsersPage({ users, roles }: Props) {
  const [showCreate, setShowCreate] = useState(false)
  const form = useForm({ fullName: '', email: '', password: '', roleId: '' })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    form.post('/admin/settings/users', {
      onSuccess: () => { setShowCreate(false); form.reset() },
    })
  }

  const deleteUser = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      router.delete(`/admin/settings/users/${id}`)
    }
  }

  return (
    <AdminLayout
      title="Admin Users"
      description={`${users.length} admin users`}
      actions={
        <Button onClick={() => setShowCreate(true)}>
          <UserPlus className="mr-2 h-4 w-4" />Add User
        </Button>
      }
    >
      <Head title="Admin Users - Admin" />
      <div className="animate-fade-in">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">User</TableHead>
                  <TableHead className="text-xs">Role</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Last Login</TableHead>
                  <TableHead className="text-xs">Created</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <UsersIcon className="text-muted-foreground h-8 w-8" />
                        <p className="text-muted-foreground text-sm">No admin users</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.fullName}</p>
                            <p className="text-muted-foreground text-[11px]">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">{user.roleName || 'No role'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'default' : 'secondary'} className="text-[11px]">
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.get(`/admin/settings/users/${user.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => deleteUser(user.id, user.fullName)}>
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
          <DialogHeader><DialogTitle>Add Admin User</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={form.data.fullName} onChange={(e) => form.setData('fullName', e.target.value)} placeholder="John Doe" />
              {form.errors.fullName && <p className="text-destructive text-xs">{form.errors.fullName}</p>}
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} placeholder="john@example.com" />
              {form.errors.email && <p className="text-destructive text-xs">{form.errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} placeholder="Minimum 8 characters" />
              {form.errors.password && <p className="text-destructive text-xs">{form.errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.data.roleId} onValueChange={(v) => form.setData('roleId', v)}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={String(role.id)}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={form.processing}>Create User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
