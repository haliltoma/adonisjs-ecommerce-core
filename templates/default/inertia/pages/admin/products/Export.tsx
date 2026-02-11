import { Head } from '@inertiajs/react'
import { useState } from 'react'
import {
  Download,
  FileSpreadsheet,
  CheckCircle2,
  ArrowLeft,
  Package,
  Users,
  ShoppingCart,
  Boxes,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Props {
  stats: {
    products: number
    customers: number
    orders: number
    inventory: number
  }
}

const exportTypes = [
  {
    key: 'products',
    label: 'Products',
    description: 'Export product catalog with prices, variants, and categories',
    icon: Package,
    fields: [
      { key: 'title', label: 'Title', default: true },
      { key: 'slug', label: 'Slug', default: true },
      { key: 'description', label: 'Description', default: true },
      { key: 'price', label: 'Price', default: true },
      { key: 'compareAtPrice', label: 'Compare At Price', default: false },
      { key: 'sku', label: 'SKU', default: true },
      { key: 'barcode', label: 'Barcode', default: false },
      { key: 'status', label: 'Status', default: true },
      { key: 'type', label: 'Type', default: true },
      { key: 'vendor', label: 'Vendor', default: false },
      { key: 'tags', label: 'Tags', default: false },
      { key: 'category', label: 'Category', default: true },
    ],
  },
  {
    key: 'customers',
    label: 'Customers',
    description: 'Export customer list with contact info and order history',
    icon: Users,
    fields: [
      { key: 'email', label: 'Email', default: true },
      { key: 'firstName', label: 'First Name', default: true },
      { key: 'lastName', label: 'Last Name', default: true },
      { key: 'phone', label: 'Phone', default: true },
      { key: 'totalOrders', label: 'Total Orders', default: true },
      { key: 'totalSpent', label: 'Total Spent', default: true },
      { key: 'status', label: 'Status', default: false },
      { key: 'tags', label: 'Tags', default: false },
    ],
  },
  {
    key: 'orders',
    label: 'Orders',
    description: 'Export order data with line items and fulfillment status',
    icon: ShoppingCart,
    fields: [
      { key: 'orderNumber', label: 'Order Number', default: true },
      { key: 'status', label: 'Status', default: true },
      { key: 'total', label: 'Total', default: true },
      { key: 'subtotal', label: 'Subtotal', default: true },
      { key: 'customerEmail', label: 'Customer Email', default: true },
      { key: 'customerName', label: 'Customer Name', default: true },
      { key: 'shippingAddress', label: 'Shipping Address', default: false },
      { key: 'paymentStatus', label: 'Payment Status', default: true },
      { key: 'fulfillmentStatus', label: 'Fulfillment Status', default: true },
      { key: 'createdAt', label: 'Created At', default: true },
    ],
  },
  {
    key: 'inventory',
    label: 'Inventory',
    description: 'Export current stock levels for all tracked variants',
    icon: Boxes,
    fields: [
      { key: 'productTitle', label: 'Product Title', default: true },
      { key: 'variantTitle', label: 'Variant Title', default: true },
      { key: 'sku', label: 'SKU', default: true },
      { key: 'quantity', label: 'Quantity', default: true },
      { key: 'location', label: 'Location', default: true },
      { key: 'price', label: 'Price', default: false },
      { key: 'barcode', label: 'Barcode', default: false },
    ],
  },
]

export default function ProductExport({ stats }: Props) {
  const [selectedType, setSelectedType] = useState('products')
  const currentType = exportTypes.find((t) => t.key === selectedType)!

  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    currentType.fields.forEach((f) => {
      initial[f.key] = f.default
    })
    return initial
  })

  const [statusFilter, setStatusFilter] = useState('all')
  const [exporting, setExporting] = useState(false)

  const handleTypeChange = (type: string) => {
    setSelectedType(type)
    const newType = exportTypes.find((t) => t.key === type)!
    const initial: Record<string, boolean> = {}
    newType.fields.forEach((f) => {
      initial[f.key] = f.default
    })
    setSelectedFields(initial)
    setStatusFilter('all')
  }

  const toggleField = (key: string) => {
    setSelectedFields((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleExport = () => {
    setExporting(true)
    const fields = Object.entries(selectedFields)
      .filter(([, v]) => v)
      .map(([k]) => k)
    const filters: Record<string, string> = {}
    if (statusFilter !== 'all') {
      filters.status = statusFilter
    }

    // Create a form and submit it to trigger file download
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/admin/products/export/download'

    // Add CSRF token
    const csrfMeta = document.querySelector('meta[name="csrf-token"]')
    if (csrfMeta) {
      const csrfInput = document.createElement('input')
      csrfInput.type = 'hidden'
      csrfInput.name = '_csrf'
      csrfInput.value = csrfMeta.getAttribute('content') || ''
      form.appendChild(csrfInput)
    }

    // Add type
    const typeInput = document.createElement('input')
    typeInput.type = 'hidden'
    typeInput.name = 'type'
    typeInput.value = selectedType
    form.appendChild(typeInput)

    // Add fields
    fields.forEach((field) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = 'fields[]'
      input.value = field
      form.appendChild(input)
    })

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = `filters[${key}]`
      input.value = value
      form.appendChild(input)
    })

    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)

    setTimeout(() => setExporting(false), 2000)
  }

  const getCount = (type: string) => {
    return stats[type as keyof typeof stats] || 0
  }

  return (
    <AdminLayout
      title="Export Data"
      description="Download your store data as CSV files"
      actions={
        <Button variant="outline" asChild>
          <a href="/admin/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </a>
        </Button>
      }
    >
      <Head title="Export Data - Admin" />

      <div className="animate-fade-in mx-auto max-w-2xl space-y-6">
        {/* Data Type Selection */}
        <Card className="animate-fade-up">
          <CardHeader>
            <CardTitle className="font-display text-lg">What to Export</CardTitle>
            <CardDescription>Choose the type of data you want to export</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {exportTypes.map((type) => {
                const Icon = type.icon
                const isSelected = selectedType === type.key
                return (
                  <button
                    key={type.key}
                    onClick={() => handleTypeChange(type.key)}
                    className={`flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
                      isSelected
                        ? 'border-accent bg-accent/5'
                        : 'border-muted hover:border-muted-foreground/25'
                    }`}
                  >
                    <Icon
                      className={`mt-0.5 h-5 w-5 flex-shrink-0 ${isSelected ? 'text-accent' : 'text-muted-foreground'}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{type.label}</span>
                        <span className="text-muted-foreground text-xs">
                          {getCount(type.key).toLocaleString()} records
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-0.5 text-xs">{type.description}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Fields to Include */}
        <Card className="animate-fade-up delay-100">
          <CardHeader>
            <CardTitle className="font-display text-lg">Fields to Include</CardTitle>
            <CardDescription>
              Select which data fields to include in the export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentType.fields.map((field) => (
                <label
                  key={field.key}
                  className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedFields[field.key] ?? false}
                    onCheckedChange={() => toggleField(field.key)}
                  />
                  <span className="text-sm font-medium">{field.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filter Options */}
        {(selectedType === 'products' || selectedType === 'orders') && (
          <Card className="animate-fade-up delay-200">
            <CardHeader>
              <CardTitle className="font-display text-lg">Filter Options</CardTitle>
              <CardDescription>
                Optionally filter data before exporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Status
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {selectedType === 'products' ? (
                        <>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Export Button */}
        <div className="animate-fade-up delay-300 flex justify-end">
          <Button size="lg" onClick={handleExport} disabled={exporting}>
            <Download className="mr-2 h-4 w-4" />
            {exporting ? 'Preparing...' : `Export ${currentType.label}`}
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}
