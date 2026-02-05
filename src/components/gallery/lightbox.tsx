'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { GalleryItem } from '@/lib/gallery'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

// Helper function to extract YouTube video ID
function getYouTubeId(url: string): string | null {
  // This covers watch URLs, short URLs, and the embed URLs you are using
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) return match[2];
  
  // Fallback for embed URLs if the regex fails
  if (url.includes('youtube.com/embed/')) {
    return url.split('embed/')[1].split('?')[0];
  }
  return null;
}

// Helper function to extract Vimeo video ID
function getVimeoId(url: string): string | null {
  const regExp = /vimeo\.com\/(\d+)/
  const match = url.match(regExp)
  return match ? match[1] : null
}

interface LightboxProps {
  item: GalleryItem
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
  currentIndex: number
  totalItems: number
}

export function Lightbox({
  item,
  onClose,
  onPrevious,
  onNext,
  currentIndex,
  totalItems
}: LightboxProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrevious()
      if (e.key === 'ArrowRight') onNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onPrevious, onNext])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 sm:p-8 lg:p-16">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-50"
        aria-label="Close"
      >
        <X size={32} />
      </button>

      {/* Previous button */}
      {totalItems > 1 && (
        <button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition z-50"
          aria-label="Previous"
        >
          <ChevronLeft size={48} />
        </button>
      )}

      {/* Next button */}
      {totalItems > 1 && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition z-50"
          aria-label="Next"
        >
          <ChevronRight size={48} />
        </button>
      )}

      {/* Main content */}
      <div className="relative w-full h-full flex flex-col items-center justify-center px-4 sm:px-12 lg:px-16 pb-24 sm:pb-28">
        {item.type === 'url' && item.isExternal ? (
          // Handle external URL embeds (YouTube, Vimeo, etc.)
          (() => {
            const youtubeId = getYouTubeId(item.url)
            const vimeoId = getVimeoId(item.url)

            if (youtubeId) {
              return (
                <div className="relative w-full max-w-5xl aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title={item.title || 'YouTube video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full rounded-lg"
                  />
                </div>
              )
            } else if (vimeoId) {
              return (
                <div className="relative w-full max-w-5xl aspect-video">
                  <iframe
                    src={`https://player.vimeo.com/video/${vimeoId}`}
                    title={item.title || 'Vimeo video'}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full rounded-lg"
                  />
                </div>
              )
            } else {
              // Direct URL - check if it's an image or video
              const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(item.url)
              if (isImage) {
                return (
                  <div className="relative w-full h-[60vh] sm:h-[70vh] max-w-7xl">
                    <Image
                      src={item.url}
                      alt={item.title || item.filename}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      unoptimized
                    />
                  </div>
                )
              } else {
                return (
                  <video
                    src={item.url}
                    controls
                    className="max-w-7xl max-h-[60vh] sm:max-h-[70vh] w-full"
                    autoPlay
                  >
                    Your browser does not support video playback.
                  </video>
                )
              }
            }
          })()
        ) : item.type === 'image' ? (
          <div className="relative w-full h-[60vh] sm:h-[70vh] max-w-7xl">
            <Image
              src={item.url}
              alt={item.title || item.filename}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        ) : (
          <video
            src={item.url}
            controls
            className="max-w-7xl max-h-[60vh] sm:max-h-[70vh] w-full"
            autoPlay
          >
            Your browser does not support video playback.
          </video>
        )}
      </div>

      {/* Info section - fixed at bottom, not overlapping content */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm p-4 sm:p-6 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-12 lg:px-16">
          {item.title && (
            <h2 className="text-white text-lg sm:text-2xl font-bold mb-1 sm:mb-2 truncate">{item.title}</h2>
          )}
          {item.description && (
            <p className="text-gray-300 text-sm sm:text-base mb-1 sm:mb-2 line-clamp-2">{item.description}</p>
          )}
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
            <span className="capitalize">{item.category.replace(/-/g, ' ')}</span>
            <span>•</span>
            <span>{currentIndex} / {totalItems}</span>
            {item.featured && (
              <>
                <span>•</span>
                <span className="text-yellow-400">Featured</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-label="Close lightbox"
      />
    </div>,
    document.body
  )
}
