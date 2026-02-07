import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAllMedia, updateMediaMetadata, deleteMediaItem, GALLERY_TYPES, type GalleryType } from '@/lib/gallery'

async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return profile?.role === 'admin'
  } catch (error) {
    console.error('Auth check error:', error)
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized - Admin access only' }, { status: 401 })
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
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized - Admin access only' }, { status: 401 })
    }

    const body = await request.json()
    const { id, updates } = body

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid id' }, { status: 400 })
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Missing or invalid updates' }, { status: 400 })
    }

    // Whitelist allowed fields to prevent unintended data modification
    const allowedFields = ['title', 'description', 'featured', 'galleries', 'primaryGallery', 'category']
    const sanitizedUpdates: Record<string, any> = {}
    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        sanitizedUpdates[key] = updates[key]
      }
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid update fields provided' }, { status: 400 })
    }

    if (sanitizedUpdates.galleries) {
      if (!Array.isArray(sanitizedUpdates.galleries)) {
        return NextResponse.json({ error: 'galleries must be an array' }, { status: 400 })
      }
      const invalidGalleries = sanitizedUpdates.galleries.filter((g: string) => !GALLERY_TYPES.includes(g as GalleryType))
      if (invalidGalleries.length > 0) {
        return NextResponse.json({ error: `Invalid gallery types: ${invalidGalleries.join(', ')}` }, { status: 400 })
      }
    }

    const success = updateMediaMetadata(id, sanitizedUpdates)

    if (!success) {
      return NextResponse.json({ error: 'Failed to update media' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error('Media update error:', error)
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized - Admin access only' }, { status: 401 })
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
