import { Head } from '@inertiajs/react'
import { useState } from 'react'
import {
  Download,
  FileSpreadsheet,
  FileText,
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
  const [format, setFormat] = useState('csv')
  const [includeFields, setIncludeFields] = useState({
    productTitle: true,
    variantTitle: true,
    sku: true,
    quantity: true,
    location: true,
    price: false,
    barcode: false,
  })

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

  return (
    <AdminLayout
      title="Export Inventory"
      description="Download your inventory data as a spreadsheet"
    >
      <Head title="Export Inventory - Admin" />

      <div className="animate-fade-in mx-auto max-w-2xl space-y-6">
        {/* Format Selection */}
        <Card className="animate-fade-up">
          <CardHeader>
            <CardTitle className="font-display text-lg">Export Format</CardTitle>
            <CardDescription>
              Choose the file format for your inventory export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => setFormat('csv')}
                className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
                  format === 'csv'
                    ? 'border-accent bg-accent/5'
                    : 'border-muted hover:border-muted-foreground/25'
                }`}
              >
                <FileSpreadsheet className={`h-8 w-8 ${format === 'csv' ? 'text-accent' : 'text-muted-foreground'}`} />
                <div>
                  <div className="font-medium">CSV</div>
                  <div className="text-muted-foreground text-sm">
                    Comma-separated values, compatible with Excel
                  </div>
                </div>
                {format === 'csv' && <CheckCircle2 className="text-accent ml-auto h-5 w-5" />}
              </button>
              <button
                onClick={() => setFormat('xlsx')}
                className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
                  format === 'xlsx'
                    ? 'border-accent bg-accent/5'
                    : 'border-muted hover:border-muted-foreground/25'
                }`}
              >
                <FileText className={`h-8 w-8 ${format === 'xlsx' ? 'text-accent' : 'text-muted-foreground'}`} />
                <div>
                  <div className="font-medium">XLSX</div>
                  <div className="text-muted-foreground text-sm">
                    Excel spreadsheet format with formatting
                  </div>
                </div>
                {format === 'xlsx' && <CheckCircle2 className="text-accent ml-auto h-5 w-5" />}
              </button>
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
                <Select defaultValue="all">
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
          <Button size="lg" disabled>
            <Download className="mr-2 h-4 w-4" />
            Export Inventory
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}
