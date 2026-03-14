export const typographyComponents = {
  Heading: {
    fields: {
      text: { type: 'text' as const },
      level: {
        type: 'select' as const,
        options: [
          { label: 'H1', value: 'h1' },
          { label: 'H2', value: 'h2' },
          { label: 'H3', value: 'h3' },
          { label: 'H4', value: 'h4' },
        ],
      },
      align: {
        type: 'select' as const,
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
      },
    },
    defaultProps: { text: 'Heading', level: 'h2', align: 'left' },
    render: ({ text, level, align }: any) => {
      const Tag = level as keyof JSX.IntrinsicElements
      const sizeMap: Record<string, string> = {
        h1: 'text-4xl md:text-5xl font-bold tracking-tight',
        h2: 'text-3xl md:text-4xl font-bold tracking-tight',
        h3: 'text-2xl md:text-3xl font-semibold',
        h4: 'text-xl md:text-2xl font-semibold',
      }
      const alignMap: Record<string, string> = {
        left: 'text-left', center: 'text-center', right: 'text-right',
      }
      return <Tag className={`${sizeMap[level]} ${alignMap[align]}`}>{text}</Tag>
    },
  },

  Text: {
    fields: {
      text: { type: 'textarea' as const },
      size: {
        type: 'select' as const,
        options: [
          { label: 'Small', value: 'sm' },
          { label: 'Base', value: 'base' },
          { label: 'Large', value: 'lg' },
          { label: 'Extra Large', value: 'xl' },
        ],
      },
      align: {
        type: 'select' as const,
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
      },
      color: {
        type: 'select' as const,
        options: [
          { label: 'Default', value: 'default' },
          { label: 'Muted', value: 'muted' },
          { label: 'Primary', value: 'primary' },
        ],
      },
    },
    defaultProps: { text: 'Enter your text here...', size: 'base', align: 'left', color: 'default' },
    render: ({ text, size, align, color }: any) => {
      const sizeMap: Record<string, string> = {
        sm: 'text-sm', base: 'text-base', lg: 'text-lg', xl: 'text-xl',
      }
      const colorMap: Record<string, string> = {
        default: 'text-gray-900', muted: 'text-gray-500', primary: 'text-amber-700',
      }
      const alignMap: Record<string, string> = {
        left: 'text-left', center: 'text-center', right: 'text-right',
      }
      return (
        <p className={`${sizeMap[size]} ${colorMap[color]} ${alignMap[align]} leading-relaxed`}>
          {text}
        </p>
      )
    },
  },

  RichText: {
    fields: {
      html: { type: 'textarea' as const },
    },
    defaultProps: { html: '<p>Write your content here using HTML tags like <strong>bold</strong>, <em>italic</em>, <a href="#">links</a>, and more.</p>' },
    render: ({ html }: any) => (
      <div
        className="prose prose-gray max-w-none prose-headings:font-semibold prose-a:text-amber-700 prose-a:underline-offset-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    ),
  },
}
