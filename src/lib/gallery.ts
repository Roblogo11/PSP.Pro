import fs from 'fs'
import path from 'path'

export const GALLERY_TYPES = [
  'training-drills', 'athlete-progress', 'facility',
  'session-highlights', 'testimonials', 'equipment', 'events'
] as const

export type GalleryType = typeof GALLERY_TYPES[number]

export interface GalleryItem {
  id: string
  filename: string
  url: string
  thumbnail: string
  category: string
  type: 'image' | 'video' | 'url'
  uploadDate: string
  title?: string
  description?: string
  featured?: boolean
  isExternal?: boolean
  galleries?: GalleryType[]
  primaryGallery?: GalleryType
}

interface GalleryStats {
  total: number
  byType: Record<GalleryType, number>
  byCategory: Record<string, number>
}

interface GalleryData {
  items: GalleryItem[]
  categories: string[]
}

const GALLERIES_JSON_PATH = path.join(process.cwd(), 'public', 'data', 'galleries.json')
const MEDIA_DIR = path.join(process.cwd(), 'public', 'media')

export const isImageFile = (filename: string) => /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(filename)
export const isVideoFile = (filename: string) => /\.(mp4|webm|ogg|mov)$/i.test(filename)

// Cache for galleries data
let galleriesCache: Record<GalleryType, GalleryData> | null = null
let cacheTime = 0
const CACHE_TTL = 5000 // 5 second cache

function loadGalleriesJson(): Record<GalleryType, GalleryData> {
  const now = Date.now()
  if (galleriesCache && (now - cacheTime) < CACHE_TTL) {
    return galleriesCache
  }

  try {
    if (fs.existsSync(GALLERIES_JSON_PATH)) {
      const data = JSON.parse(fs.readFileSync(GALLERIES_JSON_PATH, 'utf8'))
      galleriesCache = data
      cacheTime = now
      return data
    }
  } catch (error) {
    console.error('Failed to load galleries.json:', error)
  }

  // Return empty structure if file doesn't exist
  const emptyData: Record<GalleryType, GalleryData> = {} as any
  GALLERY_TYPES.forEach(type => {
    emptyData[type] = { items: [], categories: [] }
  })
  return emptyData
}

function saveGalleriesJson(data: Record<GalleryType, GalleryData>): void {
  try {
    const dir = path.dirname(GALLERIES_JSON_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(GALLERIES_JSON_PATH, JSON.stringify(data, null, 2))
    galleriesCache = data
    cacheTime = Date.now()
  } catch (error) {
    console.error('Failed to save galleries.json:', error)
  }
}

export function getGalleryItems(galleryType: GalleryType, category?: string): GalleryItem[] {
  const galleries = loadGalleriesJson()
  const galleryData = galleries[galleryType]

  if (!galleryData || !galleryData.items) {
    return []
  }

  let items = [...galleryData.items]

  if (category && category !== 'all') {
    items = items.filter(item => item.category === category)
  }

  return items.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
}

export function getGalleryCategories(galleryType: GalleryType): string[] {
  const galleries = loadGalleriesJson()
  const galleryData = galleries[galleryType]

  if (!galleryData || !galleryData.categories) {
    return []
  }

  return galleryData.categories
}

export function getAllMedia(): { items: GalleryItem[], stats: GalleryStats } {
  const galleries = loadGalleriesJson()
  const items: GalleryItem[] = []
  const stats: GalleryStats = {
    total: 0,
    byType: {} as Record<GalleryType, number>,
    byCategory: {}
  }

  for (const galleryType of GALLERY_TYPES) {
    const galleryData = galleries[galleryType]
    if (galleryData && galleryData.items) {
      items.push(...galleryData.items)
      stats.byType[galleryType] = galleryData.items.length
    } else {
      stats.byType[galleryType] = 0
    }
  }

  stats.total = items.length
  items.forEach(item => {
    stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1
  })

  return { items, stats }
}

export function updateMediaMetadata(id: string, updates: Partial<GalleryItem>): boolean {
  try {
    const galleries = loadGalleriesJson()
    let found = false

    for (const galleryType of GALLERY_TYPES) {
      const galleryData = galleries[galleryType]
      if (!galleryData || !galleryData.items) continue

      const itemIndex = galleryData.items.findIndex(item => item.id === id)
      if (itemIndex !== -1) {
        galleryData.items[itemIndex] = { ...galleryData.items[itemIndex], ...updates }
        found = true
        break
      }
    }

    if (found) {
      saveGalleriesJson(galleries)
      return true
    }

    return false
  } catch (error) {
    console.error('Failed to update metadata:', error)
    return false
  }
}

export function deleteMediaItem(id: string): boolean {
  try {
    const galleries = loadGalleriesJson()
    let found = false
    let deletedItem: GalleryItem | null = null

    for (const galleryType of GALLERY_TYPES) {
      const galleryData = galleries[galleryType]
      if (!galleryData || !galleryData.items) continue

      const itemIndex = galleryData.items.findIndex(item => item.id === id)
      if (itemIndex !== -1) {
        deletedItem = galleryData.items[itemIndex]
        galleryData.items.splice(itemIndex, 1)

        // Update categories if needed
        const remainingCategories = new Set(galleryData.items.map(item => item.category))
        galleryData.categories = Array.from(remainingCategories).sort()

        found = true
        break
      }
    }

    if (found && deletedItem) {
      // If it's a local file (not external), try to delete the physical file
      if (!deletedItem.isExternal && deletedItem.type !== 'url') {
        const parts = id.split('/')
        if (parts.length >= 3) {
          const filePath = path.join(MEDIA_DIR, id)
          const thumbPath = path.join(MEDIA_DIR, parts[0], parts[1], 'thumbs', parts[2])

          if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
          if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath)
        }
      }

      saveGalleriesJson(galleries)
      return true
    }

    return false
  } catch (error) {
    console.error('Failed to delete media:', error)
    return false
  }
}
