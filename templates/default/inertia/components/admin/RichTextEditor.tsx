import * as React from 'react'
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Heading2, Quote, Code, Undo, Redo } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  minHeight?: number
}

function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Write something...',
  className,
  disabled,
  minHeight = 200,
}: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null)
  const isInternalUpdate = React.useRef(false)

  React.useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value
      }
    }
    isInternalUpdate.current = false
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      isInternalUpdate.current = true
      onChange?.(editorRef.current.innerHTML)
    }
  }

  const execCommand = (command: string, value?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    handleInput()
  }

  const toolbarItems = [
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { icon: Heading2, command: 'formatBlock', value: 'h2', title: 'Heading' },
    { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Quote' },
    { icon: Code, command: 'formatBlock', value: 'pre', title: 'Code' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Ordered List' },
    {
      icon: LinkIcon,
      command: 'createLink',
      title: 'Link',
      action: () => {
        const url = window.prompt('Enter URL:')
        if (url) execCommand('createLink', url)
      },
    },
    { icon: Undo, command: 'undo', title: 'Undo' },
    { icon: Redo, command: 'redo', title: 'Redo' },
  ]

  return (
    <div
      className={cn(
        'rounded-md border',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      <div className="flex flex-wrap gap-0.5 border-b p-1">
        {toolbarItems.map((item) => (
          <Button
            key={item.title}
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            title={item.title}
            onClick={() => {
              if (item.action) {
                item.action()
              } else {
                execCommand(item.command, item.value)
              }
            }}
          >
            <item.icon className="size-4" />
          </Button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        data-placeholder={placeholder}
        className={cn(
          'prose prose-sm max-w-none p-3 outline-none focus-visible:ring-0',
          'empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]'
        )}
        style={{ minHeight }}
      />
    </div>
  )
}

export { RichTextEditor }
export type { RichTextEditorProps }
