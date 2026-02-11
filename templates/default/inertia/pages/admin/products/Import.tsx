import { Head, router, usePage } from '@inertiajs/react'
import { useState, useRef } from 'react'
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Download,
  ArrowLeft,
  X,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function ProductImport() {
  const { props } = usePage<{ flash?: { success?: string; error?: string; importErrors?: string } }>()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parsedErrors: string[] = props.flash?.importErrors
    ? JSON.parse(props.flash.importErrors)
    : []

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (!file) return
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    router.post('/admin/products/import/process', formData as any, {
      forceFormData: true,
      onFinish: () => setUploading(false),
    })
  }

  const handleDownloadTemplate = () => {
    window.location.href = '/admin/products/template'
  }

  const clearFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <AdminLayout
      title="Import Products"
      description="Upload a CSV file to bulk create or update products"
      actions={
        <Button variant="outline" asChild>
          <a href="/admin/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </a>
        </Button>
      }
    >
      <Head title="Import Products - Admin" />

      <div className="animate-fade-in mx-auto max-w-2xl space-y-6">
        {/* Success/Error Messages */}
        {props.flash?.success && (
          <div className="animate-fade-up rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                {props.flash.success}
              </p>
            </div>
          </div>
        )}

        {props.flash?.error && (
          <div className="animate-fade-up rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm font-medium text-destructive">{props.flash.error}</p>
            </div>
          </div>
        )}

        {parsedErrors.length > 0 && (
          <Card className="animate-fade-up border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg text-amber-800 dark:text-amber-200">
                Import Warnings
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300">
                Some rows had issues during import
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                {parsedErrors.map((err, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0 text-amber-600">-</span>
                    {err}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="animate-fade-up">
          <CardHeader>
            <CardTitle className="font-display text-lg">How it works</CardTitle>
            <CardDescription>
              Follow these steps to import product data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: '#d4872e' }}
                >
                  1
                </div>
                <div>
                  <div className="font-medium">Download the template</div>
                  <p className="text-muted-foreground text-sm">
                    Get the CSV template with the required column headers
                  </p>
                </div>
              </div>
              <div className="ml-4 border-l-2 py-1 pl-7" style={{ borderColor: '#e5e0db' }}>
                <ArrowRight className="text-muted-foreground h-4 w-4" />
              </div>
              <div className="flex items-start gap-4">
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: '#d4872e' }}
                >
                  2
                </div>
                <div>
                  <div className="font-medium">Fill in your data</div>
                  <p className="text-muted-foreground text-sm">
                    Add product data including title, description, price, SKU, status, and category.
                    Existing products matched by slug will be updated.
                  </p>
                </div>
              </div>
              <div className="ml-4 border-l-2 py-1 pl-7" style={{ borderColor: '#e5e0db' }}>
                <ArrowRight className="text-muted-foreground h-4 w-4" />
              </div>
              <div className="flex items-start gap-4">
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: '#d4872e' }}
                >
                  3
                </div>
                <div>
                  <div className="font-medium">Upload and import</div>
                  <p className="text-muted-foreground text-sm">
                    Upload the CSV file to create or update products in bulk
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Button variant="outline" onClick={handleDownloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="animate-fade-up delay-100">
          <CardHeader>
            <CardTitle className="font-display text-lg">Upload File</CardTitle>
            <CardDescription>Upload a CSV file with your product data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label
                htmlFor="file-upload"
                className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-accent/50"
                style={{ borderColor: '#e5e0db' }}
              >
                {file ? (
                  <>
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-muted-foreground text-sm">
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        clearFile()
                      }}
                    >
                      <X className="mr-1 h-3 w-3" />
                      Remove
                    </Button>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-10 w-10" style={{ color: '#e9b96e' }} />
                    <div>
                      <div className="font-medium">Click to upload or drag and drop</div>
                      <div className="text-muted-foreground text-sm">CSV files up to 10MB</div>
                    </div>
                  </>
                )}
                <input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* CSV Format Reference */}
        <Card className="animate-fade-up delay-200">
          <CardHeader>
            <CardTitle className="font-display text-lg">Expected Columns</CardTitle>
            <CardDescription>Your CSV file should contain these column headers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['title', 'slug', 'description', 'price', 'compareAtPrice', 'sku', 'barcode', 'status', 'type', 'vendor', 'weight', 'tags', 'category'].map(
                (col) => (
                  <Badge key={col} variant="secondary" className="font-mono text-xs">
                    {col}
                  </Badge>
                )
              )}
            </div>
            <p className="text-muted-foreground mt-3 text-xs">
              Only <strong>title</strong> is required. Products with matching <strong>slug</strong> will be updated instead of created.
            </p>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="animate-fade-up delay-300 border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Important notes
                </p>
                <ul className="list-disc space-y-1 pl-4 text-sm text-amber-700 dark:text-amber-300">
                  <li>The first row must contain column headers</li>
                  <li>Products are matched by slug for updates</li>
                  <li>New products are created in &quot;draft&quot; status by default</li>
                  <li>Tags should be comma-separated within the cell</li>
                  <li>Maximum file size is 10MB</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Import Button */}
        <div className="animate-fade-up delay-400 flex justify-end">
          <Button size="lg" disabled={!file || uploading} onClick={handleUpload}>
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? 'Importing...' : 'Import Products'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}
