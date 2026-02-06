'use client'

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  objectFit?: 'cover' | 'contain' | 'fill'
  aspectRatio?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  objectFit = 'cover',
  aspectRatio,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={aspectRatio ? { aspectRatio } : { width, height }}
    >
      {!error ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setError(true)
          }}
          className={`
            object-${objectFit}
            transition-opacity duration-500
            ${isLoading ? 'opacity-0' : 'opacity-100'}
          `}
        />
      ) : (
        <div className="w-full h-full bg-cyan-900/30 flex items-center justify-center">
          <p className="text-cyan-700 dark:text-white text-sm">Image unavailable</p>
        </div>
      )}

      {isLoading && !error && (
        <div className="absolute inset-0 bg-cyan-900/30 animate-pulse" />
      )}
    </div>
  )
}
