import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAllMedia, type GalleryItem } from '@/lib/gallery'

const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images')
const IMAGE_EXT_RE = /\.(jpe?g|png|gif|webp|avif|svg)$/i

function listPublicImages(): GalleryItem[] {
  try {
    if (!fs.existsSync(PUBLIC_IMAGES_DIR)) return []
    const entries = fs.readdirSync(PUBLIC_IMAGES_DIR, { withFileTypes: true })
    const items: GalleryItem[] = []
    for (const entry of entries) {
      if (!entry.isFile()) continue
      if (!IMAGE_EXT_RE.test(entry.name)) continue
      const full = path.join(PUBLIC_IMAGES_DIR, entry.name)
      let mtime = new Date()
      try { mtime = fs.statSync(full).mtime } catch {}
      const publicUrl = `/images/${entry.name}`
      items.push({
        id: `public:${entry.name}`,
        filename: entry.name,
        url: publicUrl,
        thumbnail: publicUrl,
        category: 'site-assets',
        type: 'image',
        uploadDate: mtime.toISOString(),
        title: entry.name.replace(IMAGE_EXT_RE, ''),
      })
    }
    return items
  } catch (e) {
    console.error('Failed to list /public/images:', e)
    return []
  }
}

async function isStaff(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return profile?.role === 'admin' || profile?.role === 'master_admin' || profile?.role === 'coach'
  } catch (error) {
    console.error('Auth check error:', error)
    return false
  }
}

export async function GET(_request: NextRequest) {
  try {
    if (!(await isStaff())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { items: localItems, stats } = getAllMedia()
    const publicImages = listPublicImages()

    let storageItems: GalleryItem[] = []
    try {
      const adminClient = createAdminClient()
      const seen = new Set<string>()
      const collect = async (path: string) => {
        const { data, error } = await adminClient.storage
          .from('images')
          .list(path, { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } })
        if (error || !data) return
        for (const entry of data) {
          if (entry.id === null && entry.name && !entry.name.includes('.')) {
            await collect(path ? `${path}/${entry.name}` : entry.name)
            continue
          }
          if (!entry.name) continue
          if (!/\.(jpe?g|png|gif|webp|avif|svg)$/i.test(entry.name)) continue
          const fullPath = path ? `${path}/${entry.name}` : entry.name
          if (seen.has(fullPath)) continue
          seen.add(fullPath)
          const { data: pub } = adminClient.storage.from('images').getPublicUrl(fullPath)
          storageItems.push({
            id: `storage:${fullPath}`,
            filename: entry.name,
            url: pub.publicUrl,
            thumbnail: pub.publicUrl,
            category: path.split('/')[0] || 'uncategorized',
            type: 'image',
            uploadDate: entry.created_at || new Date().toISOString(),
            title: entry.name,
          })
        }
      }
      await collect('')
    } catch (e) {
      console.error('Storage list error (non-fatal):', e)
    }

    const merged = [...storageItems, ...publicImages, ...localItems].sort(
      (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    )

    return NextResponse.json({
      items: merged,
      stats: { ...stats, total: merged.length },
    })
  } catch (error) {
    console.error('Media fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}
