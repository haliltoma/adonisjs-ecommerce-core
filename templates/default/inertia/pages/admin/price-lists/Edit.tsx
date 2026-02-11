import { Head, Link, useForm, router } from '@inertiajs/react'
import { useState } from 'react'
import { ArrowLeft, Plus, Search, Trash, X } from 'lucide-react'

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

interface PriceEntry {
  id: string
  variantId: string
  amount: number
  currencyCode: string
  minQuantity: number | null
  maxQuantity: number | null
  variant: {
    id: string
    title: string
    sku: string | null
    price: number | null
    productTitle: string
  } | null
}

interface Rule {
  id: string
  attribute: string
  operator: string
  value: unknown
}

interface PriceListData {
  id: string
  name: string
  description: string | null
  type: 'sale' | 'override'
  status: 'active' | 'draft' | 'expired'
  startsAt: string | null
  endsAt: string | null
  rules: Rule[]
  prices: PriceEntry[]
}

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
  priceList: PriceListData
  products: ProductItem[]
  customerGroups: Array<{ id: string; name: string }>
  regions: Array<{ id: string; name: string; currencyCode: string }>
}

export default function EditPriceList({ priceList, products, customerGroups, regions }: Props) {
  const [productSearch, setProductSearch] = useState('')

  const { data, setData, patch, processing, errors } = useForm({
    name: priceList.name,
    description: priceList.description || '',
    type: priceList.type,
    status: priceList.status as 'active' | 'draft',
    startsAt: priceList.startsAt?.slice(0, 16) || '',
    endsAt: priceList.endsAt?.slice(0, 16) || '',
  })

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(productSearch.toLowerCase())
  )

  const existingVariantIds = new Set(priceList.prices.map((p) => p.variantId))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    patch(`/admin/price-lists/${priceList.id}`)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this price list?')) {
      router.delete(`/admin/price-lists/${priceList.id}`)
    }
  }

  const handleAddVariant = (product: ProductItem, variant: Variant) => {
    if (existingVariantIds.has(variant.id)) return
    router.post(`/admin/price-lists/${priceList.id}/prices`, {
      prices: [{
        variantId: variant.id,
        amount: variant.price || 0,
        currencyCode: 'USD',
      }],
    }, { preserveScroll: true })
  }

  const handleRemovePrice = (priceId: string) => {
    router.delete(`/admin/price-lists/${priceList.id}/prices`, {
      data: { priceIds: [priceId] },
      preserveScroll: true,
    })
  }

  return (
    <AdminLayout
      title={`Edit: ${priceList.name}`}
      description="Manage price list details and pricing"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/price-lists">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button onClick={handleSubmit} disabled={processing}>
            {processing ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <Head title={`${priceList.name} - Price Lists`} />

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
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
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
                    <Label>Status</Label>
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
                <Label>Description</Label>
                <Textarea
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="datetime-local"
                    value={data.startsAt}
                    onChange={(e) => setData('startsAt', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="datetime-local"
                    value={data.endsAt}
                    onChange={(e) => setData('endsAt', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Prices */}
        <Card>
          <CardHeader>
            <CardTitle>Prices ({priceList.prices.length})</CardTitle>
            <CardDescription>Manage pricing for product variants</CardDescription>
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
                    <div className="px-3 py-2 text-sm font-medium bg-muted/50">{product.title}</div>
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => handleAddVariant(product, variant)}
                        disabled={existingVariantIds.has(variant.id)}
                        className="flex w-full items-center justify-between px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
                      >
                        <span>{variant.title}</span>
                        <span className="text-muted-foreground">${variant.price?.toFixed(2) ?? '—'}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {priceList.prices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product / Variant</TableHead>
                    <TableHead>Original</TableHead>
                    <TableHead>List Price</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceList.prices.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="font-medium">{entry.variant?.productTitle}</div>
                        <div className="text-xs text-muted-foreground">
                          {entry.variant?.title}
                          {entry.variant?.sku && ` (${entry.variant.sku})`}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        ${entry.variant?.price?.toFixed(2) ?? '—'}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${entry.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.currencyCode}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRemovePrice(entry.id)}
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
                No prices configured. Search and add products above.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Conditions</CardTitle>
            <CardDescription>Rules that determine when this price list applies</CardDescription>
          </CardHeader>
          <CardContent>
            {priceList.rules.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {priceList.rules.map((rule) => (
                  <Badge key={rule.id} variant="secondary" className="text-sm">
                    {rule.attribute} {rule.operator}{' '}
                    {Array.isArray(rule.value) ? (rule.value as string[]).join(', ') : String(rule.value)}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No conditions set — this price list applies to all matching contexts.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
