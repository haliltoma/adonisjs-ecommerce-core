import { Head, useForm, router } from '@inertiajs/react'
import { useState } from 'react'
import {
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  Save,
  X,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface TaxRate {
  id: string
  name: string
  rate: number
  country: string
  state: string | null
  postalCode: string | null
  priority: number
  isCompound: boolean
}

interface TaxClass {
  id: string
  name: string
  description: string | null
  isDefault: boolean
  rates: TaxRate[]
}

interface Props {
  taxClasses: TaxClass[]
}

export default function Taxes({ taxClasses }: Props) {
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set())
  const [editingClass, setEditingClass] = useState<string | null>(null)
  const [editingRate, setEditingRate] = useState<string | null>(null)
  const [showAddClass, setShowAddClass] = useState(false)
  const [showAddRate, setShowAddRate] = useState<string | null>(null)

  const addClassForm = useForm({
    name: '',
    description: '',
    isDefault: false,
  })

  const editClassForm = useForm({
    name: '',
    description: '',
    isDefault: false,
  })

  const addRateForm = useForm({
    name: '',
    rate: 0,
    country: '',
    state: '',
    postalCode: '',
    priority: 1,
    isCompound: false,
  })

  const editRateForm = useForm({
    name: '',
    rate: 0,
    country: '',
    state: '',
    postalCode: '',
    priority: 1,
    isCompound: false,
  })

  const toggleExpanded = (classId: string) => {
    const newExpanded = new Set(expandedClasses)
    if (newExpanded.has(classId)) {
      newExpanded.delete(classId)
    } else {
      newExpanded.add(classId)
    }
    setExpandedClasses(newExpanded)
  }

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault()
    addClassForm.post('/admin/settings/taxes/classes', {
      onSuccess: () => {
        addClassForm.reset()
        setShowAddClass(false)
      },
    })
  }

  const handleEditClass = (taxClass: TaxClass) => {
    setEditingClass(taxClass.id)
    editClassForm.setData({
      name: taxClass.name,
      description: taxClass.description || '',
      isDefault: taxClass.isDefault,
    })
  }

  const handleUpdateClass = (classId: string) => {
    editClassForm.patch(`/admin/settings/taxes/classes/${classId}`, {
      onSuccess: () => {
        setEditingClass(null)
        editClassForm.reset()
      },
    })
  }

  const handleDeleteClass = (classId: string) => {
    if (confirm('Are you sure you want to delete this tax class?')) {
      router.delete(`/admin/settings/taxes/classes/${classId}`)
    }
  }

  const handleAddRate = (classId: string, e: React.FormEvent) => {
    e.preventDefault()
    addRateForm.post(`/admin/settings/taxes/classes/${classId}/rates`, {
      onSuccess: () => {
        addRateForm.reset()
        setShowAddRate(null)
      },
    })
  }

  const handleEditRate = (rate: TaxRate) => {
    setEditingRate(rate.id)
    editRateForm.setData({
      name: rate.name,
      rate: rate.rate,
      country: rate.country,
      state: rate.state || '',
      postalCode: rate.postalCode || '',
      priority: rate.priority,
      isCompound: rate.isCompound,
    })
  }

  const handleUpdateRate = (rateId: string) => {
    editRateForm.patch(`/admin/settings/taxes/rates/${rateId}`, {
      onSuccess: () => {
        setEditingRate(null)
        editRateForm.reset()
      },
    })
  }

  const handleDeleteRate = (rateId: string) => {
    if (confirm('Are you sure you want to delete this tax rate?')) {
      router.delete(`/admin/settings/taxes/rates/${rateId}`)
    }
  }

  return (
    <AdminLayout
      title="Tax Settings"
      description="Manage tax classes and rates for your store"
      actions={
        <Dialog open={showAddClass} onOpenChange={setShowAddClass}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Tax Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display text-lg">Add Tax Class</DialogTitle>
              <DialogDescription>
                Create a new tax class to organize your tax rates
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddClass}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Name</Label>
                  <Input
                    id="name"
                    value={addClassForm.data.name}
                    onChange={(e) => addClassForm.setData('name', e.target.value)}
                    placeholder="e.g., Standard, Reduced"
                    className="h-11"
                    required
                  />
                  {addClassForm.errors.name && (
                    <p className="text-destructive text-sm">{addClassForm.errors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs uppercase tracking-wider text-muted-foreground">Description</Label>
                  <Textarea
                    id="description"
                    value={addClassForm.data.description}
                    onChange={(e) => addClassForm.setData('description', e.target.value)}
                    placeholder="Optional description"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isDefault"
                    checked={addClassForm.data.isDefault}
                    onCheckedChange={(checked) => addClassForm.setData('isDefault', checked)}
                  />
                  <Label htmlFor="isDefault">Set as default tax class</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddClass(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={addClassForm.processing}>
                  {addClassForm.processing ? 'Creating...' : 'Create Tax Class'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <Head title="Tax Settings - Admin" />

      <div className="animate-fade-in space-y-4">
        {taxClasses.length === 0 ? (
          <Card className="animate-fade-up">
            <CardContent className="flex h-32 items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">No tax classes configured</p>
                <p className="text-muted-foreground text-xs">
                  Add a tax class to get started
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          taxClasses.map((taxClass, index) => (
            <Card key={taxClass.id} className={`animate-fade-up delay-${(index + 1) * 100}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleExpanded(taxClass.id)}
                    >
                      {expandedClasses.has(taxClass.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    {editingClass === taxClass.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editClassForm.data.name}
                          onChange={(e) => editClassForm.setData('name', e.target.value)}
                          className="h-11 w-48"
                        />
                      </div>
                    ) : (
                      <div>
                        <CardTitle className="font-display flex items-center gap-2 text-lg">
                          {taxClass.name}
                          {taxClass.isDefault && <Badge className="bg-accent text-accent-foreground">Default</Badge>}
                        </CardTitle>
                        {taxClass.description && (
                          <p className="text-muted-foreground mt-1 text-sm">
                            {taxClass.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {editingClass === taxClass.id ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingClass(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateClass(taxClass.id)}
                          disabled={editClassForm.processing}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClass(taxClass)}
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClass(taxClass.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              {expandedClasses.has(taxClass.id) && (
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display text-sm">Tax Rates</h4>
                      <Dialog
                        open={showAddRate === taxClass.id}
                        onOpenChange={(open) => setShowAddRate(open ? taxClass.id : null)}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Rate
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="font-display text-lg">Add Tax Rate</DialogTitle>
                            <DialogDescription>
                              Add a new tax rate to {taxClass.name}
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={(e) => handleAddRate(taxClass.id, e)}>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="rateName" className="text-xs uppercase tracking-wider text-muted-foreground">Name</Label>
                                  <Input
                                    id="rateName"
                                    value={addRateForm.data.name}
                                    onChange={(e) =>
                                      addRateForm.setData('name', e.target.value)
                                    }
                                    placeholder="e.g., US Sales Tax"
                                    className="h-11"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="rate" className="text-xs uppercase tracking-wider text-muted-foreground">Rate (%)</Label>
                                  <Input
                                    id="rate"
                                    type="number"
                                    step="0.01"
                                    value={addRateForm.data.rate}
                                    onChange={(e) =>
                                      addRateForm.setData('rate', parseFloat(e.target.value))
                                    }
                                    placeholder="7.5"
                                    className="h-11"
                                    required
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="country" className="text-xs uppercase tracking-wider text-muted-foreground">Country</Label>
                                  <Input
                                    id="country"
                                    value={addRateForm.data.country}
                                    onChange={(e) =>
                                      addRateForm.setData('country', e.target.value)
                                    }
                                    placeholder="US"
                                    className="h-11"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="state" className="text-xs uppercase tracking-wider text-muted-foreground">State/Province (Optional)</Label>
                                  <Input
                                    id="state"
                                    value={addRateForm.data.state}
                                    onChange={(e) =>
                                      addRateForm.setData('state', e.target.value)
                                    }
                                    placeholder="CA"
                                    className="h-11"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="postalCode" className="text-xs uppercase tracking-wider text-muted-foreground">Postal Code (Optional)</Label>
                                  <Input
                                    id="postalCode"
                                    value={addRateForm.data.postalCode}
                                    onChange={(e) =>
                                      addRateForm.setData('postalCode', e.target.value)
                                    }
                                    placeholder="90210"
                                    className="h-11"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="priority" className="text-xs uppercase tracking-wider text-muted-foreground">Priority</Label>
                                  <Input
                                    id="priority"
                                    type="number"
                                    value={addRateForm.data.priority}
                                    onChange={(e) =>
                                      addRateForm.setData('priority', parseInt(e.target.value))
                                    }
                                    className="h-11"
                                    required
                                  />
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="isCompound"
                                  checked={addRateForm.data.isCompound}
                                  onCheckedChange={(checked) =>
                                    addRateForm.setData('isCompound', checked)
                                  }
                                />
                                <Label htmlFor="isCompound">
                                  Compound rate (apply after other taxes)
                                </Label>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowAddRate(null)}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" disabled={addRateForm.processing}>
                                {addRateForm.processing ? 'Adding...' : 'Add Rate'}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {taxClass.rates.length === 0 ? (
                      <p className="text-muted-foreground text-center text-sm">
                        No tax rates configured
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Name</TableHead>
                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Rate</TableHead>
                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Country</TableHead>
                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">State</TableHead>
                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Postal Code</TableHead>
                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Priority</TableHead>
                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Compound</TableHead>
                            <TableHead className="w-24"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {taxClass.rates.map((rate) => (
                            <TableRow key={rate.id}>
                              {editingRate === rate.id ? (
                                <>
                                  <TableCell>
                                    <Input
                                      value={editRateForm.data.name}
                                      onChange={(e) =>
                                        editRateForm.setData('name', e.target.value)
                                      }
                                      className="w-32"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={editRateForm.data.rate}
                                      onChange={(e) =>
                                        editRateForm.setData('rate', parseFloat(e.target.value))
                                      }
                                      className="w-20"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      value={editRateForm.data.country}
                                      onChange={(e) =>
                                        editRateForm.setData('country', e.target.value)
                                      }
                                      className="w-20"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      value={editRateForm.data.state}
                                      onChange={(e) =>
                                        editRateForm.setData('state', e.target.value)
                                      }
                                      className="w-20"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      value={editRateForm.data.postalCode}
                                      onChange={(e) =>
                                        editRateForm.setData('postalCode', e.target.value)
                                      }
                                      className="w-20"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      value={editRateForm.data.priority}
                                      onChange={(e) =>
                                        editRateForm.setData('priority', parseInt(e.target.value))
                                      }
                                      className="w-16"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Switch
                                      checked={editRateForm.data.isCompound}
                                      onCheckedChange={(checked) =>
                                        editRateForm.setData('isCompound', checked)
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => setEditingRate(null)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleUpdateRate(rate.id)}
                                        disabled={editRateForm.processing}
                                      >
                                        <Save className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </>
                              ) : (
                                <>
                                  <TableCell className="text-sm font-medium">{rate.name}</TableCell>
                                  <TableCell className="text-sm">{rate.rate}%</TableCell>
                                  <TableCell className="text-sm">{rate.country}</TableCell>
                                  <TableCell className="text-sm">{rate.state || '-'}</TableCell>
                                  <TableCell className="text-sm">{rate.postalCode || '-'}</TableCell>
                                  <TableCell className="text-sm">{rate.priority}</TableCell>
                                  <TableCell>
                                    {rate.isCompound && <Badge variant="secondary">Yes</Badge>}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleEditRate(rate)}
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleDeleteRate(rate.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </AdminLayout>
  )
}
