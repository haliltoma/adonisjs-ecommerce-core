import { Head, useForm, Link } from '@inertiajs/react'
import { useState } from 'react'
import {
  Package,
  ArrowRightLeft,
  History,
  Plus,
  Minus,
  RefreshCw,
  ChevronLeft,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDateTime } from '@/lib/utils'

interface Variant {
  id: string
  productId: string
  productTitle: string
  title: string
  sku: string | null
  inventoryQuantity: number
  trackInventory: boolean
  allowBackorder: boolean
}

interface StockByLocation {
  locationId: string
  locationName: string
  quantity?: number
}

interface Movement {
  id: string
  type: string
  quantity: number
  reason: string | null
  locationName: string
  createdAt: string
}

interface InventoryLocation {
  id: string
  name: string
  code: string
}

interface Props {
  variant: Variant
  stockByLocation: StockByLocation[]
  movements: Movement[]
  locations: InventoryLocation[]
}

export default function VariantInventory({
  variant,
  stockByLocation,
  movements,
  locations,
}: Props) {
  const [activeTab, setActiveTab] = useState('adjust')

  const adjustForm = useForm({
    locationId: '',
    quantity: 0,
    reason: '',
  })

  const setForm = useForm({
    locationId: '',
    quantity: 0,
  })

  const transferForm = useForm({
    fromLocationId: '',
    toLocationId: '',
    quantity: 1,
  })

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault()
    adjustForm.post(`/admin/inventory/variants/${variant.id}/adjust`, {
      onSuccess: () => {
        adjustForm.reset()
      },
    })
  }

  const handleSet = (e: React.FormEvent) => {
    e.preventDefault()
    setForm.post(`/admin/inventory/variants/${variant.id}/set`, {
      onSuccess: () => {
        setForm.reset()
      },
    })
  }

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault()
    transferForm.post('/admin/inventory/transfer', {
      onSuccess: () => {
        transferForm.reset()
      },
    })
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'adjustment':
        return <RefreshCw className="h-4 w-4" />
      case 'transfer_in':
        return <Plus className="h-4 w-4" />
      case 'transfer_out':
        return <Minus className="h-4 w-4" />
      default:
        return <History className="h-4 w-4" />
    }
  }

  const getMovementBadgeVariant = (type: string) => {
    switch (type) {
      case 'adjustment':
        return 'secondary'
      case 'transfer_in':
        return 'default'
      case 'transfer_out':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const formatMovementType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <AdminLayout
      title="Variant Inventory"
      description={`Manage inventory for ${variant.title}`}
      actions={
        <Button variant="outline" asChild>
          <Link href={`/admin/products/${variant.productId}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Product
          </Link>
        </Button>
      }
    >
      <Head title={`Inventory - ${variant.title} - Admin`} />

      <div className="animate-fade-in space-y-6">
        <Card className="animate-fade-up">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="font-display flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5" style={{ color: '#d4872e' }} />
                  {variant.title}
                </CardTitle>
                <CardDescription className="mt-1">
                  <Link
                    href={`/admin/products/${variant.productId}`}
                    className="text-accent hover:underline underline-offset-4"
                  >
                    {variant.productTitle}
                  </Link>
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">SKU</p>
                <p className="font-mono font-medium">{variant.sku || 'N/A'}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Quantity</p>
                <p className="font-display text-3xl">{variant.inventoryQuantity}</p>
              </div>
              <div className="flex gap-2">
                {variant.trackInventory ? (
                  <Badge className="bg-accent text-accent-foreground">Tracked</Badge>
                ) : (
                  <Badge variant="secondary">Not Tracked</Badge>
                )}
                {variant.allowBackorder && <Badge variant="outline">Backorder</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="animate-fade-up delay-100">
            <CardHeader>
              <CardTitle className="font-display text-lg">Stock by Location</CardTitle>
            </CardHeader>
            <CardContent>
              {stockByLocation.length === 0 ? (
                <p className="text-muted-foreground text-center text-sm">
                  No stock in any location
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Location</TableHead>
                      <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockByLocation.map((stock) => (
                      <TableRow key={stock.locationId}>
                        <TableCell className="text-sm font-medium">{stock.locationName}</TableCell>
                        <TableCell className="text-right text-sm">
                          {stock.quantity !== undefined ? stock.quantity : 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="animate-fade-up delay-200">
            <CardHeader>
              <CardTitle className="font-display text-lg">Manage Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="adjust">Adjust</TabsTrigger>
                  <TabsTrigger value="set">Set</TabsTrigger>
                  <TabsTrigger value="transfer">Transfer</TabsTrigger>
                </TabsList>

                <TabsContent value="adjust" className="space-y-4">
                  <form onSubmit={handleAdjust} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="adjust-location" className="text-xs uppercase tracking-wider text-muted-foreground">Location</Label>
                      <Select
                        value={adjustForm.data.locationId}
                        onValueChange={(value) => adjustForm.setData('locationId', value)}
                      >
                        <SelectTrigger id="adjust-location" className="h-11">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name} ({location.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {adjustForm.errors.locationId && (
                        <p className="text-destructive text-sm">
                          {adjustForm.errors.locationId}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adjust-quantity" className="text-xs uppercase tracking-wider text-muted-foreground">Quantity Change</Label>
                      <Input
                        id="adjust-quantity"
                        type="number"
                        value={adjustForm.data.quantity}
                        onChange={(e) =>
                          adjustForm.setData('quantity', parseInt(e.target.value))
                        }
                        placeholder="e.g., 10 or -5"
                        className="h-11"
                        required
                      />
                      <p className="text-muted-foreground text-xs">
                        Use negative numbers to decrease inventory
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adjust-reason" className="text-xs uppercase tracking-wider text-muted-foreground">Reason (Optional)</Label>
                      <Textarea
                        id="adjust-reason"
                        value={adjustForm.data.reason}
                        onChange={(e) => adjustForm.setData('reason', e.target.value)}
                        placeholder="e.g., Damaged goods, Found stock, etc."
                        rows={2}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={adjustForm.processing}>
                      {adjustForm.processing ? 'Adjusting...' : 'Adjust Stock'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="set" className="space-y-4">
                  <form onSubmit={handleSet} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="set-location" className="text-xs uppercase tracking-wider text-muted-foreground">Location</Label>
                      <Select
                        value={setForm.data.locationId}
                        onValueChange={(value) => setForm.setData('locationId', value)}
                      >
                        <SelectTrigger id="set-location" className="h-11">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name} ({location.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {setForm.errors.locationId && (
                        <p className="text-destructive text-sm">{setForm.errors.locationId}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="set-quantity" className="text-xs uppercase tracking-wider text-muted-foreground">New Quantity</Label>
                      <Input
                        id="set-quantity"
                        type="number"
                        min="0"
                        value={setForm.data.quantity}
                        onChange={(e) => setForm.setData('quantity', parseInt(e.target.value))}
                        placeholder="e.g., 100"
                        className="h-11"
                        required
                      />
                      <p className="text-muted-foreground text-xs">
                        Set the exact quantity for this location
                      </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={setForm.processing}>
                      {setForm.processing ? 'Setting...' : 'Set Stock Level'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="transfer" className="space-y-4">
                  <form onSubmit={handleTransfer} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="from-location" className="text-xs uppercase tracking-wider text-muted-foreground">From Location</Label>
                      <Select
                        value={transferForm.data.fromLocationId}
                        onValueChange={(value) => transferForm.setData('fromLocationId', value)}
                      >
                        <SelectTrigger id="from-location" className="h-11">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name} ({location.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {transferForm.errors.fromLocationId && (
                        <p className="text-destructive text-sm">
                          {transferForm.errors.fromLocationId}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-center">
                      <ArrowRightLeft className="text-muted-foreground h-4 w-4" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="to-location" className="text-xs uppercase tracking-wider text-muted-foreground">To Location</Label>
                      <Select
                        value={transferForm.data.toLocationId}
                        onValueChange={(value) => transferForm.setData('toLocationId', value)}
                      >
                        <SelectTrigger id="to-location" className="h-11">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name} ({location.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {transferForm.errors.toLocationId && (
                        <p className="text-destructive text-sm">
                          {transferForm.errors.toLocationId}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="transfer-quantity" className="text-xs uppercase tracking-wider text-muted-foreground">Quantity</Label>
                      <Input
                        id="transfer-quantity"
                        type="number"
                        min="1"
                        value={transferForm.data.quantity}
                        onChange={(e) =>
                          transferForm.setData('quantity', parseInt(e.target.value))
                        }
                        className="h-11"
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={transferForm.processing}>
                      {transferForm.processing ? 'Transferring...' : 'Transfer Stock'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <Card className="animate-fade-up delay-300">
          <CardHeader>
            <CardTitle className="font-display text-lg">Recent Movements</CardTitle>
            <CardDescription>History of inventory changes for this variant</CardDescription>
          </CardHeader>
          <CardContent>
            {movements.length === 0 ? (
              <p className="text-muted-foreground text-center text-sm">
                No inventory movements yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Type</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Quantity</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Location</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Reason</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMovementIcon(movement.type)}
                          <Badge variant={getMovementBadgeVariant(movement.type)}>
                            {formatMovementType(movement.type)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                          }
                        >
                          {movement.quantity > 0 ? '+' : ''}
                          {movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm font-medium">{movement.locationName}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {movement.reason || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDateTime(movement.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
