import { useState, useEffect, type ComponentType } from 'react'
import StorefrontLayout from '../../components/storefront/StorefrontLayout'
import { ArticleSeo } from '../../components/shared/Seo'

interface Props {
  store: { name: string; logoUrl: string | null }
  page: {
    title: string
    slug: string
    content: string | null
    puckContent: Record<string, unknown> | null
    template?: string
    metaTitle?: string
    metaDescription?: string
  }
}

function PuckRenderer({ data }: { data: Record<string, unknown> }) {
  const [RenderComponent, setRenderComponent] = useState<ComponentType<any> | null>(null)
  const [config, setConfig] = useState<any>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      import('@puckeditor/core'),
      import('@/lib/puck-config'),
    ]).then(([puckModule, configModule]) => {
      if (!cancelled) {
        setRenderComponent(() => puckModule.Render)
        setConfig(configModule.puckConfig)
      }
    })
    return () => { cancelled = true }
  }, [])

  if (!RenderComponent || !config) {
    return <div className="flex justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
    </div>
  }

  return <RenderComponent config={config} data={data} />
}

export default function Page({ store, page }: Props) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const isFullWidth = page.template === 'full-width' || page.template === 'landing'

  return (
    <StorefrontLayout>
      <ArticleSeo
        title={page.metaTitle || page.title}
        content={page.content || undefined}
        storeName={store.name}
        baseUrl={baseUrl}
        slug={page.slug}
      />

      {/* Puck content */}
      {page.puckContent ? (
        <div className={isFullWidth ? '' : 'mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'}>
          {!isFullWidth && (
            <div className="mb-8 text-center animate-fade-up">
              <h1 className="font-display text-4xl sm:text-5xl tracking-tight">
                {page.title}
              </h1>
            </div>
          )}
          <div className="animate-fade-up delay-100">
            <PuckRenderer data={page.puckContent} />
          </div>
        </div>
      ) : (
        <>
          {/* Hero */}
          <section className="relative py-20 grain">
            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
              <div className="animate-fade-up">
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                  {store.name}
                </span>
                <h1 className="font-display text-4xl sm:text-5xl tracking-tight mt-3">
                  {page.title}
                </h1>
              </div>
            </div>
          </section>

          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
            {page.content && (
              <div
                className="prose prose-lg max-w-none prose-headings:font-display prose-a:text-accent prose-a:no-underline hover:prose-a:underline animate-fade-up delay-200"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            )}
          </div>
        </>
      )}
    </StorefrontLayout>
  )
}
