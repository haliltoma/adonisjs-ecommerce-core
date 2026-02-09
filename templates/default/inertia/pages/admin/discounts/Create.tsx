import { Head, Link, useForm } from '@inertiajs/react'
import { ArrowLeft, Save, Sparkles } from 'lucide-react'
import { FormEvent } from 'react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

export default function CreateDiscount() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    code: '',
    type: 'percentage',
    value: '',
    minimumOrderAmount: '',
    maximumDiscountAmount: '',
    usageLimit: '',
    usageLimitPerCustomer: '',
    isActive: true,
    isPublic: true,
    firstOrderOnly: false,
    startsAt: '',
    endsAt: '',
    appliesTo: 'all',
  })

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setData('code', code)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    post('/admin/discounts')
  }

  return (
    <AdminLayout
      title="Create Discount"
      description="Add a new discount code"
      actions={
        <Button variant="outline" asChild>
          <Link href="/admin/discounts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      }
    >
      <Head title="Create Discount - Admin" />

      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6 animate-fade-in">
        <Card className="animate-fade-up delay-100">
          <CardHeader>
            <CardTitle className="font-display text-lg">Discount Information</CardTitle>
            <CardDescription>
              Basic information about the discount
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="Summer Sale 2024"
                required
                className="h-11 border-border/60 focus-visible:border-accent"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Code <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={data.code}
                  onChange={(e) => setData('code', e.target.value.toUpperCase())}
                  placeholder="SUMMER2024"
                  className="flex-1 h-11 border-border/60 focus-visible:border-accent"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateRandomCode}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate
                </Button>
              </div>
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={data.type}
                  onValueChange={(value) => setData('type', value)}
                >
                  <SelectTrigger id="type" className="h-11 border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="value" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Value <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.value}
                    onChange={(e) => setData('value', e.target.value)}
                    placeholder={data.type === 'percentage' ? '10' : '5.00'}
                    required
                    disabled={data.type === 'free_shipping'}
                    className="h-11 border-border/60 focus-visible:border-accent"
                  />
                  {data.type === 'percentage' && (
                    <span className="absolute right-3 top-3 text-sm text-muted-foreground">
                      %
                    </span>
                  )}
                  {data.type === 'fixed_amount' && (
                    <span className="absolute right-3 top-3 text-sm text-muted-foreground">
                      $
                    </span>
                  )}
                </div>
                {errors.value && (
                  <p className="text-sm text-destructive">{errors.value}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minimumOrderAmount" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Minimum Order Amount</Label>
                <div className="relative">
                  <Input
                    id="minimumOrderAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.minimumOrderAmount}
                    onChange={(e) => setData('minimumOrderAmount', e.target.value)}
                    placeholder="0.00"
                    className="h-11 border-border/60 focus-visible:border-accent"
                  />
                  <span className="absolute right-3 top-3 text-sm text-muted-foreground">
                    $
                  </span>
                </div>
                {errors.minimumOrderAmount && (
                  <p className="text-sm text-destructive">{errors.minimumOrderAmount}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maximumDiscountAmount" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Maximum Discount Amount</Label>
                <div className="relative">
                  <Input
                    id="maximumDiscountAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.maximumDiscountAmount}
                    onChange={(e) => setData('maximumDiscountAmount', e.target.value)}
                    placeholder="0.00"
                    className="h-11 border-border/60 focus-visible:border-accent"
                  />
                  <span className="absolute right-3 top-3 text-sm text-muted-foreground">
                    $
                  </span>
                </div>
                {errors.maximumDiscountAmount && (
                  <p className="text-sm text-destructive">{errors.maximumDiscountAmount}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appliesTo" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Applies To <span className="text-destructive">*</span>
              </Label>
              <Select
                value={data.appliesTo}
                onValueChange={(value) => setData('appliesTo', value)}
              >
                <SelectTrigger id="appliesTo" className="h-11 border-border/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="specific_products">Specific Products</SelectItem>
                  <SelectItem value="specific_categories">Specific Categories</SelectItem>
                </SelectContent>
              </Select>
              {errors.appliesTo && (
                <p className="text-sm text-destructive">{errors.appliesTo}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up delay-200">
          <CardHeader>
            <CardTitle className="font-display text-lg">Usage Limits</CardTitle>
            <CardDescription>
              Control how many times this discount can be used
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="usageLimit" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  min="0"
                  value={data.usageLimit}
                  onChange={(e) => setData('usageLimit', e.target.value)}
                  placeholder="Unlimited"
                  className="h-11 border-border/60 focus-visible:border-accent"
                />
                <p className="text-muted-foreground text-[11px] tracking-wide">
                  Leave empty for unlimited uses
                </p>
                {errors.usageLimit && (
                  <p className="text-sm text-destructive">{errors.usageLimit}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="usageLimitPerCustomer" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Limit Per Customer</Label>
                <Input
                  id="usageLimitPerCustomer"
                  type="number"
                  min="0"
                  value={data.usageLimitPerCustomer}
                  onChange={(e) => setData('usageLimitPerCustomer', e.target.value)}
                  placeholder="Unlimited"
                  className="h-11 border-border/60 focus-visible:border-accent"
                />
                <p className="text-muted-foreground text-[11px] tracking-wide">
                  Leave empty for unlimited uses per customer
                </p>
                {errors.usageLimitPerCustomer && (
                  <p className="text-sm text-destructive">{errors.usageLimitPerCustomer}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up delay-300">
          <CardHeader>
            <CardTitle className="font-display text-lg">Active Dates</CardTitle>
            <CardDescription>
              Set when this discount is valid
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startsAt" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Start Date</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  value={data.startsAt}
                  onChange={(e) => setData('startsAt', e.target.value)}
                  className="h-11 border-border/60 focus-visible:border-accent"
                />
                {errors.startsAt && (
                  <p className="text-sm text-destructive">{errors.startsAt}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endsAt" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">End Date</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  value={data.endsAt}
                  onChange={(e) => setData('endsAt', e.target.value)}
                  className="h-11 border-border/60 focus-visible:border-accent"
                />
                {errors.endsAt && (
                  <p className="text-sm text-destructive">{errors.endsAt}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up delay-400">
          <CardHeader>
            <CardTitle className="font-display text-lg">Settings</CardTitle>
            <CardDescription>
              Additional discount configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active</Label>
                <p className="text-muted-foreground text-[11px] tracking-wide">
                  Enable this discount code
                </p>
              </div>
              <Switch
                id="isActive"
                checked={data.isActive}
                onCheckedChange={(checked) => setData('isActive', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isPublic">Public</Label>
                <p className="text-muted-foreground text-[11px] tracking-wide">
                  Show this discount on your store
                </p>
              </div>
              <Switch
                id="isPublic"
                checked={data.isPublic}
                onCheckedChange={(checked) => setData('isPublic', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="firstOrderOnly">First Order Only</Label>
                <p className="text-muted-foreground text-[11px] tracking-wide">
                  Only apply to customer's first order
                </p>
              </div>
              <Switch
                id="firstOrderOnly"
                checked={data.firstOrderOnly}
                onCheckedChange={(checked) => setData('firstOrderOnly', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4 animate-fade-up delay-500">
          <Button variant="outline" asChild type="button">
            <Link href="/admin/discounts">Cancel</Link>
          </Button>
          <Button type="submit" disabled={processing} className="tracking-wide">
            <Save className="mr-2 h-4 w-4" />
            Create Discount
          </Button>
        </div>
      </form>
    </AdminLayout>
  )
}
