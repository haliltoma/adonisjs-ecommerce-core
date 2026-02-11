import { Head, router, useForm } from '@inertiajs/react'
import { useState } from 'react'
import {
  Globe,
  MoreHorizontal,
  Plus,
  Trash,
  Pencil,
  MapPin,
  X,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Country {
  id: string
  countryCode: string
  countryName: string
}

interface Region {
  id: string
  name: string
  currencyCode: string
  taxRate: number
  taxCode: string | null
  includesTax: boolean
  paymentProviders: string[]
  fulfillmentProviders: string[]
  isActive: boolean
  countries: Country[]
  createdAt: string
}

interface Props {
  regions: {
    data: Region[]
    meta: { total: number; currentPage: number; lastPage: number }
  }
  currencies: Array<{ code: string; name: string; symbol: string }>
}

export default function Regions({ regions, currencies }: Props) {
  const [showDialog, setShowDialog] = useState(false)
  const [editingRegion, setEditingRegion] = useState<Region | null>(null)

  const { data, setData, post, patch, processing, reset } = useForm({
    name: '',
    currencyCode: 'USD',
    taxRate: 0,
    taxCode: '',
    includesTax: false,
    countries: [] as { countryCode: string; countryName: string }[],
  })

  const openCreate = () => {
    setEditingRegion(null)
    reset()
    setShowDialog(true)
  }

  const openEdit = (region: Region) => {
    setEditingRegion(region)
    setData({
      name: region.name,
      currencyCode: region.currencyCode,
      taxRate: region.taxRate,
      taxCode: region.taxCode || '',
      includesTax: region.includesTax,
      countries: region.countries.map((c) => ({
        countryCode: c.countryCode,
        countryName: c.countryName,
      })),
    })
    setShowDialog(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingRegion) {
      patch(`/admin/settings/regions/${editingRegion.id}`, {
        onSuccess: () => {
          setShowDialog(false)
          reset()
        },
      })
    } else {
      post('/admin/settings/regions', {
        onSuccess: () => {
          setShowDialog(false)
          reset()
        },
      })
    }
  }

  const handleDelete = (regionId: string) => {
    if (confirm('Are you sure you want to delete this region?')) {
      router.delete(`/admin/settings/regions/${regionId}`)
    }
  }

  return (
    <AdminLayout
      title="Regions"
      description="Manage regions, currencies, and tax settings per geographic area"
      actions={
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Region
        </Button>
      }
    >
      <Head title="Regions - Settings" />

      <div className="animate-fade-in space-y-6">
        {regions.data.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Globe className="h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-medium">No regions yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create regions to manage currencies, taxes, and shipping by geographic area.
              </p>
              <Button onClick={openCreate} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create first region
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Regions</CardTitle>
              <CardDescription>{regions.meta.total} region(s) configured</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Tax Rate</TableHead>
                    <TableHead>Countries</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regions.data.map((region) => (
                    <TableRow key={region.id}>
                      <TableCell className="font-medium">{region.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{region.currencyCode}</Badge>
                      </TableCell>
                      <TableCell>{region.taxRate}%</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {region.countries.slice(0, 3).map((c) => (
                            <Badge key={c.countryCode} variant="secondary" className="text-xs">
                              {c.countryCode}
                            </Badge>
                          ))}
                          {region.countries.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{region.countries.length - 3}
                            </Badge>
                          )}
                          {region.countries.length === 0 && (
                            <span className="text-xs text-muted-foreground">No countries</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={region.isActive ? 'default' : 'secondary'}>
                          {region.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(region)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(region.id)}
                              className="text-destructive"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRegion ? 'Edit Region' : 'Create Region'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Region Name</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="e.g. Europe, North America"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currencyCode">Currency</Label>
                <Select value={data.currencyCode} onValueChange={(v) => setData('currencyCode', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code} — {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={data.taxRate}
                  onChange={(e) => setData('taxRate', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxCode">Tax Code (optional)</Label>
              <Input
                id="taxCode"
                value={data.taxCode}
                onChange={(e) => setData('taxCode', e.target.value)}
                placeholder="e.g. VAT, GST"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="includesTax"
                checked={data.includesTax}
                onCheckedChange={(v) => setData('includesTax', v)}
              />
              <Label htmlFor="includesTax">Prices include tax</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? 'Saving...' : editingRegion ? 'Update Region' : 'Create Region'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
