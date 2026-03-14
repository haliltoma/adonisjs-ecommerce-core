import { useState, useRef, useEffect } from 'react'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  webPSrc?: string
  sizes?: string
  srcSet?: string
  width?: number
  height?: number
  loading?: 'lazy' | 'eager'
}

export default function LazyImage({
  src,
  alt,
  className = '',
  placeholder,
  webPSrc,
  sizes,
  srcSet,
  width,
  height,
  loading = 'lazy',
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px', // Start loading 50px before viewport
      }
    )

    const currentRef = imgRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [])

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true)
  }

  // Handle image error
  const handleError = () => {
    console.error(`Failed to load image: ${src}`)
    setIsLoaded(true) // Still set loaded to remove placeholder
  }

  return (
    <div
      className={`lazy-image-container ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: width || '100%',
        height: height || 'auto',
      }}
    >
      {/* Placeholder or Blur-up */}
      {!isLoaded && placeholder && (
        <img
          src={placeholder}
          alt=""
          className="image-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(10px)',
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      )}

      {/* Actual Image */}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        sizes={sizes}
        srcSet={isInView ? srcSet : undefined}
      />

      {/* WebP version with fallback */}
      {webPSrc && (
        <picture
          style={{
            display: 'contents',
          }}
        >
          <source srcSet={isInView ? webPSrc : undefined} type="image/webp" />
          <img
            ref={imgRef}
            src={isInView ? src : undefined}
            alt={alt}
            loading={loading}
            onLoad={handleLoad}
            onError={handleError}
            style={{
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </picture>
      )}
    </div>
  )
}
