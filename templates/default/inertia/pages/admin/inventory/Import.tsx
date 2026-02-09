import { Head } from '@inertiajs/react'
import { useState } from 'react'
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Download,
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

export default function InventoryImport() {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  return (
    <AdminLayout
      title="Import Inventory"
      description="Upload a spreadsheet to bulk update inventory quantities"
    >
      <Head title="Import Inventory - Admin" />

      <div className="animate-fade-in mx-auto max-w-2xl space-y-6">
        {/* Instructions */}
        <Card className="animate-fade-up">
          <CardHeader>
            <CardTitle className="font-display text-lg">How it works</CardTitle>
            <CardDescription>
              Follow these steps to import inventory data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium text-white" style={{ backgroundColor: '#d4872e' }}>
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
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium text-white" style={{ backgroundColor: '#d4872e' }}>
                  2
                </div>
                <div>
                  <div className="font-medium">Fill in your data</div>
                  <p className="text-muted-foreground text-sm">
                    Add SKU numbers and quantity values. Use product variant SKUs to match items.
                  </p>
                </div>
              </div>
              <div className="ml-4 border-l-2 py-1 pl-7" style={{ borderColor: '#e5e0db' }}>
                <ArrowRight className="text-muted-foreground h-4 w-4" />
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium text-white" style={{ backgroundColor: '#d4872e' }}>
                  3
                </div>
                <div>
                  <div className="font-medium">Upload and review</div>
                  <p className="text-muted-foreground text-sm">
                    Upload the file and review changes before applying them
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Button variant="outline" disabled>
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
            <CardDescription>
              Upload a CSV or XLSX file with your inventory data
            </CardDescription>
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
                    <Button variant="outline" size="sm" asChild>
                      <span>Choose different file</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-10 w-10" style={{ color: '#e9b96e' }} />
                    <div>
                      <div className="font-medium">Click to upload or drag and drop</div>
                      <div className="text-muted-foreground text-sm">
                        CSV or XLSX files up to 10MB
                      </div>
                    </div>
                  </>
                )}
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="animate-fade-up delay-200 border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-800">Important notes</p>
                <ul className="text-muted-foreground list-disc space-y-1 pl-4 text-sm">
                  <li>SKU column is required to match inventory items</li>
                  <li>Quantities will overwrite existing values, not add to them</li>
                  <li>Unrecognized SKUs will be skipped</li>
                  <li>You will be able to review all changes before confirming</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Import Button */}
        <div className="animate-fade-up delay-300 flex justify-end">
          <Button size="lg" disabled={!file}>
            <Upload className="mr-2 h-4 w-4" />
            Upload and Review
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}
