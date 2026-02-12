import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const GALLERIES_JSON_PATH = path.join(process.cwd(), 'public', 'data', 'galleries.json')

type GalleryType = 'photography' | 'video' | 'drone' | 'podcast' | 'media-production' | 'motion-graphics' | 'digital-builds' | 'website-redesign'

interface GalleryItem {
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
  galleries?: string[]
  primaryGallery?: string
  fileSize?: number
  originalName?: string
}

interface GalleryData {
  items: GalleryItem[]
  categories: string[]
}

function loadGalleriesJson(): Record<GalleryType, GalleryData> {
  try {
    if (fs.existsSync(GALLERIES_JSON_PATH)) {
      return JSON.parse(fs.readFileSync(GALLERIES_JSON_PATH, 'utf8'))
    }
  } catch (error) {
    console.error('Failed to load galleries.json:', error)
  }

  // Return empty structure
  const types: GalleryType[] = ['photography', 'video', 'drone', 'podcast', 'media-production', 'motion-graphics', 'digital-builds', 'website-redesign']
  const emptyData: Record<GalleryType, GalleryData> = {} as any
  types.forEach(type => {
    emptyData[type] = { items: [], categories: [] }
  })
  return emptyData
}

function saveGalleriesJson(data: Record<GalleryType, GalleryData>): void {
  const dir = path.dirname(GALLERIES_JSON_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(GALLERIES_JSON_PATH, JSON.stringify(data, null, 2))
}

export async function POST(request: NextRequest) {
  try {
    // Check Supabase auth + admin role
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'master_admin', 'coach'].includes(profile.role)) {
      return NextResponse.json({ error: 'Unauthorized - Admin/Coach access only' }, { status: 403 })
    }

    const formData = await request.formData()
    const uploadMode = formData.get('uploadMode') as string
    const galleryType = formData.get('type') as GalleryType
    const category = formData.get('category') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const featured = formData.get('featured') === 'true'

    if (!galleryType || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Sanitize category to prevent path traversal
    const safeCategory = category.replace(/[^a-zA-Z0-9_\- ]/g, '_')
    if (safeCategory !== category) {
      return NextResponse.json({ error: 'Invalid category name' }, { status: 400 })
    }

    // Validate gallery type
    const validTypes: GalleryType[] = ['photography', 'video', 'drone', 'podcast', 'media-production', 'motion-graphics', 'digital-builds', 'website-redesign']
    if (!validTypes.includes(galleryType)) {
      return NextResponse.json({ error: 'Invalid gallery type' }, { status: 400 })
    }

    // Load galleries
    const galleries = loadGalleriesJson()
    if (!galleries[galleryType]) {
      galleries[galleryType] = { items: [], categories: [] }
    }

    // Handle URL-based uploads (no file storage needed)
    if (uploadMode === 'url') {
      const mediaUrl = formData.get('mediaUrl') as string
      if (!mediaUrl) {
        return NextResponse.json({ error: 'Media URL is required' }, { status: 400 })
      }

      // Validate URL protocol to prevent javascript: or data: XSS
      try {
        const parsed = new URL(mediaUrl)
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          return NextResponse.json({ error: 'Only http/https URLs are allowed' }, { status: 400 })
        }
      } catch {
        return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
      }

      const timestamp = Date.now()
      const fileKey = `${galleryType}/${category}/url-${timestamp}`

      const newItem: GalleryItem = {
        id: fileKey,
        filename: title || 'Linked Media',
        url: mediaUrl,
        thumbnail: mediaUrl,
        category,
        type: 'url',
        uploadDate: new Date().toISOString(),
        title: title || 'Linked Media',
        description,
        featured,
        isExternal: true,
        galleries: [galleryType],
        primaryGallery: galleryType
      }

      galleries[galleryType].items.push(newItem)

      // Update categories
      if (!galleries[galleryType].categories.includes(category)) {
        galleries[galleryType].categories.push(category)
        galleries[galleryType].categories.sort()
      }

      saveGalleriesJson(galleries)

      return NextResponse.json({
        success: true,
        url: mediaUrl,
        id: fileKey
      })
    }

    // Handle file uploads (existing logic)
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'File is required for file upload mode' }, { status: 400 })
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 })
    }

    // Get file extension
    const fileExtension = path.extname(file.name).toLowerCase()
    const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExtension)
    const isVideo = ['.mp4', '.mov', '.avi', '.webm'].includes(fileExtension)

    if (!isImage && !isVideo) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Create directories
    const uploadDir = path.join(process.cwd(), 'public', 'media', galleryType, category)
    const thumbsDir = path.join(uploadDir, 'thumbs')

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    if (!fs.existsSync(thumbsDir)) {
      fs.mkdirSync(thumbsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}-${safeName}`
    const filePath = path.join(uploadDir, filename)

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    if (isImage) {
      // Optimize and save main image
      await sharp(buffer)
        .resize(2000, 2000, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85, mozjpeg: true })
        .toFile(filePath)

      // Create thumbnail
      const thumbPath = path.join(thumbsDir, filename)
      await sharp(buffer)
        .resize(400, 400, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(thumbPath)
    } else {
      // For videos, just save the file
      fs.writeFileSync(filePath, buffer)
    }

    // Add to galleries.json
    const fileKey = `${galleryType}/${category}/${filename}`
    const newItem: GalleryItem = {
      id: fileKey,
      filename,
      url: `/media/${galleryType}/${category}/${filename}`,
      thumbnail: isImage
        ? `/media/${galleryType}/${category}/thumbs/${filename}`
        : `/media/${galleryType}/${category}/${filename}`,
      category,
      type: isImage ? 'image' : 'video',
      uploadDate: new Date().toISOString(),
      title: title || filename,
      description,
      featured,
      galleries: [galleryType],
      primaryGallery: galleryType,
      fileSize: file.size,
      originalName: file.name
    }

    galleries[galleryType].items.push(newItem)

    // Update categories
    if (!galleries[galleryType].categories.includes(category)) {
      galleries[galleryType].categories.push(category)
      galleries[galleryType].categories.sort()
    }

    saveGalleriesJson(galleries)

    return NextResponse.json({
      success: true,
      filename,
      url: `/media/${galleryType}/${category}/${filename}`,
      thumbnail: isImage ? `/media/${galleryType}/${category}/thumbs/${filename}` : null
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
