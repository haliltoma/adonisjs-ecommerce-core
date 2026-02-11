import * as React from 'react'
import { Upload, X, GripVertical, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MediaFile {
  id: string
  url: string
  name: string
  size?: number
  type?: string
}

interface MediaUploaderProps {
  value?: MediaFile[]
  onChange?: (files: MediaFile[]) => void
  onUpload?: (files: File[]) => Promise<MediaFile[]>
  accept?: string
  maxFiles?: number
  maxSize?: number
  className?: string
  disabled?: boolean
}

function MediaUploader({
  value = [],
  onChange,
  onUpload,
  accept = 'image/*',
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024,
  className,
  disabled,
}: MediaUploaderProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const dragCounter = React.useRef(0)

  const handleFiles = React.useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter((f) => {
        if (f.size > maxSize) return false
        return true
      })

      const remaining = maxFiles - value.length
      const toUpload = files.slice(0, remaining)

      if (toUpload.length === 0) return

      if (onUpload) {
        setIsUploading(true)
        try {
          const uploaded = await onUpload(toUpload)
          onChange?.([...value, ...uploaded])
        } finally {
          setIsUploading(false)
        }
      } else {
        const newFiles: MediaFile[] = toUpload.map((f) => ({
          id: crypto.randomUUID(),
          url: URL.createObjectURL(f),
          name: f.name,
          size: f.size,
          type: f.type,
        }))
        onChange?.([...value, ...newFiles])
      }
    },
    [value, onChange, onUpload, maxFiles, maxSize]
  )

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)
    if (!disabled && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const removeFile = (id: string) => {
    onChange?.(value.filter((f) => f.id !== id))
  }

  const moveFile = (fromIndex: number, toIndex: number) => {
    const updated = [...value]
    const [moved] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, moved)
    onChange?.(updated)
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div
        role="button"
        tabIndex={0}
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragging && 'border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed',
          !isDragging && !disabled && 'border-muted-foreground/25 hover:border-primary/50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <Upload className="mx-auto size-8 text-muted-foreground mb-2" />
        <p className="text-sm font-medium">
          {isUploading ? 'Uploading...' : 'Drop files here or click to upload'}
        </p>
        <p className="text-muted-foreground text-xs mt-1">
          Max {maxFiles} files, up to {Math.round(maxSize / 1024 / 1024)}MB each
        </p>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {value.map((file, index) => (
            <div
              key={file.id}
              className="group relative rounded-lg border overflow-hidden bg-muted/30"
            >
              <div className="aspect-square relative">
                {file.type?.startsWith('image/') || file.url.match(/\.(jpg|jpeg|png|gif|webp|svg)/i) ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <ImageIcon className="size-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-white hover:bg-white/20"
                    onClick={(e) => {
                      e.stopPropagation()
                      moveFile(index, index - 1)
                    }}
                  >
                    <GripVertical className="size-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(file.id)
                  }}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
              <p className="text-xs truncate p-1.5">{file.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { MediaUploader }
export type { MediaUploaderProps, MediaFile }
