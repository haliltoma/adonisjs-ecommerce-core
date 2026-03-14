export const mediaComponents = {
  Image: {
    fields: {
      src: { type: 'text' as const },
      alt: { type: 'text' as const },
      aspectRatio: {
        type: 'select' as const,
        options: [
          { label: 'Auto', value: 'auto' },
          { label: '16:9', value: '16/9' },
          { label: '4:3', value: '4/3' },
          { label: '1:1', value: '1/1' },
          { label: '3:4', value: '3/4' },
        ],
      },
      rounded: {
        type: 'select' as const,
        options: [
          { label: 'None', value: 'none' },
          { label: 'Small', value: 'sm' },
          { label: 'Medium', value: 'md' },
          { label: 'Large', value: 'lg' },
          { label: 'Full', value: 'full' },
        ],
      },
    },
    defaultProps: { src: '', alt: '', aspectRatio: 'auto', rounded: 'md' },
    render: ({ src, alt, aspectRatio, rounded }: any) => {
      const roundedMap: Record<string, string> = {
        none: '', sm: 'rounded-sm', md: 'rounded-lg', lg: 'rounded-xl', full: 'rounded-full',
      }
      if (!src) {
        return (
          <div className={`flex items-center justify-center bg-gray-100 ${roundedMap[rounded]} text-gray-400 min-h-[200px]`}
            style={aspectRatio !== 'auto' ? { aspectRatio } : undefined}
          >
            <span className="text-sm">Add image URL</span>
          </div>
        )
      }
      return (
        <img
          src={src}
          alt={alt}
          className={`w-full object-cover ${roundedMap[rounded]}`}
          style={aspectRatio !== 'auto' ? { aspectRatio } : undefined}
        />
      )
    },
  },

  Video: {
    fields: {
      url: { type: 'text' as const },
      aspectRatio: {
        type: 'select' as const,
        options: [
          { label: '16:9', value: '16/9' },
          { label: '4:3', value: '4/3' },
          { label: '1:1', value: '1/1' },
        ],
      },
    },
    defaultProps: { url: '', aspectRatio: '16/9' },
    render: ({ url, aspectRatio }: any) => {
      if (!url) {
        return (
          <div className="flex items-center justify-center bg-gray-100 rounded-lg text-gray-400 min-h-[200px]" style={{ aspectRatio }}>
            <span className="text-sm">Add video URL (YouTube or Vimeo)</span>
          </div>
        )
      }
      let embedUrl = url
      try {
        if (url.includes('youtube.com/watch')) {
          const id = new URL(url).searchParams.get('v')
          if (id) embedUrl = `https://www.youtube.com/embed/${id}`
        } else if (url.includes('youtu.be/')) {
          const id = url.split('youtu.be/')[1]?.split('?')[0]
          if (id) embedUrl = `https://www.youtube.com/embed/${id}`
        } else if (url.includes('vimeo.com/')) {
          const id = url.split('vimeo.com/')[1]?.split('?')[0]
          if (id) embedUrl = `https://player.vimeo.com/video/${id}`
        }
      } catch {
        // Invalid URL, use as-is
      }
      return (
        <div className="rounded-lg overflow-hidden" style={{ aspectRatio }}>
          <iframe src={embedUrl} className="w-full h-full" allowFullScreen frameBorder="0" />
        </div>
      )
    },
  },

  ImageGallery: {
    fields: {
      images: { type: 'textarea' as const },
      columns: {
        type: 'select' as const,
        options: [
          { label: '2 Columns', value: '2' },
          { label: '3 Columns', value: '3' },
          { label: '4 Columns', value: '4' },
        ],
      },
    },
    defaultProps: { images: '', columns: '3' },
    render: ({ images, columns }: any) => {
      const imageList = images.split('\n').filter(Boolean)
      const gridMap: Record<string, string> = {
        '2': 'grid-cols-2', '3': 'grid-cols-2 md:grid-cols-3', '4': 'grid-cols-2 md:grid-cols-4',
      }
      if (imageList.length === 0) {
        return (
          <div className="flex items-center justify-center bg-gray-100 rounded-lg text-gray-400 min-h-[200px]">
            <span className="text-sm">Enter image URLs (one per line)</span>
          </div>
        )
      }
      return (
        <div className={`grid ${gridMap[columns]} gap-4`}>
          {imageList.map((src: string, i: number) => (
            <img key={i} src={src} alt="" className="w-full aspect-square object-cover rounded-lg" />
          ))}
        </div>
      )
    },
  },
}
