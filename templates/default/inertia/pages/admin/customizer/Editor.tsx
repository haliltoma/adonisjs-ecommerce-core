'use client'

import { Head } from '@inertiajs/react'
import { csrfFetch } from '@/lib/csrf'
import { useState, useCallback, useEffect, useRef, type ComponentType } from 'react'
import {
  ArrowLeft,
  Loader2,
  Save,
  Home,
  Package,
  Grid3X3,
  FolderOpen,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PageType } from '@/lib/puck/types'

interface PageData {
  id: string
  title: string
  slug: string
  content: Record<string, unknown> | null
  template: string
  pageType: string
  status: string
}

interface Props {
  page: PageData | null
  pageType: string
  error?: string
}

const emptyPuckData = { root: {}, content: [] }

const pageTypeLabels: Record<string, { label: string; icon: typeof Home }> = {
  home: { label: 'Home Page', icon: Home },
  product: { label: 'Product Page', icon: Package },
  category: { label: 'Category Page', icon: Grid3X3 },
  collection: { label: 'Collection Page', icon: FolderOpen },
}

export default function CustomizerEditor({ page, pageType, error: serverError }: Props) {
  const [PuckEditor, setPuckEditor] = useState<ComponentType<any> | null>(null)
  const [puckConfig, setPuckConfig] = useState<any>(null)
  const [loadError, setLoadError] = useState<string | null>(serverError || null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [currentPageType, setCurrentPageType] = useState<string>(pageType)

  const [plugins, setPlugins] = useState<any[]>([])

  const loadEditor = useCallback(() => {
    setLoadError(null)
    Promise.all([
      import('@puckeditor/core'),
      import('@puckeditor/core/puck.css'),
      import('@/lib/puck/index'),
      import('@/lib/puck/plugins/ai-plugin'),
    ]).then(([puckModule, , configModule, aiPluginModule]) => {
      setPuckEditor(() => puckModule.Puck)
      setPuckConfig(configModule.createPuckConfig(currentPageType as PageType))
      setPlugins([aiPluginModule.aiPlugin()])
    }).catch((err) => {
      console.error('Failed to load editor:', err)
      setLoadError(err?.message || 'Failed to load the editor.')
    })
  }, [currentPageType])

  useEffect(() => {
    loadEditor()
  }, [loadEditor])

  const handlePageTypeChange = (newType: string) => {
    setCurrentPageType(newType)
    window.location.href = `/admin/customizer/${newType}`
  }

  const handleSave = useCallback(async (puckData: any) => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await csrfFetch(`/admin/customizer/${currentPageType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: puckData,
          title: `${pageTypeLabels[currentPageType]?.label || currentPageType} Template`,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }, [currentPageType])

  const initialData = (page?.content as any) || emptyPuckData
  const PageIcon = pageTypeLabels[currentPageType]?.icon || Home
  const puckDataRef = useRef<any>(null)

  return (
    <>
      <Head title={`Customize ${pageTypeLabels[currentPageType]?.label || 'Page'} - Admin`} />

      <style>{`
        ._Puck-root {
          height: 100vh;
        }
        ._Puck-header {
          background: hsl(var(--background)) !important;
          border-bottom: 1px solid hsl(var(--border)) !important;
        }
        .customizer-bar {
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
        .customizer-bar + div {
          padding-top: 52px;
        }
        .customizer-wrapper {
          height: calc(100vh - 52px);
        }
        .customizer-wrapper ._Puck-root {
          height: 100%;
        }
      `}</style>

      <div className="customizer-bar">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <a href="/admin">
              <ArrowLeft className="h-4 w-4" />
            </a>
          </Button>

          <div className="h-5 w-px bg-border" />

          <div className="flex items-center gap-2">
            <PageIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Theme Customizer</span>
          </div>

          <Select value={currentPageType} onValueChange={handlePageTypeChange}>
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(pageTypeLabels).map(([key, { label, icon: Icon }]) => (
                <SelectItem key={key} value={key}>
                  <span className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {page && (
            <span className="text-xs text-muted-foreground">
              Last saved: {page.status === 'published' ? 'Published' : 'Draft'}
            </span>
          )}
        </div>
      </div>

      <div className="customizer-wrapper">
        {PuckEditor && puckConfig ? (
          <PuckEditor
            config={puckConfig}
            data={initialData}
            onChange={(data: any) => { puckDataRef.current = data }}
            onPublish={handleSave}
            plugins={plugins}
            overrides={{
              headerActions: () => (
                <Button
                  size="sm"
                  className="h-8"
                  disabled={saving}
                  onClick={() => handleSave(puckDataRef.current || initialData)}
                >
                  {saved ? (
                    <>
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                      Saved
                    </>
                  ) : saving ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-1.5 h-3.5 w-3.5" />
                      Save Template
                    </>
                  )}
                </Button>
              ),
            }}
          />
        ) : loadError ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium">{loadError}</p>
              <Button variant="outline" size="sm" onClick={loadEditor}>
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Loading customizer...</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
