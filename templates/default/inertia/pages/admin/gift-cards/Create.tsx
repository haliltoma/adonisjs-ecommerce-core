import { Head, router, useForm } from '@inertiajs/react'
import { ArrowLeft } from 'lucide-react'
import { FormEvent } from 'react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  regions: { id: string; name: string; currencyCode: string }[]
}

export default function GiftCardCreate({ regions }: Props) {
  const form = useForm({
    value: '',
    currencyCode: 'USD',
    regionId: '',
    endsAt: '',
  })

  const handleRegionChange = (regionId: string) => {
    form.setData('regionId', regionId === 'none' ? '' : regionId)
    const region = regions.find((r) => r.id === regionId)
    if (region) form.setData('currencyCode', region.currencyCode)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    form.post('/admin/gift-cards')
  }

  return (
    <AdminLayout
      title="Create Gift Card"
      description="Issue a new gift card"
      actions={
        <Button variant="outline" onClick={() => router.get('/admin/gift-cards')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      }
    >
      <Head title="Create Gift Card - Admin" />

      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl animate-fade-in">
        <Card className="animate-fade-up delay-100">
          <CardHeader>
            <CardTitle className="font-display text-lg">Gift Card Details</CardTitle>
            <CardDescription>
              A unique code will be generated automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Value *
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={form.data.value}
                onChange={(e) => form.setData('value', e.target.value)}
                required
              />
              {form.errors.value && (
                <p className="text-destructive text-sm">{form.errors.value}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Currency
                </Label>
                <Input
                  value={form.data.currencyCode}
                  onChange={(e) => form.setData('currencyCode', e.target.value.toUpperCase())}
                  maxLength={3}
                  placeholder="USD"
                />
              </div>

              {regions.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Region (optional)
                  </Label>
                  <Select value={form.data.regionId || 'none'} onValueChange={handleRegionChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="No region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No region</SelectItem>
                      {regions.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name} ({r.currencyCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Expiration Date (optional)
              </Label>
              <Input
                type="datetime-local"
                value={form.data.endsAt}
                onChange={(e) => form.setData('endsAt', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={!form.data.value || form.processing} className="tracking-wide">
            Create Gift Card
          </Button>
        </div>
      </form>
    </AdminLayout>
  )
}
