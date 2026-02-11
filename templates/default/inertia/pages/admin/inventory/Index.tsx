import { Head, Link, router } from '@inertiajs/react'
import { useState, useRef, useEffect } from 'react'
import {
  AlertTriangle,
  Check,
  Download,
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
  variantId: string
  productTitle: string
  variantTitle: string | null
  sku: string | null
  thumbnail: string | null
  quantity: number
  trackInventory: boolean
  allowBackorder: boolean
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

function StockAdjuster({
  item,
  onClose,
}: {
  item: InventoryItem
  onClose: () => void
}) {
  const [mode, setMode] = useState<'add' | 'remove' | 'set'>('add')
  const [value, setValue] = useState('1')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [mode])

  const numValue = parseInt(value) || 0

  const canSubmit =
    numValue > 0 &&
    !submitting &&
    (mode !== 'remove' || numValue <= item.quantity) &&
    (mode !== 'set' || numValue !== item.quantity)

  const handleSubmit = () => {
    if (!canSubmit) return
    setSubmitting(true)

    if (mode === 'set') {
      router.post(
        `/admin/inventory/variants/${item.id}/set`,
        { quantity: numValue },
        { preserveScroll: true, onFinish: () => { setSubmitting(false); onClose() } }
      )
    } else {
      router.post(
        `/admin/inventory/variants/${item.id}/adjust`,
        {
          quantity: numValue,
          type: mode === 'add' ? 'addition' : 'subtraction',
          reason: reason || undefined,
        },
        { preserveScroll: true, onFinish: () => { setSubmitting(false); onClose() } }
      )
    }
  }

  const preview =
    mode === 'set'
      ? numValue
      : mode === 'add'
        ? item.quantity + numValue
        : item.quantity - numValue

  return (
    <div className="absolute right-0 top-full z-30 mt-1 w-72 rounded-lg border bg-popover p-3 shadow-lg">
      {/* Mode tabs */}
      <div className="mb-3 flex rounded-md border bg-muted/50 p-0.5">
        {(['add', 'remove', 'set'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setValue(m === 'set' ? String(item.quantity) : '1') }}
            className={`flex-1 rounded-sm px-2 py-1 text-xs font-medium transition-colors ${
              mode === m
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            disabled={m === 'remove' && item.quantity <= 0}
          >
            {m === 'add' ? 'Add' : m === 'remove' ? 'Remove' : 'Set'}
          </button>
        ))}
      </div>

      {/* Quantity input */}
      <div className="mb-2 flex items-center gap-2">
        <div className="flex items-center gap-1.5 flex-1">
          <span className="text-xs text-muted-foreground w-10">
            {mode === 'set' ? 'To:' : 'Qty:'}
          </span>
          <Input
            ref={inputRef}
            type="number"
            min={mode === 'set' ? 0 : 1}
            max={mode === 'remove' ? item.quantity : undefined}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') onClose() }}
            className="h-8 text-sm text-center"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="mb-2 flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5">
        <span className="text-xs text-muted-foreground">Result</span>
        <span className="text-sm font-medium">
          {item.quantity}
          {mode !== 'set' && (
            <>
              <span className={mode === 'add' ? 'text-emerald-600' : 'text-red-500'}>
                {' '}{mode === 'add' ? '+' : '-'}{numValue || 0}
              </span>
              {' = '}
            </>
          )}
          {mode === 'set' && <>{' → '}</>}
          <span className={preview < 0 ? 'text-red-500' : ''}>{preview}</span>
        </span>
      </div>

      {/* Validation error */}
      {mode === 'remove' && numValue > item.quantity && (
        <p className="mb-2 text-xs text-red-500">
          Cannot remove more than current stock ({item.quantity})
        </p>
      )}

      {/* Reason (optional) */}
      {mode !== 'set' && (
        <Input
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
          className="mb-2 h-7 text-xs"
        />
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-1.5">
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="sm"
          className="h-7 text-xs"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {submitting ? 'Saving...' : 'Confirm'}
        </Button>
      </div>
    </div>
  )
}

export default function InventoryIndex({ inventory, locations, filters = {} }: Props) {
  const [search, setSearch] = useState(filters.search || '')
  const [adjustingId, setAdjustingId] = useState<string | null>(null)

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

  const handleQuickAdjust = (itemId: string, type: 'addition' | 'subtraction') => {
    router.post(
      `/admin/inventory/variants/${itemId}/adjust`,
      { quantity: 1, type, reason: type === 'addition' ? 'Quick add' : 'Quick remove' },
      { preserveScroll: true }
    )
  }

  const getStockStatus = (
    item: InventoryItem
  ): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } => {
    if (!item.trackInventory) {
      return { label: 'Not tracked', variant: 'outline' }
    }
    if (item.quantity <= 0) {
      return { label: 'Out of stock', variant: 'destructive' }
    }
    if (item.quantity <= 10) {
      return { label: 'Low stock', variant: 'secondary' }
    }
    return { label: 'In stock', variant: 'default' }
  }

  const getQuantityColor = (item: InventoryItem) => {
    if (item.quantity <= 0) return 'text-red-600 dark:text-red-400'
    if (item.quantity <= 10) return 'text-yellow-600 dark:text-yellow-400'
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

      <div className="animate-fade-in">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
                <Input
                  placeholder="Search by product or SKU..."
                  value={search}
                  onChange={handleSearchChange}
                  className="bg-secondary/50 border-0 pl-8 text-sm h-9"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {locations.length > 0 && (
                  <Select
                    value={filters.locationId || 'all'}
                    onValueChange={(value) =>
                      handleFilterChange('locationId', value === 'all' ? '' : value)
                    }
                  >
                    <SelectTrigger className="w-[180px] h-9 text-sm">
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
                )}

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
                  <TableHead className="text-xs">Product</TableHead>
                  <TableHead className="text-xs">SKU</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-center text-xs">Stock</TableHead>
                  <TableHead className="w-40"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="text-muted-foreground h-8 w-8" />
                        <p className="text-muted-foreground text-sm">
                          {filters.search || filters.lowStock
                            ? 'No inventory found'
                            : 'No inventory yet'}
                        </p>
                        {!filters.search && !filters.lowStock && (
                          <p className="text-muted-foreground text-[11px]">
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
                                className="text-sm font-medium hover:underline underline-offset-4"
                              >
                                {item.productTitle}
                              </Link>
                              {item.variantTitle && (
                                <p className="text-muted-foreground text-[11px] mt-0.5">
                                  {item.variantTitle}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {item.sku || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="text-[11px]">
                            {status.variant === 'secondary' && (
                              <AlertTriangle className="mr-1 h-3 w-3" />
                            )}
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`text-sm font-semibold tabular-nums ${getQuantityColor(item)}`}>
                            {item.quantity}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="relative flex items-center justify-end gap-1">
                            {/* Quick -1 */}
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              disabled={item.quantity <= 0}
                              onClick={() => handleQuickAdjust(item.id, 'subtraction')}
                              title={item.quantity <= 0 ? 'No stock to remove' : 'Remove 1'}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>

                            {/* Quick +1 */}
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleQuickAdjust(item.id, 'addition')}
                              title="Add 1"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>

                            {/* Custom adjust toggle */}
                            <Button
                              variant={adjustingId === item.id ? 'secondary' : 'ghost'}
                              size="sm"
                              className="h-7 px-2 text-[11px]"
                              onClick={() => setAdjustingId(adjustingId === item.id ? null : item.id)}
                            >
                              {adjustingId === item.id ? <X className="h-3 w-3" /> : 'Adjust'}
                            </Button>

                            {/* Popover for custom adjustment */}
                            {adjustingId === item.id && (
                              <StockAdjuster
                                item={item}
                                onClose={() => setAdjustingId(null)}
                              />
                            )}
                          </div>
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
                <p className="text-muted-foreground text-xs">
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
      </div>
    </AdminLayout>
  )
}
