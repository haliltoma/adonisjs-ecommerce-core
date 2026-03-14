import { useState } from 'react'

interface ProgressiveImageProps {
  src: string
  alt: string
  className?: string
  sizes?: {
    thumbnail?: string
    small?: string
    medium?: string
    large?: string
  }
  webPSizes?: {
    thumbnail?: string
    small?: string
    medium?: string
    large?: string
  }
}

export default function ProgressiveImage({
  src,
  alt,
  className = '',
  sizes,
  webPSizes,
}: ProgressiveImageProps) {
  const [currentSize, setCurrentSize] = useState<'thumbnail' | 'small' | 'medium' | 'large'>('thumbnail')
  const [isLoaded, setIsLoaded] = useState(false)

  const handleLoad = () => {
    setIsLoaded(true)
  }

  // Generate srcset for responsive images
  const generateSrcSet = (sizeMap: any) => {
    if (!sizeMap) return undefined

    return Object.entries(sizeMap)
      .map(([size, url], index) => {
        const width = size === 'thumbnail' ? 300 : size === 'small' ? 400 : size === 'medium' ? 800 : 1200
        return `${url} ${width}w`
      })
      .join(', ')
  }

  const regularSrcSet = generateSrcSet(sizes)
  const webPSrcSet = generateSrcSet(webPSizes)

  return (
    <div className={`progressive-image ${className}`}>
      {/* WebP with fallback */}
      {webPSrcSet ? (
        <picture>
          <source srcSet={webPSrcSet} type="image/webp" sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px" />
          <source
            srcSet={regularSrcSet}
            type="image/jpeg"
            sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
          />
          <img
            src={sizes?.medium || src}
            alt={alt}
            loading="lazy"
            onLoad={handleLoad}
            style={{
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
              width: '100%',
              height: 'auto',
            }}
          />
        </picture>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          srcSet={regularSrcSet}
          sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
          onLoad={handleLoad}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            width: '100%',
            height: 'auto',
          }}
        />
      )}
    </div>
  )
}
