import { NextRequest, NextResponse } from 'next/server'

const FETCH_TIMEOUT_MS = 5000
const HEAD_TIMEOUT_MS = 3000
const MAX_BYTES = 512 * 1024

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    let target: URL
    try {
      target = new URL(url.startsWith('http') ? url : `https://${url}`)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    if (target.protocol !== 'http:' && target.protocol !== 'https:') {
      return NextResponse.json({ error: 'Only http(s) URLs allowed' }, { status: 400 })
    }

    const html = await fetchHtml(target.toString(), FETCH_TIMEOUT_MS)

    const candidates: { href: string; rel: string; size: number }[] = []
    if (html) {
      const linkRegex = /<link\s+[^>]*rel=["']([^"']+)["'][^>]*>/gi
      let m: RegExpExecArray | null
      while ((m = linkRegex.exec(html)) !== null) {
        const tag = m[0]
        const rel = m[1].toLowerCase()
        if (!/icon/.test(rel)) continue
        const hrefMatch = tag.match(/href=["']([^"']+)["']/i)
        if (!hrefMatch) continue
        const sizesMatch = tag.match(/sizes=["']([^"']+)["']/i)
        const size = sizesMatch ? parseInt(sizesMatch[1]) || 0 : 0
        candidates.push({ href: hrefMatch[1], rel, size })
      }
    }

    candidates.sort((a, b) => {
      const aTouch = a.rel.includes('apple-touch') ? 1 : 0
      const bTouch = b.rel.includes('apple-touch') ? 1 : 0
      if (aTouch !== bTouch) return bTouch - aTouch
      return b.size - a.size
    })

    const candidateUrls: string[] = []
    for (const c of candidates) {
      try {
        candidateUrls.push(new URL(c.href, target).toString())
      } catch {}
    }
    candidateUrls.push(`${target.origin}/favicon.ico`)
    candidateUrls.push(
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(target.hostname)}&sz=256`
    )

    let faviconUrl: string | null = null
    let dataUrl: string | null = null
    for (const u of candidateUrls) {
      const bytes = await fetchImageBytes(u, FETCH_TIMEOUT_MS)
      if (bytes && bytes.buffer.byteLength > 0) {
        faviconUrl = u
        dataUrl = `data:${bytes.mimeType};base64,${bytes.buffer.toString('base64')}`
        break
      }
    }

    if (!faviconUrl || !dataUrl) {
      return NextResponse.json(
        { error: 'Could not load a favicon from that website' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      faviconUrl,
      dataUrl,
      siteUrl: target.toString(),
      hostname: target.hostname,
    })
  } catch (error) {
    console.error('Favicon fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch favicon' }, { status: 500 })
  }
}

async function fetchHtml(url: string, ms: number): Promise<string | null> {
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), ms)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'PSP-Pro/1.0 favicon-fetcher' },
      redirect: 'follow',
    })
    clearTimeout(t)
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

async function fetchImageBytes(
  url: string,
  ms: number
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), ms)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'PSP-Pro/1.0 favicon-fetcher' },
      redirect: 'follow',
    })
    clearTimeout(t)
    if (!res.ok) return null
    const contentType = (res.headers.get('content-type') || '').toLowerCase()
    if (contentType && !contentType.startsWith('image/')) return null
    const ab = await res.arrayBuffer()
    if (ab.byteLength === 0 || ab.byteLength > MAX_BYTES) return null
    const buffer = Buffer.from(ab)
    const mimeType = contentType || sniffMime(buffer) || 'image/x-icon'
    return { buffer, mimeType }
  } catch {
    return null
  }
}

function sniffMime(buf: Buffer): string | null {
  if (buf.length < 4) return null
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png'
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'image/gif'
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) return 'image/webp'
  if (buf[0] === 0x00 && buf[1] === 0x00 && (buf[2] === 0x01 || buf[2] === 0x02)) return 'image/x-icon'
  if (buf.toString('utf8', 0, Math.min(buf.length, 256)).includes('<svg')) return 'image/svg+xml'
  return null
}
