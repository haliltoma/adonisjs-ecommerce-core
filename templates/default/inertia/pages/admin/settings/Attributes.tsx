import { Head, router, useForm } from '@inertiajs/react'
import { useState } from 'react'
import {
  Edit,
  GripVertical,
  MoreHorizontal,
  Plus,
  Settings,
  Trash,
  X,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

interface AttributeOption {
  id: string
  value: string
  label: string
  sortOrder: number
}

interface Attribute {
  id: string
  name: string
  slug: string
  type: 'text' | 'select' | 'multiselect' | 'boolean' | 'number' | 'color'
  isFilterable: boolean
  isVisible: boolean
  isRequired: boolean
  sortOrder: number
  options: AttributeOption[]
}

interface Props {
  attributes: Attribute[]
}

export default function AttributesPage({ attributes }: Props) {
  const [showCreate, setShowCreate] = useState(false)
  const [editingAttr, setEditingAttr] = useState<Attribute | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const form = useForm({
    name: '',
    type: 'text' as Attribute['type'],
    isFilterable: false,
    isVisible: true,
    isRequired: false,
    options: [] as string[],
  })

  const openCreate = () => {
    form.reset()
    setOptions([])
    setEditingAttr(null)
    setShowCreate(true)
  }

  const openEdit = (attr: Attribute) => {
    form.setData({
      name: attr.name,
      type: attr.type,
      isFilterable: attr.isFilterable,
      isVisible: attr.isVisible,
      isRequired: attr.isRequired,
      options: attr.options.map((o) => o.value),
    })
    setOptions(attr.options.map((o) => o.value))
    setEditingAttr(attr)
    setShowCreate(true)
  }

  const addOption = () => {
    setOptions([...options, ''])
  }

  const updateOption = (index: number, value: string) => {
    const updated = [...options]
    updated[index] = value
    setOptions(updated)
    form.setData('options', updated.filter(Boolean))
  }

  const removeOption = (index: number) => {
    const updated = options.filter((_, i) => i !== index)
    setOptions(updated)
    form.setData('options', updated.filter(Boolean))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    form.setData('options', options.filter(Boolean))
    if (editingAttr) {
      form.patch(`/admin/settings/attributes/${editingAttr.id}`, {
        onSuccess: () => { setShowCreate(false); form.reset() },
      })
    } else {
      form.post('/admin/settings/attributes', {
        onSuccess: () => { setShowCreate(false); form.reset() },
      })
    }
  }

  const deleteAttribute = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      router.delete(`/admin/settings/attributes/${id}`)
    }
  }

  const showOptions = ['select', 'multiselect', 'color'].includes(form.data.type)

  return (
    <AdminLayout
      title="Product Attributes"
      description="Define custom attributes for your products"
      actions={
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />Add Attribute
        </Button>
      }
    >
      <Head title="Attributes - Admin" />
      <div className="animate-fade-in">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Attribute</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Options</TableHead>
                  <TableHead className="text-xs">Filterable</TableHead>
                  <TableHead className="text-xs">Visible</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {attributes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Settings className="text-muted-foreground h-8 w-8" />
                        <p className="text-muted-foreground text-sm">No attributes defined</p>
                        <Button size="sm" variant="outline" onClick={openCreate}>Add your first attribute</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  attributes.map((attr) => (
                    <TableRow key={attr.id}>
                      <TableCell>
                        <p className="text-sm font-medium">{attr.name}</p>
                        <p className="text-muted-foreground text-[11px]">{attr.slug}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px] capitalize">{attr.type}</Badge>
                      </TableCell>
                      <TableCell>
                        {attr.options.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {attr.options.slice(0, 3).map((o) => (
                              <Badge key={o.id} variant="secondary" className="text-[10px]">{o.value}</Badge>
                            ))}
                            {attr.options.length > 3 && (
                              <Badge variant="outline" className="text-[10px]">+{attr.options.length - 3}</Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={attr.isFilterable ? 'default' : 'secondary'} className="text-[10px]">
                          {attr.isFilterable ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={attr.isVisible ? 'default' : 'secondary'} className="text-[10px]">
                          {attr.isVisible ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(attr)}>
                              <Edit className="mr-2 h-4 w-4" />Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => deleteAttribute(attr.id, attr.name)}>
                              <Trash className="mr-2 h-4 w-4" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingAttr ? 'Edit Attribute' : 'Add Attribute'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="e.g. Color, Size, Material" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.data.type} onValueChange={(v) => form.setData('type', v as Attribute['type'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="multiselect">Multi-select</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="color">Color</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {showOptions && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Options</Label>
                  <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={addOption}>
                    <Plus className="mr-1 h-3 w-3" />Add
                  </Button>
                </div>
                <div className="space-y-1.5">
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input value={opt} onChange={(e) => updateOption(i, e.target.value)} placeholder={`Option ${i + 1}`} className="text-sm" />
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeOption(i)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Filterable</Label>
                <Switch checked={form.data.isFilterable} onCheckedChange={(v) => form.setData('isFilterable', v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Visible on product page</Label>
                <Switch checked={form.data.isVisible} onCheckedChange={(v) => form.setData('isVisible', v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Required</Label>
                <Switch checked={form.data.isRequired} onCheckedChange={(v) => form.setData('isRequired', v)} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={form.processing}>{editingAttr ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
