import { useState, useRef, useCallback } from 'react'
import { usePuck } from '@puckeditor/core'
import { csrfFetchJson } from '@/lib/csrf'

type Mode = 'text' | 'image'

export default function AiPanel() {
  const { dispatch, appState } = usePuck()
  const [mode, setMode] = useState<Mode>('text')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<any>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    setPreview(null)

    try {
      const data = await csrfFetchJson<{ data: any }>('/admin/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      setPreview(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [prompt])

  const handleImageAnalyze = useCallback(async () => {
    if (!imageFile) return
    setLoading(true)
    setError(null)
    setPreview(null)

    try {
      const formData = new FormData()
      formData.append('image', imageFile)

      const data = await csrfFetchJson<{ data: any }>('/admin/api/ai/image-to-component', {
        method: 'POST',
        body: formData,
      })
      setPreview(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [imageFile])

  const handleInsert = useCallback(() => {
    if (!preview?.content) return

    dispatch({
      type: 'setData',
      data: (prevData: any) => ({
        ...prevData,
        content: [...(prevData.content || []), ...preview.content],
      }),
    })

    setPreview(null)
    setPrompt('')
    setImageFile(null)
    setImagePreviewUrl(null)
  }, [preview, dispatch])

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
      setImageFile(file)
      setImagePreviewUrl(URL.createObjectURL(file))
    }
  }, [imagePreviewUrl])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
      setImageFile(file)
      setImagePreviewUrl(URL.createObjectURL(file))
    }
  }, [imagePreviewUrl])

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
      <div style={{ fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        AI Component Generator
      </div>

      {/* Mode Toggle */}
      <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', borderRadius: '6px', padding: '2px' }}>
        <button
          onClick={() => setMode('text')}
          style={{
            flex: 1,
            padding: '6px 12px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 500,
            background: mode === 'text' ? 'white' : 'transparent',
            boxShadow: mode === 'text' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
            color: mode === 'text' ? '#0f172a' : '#64748b',
          }}
        >
          Text Prompt
        </button>
        <button
          onClick={() => setMode('image')}
          style={{
            flex: 1,
            padding: '6px 12px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 500,
            background: mode === 'image' ? 'white' : 'transparent',
            boxShadow: mode === 'image' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
            color: mode === 'image' ? '#0f172a' : '#64748b',
          }}
        >
          From Image
        </button>
      </div>

      {/* Text Mode */}
      {mode === 'text' && (
        <>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the section you want to create...&#10;&#10;e.g., 'A hero section with a big heading, subtitle text, and two CTA buttons'"
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '8px 10px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '12px',
              resize: 'vertical',
              fontFamily: 'inherit',
              lineHeight: '1.5',
            }}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            style={{
              width: '100%',
              padding: '8px 16px',
              background: loading || !prompt.trim() ? '#94a3b8' : '#0f172a',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            {loading ? 'Generating...' : 'Generate Components'}
          </button>
        </>
      )}

      {/* Image Mode */}
      {mode === 'image' && (
        <>
          <div
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed #e2e8f0',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: '#fafafa',
            }}
          >
            {imagePreviewUrl ? (
              <img src={imagePreviewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px' }} />
            ) : (
              <div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ margin: '0 auto 8px' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p style={{ color: '#64748b', fontSize: '11px' }}>
                  Drop an image or click to upload
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
          <button
            onClick={handleImageAnalyze}
            disabled={loading || !imageFile}
            style={{
              width: '100%',
              padding: '8px 16px',
              background: loading || !imageFile ? '#94a3b8' : '#0f172a',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading || !imageFile ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            {loading ? 'Analyzing...' : 'Analyze & Generate'}
          </button>
        </>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: '8px 10px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#dc2626',
          fontSize: '11px',
        }}>
          {error}
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 500, fontSize: '12px' }}>Preview</span>
            <span style={{ color: '#64748b', fontSize: '11px' }}>
              {preview.content?.length || 0} component{(preview.content?.length || 0) !== 1 ? 's' : ''}
            </span>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '8px',
            maxHeight: '150px',
            overflow: 'auto',
            fontSize: '10px',
            fontFamily: 'monospace',
            lineHeight: '1.4',
          }}>
            {preview.content?.map((comp: any, i: number) => (
              <div key={i} style={{ padding: '2px 0', color: '#475569' }}>
                {comp.type}
                {comp.props?.title ? `: "${comp.props.title}"` : ''}
                {comp.props?.text ? `: "${comp.props.text.substring(0, 30)}..."` : ''}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
            <button
              onClick={handleInsert}
              style={{
                flex: 1,
                padding: '8px 16px',
                background: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              Insert into Page
            </button>
            <button
              onClick={() => setPreview(null)}
              style={{
                padding: '8px 12px',
                background: 'white',
                color: '#64748b',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
