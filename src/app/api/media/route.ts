import { NextRequest, NextResponse } from 'next/server'
import { getAllMedia, updateMediaMetadata, deleteMediaItem, GALLERY_TYPES, type GalleryType } from '@/lib/gallery'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

if (!ADMIN_PASSWORD) {
  console.error('ADMIN_PASSWORD environment variable is required')
}

function isAuthorized(request: NextRequest): boolean {
  if (!ADMIN_PASSWORD) return false
  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${ADMIN_PASSWORD}`
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { items, stats } = getAllMedia()
    return NextResponse.json({ items, stats })
  } catch (error) {
    console.error('Media fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, updates } = body

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid id' }, { status: 400 })
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Missing or invalid updates' }, { status: 400 })
    }

    if (updates.galleries) {
      if (!Array.isArray(updates.galleries)) {
        return NextResponse.json({ error: 'galleries must be an array' }, { status: 400 })
      }
      const invalidGalleries = updates.galleries.filter((g: string) => !GALLERY_TYPES.includes(g as GalleryType))
      if (invalidGalleries.length > 0) {
        return NextResponse.json({ error: `Invalid gallery types: ${invalidGalleries.join(', ')}` }, { status: 400 })
      }
    }

    const success = updateMediaMetadata(id, updates)

    if (!success) {
      return NextResponse.json({ error: 'Failed to update media' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id, updates })
  } catch (error) {
    console.error('Media update error:', error)
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
    }

    const success = deleteMediaItem(id)

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error('Media delete error:', error)
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 })
  }
}
