import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import {
  AlertTriangle,
  Check,
  Download,
  MapPin,
  Minus,
  Package,
  Plus,
  Search,
  Upload,
  X,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { debounce } from '@/lib/utils'

interface InventoryItem {
  id: string
  productId: string
  variantId: string | null
  productTitle: string
  variantTitle: string | null
  sku: string | null
  thumbnail: string | null
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  lowStockThreshold: number
  trackInventory: boolean
  allowBackorder: boolean
  locationId: string
  locationName: string
}

interface Location {
  id: string
  name: string
  code: string
}

interface Props {
  inventory: {
    data: InventoryItem[]
    meta: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
    }
  }
  locations: Location[]
  filters: {
    search?: string
    locationId?: string
    lowStock?: boolean
  }
}

export default function InventoryIndex({ inventory, locations, filters = {} }: Props) {
  const [search, setSearch] = useState(filters.search || '')
  const [adjustingId, setAdjustingId] = useState<string | null>(null)
  const [adjustmentValue, setAdjustmentValue] = useState('')
  const [adjustmentReason, setAdjustmentReason] = useState('')

  const debouncedSearch = debounce((value: string) => {
    router.get(
      '/admin/inventory',
      { ...filters, search: value, page: 1 },
      { preserveState: true }
    )
  }, 300)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    debouncedSearch(e.target.value)
  }

  const handleFilterChange = (key: string, value: string | boolean) => {
    router.get(
      '/admin/inventory',
      { ...filters, [key]: value || undefined, page: 1 },
      { preserveState: true }
    )
  }

  const handleAdjustment = (itemId: string) => {
    const value = parseInt(adjustmentValue)
    if (isNaN(value) || value === 0) return

    router.post(
      `/admin/inventory/${itemId}/adjust`,
      {
        adjustment: value,
        reason: adjustmentReason,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setAdjustingId(null)
          setAdjustmentValue('')
          setAdjustmentReason('')
        },
      }
    )
  }

  const getStockStatus = (
    item: InventoryItem
  ): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } => {
    if (!item.trackInventory) {
      return { label: 'Not tracked', variant: 'outline' }
    }
    if (item.availableQuantity <= 0) {
      return { label: 'Out of stock', variant: 'destructive' }
    }
    if (item.availableQuantity <= item.lowStockThreshold) {
      return { label: 'Low stock', variant: 'secondary' }
    }
    return { label: 'In stock', variant: 'default' }
  }

  const getQuantityColor = (item: InventoryItem) => {
    if (item.availableQuantity <= 0) return 'text-red-600'
    if (item.availableQuantity <= item.lowStockThreshold) return 'text-yellow-600'
    return ''
  }

  return (
    <AdminLayout
      title="Inventory"
      description={`Manage stock for ${inventory.meta.total} items`}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/inventory/export">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/inventory/import">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Link>
          </Button>
        </div>
      }
    >
      <Head title="Inventory - Admin" />

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
              <Input
                placeholder="Search by product or SKU..."
                value={search}
                onChange={handleSearchChange}
                className="pl-8"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={filters.locationId || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('locationId', value === 'all' ? '' : value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <MapPin className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <label className="flex items-center gap-2">
                <Checkbox
                  checked={filters.lowStock || false}
                  onCheckedChange={(checked) =>
                    handleFilterChange('lowStock', checked === true)
                  }
                />
                <span className="text-sm">Low stock only</span>
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Available</TableHead>
                <TableHead className="text-center">Reserved</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="w-32"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="text-muted-foreground h-8 w-8" />
                      <p className="text-muted-foreground text-sm">
                        {filters.search || filters.lowStock
                          ? 'No inventory found'
                          : 'No inventory yet'}
                      </p>
                      {!filters.search && !filters.lowStock && (
                        <p className="text-muted-foreground text-xs">
                          Add products to see inventory here
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                inventory.data.map((item) => {
                  const status = getStockStatus(item)
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="bg-muted h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
                            {item.thumbnail ? (
                              <img
                                src={item.thumbnail}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/admin/products/${item.productId}/edit`}
                              className="font-medium hover:underline"
                            >
                              {item.productTitle}
                            </Link>
                            {item.variantTitle && (
                              <p className="text-muted-foreground text-xs">
                                {item.variantTitle}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.sku || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="text-muted-foreground h-3 w-3" />
                          <span className="text-sm">{item.locationName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>
                          {status.variant === 'secondary' && (
                            <AlertTriangle className="mr-1 h-3 w-3" />
                          )}
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-medium ${getQuantityColor(item)}`}>
                          {item.availableQuantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-center">
                        {item.reservedQuantity}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {item.quantity}
                      </TableCell>
                      <TableCell>
                        {adjustingId === item.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={adjustmentValue}
                              onChange={(e) => setAdjustmentValue(e.target.value)}
                              placeholder="+/-"
                              className="h-8 w-16 text-center"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:text-green-700"
                              onClick={() => handleAdjustment(item.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setAdjustingId(null)
                                setAdjustmentValue('')
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setAdjustingId(item.id)
                                setAdjustmentValue('-1')
                              }}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setAdjustingId(item.id)
                                setAdjustmentValue('1')
                              }}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {inventory.meta.lastPage > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-muted-foreground text-sm">
                Page {inventory.meta.currentPage} of {inventory.meta.lastPage}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={inventory.meta.currentPage <= 1}
                  onClick={() =>
                    router.get('/admin/inventory', {
                      ...filters,
                      page: inventory.meta.currentPage - 1,
                    })
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={inventory.meta.currentPage >= inventory.meta.lastPage}
                  onClick={() =>
                    router.get('/admin/inventory', {
                      ...filters,
                      page: inventory.meta.currentPage + 1,
                    })
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
