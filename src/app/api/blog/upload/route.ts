import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'media', 'blog')

export async function POST(request: NextRequest) {
  try {
    // Auth check
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
      return NextResponse.json({ error: 'Unauthorized - Staff access only' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }

    const ext = path.extname(file.name).toLowerCase()
    if (!ALLOWED_TYPES.includes(ext)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPG, PNG, GIF, WebP' },
        { status: 400 }
      )
    }

    // Ensure upload directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    }

    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}-${safeName}`
    const filePath = path.join(UPLOAD_DIR, filename)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const isGif = ext === '.gif'

    if (isGif) {
      // Preserve GIF animation — just write directly, but check dimensions
      const metadata = await sharp(buffer).metadata()
      if (metadata.width && metadata.width > 1200) {
        // Resize animated GIF (sharp handles animated GIFs)
        await sharp(buffer, { animated: true })
          .resize(1200, undefined, { withoutEnlargement: true })
          .toFile(filePath)
      } else {
        fs.writeFileSync(filePath, buffer)
      }
    } else {
      // Optimize image: resize to max 1200px wide, compress
      await sharp(buffer)
        .resize(1200, undefined, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85, mozjpeg: true })
        .toFile(filePath.replace(ext, '.jpg'))

      // Update filename if we converted to jpg
      if (ext !== '.jpg' && ext !== '.jpeg') {
        const jpgFilename = filename.replace(ext, '.jpg')
        return NextResponse.json({
          success: true,
          url: `/media/blog/${jpgFilename}`,
          filename: jpgFilename,
        })
      }
    }

    return NextResponse.json({
      success: true,
      url: `/media/blog/${filename}`,
      filename,
    })
  } catch (error) {
    console.error('Blog image upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
