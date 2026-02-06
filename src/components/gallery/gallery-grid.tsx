'use client'

import { useState } from 'react'
import Image from 'next/image'
import { GalleryItem } from '@/lib/gallery'
import { Lightbox } from './lightbox'
import { ImageOff, Play, Video } from 'lucide-react'

// Helper to extract YouTube video ID
function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  if (match && match[2].length === 11) return match[2]
  if (url.includes('youtube.com/embed/')) {
    return url.split('embed/')[1].split('?')[0]
  }
  return null
}

// Get best thumbnail URL for any media type
function getBestThumbnail(item: GalleryItem): string | null {
  // For YouTube videos, generate thumbnail from video ID
  const youtubeId = getYouTubeId(item.url)
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
  }

  // For direct image URLs or valid thumbnails
  if (item.thumbnail && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.thumbnail)) {
    return item.thumbnail
  }

  // For external image URLs, use the URL directly
  if (item.isExternal && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.url)) {
    return item.url
  }

  return item.thumbnail || null
}

interface GalleryGridProps {
  items: GalleryItem[]
  columns?: 2 | 3 | 4
}

function ThumbnailImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-dark-100">
        <ImageOff className="w-12 h-12 text-gray-600 dark:text-gray-400 mb-2" />
        <span className="text-gray-700 dark:text-gray-400 text-xs">Image unavailable</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover transition-opacity group-hover:opacity-80"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      onError={() => setError(true)}
      unoptimized={src.startsWith('http')}
    />
  )
}

export function GalleryGrid({ items, columns = 3 }: GalleryGridProps) {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const handleItemClick = (item: GalleryItem, index: number) => {
    setSelectedItem(item)
    setLightboxIndex(index)
  }

  const handleClose = () => {
    setSelectedItem(null)
  }

  const handlePrevious = () => {
    const newIndex = lightboxIndex > 0 ? lightboxIndex - 1 : items.length - 1
    setLightboxIndex(newIndex)
    setSelectedItem(items[newIndex])
  }

  const handleNext = () => {
    const newIndex = lightboxIndex < items.length - 1 ? lightboxIndex + 1 : 0
    setLightboxIndex(newIndex)
    setSelectedItem(items[newIndex])
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No media items yet. Upload some to get started!</p>
      </div>
    )
  }

  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4'
  }

  return (
    <>
      <div className={`grid grid-cols-1 ${gridCols[columns]} gap-6`}>
        {items.map((item, index) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item, index)}
            className="group relative aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105"
          >
            {item.type === 'image' ? (
              <ThumbnailImage
                src={item.thumbnail}
                alt={item.title || item.filename}
              />
            ) : item.type === 'url' && item.isExternal ? (
              (() => {
                const thumbUrl = getBestThumbnail(item)
                const isVideoUrl = item.url.includes('youtube') || item.url.includes('vimeo') || item.url.endsWith('.mp4')

                if (thumbUrl) {
                  return (
                    <div className="relative w-full h-full">
                      <ThumbnailImage
                        src={thumbUrl}
                        alt={item.title || item.filename}
                      />
                      {/* Play icon overlay for video URLs */}
                      {isVideoUrl && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center">
                            <Play className="w-7 h-7 text-white fill-white ml-1" />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }

                return (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-dark-100">
                    <Video className="w-12 h-12 text-gray-700 dark:text-gray-400 mb-2" />
                    <span className="text-gray-700 dark:text-gray-400 text-xs">External Media</span>
                  </div>
                )
              })()
            ) : (
              <div className="w-full h-full relative">
                <ThumbnailImage
                  src={item.thumbnail}
                  alt={item.title || item.filename}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center">
                    <Play className="w-7 h-7 text-white fill-white ml-1" />
                  </div>
                </div>
              </div>
            )}

            {/* Overlay with title */}
            {item.title && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-medium text-sm line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </div>
            )}

            {/* Featured badge */}
            {item.featured && (
              <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                FEATURED
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedItem && (
        <Lightbox
          item={selectedItem}
          onClose={handleClose}
          onPrevious={handlePrevious}
          onNext={handleNext}
          currentIndex={lightboxIndex + 1}
          totalItems={items.length}
        />
      )}
    </>
  )
}
