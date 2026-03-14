import { Head } from '@inertiajs/react'
import { useState } from 'react'
import { router } from '@inertiajs/react'
import {
  Menu as MenuIcon,
  Plus,
  Trash2,
  Pencil,
  GripVertical,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Link2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
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

interface MenuItemData {
  id: string
  title: string
  url: string | null
  type: string
  target: string
  parentId: string | null
  sortOrder: number
  isActive: boolean
}

interface MenuData {
  id: string
  name: string
  slug: string
  location: string | null
  isActive: boolean
  itemCount: number
  items: MenuItemData[]
  updatedAt: string | null
}

interface Props {
  menus: MenuData[]
}

export default function ContentMenus({ menus }: Props) {
  const [showCreate, setShowCreate] = useState(false)
  const [editingMenu, setEditingMenu] = useState<MenuData | null>(null)
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)
  const [showAddItem, setShowAddItem] = useState<string | null>(null)

  // Create menu form state
  const [createName, setCreateName] = useState('')
  const [createSlug, setCreateSlug] = useState('')
  const [createLocation, setCreateLocation] = useState('')
  const [creating, setCreating] = useState(false)

  // Edit menu form state
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [saving, setSaving] = useState(false)

  // Add item form state
  const [itemTitle, setItemTitle] = useState('')
  const [itemUrl, setItemUrl] = useState('')
  const [itemType, setItemType] = useState('link')
  const [itemTarget, setItemTarget] = useState('_self')
  const [addingItem, setAddingItem] = useState(false)

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    router.post(
      '/admin/content/menus',
      { name: createName, slug: createSlug || slugify(createName), location: createLocation || null, isActive: true },
      {
        onSuccess: () => {
          setShowCreate(false)
          setCreateName('')
          setCreateSlug('')
          setCreateLocation('')
        },
        onFinish: () => setCreating(false),
      }
    )
  }

  function openEditMenu(menu: MenuData) {
    setEditingMenu(menu)
    setEditName(menu.name)
    setEditSlug(menu.slug)
    setEditLocation(menu.location || '')
  }

  function handleUpdateMenu(e: React.FormEvent) {
    if (!editingMenu) return
    e.preventDefault()
    setSaving(true)
    router.patch(
      `/admin/content/menus/${editingMenu.id}`,
      { name: editName, slug: editSlug, location: editLocation || null },
      {
        onSuccess: () => setEditingMenu(null),
        onFinish: () => setSaving(false),
      }
    )
  }

  function handleToggleMenu(menu: MenuData) {
    router.patch(`/admin/content/menus/${menu.id}`, { isActive: !menu.isActive }, { preserveScroll: true })
  }

  function handleDeleteMenu(menu: MenuData) {
    if (!confirm(`Delete menu "${menu.name}"? This will also delete all its items.`)) return
    router.delete(`/admin/content/menus/${menu.id}`, { preserveScroll: true })
  }

  function handleAddItem(e: React.FormEvent, menuId: string) {
    e.preventDefault()
    setAddingItem(true)
    router.post(
      `/admin/content/menus/${menuId}/items`,
      { title: itemTitle, url: itemUrl || null, type: itemType, target: itemTarget, isActive: true, sortOrder: 0 },
      {
        preserveScroll: true,
        onSuccess: () => {
          setShowAddItem(null)
          setItemTitle('')
          setItemUrl('')
          setItemType('link')
          setItemTarget('_self')
        },
        onFinish: () => setAddingItem(false),
      }
    )
  }

  function handleToggleItem(menuId: string, item: MenuItemData) {
    router.patch(`/admin/content/menus/${menuId}/items/${item.id}`, { isActive: !item.isActive }, { preserveScroll: true })
  }

  function handleDeleteItem(menuId: string, itemId: string) {
    if (!confirm('Delete this menu item?')) return
    router.delete(`/admin/content/menus/${menuId}/items/${itemId}`, { preserveScroll: true })
  }

  return (
    <AdminLayout
      title="Navigation Menus"
      description="Manage your store's navigation menus"
      actions={
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Menu
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Menu</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={createName}
                  onChange={(e) => {
                    setCreateName(e.target.value)
                    if (!createSlug) setCreateSlug(slugify(e.target.value))
                  }}
                  placeholder="e.g. Main Navigation"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={createSlug || slugify(createName)}
                  onChange={(e) => setCreateSlug(e.target.value)}
                  placeholder="main-navigation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select value={createLocation} onValueChange={setCreateLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating || !createName.trim()}>
                  {creating ? 'Creating...' : 'Create Menu'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <Head title="Menus - Admin" />

      <div className="animate-fade-in space-y-6">
        {menus.length === 0 ? (
          <Card className="animate-fade-up">
            <CardContent className="py-16">
              <div className="flex flex-col items-center gap-4 text-center">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: '#e9b96e20' }}
                >
                  <MenuIcon className="h-8 w-8" style={{ color: '#d4872e' }} />
                </div>
                <div>
                  <h3 className="font-display text-lg">No menus yet</h3>
                  <p className="text-muted-foreground mt-1 max-w-md text-sm">
                    Create your first navigation menu to organize header, footer, and sidebar links.
                  </p>
                </div>
                <Button onClick={() => setShowCreate(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Menu
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          menus.map((menu) => (
            <Card key={menu.id} className="animate-fade-up">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setExpandedMenu(expandedMenu === menu.id ? null : menu.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {expandedMenu === menu.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <CardTitle className="text-base">{menu.name}</CardTitle>
                    {menu.location && (
                      <Badge variant="secondary" className="text-xs">
                        {menu.location}
                      </Badge>
                    )}
                    <Badge variant={menu.isActive ? 'default' : 'outline'} className="text-xs">
                      {menu.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {menu.itemCount} item{menu.itemCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleMenu(menu)}
                      title={menu.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {menu.isActive ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditMenu(menu)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteMenu(menu)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedMenu === menu.id && (
                <CardContent className="border-t pt-4">
                  <div className="space-y-2">
                    {menu.items.length === 0 ? (
                      <p className="text-muted-foreground py-4 text-center text-sm">
                        No items in this menu yet.
                      </p>
                    ) : (
                      menu.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg border px-3 py-2"
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical className="text-muted-foreground h-4 w-4" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{item.title}</span>
                                {!item.isActive && (
                                  <Badge variant="outline" className="text-xs">
                                    Inactive
                                  </Badge>
                                )}
                              </div>
                              {item.url && (
                                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                                  <Link2 className="h-3 w-3" />
                                  {item.url}
                                  {item.target === '_blank' && (
                                    <ExternalLink className="h-3 w-3" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleToggleItem(menu.id, item)}
                            >
                              {item.isActive ? (
                                <ToggleRight className="h-3.5 w-3.5" />
                              ) : (
                                <ToggleLeft className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => handleDeleteItem(menu.id, item.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Add Item Form */}
                    {showAddItem === menu.id ? (
                      <form
                        onSubmit={(e) => handleAddItem(e, menu.id)}
                        className="mt-3 space-y-3 rounded-lg border bg-muted/30 p-3"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Title</Label>
                            <Input
                              value={itemTitle}
                              onChange={(e) => setItemTitle(e.target.value)}
                              placeholder="Link title"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">URL</Label>
                            <Input
                              value={itemUrl}
                              onChange={(e) => setItemUrl(e.target.value)}
                              placeholder="/about or https://..."
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Type</Label>
                            <Select value={itemType} onValueChange={setItemType}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="link">Link</SelectItem>
                                <SelectItem value="page">Page</SelectItem>
                                <SelectItem value="category">Category</SelectItem>
                                <SelectItem value="product">Product</SelectItem>
                                <SelectItem value="collection">Collection</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Target</Label>
                            <Select value={itemTarget} onValueChange={setItemTarget}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="_self">Same Window</SelectItem>
                                <SelectItem value="_blank">New Tab</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowAddItem(null)
                              setItemTitle('')
                              setItemUrl('')
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" size="sm" disabled={addingItem || !itemTitle.trim()}>
                            {addingItem ? 'Adding...' : 'Add Item'}
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => setShowAddItem(menu.id)}
                      >
                        <Plus className="mr-2 h-3.5 w-3.5" />
                        Add Menu Item
                      </Button>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Edit Menu Dialog */}
      <Dialog open={!!editingMenu} onOpenChange={(open) => !open && setEditingMenu(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateMenu} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-slug">Slug</Label>
              <Input
                id="edit-slug"
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Select value={editLocation} onValueChange={setEditLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">Header</SelectItem>
                  <SelectItem value="footer">Footer</SelectItem>
                  <SelectItem value="sidebar">Sidebar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingMenu(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !editName.trim()}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
