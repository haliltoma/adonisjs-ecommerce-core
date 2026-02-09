import { Head, useForm, router } from '@inertiajs/react'
import { useState } from 'react'
import { Plus, Edit2, Save, X } from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  symbolPosition: string
  decimalPlaces: number
  decimalSeparator: string
  thousandsSeparator: string
  exchangeRate: number
  isDefault: boolean
  isActive: boolean
}

interface Props {
  currencies: Currency[]
}

export default function Currencies({ currencies }: Props) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingCurrency, setEditingCurrency] = useState<string | null>(null)

  const addForm = useForm({
    code: '',
    name: '',
    symbol: '',
    symbolPosition: 'before',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
    exchangeRate: 1,
    isDefault: false,
    isActive: true,
  })

  const editForm = useForm({
    code: '',
    name: '',
    symbol: '',
    symbolPosition: 'before',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
    exchangeRate: 1,
    isDefault: false,
    isActive: true,
  })

  const handleAddCurrency = (e: React.FormEvent) => {
    e.preventDefault()
    addForm.post('/admin/settings/currencies', {
      onSuccess: () => {
        addForm.reset()
        setShowAddDialog(false)
      },
    })
  }

  const handleEditCurrency = (currency: Currency) => {
    setEditingCurrency(currency.id)
    editForm.setData({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      symbolPosition: currency.symbolPosition,
      decimalPlaces: currency.decimalPlaces,
      decimalSeparator: currency.decimalSeparator,
      thousandsSeparator: currency.thousandsSeparator,
      exchangeRate: currency.exchangeRate,
      isDefault: currency.isDefault,
      isActive: currency.isActive,
    })
  }

  const handleUpdateCurrency = (currencyId: string) => {
    editForm.patch(`/admin/settings/currencies/${currencyId}`, {
      onSuccess: () => {
        setEditingCurrency(null)
        editForm.reset()
      },
    })
  }

  const handleToggleActive = (currencyId: string, isActive: boolean) => {
    router.patch(
      `/admin/settings/currencies/${currencyId}`,
      { isActive },
      { preserveScroll: true }
    )
  }

  return (
    <AdminLayout
      title="Currency Settings"
      description="Manage currencies for your store"
      actions={
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Currency
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-lg">Add Currency</DialogTitle>
              <DialogDescription>
                Add a new currency to your store
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCurrency}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-xs uppercase tracking-wider text-muted-foreground">Currency Code</Label>
                    <Input
                      id="code"
                      value={addForm.data.code}
                      onChange={(e) => addForm.setData('code', e.target.value.toUpperCase())}
                      placeholder="USD"
                      maxLength={3}
                      className="h-11"
                      required
                    />
                    {addForm.errors.code && (
                      <p className="text-destructive text-sm">{addForm.errors.code}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Currency Name</Label>
                    <Input
                      id="name"
                      value={addForm.data.name}
                      onChange={(e) => addForm.setData('name', e.target.value)}
                      placeholder="US Dollar"
                      className="h-11"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="symbol" className="text-xs uppercase tracking-wider text-muted-foreground">Symbol</Label>
                    <Input
                      id="symbol"
                      value={addForm.data.symbol}
                      onChange={(e) => addForm.setData('symbol', e.target.value)}
                      placeholder="$"
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="symbolPosition" className="text-xs uppercase tracking-wider text-muted-foreground">Symbol Position</Label>
                    <Select
                      value={addForm.data.symbolPosition}
                      onValueChange={(value) => addForm.setData('symbolPosition', value)}
                    >
                      <SelectTrigger id="symbolPosition" className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before">Before amount ($100)</SelectItem>
                        <SelectItem value="after">After amount (100$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="decimalPlaces" className="text-xs uppercase tracking-wider text-muted-foreground">Decimal Places</Label>
                    <Input
                      id="decimalPlaces"
                      type="number"
                      min="0"
                      max="4"
                      value={addForm.data.decimalPlaces}
                      onChange={(e) =>
                        addForm.setData('decimalPlaces', parseInt(e.target.value))
                      }
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="decimalSeparator" className="text-xs uppercase tracking-wider text-muted-foreground">Decimal Separator</Label>
                    <Input
                      id="decimalSeparator"
                      value={addForm.data.decimalSeparator}
                      onChange={(e) => addForm.setData('decimalSeparator', e.target.value)}
                      placeholder="."
                      maxLength={1}
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thousandsSeparator" className="text-xs uppercase tracking-wider text-muted-foreground">Thousands Separator</Label>
                    <Input
                      id="thousandsSeparator"
                      value={addForm.data.thousandsSeparator}
                      onChange={(e) => addForm.setData('thousandsSeparator', e.target.value)}
                      placeholder=","
                      maxLength={1}
                      className="h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exchangeRate" className="text-xs uppercase tracking-wider text-muted-foreground">Exchange Rate</Label>
                  <Input
                    id="exchangeRate"
                    type="number"
                    step="0.000001"
                    value={addForm.data.exchangeRate}
                    onChange={(e) =>
                      addForm.setData('exchangeRate', parseFloat(e.target.value))
                    }
                    placeholder="1.0"
                    className="h-11"
                    required
                  />
                  <p className="text-muted-foreground text-xs">
                    Exchange rate relative to your base currency
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isDefault"
                    checked={addForm.data.isDefault}
                    onCheckedChange={(checked) => addForm.setData('isDefault', checked)}
                  />
                  <Label htmlFor="isDefault">Set as default currency</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={addForm.data.isActive}
                    onCheckedChange={(checked) => addForm.setData('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Enable this currency</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={addForm.processing}>
                  {addForm.processing ? 'Adding...' : 'Add Currency'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <Head title="Currency Settings - Admin" />

      <div className="animate-fade-in">
        <Card className="animate-fade-up">
          <CardContent className="p-0">
            {currencies.length === 0 ? (
              <div className="flex h-32 items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">No currencies configured</p>
                  <p className="text-muted-foreground text-xs">Add a currency to get started</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Code</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Name</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Symbol</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Position</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Format</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Exchange Rate</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Active</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currencies.map((currency) => (
                    <TableRow key={currency.id}>
                      {editingCurrency === currency.id ? (
                        <>
                          <TableCell>
                            <Input
                              value={editForm.data.code}
                              onChange={(e) =>
                                editForm.setData('code', e.target.value.toUpperCase())
                              }
                              className="w-16"
                              maxLength={3}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editForm.data.name}
                              onChange={(e) => editForm.setData('name', e.target.value)}
                              className="w-32"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editForm.data.symbol}
                              onChange={(e) => editForm.setData('symbol', e.target.value)}
                              className="w-16"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={editForm.data.symbolPosition}
                              onValueChange={(value) => editForm.setData('symbolPosition', value)}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="before">Before</SelectItem>
                                <SelectItem value="after">After</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min="0"
                                max="4"
                                value={editForm.data.decimalPlaces}
                                onChange={(e) =>
                                  editForm.setData('decimalPlaces', parseInt(e.target.value))
                                }
                                className="w-12"
                              />
                              <Input
                                value={editForm.data.decimalSeparator}
                                onChange={(e) =>
                                  editForm.setData('decimalSeparator', e.target.value)
                                }
                                className="w-12"
                                maxLength={1}
                              />
                              <Input
                                value={editForm.data.thousandsSeparator}
                                onChange={(e) =>
                                  editForm.setData('thousandsSeparator', e.target.value)
                                }
                                className="w-12"
                                maxLength={1}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.000001"
                              value={editForm.data.exchangeRate}
                              onChange={(e) =>
                                editForm.setData('exchangeRate', parseFloat(e.target.value))
                              }
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={editForm.data.isDefault}
                              onCheckedChange={(checked) => editForm.setData('isDefault', checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={editForm.data.isActive}
                              onCheckedChange={(checked) => editForm.setData('isActive', checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setEditingCurrency(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleUpdateCurrency(currency.id)}
                                disabled={editForm.processing}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-mono text-sm font-medium">{currency.code}</TableCell>
                          <TableCell className="text-sm">{currency.name}</TableCell>
                          <TableCell className="text-sm font-medium">{currency.symbol}</TableCell>
                          <TableCell className="text-sm capitalize">{currency.symbolPosition}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {currency.decimalPlaces} / {currency.decimalSeparator} /{' '}
                            {currency.thousandsSeparator}
                          </TableCell>
                          <TableCell className="text-sm">{currency.exchangeRate}</TableCell>
                          <TableCell>
                            {currency.isDefault && <Badge className="bg-accent text-accent-foreground">Default</Badge>}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={currency.isActive}
                              onCheckedChange={(checked) =>
                                handleToggleActive(currency.id, checked)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditCurrency(currency)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </>
                      )}
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
