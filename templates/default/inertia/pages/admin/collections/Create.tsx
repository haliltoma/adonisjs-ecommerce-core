import { Head, Link, useForm } from '@inertiajs/react'
import { ArrowLeft, Save } from 'lucide-react'
import { FormEvent, useEffect } from 'react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { slugify } from '@/lib/utils'

export default function CreateCollection() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    isActive: true,
    sortOrder: 0,
  })

  useEffect(() => {
    if (data.name && !data.slug) {
      setData('slug', slugify(data.name))
    }
  }, [data.name])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    post('/admin/collections')
  }

  return (
    <AdminLayout
      title="Create Collection"
      description="Add a new product collection"
      actions={
        <Button variant="outline" asChild>
          <Link href="/admin/collections">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      }
    >
      <Head title="Create Collection - Admin" />

      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6 animate-fade-in">
        <Card className="animate-fade-up delay-100">
          <CardHeader>
            <CardTitle className="font-display text-lg">Collection Information</CardTitle>
            <CardDescription>
              Basic information about the collection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="Summer Collection"
                  required
                  className="h-11 border-border/60 focus-visible:border-accent"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Slug <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="slug"
                  value={data.slug}
                  onChange={(e) => setData('slug', e.target.value)}
                  placeholder="summer-collection"
                  required
                  className="h-11 border-border/60 focus-visible:border-accent"
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Collection description..."
                rows={4}
                className="border-border/60 focus-visible:border-accent"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={data.imageUrl}
                onChange={(e) => setData('imageUrl', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="h-11 border-border/60 focus-visible:border-accent"
              />
              {errors.imageUrl && (
                <p className="text-sm text-destructive">{errors.imageUrl}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={data.sortOrder}
                onChange={(e) => setData('sortOrder', Number(e.target.value))}
                placeholder="0"
                className="h-11 border-border/60 focus-visible:border-accent"
              />
              {errors.sortOrder && (
                <p className="text-sm text-destructive">{errors.sortOrder}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up delay-200">
          <CardHeader>
            <CardTitle className="font-display text-lg">Status</CardTitle>
            <CardDescription>Control collection visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active</Label>
                <p className="text-muted-foreground text-[11px] tracking-wide">
                  Make this collection visible to customers
                </p>
              </div>
              <Switch
                id="isActive"
                checked={data.isActive}
                onCheckedChange={(checked) => setData('isActive', checked)}
              />
            </div>
            {errors.isActive && (
              <p className="text-sm text-destructive mt-2">{errors.isActive}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4 animate-fade-up delay-300">
          <Button variant="outline" asChild type="button">
            <Link href="/admin/collections">Cancel</Link>
          </Button>
          <Button type="submit" disabled={processing} className="tracking-wide">
            <Save className="mr-2 h-4 w-4" />
            Create Collection
          </Button>
        </div>
      </form>
    </AdminLayout>
  )
}
