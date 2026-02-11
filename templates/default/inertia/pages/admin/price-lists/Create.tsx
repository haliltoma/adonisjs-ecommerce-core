import { Head, Link, useForm } from '@inertiajs/react'
import { useState } from 'react'
import { ArrowLeft, Plus, Search, X } from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Variant {
  id: string
  title: string
  sku: string | null
  price: number | null
}

interface ProductItem {
  id: string
  title: string
  variants: Variant[]
}

interface Props {
  products: ProductItem[]
  customerGroups: Array<{ id: string; name: string }>
  regions: Array<{ id: string; name: string; currencyCode: string }>
}

interface PriceEntry {
  variantId: string
  amount: number
  currencyCode: string
  variantTitle: string
  productTitle: string
  originalPrice: number | null
}

export default function CreatePriceList({ products, customerGroups, regions }: Props) {
  const [selectedPrices, setSelectedPrices] = useState<PriceEntry[]>([])
  const [productSearch, setProductSearch] = useState('')

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    type: 'sale' as 'sale' | 'override',
    status: 'draft' as 'active' | 'draft',
    startsAt: '',
    endsAt: '',
    rules: [] as { attribute: string; operator: string; value: unknown }[],
    prices: [] as { variantId: string; amount: number; currencyCode: string }[],
  })

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(productSearch.toLowerCase())
  )

  const addVariant = (product: ProductItem, variant: Variant) => {
    if (selectedPrices.find((p) => p.variantId === variant.id)) return
    const newPrice: PriceEntry = {
      variantId: variant.id,
      amount: variant.price || 0,
      currencyCode: 'USD',
      variantTitle: variant.title,
      productTitle: product.title,
      originalPrice: variant.price,
    }
    const updated = [...selectedPrices, newPrice]
    setSelectedPrices(updated)
    setData('prices', updated.map((p) => ({
      variantId: p.variantId,
      amount: p.amount,
      currencyCode: p.currencyCode,
    })))
  }

  const removePrice = (variantId: string) => {
    const updated = selectedPrices.filter((p) => p.variantId !== variantId)
    setSelectedPrices(updated)
    setData('prices', updated.map((p) => ({
      variantId: p.variantId,
      amount: p.amount,
      currencyCode: p.currencyCode,
    })))
  }

  const updatePriceAmount = (variantId: string, amount: number) => {
    const updated = selectedPrices.map((p) =>
      p.variantId === variantId ? { ...p, amount } : p
    )
    setSelectedPrices(updated)
    setData('prices', updated.map((p) => ({
      variantId: p.variantId,
      amount: p.amount,
      currencyCode: p.currencyCode,
    })))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/admin/price-lists')
  }

  return (
    <AdminLayout
      title="Create Price List"
      description="Set up special pricing for sales, customer groups, or regions"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/price-lists">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button onClick={handleSubmit} disabled={processing}>
            {processing ? 'Creating...' : 'Create Price List'}
          </Button>
        </div>
      }
    >
      <Head title="Create Price List - Admin" />

      <div className="animate-fade-in space-y-6">
        <form onSubmit={handleSubmit}>
          {/* General Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="e.g. Summer Sale 2025"
                    required
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={data.type} onValueChange={(v: 'sale' | 'override') => setData('type', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">Sale</SelectItem>
                        <SelectItem value="override">Override</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={data.status} onValueChange={(v: 'active' | 'draft') => setData('status', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startsAt">Start Date</Label>
                  <Input
                    id="startsAt"
                    type="datetime-local"
                    value={data.startsAt}
                    onChange={(e) => setData('startsAt', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endsAt">End Date</Label>
                  <Input
                    id="endsAt"
                    type="datetime-local"
                    value={data.endsAt}
                    onChange={(e) => setData('endsAt', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prices */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Prices</CardTitle>
              <CardDescription>Add product variants and set their special prices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products to add..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {productSearch && filteredProducts.length > 0 && (
                <div className="max-h-48 overflow-y-auto rounded-md border">
                  {filteredProducts.slice(0, 10).map((product) => (
                    <div key={product.id} className="border-b last:border-0">
                      <div className="px-3 py-2 text-sm font-medium bg-muted/50">
                        {product.title}
                      </div>
                      {product.variants.map((variant) => (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => addVariant(product, variant)}
                          disabled={selectedPrices.some((p) => p.variantId === variant.id)}
                          className="flex w-full items-center justify-between px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
                        >
                          <span>{variant.title} {variant.sku && <span className="text-muted-foreground">({variant.sku})</span>}</span>
                          <span className="text-muted-foreground">${variant.price?.toFixed(2) ?? '—'}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {selectedPrices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product / Variant</TableHead>
                      <TableHead>Original Price</TableHead>
                      <TableHead>List Price</TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPrices.map((entry) => (
                      <TableRow key={entry.variantId}>
                        <TableCell>
                          <div className="font-medium">{entry.productTitle}</div>
                          <div className="text-xs text-muted-foreground">{entry.variantTitle}</div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          ${entry.originalPrice?.toFixed(2) ?? '—'}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={entry.amount}
                            onChange={(e) => updatePriceAmount(entry.variantId, parseFloat(e.target.value) || 0)}
                            className="h-8 w-28"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removePrice(entry.variantId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                  Search and add products above to set their prices
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Conditions (Optional)</CardTitle>
              <CardDescription>Define when this price list applies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customerGroups.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Available customer groups:</span>
                    {customerGroups.map((g) => (
                      <Badge key={g.id} variant="outline" className="cursor-pointer hover:bg-muted"
                        onClick={() => {
                          const existing = data.rules.find((r) => r.attribute === 'customer_group')
                          if (existing) return
                          setData('rules', [...data.rules, { attribute: 'customer_group', operator: 'in', value: [g.id] }])
                        }}
                      >
                        {g.name}
                      </Badge>
                    ))}
                  </div>
                )}
                {regions.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Available regions:</span>
                    {regions.map((r) => (
                      <Badge key={r.id} variant="outline" className="cursor-pointer hover:bg-muted"
                        onClick={() => {
                          const existing = data.rules.find((rl) => rl.attribute === 'region')
                          if (existing) return
                          setData('rules', [...data.rules, { attribute: 'region', operator: 'in', value: [r.id] }])
                        }}
                      >
                        {r.name} ({r.currencyCode})
                      </Badge>
                    ))}
                  </div>
                )}
                {data.rules.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {data.rules.map((rule, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {rule.attribute}: {Array.isArray(rule.value) ? (rule.value as string[]).join(', ') : String(rule.value)}
                        <button
                          type="button"
                          onClick={() => setData('rules', data.rules.filter((_, idx) => idx !== i))}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AdminLayout>
  )
}
