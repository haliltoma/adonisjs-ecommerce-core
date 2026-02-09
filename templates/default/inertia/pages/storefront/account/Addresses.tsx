import { Head, Link, useForm, router } from '@inertiajs/react'
import { useState } from 'react'
import { ArrowLeft, MapPin, Plus, Trash2 } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Address {
  id: string
  type: string
  isDefault: boolean
  firstName: string
  lastName: string
  company: string | null
  address1: string
  address2: string | null
  city: string
  state: string
  postalCode: string
  country: string
  phone: string | null
}

interface Props {
  addresses: Address[]
}

export default function Addresses({ addresses }: Props) {
  const [showForm, setShowForm] = useState(false)

  const form = useForm({
    type: 'shipping',
    isDefault: false,
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    form.post('/account/addresses', {
      onSuccess: () => {
        setShowForm(false)
        form.reset()
      },
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      router.delete(`/account/addresses/${id}`)
    }
  }

  return (
    <StorefrontLayout>
      <Head title="Addresses" />

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="animate-fade-up mb-8">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
            <Link href="/account">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Account
            </Link>
          </Button>
        </div>

        <div className="animate-fade-up delay-100 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">Address Book</span>
            <h1 className="font-display text-3xl tracking-tight mt-2">Addresses</h1>
            <p className="text-muted-foreground mt-2">
              Manage your shipping and billing addresses.
            </p>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="h-11 tracking-wide">
                <Plus className="mr-2 h-4 w-4" />
                Add Address
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display text-xl tracking-tight">Add New Address</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Address Type</Label>
                  <Select
                    value={form.data.type}
                    onValueChange={(value) => form.setData('type', value)}
                  >
                    <SelectTrigger className="h-11 border-border/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shipping">Shipping</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-xs uppercase tracking-wider text-muted-foreground">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={form.data.firstName}
                      onChange={(e) => form.setData('firstName', e.target.value)}
                      required
                      className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-xs uppercase tracking-wider text-muted-foreground">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      value={form.data.lastName}
                      onChange={(e) => form.setData('lastName', e.target.value)}
                      required
                      className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Company (optional)
                  </Label>
                  <Input
                    id="company"
                    value={form.data.company}
                    onChange={(e) => form.setData('company', e.target.value)}
                    className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address1" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Address Line 1
                  </Label>
                  <Input
                    id="address1"
                    value={form.data.address1}
                    onChange={(e) => form.setData('address1', e.target.value)}
                    required
                    className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address2" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Address Line 2 (optional)
                  </Label>
                  <Input
                    id="address2"
                    value={form.data.address2}
                    onChange={(e) => form.setData('address2', e.target.value)}
                    className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-xs uppercase tracking-wider text-muted-foreground">City</Label>
                    <Input
                      id="city"
                      value={form.data.city}
                      onChange={(e) => form.setData('city', e.target.value)}
                      required
                      className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-xs uppercase tracking-wider text-muted-foreground">State</Label>
                    <Input
                      id="state"
                      value={form.data.state}
                      onChange={(e) => form.setData('state', e.target.value)}
                      required
                      className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-xs uppercase tracking-wider text-muted-foreground">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={form.data.postalCode}
                      onChange={(e) => form.setData('postalCode', e.target.value)}
                      required
                      className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-xs uppercase tracking-wider text-muted-foreground">Country</Label>
                    <Input
                      id="country"
                      value={form.data.country}
                      onChange={(e) => form.setData('country', e.target.value)}
                      required
                      className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-muted-foreground">Phone (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.data.phone}
                      onChange={(e) => form.setData('phone', e.target.value)}
                      className="h-11 border-border/60 transition-colors focus-visible:border-accent"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-border/60">
                    Cancel
                  </Button>
                  <Button type="submit" className="h-11 tracking-wide" disabled={form.processing}>
                    {form.processing ? 'Saving...' : 'Save Address'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Address List */}
        <div className="mt-8 space-y-4">
          {addresses.length > 0 ? (
            addresses.map((address, index) => (
              <Card key={address.id} className={`animate-fade-up delay-${(index + 2) * 100} border-border/60 card-hover`}>
                <CardContent className="flex items-start justify-between pt-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base tracking-tight">
                        {address.firstName} {address.lastName}
                      </span>
                      <Badge variant="outline" className="border-border/60 text-xs uppercase tracking-wider">
                        {address.type}
                      </Badge>
                      {address.isDefault && (
                        <Badge className="bg-accent text-accent-foreground text-xs">Default</Badge>
                      )}
                    </div>
                    {address.company && (
                      <p className="text-muted-foreground text-sm mt-1">{address.company}</p>
                    )}
                    <p className="mt-2 text-sm">{address.address1}</p>
                    {address.address2 && <p className="text-sm">{address.address2}</p>}
                    <p className="text-sm">
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p className="text-sm">{address.country}</p>
                    {address.phone && (
                      <p className="text-muted-foreground mt-1 text-sm">{address.phone}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(address.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="animate-fade-up delay-200 border-dashed border-border/60">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <MapPin className="text-muted-foreground/40 h-12 w-12" />
                <h3 className="font-display mt-4 text-lg tracking-tight">No addresses yet</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Add an address to speed up your checkout.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </StorefrontLayout>
  )
}
