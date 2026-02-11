import { Head, useForm } from '@inertiajs/react'
import { Store as StoreIcon, Upload } from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  store: {
    name: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
    logo: string | null
    favicon: string | null
    description: string
    legalName: string
    taxId: string
  }
}

export default function StoreSettingsPage({ store }: Props) {
  const { data, setData, patch, processing, errors } = useForm(store)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    patch('/admin/settings/store')
  }

  return (
    <AdminLayout
      title="Store Information"
      description="Manage your store's basic information"
      actions={
        <Button type="submit" form="store-form" disabled={processing}>
          {processing ? 'Saving...' : 'Save Changes'}
        </Button>
      }
    >
      <Head title="Store Settings - Admin" />
      <div className="animate-fade-in">
        <form id="store-form" onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><StoreIcon className="h-5 w-5" />Store Details</CardTitle>
              <CardDescription>Basic information about your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="My Store" />
                  {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Store Email</Label>
                  <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="store@example.com" />
                  {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
                </div>
                <div className="space-y-2">
                  <Label>Legal Business Name</Label>
                  <Input value={data.legalName} onChange={(e) => setData('legalName', e.target.value)} placeholder="My Store LLC" />
                </div>
                <div className="space-y-2">
                  <Label>Tax ID / VAT Number</Label>
                  <Input value={data.taxId} onChange={(e) => setData('taxId', e.target.value)} placeholder="XX-XXXXXXX" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Store Description</Label>
                <Textarea value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="Describe your store..." rows={3} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Address</CardTitle>
              <CardDescription>Your store's physical address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Street Address</Label>
                <Textarea value={data.address} onChange={(e) => setData('address', e.target.value)} placeholder="123 Main St" rows={2} />
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={data.city} onChange={(e) => setData('city', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>State / Province</Label>
                  <Input value={data.state} onChange={(e) => setData('state', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>ZIP / Postal Code</Label>
                  <Input value={data.zipCode} onChange={(e) => setData('zipCode', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value={data.country} onChange={(e) => setData('country', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Branding</CardTitle>
              <CardDescription>Store logo and favicon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Store Logo</Label>
                  <div className="rounded-lg border-2 border-dashed p-6 text-center">
                    {data.logo ? (
                      <div className="space-y-2">
                        <img src={data.logo} alt="Logo" className="h-16 mx-auto object-contain" />
                        <Button type="button" variant="ghost" size="sm" onClick={() => setData('logo', null)}>Remove</Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground text-xs">Upload your store logo</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <div className="rounded-lg border-2 border-dashed p-6 text-center">
                    {data.favicon ? (
                      <div className="space-y-2">
                        <img src={data.favicon} alt="Favicon" className="h-8 mx-auto" />
                        <Button type="button" variant="ghost" size="sm" onClick={() => setData('favicon', null)}>Remove</Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground text-xs">Upload a favicon (32x32)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AdminLayout>
  )
}
