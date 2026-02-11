import * as React from 'react'
import { ChevronRight, Folder, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
  icon?: React.ReactNode
  data?: Record<string, unknown>
}

interface TreeViewProps {
  data: TreeNode[]
  selectedId?: string
  onSelect?: (node: TreeNode) => void
  expandedIds?: string[]
  onToggle?: (id: string) => void
  className?: string
}

function TreeView({
  data,
  selectedId,
  onSelect,
  expandedIds: controlledExpanded,
  onToggle,
  className,
}: TreeViewProps) {
  const [internalExpanded, setInternalExpanded] = React.useState<Set<string>>(new Set())

  const expanded = React.useMemo(() => {
    if (controlledExpanded) return new Set(controlledExpanded)
    return internalExpanded
  }, [controlledExpanded, internalExpanded])

  const toggleExpand = (id: string) => {
    if (onToggle) {
      onToggle(id)
    } else {
      setInternalExpanded((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    }
  }

  return (
    <div className={cn('text-sm', className)} role="tree">
      {data.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          level={0}
          selectedId={selectedId}
          expanded={expanded}
          onSelect={onSelect}
          onToggle={toggleExpand}
        />
      ))}
    </div>
  )
}

function TreeItem({
  node,
  level,
  selectedId,
  expanded,
  onSelect,
  onToggle,
}: {
  node: TreeNode
  level: number
  selectedId?: string
  expanded: Set<string>
  onSelect?: (node: TreeNode) => void
  onToggle: (id: string) => void
}) {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expanded.has(node.id)
  const isSelected = selectedId === node.id

  return (
    <div role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined}>
      <div
        className={cn(
          'flex items-center gap-1 rounded-md px-2 py-1.5 cursor-pointer hover:bg-accent',
          isSelected && 'bg-accent text-accent-foreground'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (hasChildren) onToggle(node.id)
          onSelect?.(node)
        }}
      >
        {hasChildren ? (
          <ChevronRight
            className={cn(
              'size-4 shrink-0 transition-transform',
              isExpanded && 'rotate-90'
            )}
          />
        ) : (
          <span className="size-4 shrink-0" />
        )}
        {node.icon || (hasChildren ? (
          isExpanded ? (
            <FolderOpen className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <Folder className="size-4 shrink-0 text-muted-foreground" />
          )
        ) : null)}
        <span className="truncate">{node.label}</span>
      </div>
      {hasChildren && isExpanded && (
        <div role="group">
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              expanded={expanded}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export { TreeView }
export type { TreeViewProps, TreeNode }
