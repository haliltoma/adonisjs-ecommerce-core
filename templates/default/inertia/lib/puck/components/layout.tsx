export const layoutComponents = {
  Container: {
    fields: {
      maxWidth: {
        type: 'select' as const,
        options: [
          { label: 'Small (640px)', value: 'sm' },
          { label: 'Medium (768px)', value: 'md' },
          { label: 'Large (1024px)', value: 'lg' },
          { label: 'Extra Large (1280px)', value: 'xl' },
          { label: 'Full Width', value: 'full' },
        ],
      },
      padding: {
        type: 'select' as const,
        options: [
          { label: 'None', value: 'none' },
          { label: 'Small', value: 'sm' },
          { label: 'Medium', value: 'md' },
          { label: 'Large', value: 'lg' },
          { label: 'Extra Large', value: 'xl' },
        ],
      },
      background: {
        type: 'select' as const,
        options: [
          { label: 'None', value: 'none' },
          { label: 'White', value: 'white' },
          { label: 'Light Gray', value: 'gray' },
          { label: 'Dark', value: 'dark' },
          { label: 'Primary', value: 'primary' },
        ],
      },
    },
    defaultProps: {
      maxWidth: 'xl',
      padding: 'md',
      background: 'none',
    },
    render: ({ maxWidth, padding, background, puck }: any) => {
      const maxWidthMap: Record<string, string> = {
        sm: 'max-w-screen-sm',
        md: 'max-w-screen-md',
        lg: 'max-w-screen-lg',
        xl: 'max-w-screen-xl',
        full: 'w-full',
      }
      const paddingMap: Record<string, string> = {
        none: '',
        sm: 'py-4 px-4',
        md: 'py-8 px-6',
        lg: 'py-12 px-8',
        xl: 'py-16 px-8',
      }
      const bgMap: Record<string, string> = {
        none: '',
        white: 'bg-white',
        gray: 'bg-gray-50',
        dark: 'bg-gray-900 text-white',
        primary: 'bg-amber-50',
      }

      return (
        <div className={`mx-auto ${maxWidthMap[maxWidth]} ${paddingMap[padding]} ${bgMap[background]}`}>
          {puck.renderDropZone({ zone: 'content' })}
        </div>
      )
    },
  },

  Columns: {
    fields: {
      columns: {
        type: 'select' as const,
        options: [
          { label: '2 Columns', value: '2' },
          { label: '3 Columns', value: '3' },
          { label: '4 Columns', value: '4' },
          { label: '2/3 + 1/3', value: '2-1' },
          { label: '1/3 + 2/3', value: '1-2' },
        ],
      },
      gap: {
        type: 'select' as const,
        options: [
          { label: 'None', value: 'none' },
          { label: 'Small', value: 'sm' },
          { label: 'Medium', value: 'md' },
          { label: 'Large', value: 'lg' },
        ],
      },
    },
    defaultProps: {
      columns: '2',
      gap: 'md',
    },
    render: ({ columns, gap, puck }: any) => {
      const gapMap: Record<string, string> = {
        none: 'gap-0',
        sm: 'gap-4',
        md: 'gap-6',
        lg: 'gap-8',
      }

      const gridMap: Record<string, string> = {
        '2': 'grid-cols-1 md:grid-cols-2',
        '3': 'grid-cols-1 md:grid-cols-3',
        '4': 'grid-cols-2 md:grid-cols-4',
        '2-1': 'grid-cols-1 md:grid-cols-3',
        '1-2': 'grid-cols-1 md:grid-cols-3',
      }

      const colCount = columns === '2-1' || columns === '1-2' ? 2 : Number(columns)

      return (
        <div className={`grid ${gridMap[columns]} ${gapMap[gap]}`}>
          {Array.from({ length: colCount }).map((_, i) => (
            <div
              key={i}
              className={
                columns === '2-1' ? (i === 0 ? 'md:col-span-2' : '') :
                columns === '1-2' ? (i === 1 ? 'md:col-span-2' : '') : ''
              }
            >
              {puck.renderDropZone({ zone: `column-${i}` })}
            </div>
          ))}
        </div>
      )
    },
  },

  Spacer: {
    fields: {
      size: {
        type: 'select' as const,
        options: [
          { label: 'Extra Small (8px)', value: 'xs' },
          { label: 'Small (16px)', value: 'sm' },
          { label: 'Medium (32px)', value: 'md' },
          { label: 'Large (48px)', value: 'lg' },
          { label: 'Extra Large (64px)', value: 'xl' },
          { label: '2XL (96px)', value: '2xl' },
        ],
      },
    },
    defaultProps: { size: 'md' },
    render: ({ size }: any) => {
      const sizeMap: Record<string, string> = {
        xs: 'h-2', sm: 'h-4', md: 'h-8', lg: 'h-12', xl: 'h-16', '2xl': 'h-24',
      }
      return <div className={sizeMap[size]} />
    },
  },

  Divider: {
    fields: {
      style: {
        type: 'select' as const,
        options: [
          { label: 'Solid', value: 'solid' },
          { label: 'Dashed', value: 'dashed' },
          { label: 'Dotted', value: 'dotted' },
        ],
      },
    },
    defaultProps: { style: 'solid' },
    render: ({ style }: any) => (
      <hr className="my-6 border-gray-200" style={{ borderStyle: style }} />
    ),
  },
}
