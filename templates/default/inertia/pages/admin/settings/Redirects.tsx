import { router, useForm } from '@inertiajs/react'
import { useState } from 'react'
import { ArrowRight, ExternalLink, Plus, Search, Trash2 } from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface Redirect {
  id: string
  fromPath: string
  toPath: string
  type: 'permanent' | 'temporary'
  isActive: boolean
  hitCount: number
  lastHitAt: string | null
  createdAt: string
}

interface Props {
  redirects: {
    data: Redirect[]
    meta: { total: number; perPage: number; currentPage: number; lastPage: number }
  }
  filters: { search: string }
}

export default function Redirects({ redirects, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '')
  const [showCreate, setShowCreate] = useState(false)

  const createForm = useForm({
    fromPath: '',
    toPath: '',
    type: 'permanent' as 'permanent' | 'temporary',
  })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.get('/admin/settings/redirects', { search }, { preserveState: true })
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    createForm.post('/admin/settings/redirects', {
      onSuccess: () => {
        setShowCreate(false)
        createForm.reset()
      },
    })
  }

  function handleToggle(redirect: Redirect) {
    router.patch(`/admin/settings/redirects/${redirect.id}`, {
      isActive: !redirect.isActive,
    }, { preserveState: true })
  }

  function handleDelete(id: string) {
    if (confirm('Delete this redirect?')) {
      router.delete(`/admin/settings/redirects/${id}`)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="URL Redirects"
          description="Manage URL redirects to prevent broken links and improve SEO."
          actions={
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Add Redirect</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Redirect</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label>From Path</Label>
                    <Input
                      value={createForm.data.fromPath}
                      onChange={(e) => createForm.setData('fromPath', e.target.value)}
                      placeholder="/old-page"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>To Path</Label>
                    <Input
                      value={createForm.data.toPath}
                      onChange={(e) => createForm.setData('toPath', e.target.value)}
                      placeholder="/new-page"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={createForm.data.type}
                      onValueChange={(v) => createForm.setData('type', v as 'permanent' | 'temporary')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="permanent">Permanent (301)</SelectItem>
                        <SelectItem value="temporary">Temporary (302)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={createForm.processing} className="w-full">
                    {createForm.processing ? 'Creating...' : 'Create Redirect'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          }
        />

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search paths..."
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead></TableHead>
                <TableHead>To</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Hits</TableHead>
                <TableHead>Active</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {redirects.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No redirects found
                  </TableCell>
                </TableRow>
              ) : (
                redirects.data.map((redirect) => (
                  <TableRow key={redirect.id}>
                    <TableCell className="font-mono text-sm">{redirect.fromPath}</TableCell>
                    <TableCell>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {redirect.toPath.startsWith('http') ? (
                        <span className="flex items-center gap-1">
                          {redirect.toPath}
                          <ExternalLink className="h-3 w-3" />
                        </span>
                      ) : (
                        redirect.toPath
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={redirect.type === 'permanent' ? 'default' : 'secondary'}>
                        {redirect.type === 'permanent' ? '301' : '302'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {redirect.hitCount || 0}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={redirect.isActive}
                        onCheckedChange={() => handleToggle(redirect)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(redirect.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {redirects.meta.lastPage > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: redirects.meta.lastPage }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === redirects.meta.currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => router.get('/admin/settings/redirects', { page, search: filters.search }, { preserveState: true })}
              >
                {page}
              </Button>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
