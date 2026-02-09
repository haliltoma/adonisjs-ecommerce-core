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

interface Locale {
  id: string
  code: string
  name: string
  nativeName: string
  direction: string
  isDefault: boolean
  isActive: boolean
}

interface Props {
  locales: Locale[]
}

export default function Locales({ locales }: Props) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingLocale, setEditingLocale] = useState<string | null>(null)

  const addForm = useForm({
    code: '',
    name: '',
    nativeName: '',
    direction: 'ltr',
    isDefault: false,
    isActive: true,
  })

  const editForm = useForm({
    code: '',
    name: '',
    nativeName: '',
    direction: 'ltr',
    isDefault: false,
    isActive: true,
  })

  const handleAddLocale = (e: React.FormEvent) => {
    e.preventDefault()
    addForm.post('/admin/settings/locales', {
      onSuccess: () => {
        addForm.reset()
        setShowAddDialog(false)
      },
    })
  }

  const handleEditLocale = (locale: Locale) => {
    setEditingLocale(locale.id)
    editForm.setData({
      code: locale.code,
      name: locale.name,
      nativeName: locale.nativeName,
      direction: locale.direction,
      isDefault: locale.isDefault,
      isActive: locale.isActive,
    })
  }

  const handleUpdateLocale = (localeId: string) => {
    editForm.patch(`/admin/settings/locales/${localeId}`, {
      onSuccess: () => {
        setEditingLocale(null)
        editForm.reset()
      },
    })
  }

  const handleToggleActive = (localeId: string, isActive: boolean) => {
    router.patch(
      `/admin/settings/locales/${localeId}`,
      { isActive },
      { preserveScroll: true }
    )
  }

  return (
    <AdminLayout
      title="Locale Settings"
      description="Manage languages and locales for your store"
      actions={
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Locale
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display text-lg">Add Locale</DialogTitle>
              <DialogDescription>
                Add a new language/locale to your store
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddLocale}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-xs uppercase tracking-wider text-muted-foreground">Locale Code</Label>
                  <Input
                    id="code"
                    value={addForm.data.code}
                    onChange={(e) => addForm.setData('code', e.target.value.toLowerCase())}
                    placeholder="en-US"
                    className="h-11"
                    required
                  />
                  {addForm.errors.code && (
                    <p className="text-destructive text-sm">{addForm.errors.code}</p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    Use ISO language code (e.g., en-US, es-ES, fr-FR)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Name</Label>
                  <Input
                    id="name"
                    value={addForm.data.name}
                    onChange={(e) => addForm.setData('name', e.target.value)}
                    placeholder="English (United States)"
                    className="h-11"
                    required
                  />
                  <p className="text-muted-foreground text-xs">
                    Language name in English
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nativeName" className="text-xs uppercase tracking-wider text-muted-foreground">Native Name</Label>
                  <Input
                    id="nativeName"
                    value={addForm.data.nativeName}
                    onChange={(e) => addForm.setData('nativeName', e.target.value)}
                    placeholder="English (United States)"
                    className="h-11"
                    required
                  />
                  <p className="text-muted-foreground text-xs">
                    Language name in the native language
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direction" className="text-xs uppercase tracking-wider text-muted-foreground">Text Direction</Label>
                  <Select
                    value={addForm.data.direction}
                    onValueChange={(value) => addForm.setData('direction', value)}
                  >
                    <SelectTrigger id="direction" className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ltr">Left to Right (LTR)</SelectItem>
                      <SelectItem value="rtl">Right to Left (RTL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isDefault"
                    checked={addForm.data.isDefault}
                    onCheckedChange={(checked) => addForm.setData('isDefault', checked)}
                  />
                  <Label htmlFor="isDefault">Set as default locale</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={addForm.data.isActive}
                    onCheckedChange={(checked) => addForm.setData('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Enable this locale</Label>
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
                  {addForm.processing ? 'Adding...' : 'Add Locale'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <Head title="Locale Settings - Admin" />

      <div className="animate-fade-in">
        <Card className="animate-fade-up">
          <CardContent className="p-0">
            {locales.length === 0 ? (
              <div className="flex h-32 items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">No locales configured</p>
                  <p className="text-muted-foreground text-xs">Add a locale to get started</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Code</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Name</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Native Name</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Direction</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Active</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locales.map((locale) => (
                    <TableRow key={locale.id}>
                      {editingLocale === locale.id ? (
                        <>
                          <TableCell>
                            <Input
                              value={editForm.data.code}
                              onChange={(e) =>
                                editForm.setData('code', e.target.value.toLowerCase())
                              }
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editForm.data.name}
                              onChange={(e) => editForm.setData('name', e.target.value)}
                              className="w-48"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editForm.data.nativeName}
                              onChange={(e) => editForm.setData('nativeName', e.target.value)}
                              className="w-48"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={editForm.data.direction}
                              onValueChange={(value) => editForm.setData('direction', value)}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ltr">LTR</SelectItem>
                                <SelectItem value="rtl">RTL</SelectItem>
                              </SelectContent>
                            </Select>
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
                                onClick={() => setEditingLocale(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleUpdateLocale(locale.id)}
                                disabled={editForm.processing}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-mono text-sm font-medium">{locale.code}</TableCell>
                          <TableCell className="text-sm">{locale.name}</TableCell>
                          <TableCell className="text-sm">{locale.nativeName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="uppercase">
                              {locale.direction}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {locale.isDefault && <Badge className="bg-accent text-accent-foreground">Default</Badge>}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={locale.isActive}
                              onCheckedChange={(checked) => handleToggleActive(locale.id, checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditLocale(locale)}
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
