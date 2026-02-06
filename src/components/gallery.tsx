'use client'

import { useState } from 'react'
import { X, Play, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface GalleryItem {
  id: number
  type: 'image' | 'video'
  title: string
  category: string
  thumbnail: string
  url: string
  description?: string
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    type: 'image',
    title: 'Pitching Mechanics Session',
    category: 'Training',
    thumbnail: 'https://images.unsplash.com/photo-1556055078-0d563c7f7fb8?w=800&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1556055078-0d563c7f7fb8?w=1200&auto=format&fit=crop',
    description: '1-on-1 pitching mechanics breakdown with velocity tracking',
  },
  {
    id: 2,
    type: 'image',
    title: 'Hitting Development',
    category: 'Training',
    thumbnail: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=1200&auto=format&fit=crop',
    description: 'Power development and swing mechanics training',
  },
  {
    id: 3,
    type: 'image',
    title: 'Speed & Agility Training',
    category: 'Training',
    thumbnail: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200&auto=format&fit=crop',
    description: 'Group speed and agility session',
  },
  {
    id: 4,
    type: 'image',
    title: 'Training Facility - Indoor Cages',
    category: 'Facility',
    thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop',
    description: 'Our state-of-the-art indoor batting cages',
  },
  {
    id: 5,
    type: 'image',
    title: 'Velocity Tracking Technology',
    category: 'Facility',
    thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&auto=format&fit=crop',
    description: 'Advanced radar technology for precise velocity measurement',
  },
  {
    id: 6,
    type: 'image',
    title: 'Athlete Success',
    category: 'Athletes',
    thumbnail: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop',
    url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&auto=format&fit=crop',
    description: 'Celebrating another velocity milestone!',
  },
]

const CATEGORIES = ['All', ...Array.from(new Set(GALLERY_ITEMS.map(item => item.category)))]

export function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filteredItems = GALLERY_ITEMS.filter(
    item => selectedCategory === 'All' || item.category === selectedCategory
  )

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
  }

  const nextImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredItems.length)
    }
  }

  const prevImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length)
    }
  }

  return (
    <div>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-8 justify-center">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              selectedCategory === category
                ? 'bg-orange text-white shadow-lg shadow-orange/30'
                : 'glass-card-hover text-slate-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer glass-card-hover"
            onClick={() => openLightbox(index)}
          >
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-xs text-cyan font-semibold mb-1">{item.category}</p>
                <h3 className="text-white font-bold text-lg">{item.title}</h3>
              </div>
            </div>

            {/* Type Icon */}
            <div className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {item.type === 'video' ? (
                <Play className="w-5 h-5 text-white" />
              ) : (
                <ImageIcon className="w-5 h-5 text-white" />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation */}
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation()
                prevImage()
              }}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={filteredItems[lightboxIndex].url}
                alt={filteredItems[lightboxIndex].title}
                className="w-full h-full object-contain rounded-xl"
              />

              {/* Info */}
              <div className="mt-4 text-center">
                <p className="text-sm text-cyan font-semibold mb-1">
                  {filteredItems[lightboxIndex].category}
                </p>
                <h3 className="text-xl font-bold text-white mb-2">
                  {filteredItems[lightboxIndex].title}
                </h3>
                {filteredItems[lightboxIndex].description && (
                  <p className="text-cyan-700 dark:text-white">{filteredItems[lightboxIndex].description}</p>
                )}
                <p className="text-sm text-cyan-800 dark:text-white mt-2">
                  {lightboxIndex + 1} / {filteredItems.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
