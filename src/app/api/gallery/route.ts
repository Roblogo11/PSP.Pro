import { NextRequest, NextResponse } from 'next/server'
import { getGalleryItems, getGalleryCategories, getAllMedia, GALLERY_TYPES } from '@/lib/gallery'
import type { GalleryType, GalleryItem } from '@/lib/gallery'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') as GalleryType | null
    const category = searchParams.get('category')

    if (!type || !GALLERY_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid gallery type' }, { status: 400 })
    }

    const primaryItems = getGalleryItems(type, category || undefined)
    const categories = getGalleryCategories(type)

    const { items: allMedia } = getAllMedia()
    const crossTaggedItems: GalleryItem[] = []

    allMedia.forEach(item => {
      if (item.primaryGallery === type) return
      if (item.galleries && item.galleries.includes(type)) {
        if (category && item.category !== category) return
        crossTaggedItems.push(item)
      }
    })

    const existingIds = new Set(primaryItems.map(item => item.id))
    const combinedItems = [
      ...primaryItems,
      ...crossTaggedItems.filter(item => !existingIds.has(item.id))
    ]

    combinedItems.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())

    return NextResponse.json({ items: combinedItems, categories })
  } catch (error) {
    console.error('Gallery fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 })
  }
}
