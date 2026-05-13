import { NextRequest, NextResponse } from 'next/server'

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

    const html = await fetchWithTimeout(target.toString(), 5000)

    const candidates: string[] = []
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
        const href = hrefMatch[1]
        candidates.push(JSON.stringify({ href, rel, size }))
      }
    }

    const parsed = candidates.map(s => JSON.parse(s) as { href: string; rel: string; size: number })
    parsed.sort((a, b) => {
      const aTouch = a.rel.includes('apple-touch') ? 1 : 0
      const bTouch = b.rel.includes('apple-touch') ? 1 : 0
      if (aTouch !== bTouch) return bTouch - aTouch
      return b.size - a.size
    })

    let faviconUrl: string | null = null
    if (parsed[0]) {
      try {
        faviconUrl = new URL(parsed[0].href, target).toString()
      } catch {
        faviconUrl = null
      }
    }
    if (!faviconUrl) {
      faviconUrl = `${target.origin}/favicon.ico`
    }

    const ok = await headCheck(faviconUrl, 3000)
    if (!ok) {
      faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(target.hostname)}&sz=256`
    }

    return NextResponse.json({
      faviconUrl,
      siteUrl: target.toString(),
      hostname: target.hostname,
    })
  } catch (error) {
    console.error('Favicon fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch favicon' }, { status: 500 })
  }
}

async function fetchWithTimeout(url: string, ms: number): Promise<string | null> {
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

async function headCheck(url: string, ms: number): Promise<boolean> {
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), ms)
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal, redirect: 'follow' })
    clearTimeout(t)
    return res.ok
  } catch {
    return false
  }
}
