import { Head, useForm, router } from '@inertiajs/react'
import { useState } from 'react'
import { Plus, Edit2, MapPin, Warehouse, Building2 } from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import { formatDateTime } from '@/lib/utils'

interface Location {
  id: string
  name: string
  code: string
  address: any
  isActive: boolean
  isFulfillmentCenter: boolean
  priority: number
  createdAt: string
}

interface Props {
  locations: Location[]
}

export default function Locations({ locations }: Props) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)

  const addForm = useForm({
    name: '',
    code: '',
    isActive: true,
    isFulfillmentCenter: false,
    priority: 1,
  })

  const editForm = useForm({
    name: '',
    code: '',
    isActive: true,
    isFulfillmentCenter: false,
    priority: 1,
  })

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault()
    addForm.post('/admin/inventory/locations', {
      onSuccess: () => {
        addForm.reset()
        setShowAddDialog(false)
      },
    })
  }

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location)
    editForm.setData({
      name: location.name,
      code: location.code,
      isActive: location.isActive,
      isFulfillmentCenter: location.isFulfillmentCenter,
      priority: location.priority,
    })
    setShowEditDialog(true)
  }

  const handleUpdateLocation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLocation) return

    editForm.patch(`/admin/inventory/locations/${editingLocation.id}`, {
      onSuccess: () => {
        editForm.reset()
        setShowEditDialog(false)
        setEditingLocation(null)
      },
    })
  }

  const formatAddress = (address: any) => {
    if (!address) return 'No address'
    const parts = []
    if (address.street) parts.push(address.street)
    if (address.city) parts.push(address.city)
    if (address.state) parts.push(address.state)
    if (address.postalCode) parts.push(address.postalCode)
    if (address.country) parts.push(address.country)
    return parts.length > 0 ? parts.join(', ') : 'No address'
  }

  return (
    <AdminLayout
      title="Inventory Locations"
      description="Manage warehouses and fulfillment centers"
      actions={
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display text-lg">Add Inventory Location</DialogTitle>
              <DialogDescription>
                Create a new warehouse or fulfillment center
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddLocation}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Location Name</Label>
                  <Input
                    id="name"
                    value={addForm.data.name}
                    onChange={(e) => addForm.setData('name', e.target.value)}
                    placeholder="Main Warehouse"
                    className="h-11"
                    required
                  />
                  {addForm.errors.name && (
                    <p className="text-destructive text-sm">{addForm.errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code" className="text-xs uppercase tracking-wider text-muted-foreground">Location Code</Label>
                  <Input
                    id="code"
                    value={addForm.data.code}
                    onChange={(e) =>
                      addForm.setData('code', e.target.value.toUpperCase())
                    }
                    placeholder="WH-001"
                    className="h-11"
                    required
                  />
                  {addForm.errors.code && (
                    <p className="text-destructive text-sm">{addForm.errors.code}</p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    Unique code to identify this location
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-xs uppercase tracking-wider text-muted-foreground">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    value={addForm.data.priority}
                    onChange={(e) => addForm.setData('priority', parseInt(e.target.value))}
                    className="h-11"
                    required
                  />
                  <p className="text-muted-foreground text-xs">
                    Lower numbers = higher priority for fulfillment
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFulfillmentCenter"
                    checked={addForm.data.isFulfillmentCenter}
                    onCheckedChange={(checked) =>
                      addForm.setData('isFulfillmentCenter', checked)
                    }
                  />
                  <Label htmlFor="isFulfillmentCenter">
                    This is a fulfillment center
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={addForm.data.isActive}
                    onCheckedChange={(checked) => addForm.setData('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Location is active</Label>
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
                  {addForm.processing ? 'Creating...' : 'Create Location'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <Head title="Inventory Locations - Admin" />

      <div className="animate-fade-in">
        {locations.length === 0 ? (
          <Card className="animate-fade-up">
            <CardContent className="flex h-48 items-center justify-center">
              <div className="text-center">
                <Warehouse className="mx-auto h-12 w-12" style={{ color: '#e9b96e' }} />
                <p className="text-muted-foreground mt-4 text-sm">
                  No inventory locations configured
                </p>
                <p className="text-muted-foreground text-xs">
                  Add a location to start tracking inventory
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {locations.map((location, index) => (
              <Card key={location.id} className={`card-hover animate-fade-up delay-${(index + 1) * 100} relative`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {location.isFulfillmentCenter ? (
                        <Warehouse className="h-5 w-5" style={{ color: '#d4872e' }} />
                      ) : (
                        <Building2 className="text-muted-foreground h-5 w-5" />
                      )}
                      <div>
                        <CardTitle className="font-display text-base">{location.name}</CardTitle>
                        <p className="text-muted-foreground mt-1 font-mono text-xs">
                          {location.code}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditLocation(location)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
                      <p className="text-muted-foreground text-sm">
                        {formatAddress(location.address)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {location.isActive ? (
                        <Badge className="bg-accent text-accent-foreground">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      {location.isFulfillmentCenter && (
                        <Badge variant="outline">Fulfillment Center</Badge>
                      )}
                      <Badge variant="outline">Priority: {location.priority}</Badge>
                    </div>

                    <div className="border-t pt-3">
                      <p className="text-muted-foreground text-xs">
                        Created {formatDateTime(location.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Edit Location</DialogTitle>
            <DialogDescription>
              Update location details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateLocation}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-xs uppercase tracking-wider text-muted-foreground">Location Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.data.name}
                  onChange={(e) => editForm.setData('name', e.target.value)}
                  placeholder="Main Warehouse"
                  className="h-11"
                  required
                />
                {editForm.errors.name && (
                  <p className="text-destructive text-sm">{editForm.errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-code" className="text-xs uppercase tracking-wider text-muted-foreground">Location Code</Label>
                <Input
                  id="edit-code"
                  value={editForm.data.code}
                  onChange={(e) =>
                    editForm.setData('code', e.target.value.toUpperCase())
                  }
                  placeholder="WH-001"
                  className="h-11"
                  required
                />
                {editForm.errors.code && (
                  <p className="text-destructive text-sm">{editForm.errors.code}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-priority" className="text-xs uppercase tracking-wider text-muted-foreground">Priority</Label>
                <Input
                  id="edit-priority"
                  type="number"
                  min="1"
                  value={editForm.data.priority}
                  onChange={(e) => editForm.setData('priority', parseInt(e.target.value))}
                  className="h-11"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isFulfillmentCenter"
                  checked={editForm.data.isFulfillmentCenter}
                  onCheckedChange={(checked) =>
                    editForm.setData('isFulfillmentCenter', checked)
                  }
                />
                <Label htmlFor="edit-isFulfillmentCenter">
                  This is a fulfillment center
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={editForm.data.isActive}
                  onCheckedChange={(checked) => editForm.setData('isActive', checked)}
                />
                <Label htmlFor="edit-isActive">Location is active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={editForm.processing}>
                {editForm.processing ? 'Updating...' : 'Update Location'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
