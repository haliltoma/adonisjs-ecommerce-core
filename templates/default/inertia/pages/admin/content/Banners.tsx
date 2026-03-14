import { Head } from '@inertiajs/react'
import { useState } from 'react'
import { router } from '@inertiajs/react'
import {
  Image,
  Plus,
  Trash2,
  Pencil,
  Calendar,
  Eye,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
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

interface BannerData {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string
  mobileImageUrl: string | null
  linkUrl: string | null
  linkTarget: string
  position: string | null
  sortOrder: number
  isActive: boolean
  startsAt: string | null
  endsAt: string | null
}

interface Props {
  banners: BannerData[]
}

const defaultForm = {
  title: '',
  subtitle: '',
  imageUrl: '',
  mobileImageUrl: '',
  linkUrl: '',
  linkTarget: '_self',
  position: '',
  sortOrder: 0,
  isActive: true,
  startsAt: '',
  endsAt: '',
}

export default function ContentBanners({ banners }: Props) {
  const [showCreate, setShowCreate] = useState(false)
  const [editingBanner, setEditingBanner] = useState<BannerData | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [submitting, setSubmitting] = useState(false)

  function resetForm() {
    setForm(defaultForm)
  }

  function setField(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    router.post(
      '/admin/content/banners',
      {
        title: form.title,
        subtitle: form.subtitle || null,
        imageUrl: form.imageUrl,
        mobileImageUrl: form.mobileImageUrl || null,
        linkUrl: form.linkUrl || null,
        linkTarget: form.linkTarget,
        position: form.position || null,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
      },
      {
        onSuccess: () => {
          setShowCreate(false)
          resetForm()
        },
        onFinish: () => setSubmitting(false),
      }
    )
  }

  function openEdit(banner: BannerData) {
    setEditingBanner(banner)
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl,
      mobileImageUrl: banner.mobileImageUrl || '',
      linkUrl: banner.linkUrl || '',
      linkTarget: banner.linkTarget,
      position: banner.position || '',
      sortOrder: banner.sortOrder,
      isActive: banner.isActive,
      startsAt: banner.startsAt ? banner.startsAt.substring(0, 16) : '',
      endsAt: banner.endsAt ? banner.endsAt.substring(0, 16) : '',
    })
  }

  function handleUpdate(e: React.FormEvent) {
    if (!editingBanner) return
    e.preventDefault()
    setSubmitting(true)
    router.patch(
      `/admin/content/banners/${editingBanner.id}`,
      {
        title: form.title,
        subtitle: form.subtitle || null,
        imageUrl: form.imageUrl,
        mobileImageUrl: form.mobileImageUrl || null,
        linkUrl: form.linkUrl || null,
        linkTarget: form.linkTarget,
        position: form.position || null,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
      },
      {
        onSuccess: () => {
          setEditingBanner(null)
          resetForm()
        },
        onFinish: () => setSubmitting(false),
      }
    )
  }

  function handleToggle(banner: BannerData) {
    router.patch(`/admin/content/banners/${banner.id}`, { isActive: !banner.isActive }, { preserveScroll: true })
  }

  function handleDelete(banner: BannerData) {
    if (!confirm(`Delete banner "${banner.title}"?`)) return
    router.delete(`/admin/content/banners/${banner.id}`, { preserveScroll: true })
  }

  const bannerForm = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Banner title" required />
      </div>
      <div className="space-y-2">
        <Label>Subtitle</Label>
        <Input value={form.subtitle} onChange={(e) => setField('subtitle', e.target.value)} placeholder="Optional subtitle" />
      </div>
      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input value={form.imageUrl} onChange={(e) => setField('imageUrl', e.target.value)} placeholder="https://..." required />
      </div>
      <div className="space-y-2">
        <Label>Mobile Image URL</Label>
        <Input value={form.mobileImageUrl} onChange={(e) => setField('mobileImageUrl', e.target.value)} placeholder="Optional mobile image" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Link URL</Label>
          <Input value={form.linkUrl} onChange={(e) => setField('linkUrl', e.target.value)} placeholder="/sale or https://..." />
        </div>
        <div className="space-y-2">
          <Label>Link Target</Label>
          <Select value={form.linkTarget} onValueChange={(v) => setField('linkTarget', v)}>
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
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Position</Label>
          <Select value={form.position} onValueChange={(v) => setField('position', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hero">Hero</SelectItem>
              <SelectItem value="top">Top Bar</SelectItem>
              <SelectItem value="sidebar">Sidebar</SelectItem>
              <SelectItem value="inline">Inline</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Sort Order</Label>
          <Input type="number" value={form.sortOrder} onChange={(e) => setField('sortOrder', Number(e.target.value))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Starts At</Label>
          <Input type="datetime-local" value={form.startsAt} onChange={(e) => setField('startsAt', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Ends At</Label>
          <Input type="datetime-local" value={form.endsAt} onChange={(e) => setField('endsAt', e.target.value)} />
        </div>
      </div>
    </div>
  )

  return (
    <AdminLayout
      title="Banners"
      description="Manage promotional banners and hero sections"
      actions={
        <Dialog
          open={showCreate}
          onOpenChange={(open) => {
            setShowCreate(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Banner</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              {bannerForm}
              <div className="mt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || !form.title.trim() || !form.imageUrl.trim()}>
                  {submitting ? 'Creating...' : 'Create Banner'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <Head title="Banners - Admin" />

      <div className="animate-fade-in space-y-6">
        {banners.length === 0 ? (
          <Card className="animate-fade-up">
            <CardContent className="py-16">
              <div className="flex flex-col items-center gap-4 text-center">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: '#e9b96e20' }}
                >
                  <Image className="h-8 w-8" style={{ color: '#d4872e' }} />
                </div>
                <div>
                  <h3 className="font-display text-lg">No banners yet</h3>
                  <p className="text-muted-foreground mt-1 max-w-md text-sm">
                    Create promotional banners for your storefront. Schedule campaigns and target specific pages.
                  </p>
                </div>
                <Button onClick={() => setShowCreate(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Banner
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {banners.map((banner) => (
              <Card key={banner.id} className="animate-fade-up overflow-hidden">
                {banner.imageUrl && (
                  <div className="relative aspect-video bg-muted">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                    <div className="absolute right-2 top-2 flex gap-1">
                      <Badge variant={banner.isActive ? 'default' : 'secondary'}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {banner.position && (
                        <Badge variant="outline" className="bg-background/80">
                          {banner.position}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{banner.title}</CardTitle>
                  {banner.subtitle && (
                    <CardDescription className="text-xs">{banner.subtitle}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {banner.linkUrl && (
                      <span className="flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        {banner.linkUrl}
                      </span>
                    )}
                    {(banner.startsAt || banner.endsAt) && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {banner.startsAt ? new Date(banner.startsAt).toLocaleDateString() : '...'} -{' '}
                        {banner.endsAt ? new Date(banner.endsAt).toLocaleDateString() : '...'}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggle(banner)}>
                      {banner.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(banner)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(banner)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Banner Dialog */}
      <Dialog
        open={!!editingBanner}
        onOpenChange={(open) => {
          if (!open) {
            setEditingBanner(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Banner</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            {bannerForm}
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingBanner(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !form.title.trim() || !form.imageUrl.trim()}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
