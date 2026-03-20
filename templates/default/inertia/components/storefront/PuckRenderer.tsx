import { useState, useEffect, type ComponentType } from 'react'

interface PuckRendererProps {
  data: Record<string, unknown>
}

export function PuckRenderer({ data }: PuckRendererProps) {
  const [RenderComponent, setRenderComponent] = useState<ComponentType<any> | null>(null)
  const [config, setConfig] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
    Promise.all([
      import('@puckeditor/core'),
      import('@/lib/puck-config'),
    ]).then(([puckModule, configModule]) => {
      setRenderComponent(() => puckModule.Render)
      setConfig(configModule.puckConfig)
    }).catch((err) => {
      console.error('Failed to load Puck:', err)
      setError(err?.message || 'Failed to load editor')
    })
  }, [])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-destructive">Failed to load content</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!RenderComponent || !config) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
      </div>
    )
  }

  return <RenderComponent config={config} data={data} />
}
