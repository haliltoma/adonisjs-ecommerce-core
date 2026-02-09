import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@inertiajs/react'

interface Props {
  groups: { id: string; name: string }[]
}

export default function Create({ groups }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    groupId: '',
    acceptsMarketing: false,
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/admin/customers')
  }

  return (
    <AdminLayout
      title="Create Customer"
      description="Add a new customer to your store"
      actions={
        <Link href="/admin/customers">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
        </Link>
      }
    >
      <Head title="Create Customer" />

      <form onSubmit={handleSubmit} className="animate-fade-in">
        <div className="space-y-6">
          <Card className="animate-fade-up delay-100">
            <CardHeader>
              <CardTitle className="font-display text-lg">Customer Information</CardTitle>
              <CardDescription>Enter the customer's basic information</CardDescription>
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
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  placeholder="customer@example.com"
                  required
                  className="h-11 border-border/60 focus-visible:border-accent"
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
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
                <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  placeholder="Enter password"
                  required
                  className="h-11 border-border/60 focus-visible:border-accent"
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="groupId" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Customer Group</Label>
                <Select value={data.groupId} onValueChange={(value) => setData('groupId', value)}>
                  <SelectTrigger id="groupId" className="h-11 border-border/60">
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
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
            <Link href="/admin/customers">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={processing} className="tracking-wide">
              {processing ? 'Creating...' : 'Create Customer'}
            </Button>
          </div>
        </div>
      </form>
    </AdminLayout>
  )
}
