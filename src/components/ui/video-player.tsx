'use client'

import { useState } from 'react'
import { Play, X } from 'lucide-react'

interface VideoPlayerProps {
  url: string
  title?: string
  thumbnail?: boolean
}

function getVideoType(url: string): 'youtube' | 'vimeo' | 'direct' {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('vimeo.com')) return 'vimeo'
  return 'direct'
}

function getYouTubeEmbedUrl(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (match) return `https://www.youtube.com/embed/${match[1]}`
  return url
}

function getVimeoEmbedUrl(url: string): string {
  const match = url.match(/vimeo\.com\/(\d+)/)
  if (match) return `https://player.vimeo.com/video/${match[1]}`
  return url
}

export function VideoPlayer({ url, title, thumbnail = false }: VideoPlayerProps) {
  const [showModal, setShowModal] = useState(false)
  const type = getVideoType(url)

  const renderPlayer = () => {
    switch (type) {
      case 'youtube':
        return (
          <iframe
            src={getYouTubeEmbedUrl(url)}
            title={title || 'Video'}
            className="w-full aspect-video rounded-xl"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )
      case 'vimeo':
        return (
          <iframe
            src={getVimeoEmbedUrl(url)}
            title={title || 'Video'}
            className="w-full aspect-video rounded-xl"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        )
      default:
        return (
          <video
            src={url}
            controls
            className="w-full aspect-video rounded-xl"
            title={title || 'Video'}
          />
        )
    }
  }

  if (thumbnail) {
    return (
      <>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowModal(true) }}
          className="flex items-center gap-1.5 text-sm text-pink-400 hover:text-pink-300 transition-colors"
          title="Watch video"
        >
          <Play className="w-4 h-4" />
          <span>Watch</span>
        </button>

        {showModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Video player'}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <div className="max-w-3xl w-full" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-2">
                {title && <p className="text-white font-semibold">{title}</p>}
                <button onClick={() => setShowModal(false)} aria-label="Close video" className="text-white hover:text-orange transition-colors ml-auto">
                  <X className="w-6 h-6" />
                </button>
              </div>
              {renderPlayer()}
            </div>
          </div>
        )}
      </>
    )
  }

  return renderPlayer()
}
