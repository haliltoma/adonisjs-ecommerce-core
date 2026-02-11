import { Head, router, useForm } from '@inertiajs/react'
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'

interface Customer {
  id: string
  name: string
  email: string
}

interface Product {
  id: string
  title: string
  variants: { id: string; title: string; sku: string | null; price: number }[]
}

interface Region {
  id: string
  name: string
  currencyCode: string
}

interface DraftItem {
  productId: string
  variantId?: string
  title: string
  quantity: number
  unitPrice: number
}

interface Props {
  customers: Customer[]
  products: Product[]
  regions: Region[]
}

export default function DraftOrderCreate({ customers, products, regions }: Props) {
  const [items, setItems] = useState<DraftItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedVariant, setSelectedVariant] = useState('')

  const form = useForm({
    customerId: '',
    email: '',
    regionId: '',
    currencyCode: 'USD',
    items: [] as DraftItem[],
    shippingMethod: '',
    shippingTotal: 0,
    note: '',
  })

  const handleAddItem = () => {
    if (!selectedProduct) return

    const product = products.find((p) => p.id === selectedProduct)
    if (!product) return

    const variant = product.variants.find((v) => v.id === selectedVariant)
    const newItem: DraftItem = {
      productId: product.id,
      variantId: variant?.id,
      title: variant ? `${product.title} - ${variant.title}` : product.title,
      quantity: 1,
      unitPrice: variant?.price || 0,
    }

    const updated = [...items, newItem]
    setItems(updated)
    form.setData('items', updated)
    setSelectedProduct('')
    setSelectedVariant('')
  }

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index)
    setItems(updated)
    form.setData('items', updated)
  }

  const handleItemChange = (index: number, field: keyof DraftItem, value: any) => {
    const updated = items.map((item, i) => {
      if (i === index) return { ...item, [field]: value }
      return item
    })
    setItems(updated)
    form.setData('items', updated)
  }

  const handleRegionChange = (regionId: string) => {
    const region = regions.find((r) => r.id === regionId)
    form.setData('regionId', regionId)
    if (region) {
      form.setData('currencyCode', region.currencyCode)
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const grandTotal = subtotal + (form.data.shippingTotal || 0)

  const selectedProductObj = products.find((p) => p.id === selectedProduct)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    form.post('/admin/draft-orders')
  }

  return (
    <AdminLayout
      title="Create Draft Order"
      description="Manually create an order on behalf of a customer"
      actions={
        <Button variant="outline" onClick={() => router.get('/admin/draft-orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      }
    >
      <Head title="Create Draft Order - Admin" />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3 animate-fade-in">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Items */}
            <Card className="animate-fade-up delay-100">
              <CardHeader>
                <CardTitle className="font-display text-lg">Items</CardTitle>
                <CardDescription>Add products to the draft order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Product */}
                <div className="flex gap-2">
                  <Select value={selectedProduct} onValueChange={(val) => {
                    setSelectedProduct(val)
                    setSelectedVariant('')
                  }}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedProductObj && selectedProductObj.variants.length > 0 && (
                    <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Variant..." />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedProductObj.variants.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.title} ({formatCurrency(v.price, form.data.currencyCode)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Button type="button" onClick={handleAddItem} disabled={!selectedProduct}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Items List */}
                {items.length > 0 && (
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.title}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-muted-foreground sr-only">Qty</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-20 h-9"
                          />
                          <Label className="text-xs text-muted-foreground sr-only">Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-28 h-9"
                          />
                          <span className="text-sm font-display w-24 text-right">
                            {formatCurrency(item.unitPrice * item.quantity, form.data.currencyCode)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {items.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No items added yet. Select a product above to add items.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping */}
            <Card className="animate-fade-up delay-200">
              <CardHeader>
                <CardTitle className="font-display text-lg">Shipping</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Shipping Method
                    </Label>
                    <Input
                      placeholder="e.g. Standard Shipping"
                      value={form.data.shippingMethod}
                      onChange={(e) => form.setData('shippingMethod', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Shipping Cost
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.data.shippingTotal}
                      onChange={(e) => form.setData('shippingTotal', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Note */}
            <Card className="animate-fade-up delay-300">
              <CardHeader>
                <CardTitle className="font-display text-lg">Note</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add an internal note..."
                  value={form.data.note}
                  onChange={(e) => form.setData('note', e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer */}
            <Card className="animate-fade-up delay-100">
              <CardHeader>
                <CardTitle className="font-display text-lg">Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Select Customer
                  </Label>
                  <Select
                    value={form.data.customerId}
                    onValueChange={(val) => {
                      form.setData('customerId', val)
                      const customer = customers.find((c) => c.id === val)
                      if (customer) form.setData('email', customer.email)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer..." />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Or Enter Email
                  </Label>
                  <Input
                    type="email"
                    placeholder="customer@example.com"
                    value={form.data.email}
                    onChange={(e) => form.setData('email', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Region */}
            <Card className="animate-fade-up delay-200">
              <CardHeader>
                <CardTitle className="font-display text-lg">Region & Currency</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {regions.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Region
                    </Label>
                    <Select value={form.data.regionId} onValueChange={handleRegionChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region..." />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name} ({r.currencyCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="animate-fade-up delay-300">
              <CardHeader>
                <CardTitle className="font-display text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal, form.data.currencyCode)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatCurrency(form.data.shippingTotal || 0, form.data.currencyCode)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span className="font-display">Total</span>
                  <span className="font-display">{formatCurrency(grandTotal, form.data.currencyCode)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Button
              type="submit"
              className="w-full tracking-wide"
              disabled={items.length === 0 || form.processing}
            >
              Create Draft Order
            </Button>
          </div>
        </div>
      </form>
    </AdminLayout>
  )
}
