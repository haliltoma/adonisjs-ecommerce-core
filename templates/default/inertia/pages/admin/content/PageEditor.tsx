import { Head, router } from '@inertiajs/react'
import { useState, useCallback, useEffect, useRef, type ComponentType } from 'react'
import {
  ArrowLeft,
  Save,
  Globe,
  FileText,
  Settings2,
  Trash,
  Eye,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { slugify } from '@/lib/utils'

interface PageData {
  id: string
  title: string
  slug: string
  content: Record<string, unknown> | null
  template: string
  status: 'draft' | 'published'
  isSystem: boolean
  metaTitle: string | null
  metaDescription: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

interface Props {
  page: PageData | null
}

const emptyPuckData = { root: {}, content: [] }

export default function PageEditor({ page }: Props) {
  const isEditing = !!page
  const [title, setTitle] = useState(page?.title || '')
  const [slug, setSlug] = useState(page?.slug || '')
  const [status, setStatus] = useState<string>(page?.status || 'draft')
  const [template, setTemplate] = useState(page?.template || 'default')
  const [metaTitle, setMetaTitle] = useState(page?.metaTitle || '')
  const [metaDescription, setMetaDescription] = useState(page?.metaDescription || '')
  const [saving, setSaving] = useState(false)
  const [PuckEditor, setPuckEditor] = useState<ComponentType<any> | null>(null)
  const [puckConfig, setPuckConfig] = useState<any>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      import('@puckeditor/core'),
      import('@puckeditor/core/puck.css'),
      import('@/lib/puck-config'),
    ]).then(([puckModule, , configModule]) => {
      if (!cancelled) {
        setPuckEditor(() => puckModule.Puck)
        setPuckConfig(configModule.puckConfig)
      }
    })
    return () => { cancelled = true }
  }, [])

  const initialData = (page?.content as any) || emptyPuckData

  const slugManuallyEdited = useRef(isEditing)
  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle)
    if (!slugManuallyEdited.current) {
      setSlug(slugify(newTitle))
    }
  }, [])

  const handleSave = useCallback((puckData: any) => {
    if (!title.trim()) {
      alert('Please enter a page title')
      return
    }
    if (!slug.trim()) {
      alert('Please enter a page slug')
      return
    }

    setSaving(true)

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      content: puckData,
      template,
      status,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
    }

    if (isEditing) {
      router.patch(`/admin/content/pages/${page.id}`, payload, {
        onFinish: () => setSaving(false),
      })
    } else {
      router.post('/admin/content/pages', payload, {
        onFinish: () => setSaving(false),
      })
    }
  }, [title, slug, template, status, metaTitle, metaDescription, isEditing, page])

  const handleDelete = useCallback(() => {
    if (!page) return
    if (confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      router.delete(`/admin/content/pages/${page.id}`)
    }
  }, [page])

  return (
    <>
      <Head title={`${isEditing ? `Edit: ${page.title}` : 'Create Page'} - Admin`} />

      <style>{`
        /* Override Puck styles for better integration */
        ._Puck-root {
          height: 100vh;
        }
        ._Puck-header {
          background: hsl(var(--background)) !important;
          border-bottom: 1px solid hsl(var(--border)) !important;
        }
        /* Custom header bar above puck */
        .page-editor-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          background: hsl(var(--background));
          border-bottom: 1px solid hsl(var(--border));
          gap: 12px;
        }
        .page-editor-bar + div {
          padding-top: 52px;
        }
        /* Make puck fill below the bar */
        .puck-editor-wrapper {
          height: calc(100vh - 52px);
        }
        .puck-editor-wrapper ._Puck-root {
          height: 100%;
        }
      `}</style>

      <div className="page-editor-bar">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <a href="/admin/content/pages">
              <ArrowLeft className="h-4 w-4" />
            </a>
          </Button>

          <div className="h-5 w-px bg-border" />

          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Page title..."
              className="h-8 w-48 border-0 bg-transparent px-1 text-sm font-medium shadow-none focus-visible:ring-0 focus-visible:bg-muted/50 rounded"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {page?.slug && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
              <a href={`/pages/${page.slug}`} target="_blank" rel="noopener">
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                Preview
              </a>
            </Button>
          )}

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                Settings
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Page Settings</SheetTitle>
                <SheetDescription>
                  Configure page metadata and SEO settings
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Page title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    URL Slug
                  </Label>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground text-sm">/pages/</span>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => { slugManuallyEdited.current = true; setSlug(e.target.value) }}
                      placeholder="page-url"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Template
                  </Label>
                  <Select value={template} onValueChange={setTemplate}>
                    <SelectTrigger id="template">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="full-width">Full Width</SelectItem>
                      <SelectItem value="landing">Landing Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    SEO Settings
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="metaTitle" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Meta Title
                      </Label>
                      <Input
                        id="metaTitle"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        placeholder={title || 'Page title'}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        {metaTitle.length}/60 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="metaDescription" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Meta Description
                      </Label>
                      <Textarea
                        id="metaDescription"
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder="Page description for search engines..."
                        rows={3}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        {metaDescription.length}/160 characters
                      </p>
                    </div>
                  </div>
                </div>

                {/* SEO Preview */}
                {(metaTitle || title) && (
                  <div className="border-t pt-6">
                    <h3 className="text-sm font-semibold mb-3">Search Preview</h3>
                    <div className="rounded-lg border bg-white p-4 space-y-1">
                      <p className="text-blue-600 text-sm font-medium truncate">
                        {metaTitle || title}
                      </p>
                      <p className="text-green-700 text-xs">
                        yourstore.com/pages/{slug || 'page-url'}
                      </p>
                      {(metaDescription) && (
                        <p className="text-gray-600 text-xs line-clamp-2">
                          {metaDescription}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {isEditing && !page.isSystem && (
                  <div className="border-t pt-6">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      className="w-full"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete Page
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="puck-editor-wrapper">
        {PuckEditor && puckConfig ? (
          <PuckEditor
            config={puckConfig}
            data={initialData}
            onPublish={handleSave}
            overrides={{
              headerActions: () => (
                <Button size="sm" className="h-8" disabled={saving}>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  {saving ? 'Saving...' : isEditing ? 'Save' : 'Create'}
                </Button>
              ),
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Loading editor...</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
