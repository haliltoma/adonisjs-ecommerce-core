import { Head } from '@inertiajs/react'
import { useState } from 'react'
import {
  Download,
  FileSpreadsheet,
  CheckCircle2,
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

export default function InventoryExport() {
  const [includeFields, setIncludeFields] = useState({
    productTitle: true,
    variantTitle: true,
    sku: true,
    quantity: true,
    location: true,
    price: false,
    barcode: false,
  })
  const [stockFilter, setStockFilter] = useState('all')
  const [exporting, setExporting] = useState(false)

  const toggleField = (field: string) => {
    setIncludeFields((prev) => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev],
    }))
  }

  const fields = [
    { key: 'productTitle', label: 'Product Title' },
    { key: 'variantTitle', label: 'Variant Title' },
    { key: 'sku', label: 'SKU' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'location', label: 'Location' },
    { key: 'price', label: 'Price' },
    { key: 'barcode', label: 'Barcode' },
  ]

  const handleExport = () => {
    setExporting(true)
    const selectedFields = Object.entries(includeFields)
      .filter(([, v]) => v)
      .map(([k]) => k)

    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/admin/inventory/export/download'

    const csrfMeta = document.querySelector('meta[name="csrf-token"]')
    if (csrfMeta) {
      const csrfInput = document.createElement('input')
      csrfInput.type = 'hidden'
      csrfInput.name = '_csrf'
      csrfInput.value = csrfMeta.getAttribute('content') || ''
      form.appendChild(csrfInput)
    }

    const typeInput = document.createElement('input')
    typeInput.type = 'hidden'
    typeInput.name = 'type'
    typeInput.value = 'inventory'
    form.appendChild(typeInput)

    selectedFields.forEach((field) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = 'fields[]'
      input.value = field
      form.appendChild(input)
    })

    if (stockFilter !== 'all') {
      const filterInput = document.createElement('input')
      filterInput.type = 'hidden'
      filterInput.name = 'filters[stockStatus]'
      filterInput.value = stockFilter
      form.appendChild(filterInput)
    }

    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)

    setTimeout(() => setExporting(false), 2000)
  }

  return (
    <AdminLayout
      title="Export Inventory"
      description="Download your inventory data as a spreadsheet"
    >
      <Head title="Export Inventory - Admin" />

      <div className="animate-fade-in mx-auto max-w-2xl space-y-6">
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
              {fields.map((field) => (
                <label
                  key={field.key}
                  className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
                >
                  <Checkbox
                    checked={includeFields[field.key as keyof typeof includeFields]}
                    onCheckedChange={() => toggleField(field.key)}
                  />
                  <span className="text-sm font-medium">{field.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filter Options */}
        <Card className="animate-fade-up delay-200">
          <CardHeader>
            <CardTitle className="font-display text-lg">Filter Options</CardTitle>
            <CardDescription>
              Optionally filter inventory data before exporting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Stock Status</Label>
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select stock status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All inventory</SelectItem>
                    <SelectItem value="in_stock">In stock only</SelectItem>
                    <SelectItem value="low_stock">Low stock only</SelectItem>
                    <SelectItem value="out_of_stock">Out of stock only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Button */}
        <div className="animate-fade-up delay-300 flex justify-end">
          <Button size="lg" onClick={handleExport} disabled={exporting}>
            <Download className="mr-2 h-4 w-4" />
            {exporting ? 'Preparing...' : 'Export Inventory'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}
