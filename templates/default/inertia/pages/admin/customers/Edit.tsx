import { Head, useForm, router, Link } from '@inertiajs/react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ArrowLeft, Trash2, Eye, Key } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useState } from 'react'

interface Props {
  customer: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    fullName: string
    phone: string | null
    status: string
    acceptsMarketing: boolean
    groupId: string | null
    notes: string | null
    createdAt: string
  }
  groups: { id: string; name: string }[]
}

export default function Edit({ customer, groups }: Props) {
  const [isDeleting, setIsDeleting] = useState(false)

  const { data, setData, patch, processing, errors } = useForm({
    firstName: customer.firstName || '',
    lastName: customer.lastName || '',
    phone: customer.phone || '',
    groupId: customer.groupId || '',
    acceptsMarketing: customer.acceptsMarketing,
    notes: customer.notes || '',
    status: customer.status,
  })

  const passwordForm = useForm({
    newPassword: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    patch(`/admin/customers/${customer.id}`)
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    passwordForm.patch(`/admin/customers/${customer.id}/password`, {
      onSuccess: () => {
        passwordForm.reset()
      },
    })
  }

  const handleDelete = () => {
    setIsDeleting(true)
    router.delete(`/admin/customers/${customer.id}`, {
      onFinish: () => setIsDeleting(false),
    })
  }

  return (
    <AdminLayout
      title={`Edit ${customer.fullName}`}
      description={`Update customer information for ${customer.email}`}
      actions={
        <div className="flex gap-2">
          <Link href={`/admin/customers/${customer.id}`}>
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              View Customer
            </Button>
          </Link>
          <Link href="/admin/customers">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customers
            </Button>
          </Link>
        </div>
      }
    >
      <Head title={`Edit Customer: ${customer.fullName}`} />

      <div className="space-y-6 animate-fade-in">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <Card className="animate-fade-up delay-100">
              <CardHeader>
                <CardTitle className="font-display text-lg">Customer Information</CardTitle>
                <CardDescription>
                  Update the customer's basic information. Customer since{' '}
                  {formatDate(customer.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">First Name</Label>
                    <Input
                      id="firstName"
                      value={data.firstName}
                      onChange={(e) => setData('firstName', e.target.value)}
                      placeholder="John"
                      className="h-11 border-border/60 focus-visible:border-accent"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Last Name</Label>
                    <Input
                      id="lastName"
                      value={data.lastName}
                      onChange={(e) => setData('lastName', e.target.value)}
                      placeholder="Doe"
                      className="h-11 border-border/60 focus-visible:border-accent"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</Label>
                  <Input id="email" type="email" value={customer.email} disabled className="h-11 border-border/60" />
                  <p className="text-muted-foreground text-[11px] tracking-wide">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="h-11 border-border/60 focus-visible:border-accent"
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="groupId" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Customer Group</Label>
                  <Select value={data.groupId || 'none'} onValueChange={(value) => setData('groupId', value === 'none' ? '' : value)}>
                    <SelectTrigger id="groupId" className="h-11 border-border/60">
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Group</SelectItem>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.groupId && (
                    <p className="text-sm text-destructive">{errors.groupId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</Label>
                  <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                    <SelectTrigger id="status" className="h-11 border-border/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-up delay-200">
              <CardHeader>
                <CardTitle className="font-display text-lg">Marketing & Notes</CardTitle>
                <CardDescription>Marketing preferences and additional information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="acceptsMarketing">Accepts Marketing</Label>
                    <p className="text-muted-foreground text-[11px] tracking-wide">
                      Customer agreed to receive marketing emails
                    </p>
                  </div>
                  <Switch
                    id="acceptsMarketing"
                    checked={data.acceptsMarketing}
                    onCheckedChange={(checked) => setData('acceptsMarketing', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Notes</Label>
                  <Textarea
                    id="notes"
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    placeholder="Add any additional notes about this customer"
                    rows={4}
                    className="border-border/60 focus-visible:border-accent"
                  />
                  {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4 animate-fade-up delay-300">
              <Link href={`/admin/customers/${customer.id}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={processing} className="tracking-wide">
                {processing ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>

        <Card className="animate-fade-up delay-400">
          <CardHeader>
            <CardTitle className="font-display text-lg">Change Password</CardTitle>
            <CardDescription>Update the customer's password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.data.newPassword}
                  onChange={(e) => passwordForm.setData('newPassword', e.target.value)}
                  placeholder="Enter new password"
                  className="h-11 border-border/60 focus-visible:border-accent"
                />
                {passwordForm.errors.newPassword && (
                  <p className="text-sm text-destructive">{passwordForm.errors.newPassword}</p>
                )}
              </div>
              <Button type="submit" disabled={passwordForm.processing} className="tracking-wide">
                <Key className="mr-2 h-4 w-4" />
                {passwordForm.processing ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-destructive animate-fade-up delay-500">
          <CardHeader>
            <CardTitle className="font-display text-lg text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete this customer and all associated data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="tracking-wide">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Customer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the customer account
                    for <strong>{customer.fullName}</strong> ({customer.email}) and remove all
                    associated data from the system.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Customer'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
