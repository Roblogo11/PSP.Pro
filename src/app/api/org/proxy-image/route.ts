import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/org/proxy-image?url=... — server-side image proxy for logo color extraction
// Routes external images through our server so canvas can read pixels without CORS issues
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = req.nextUrl.searchParams.get('url')
    if (!url) return NextResponse.json({ error: 'Missing url param' }, { status: 400 })

    // URL validation — must be http/https and not targeting private networks
    let parsed: URL
    try {
      parsed = new URL(url)
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
      }
      // Block SSRF: private IPs, loopback, link-local, metadata endpoints
      const hostname = parsed.hostname.toLowerCase()
      const blockedPatterns = [
        /^localhost$/,
        /^127\./,
        /^10\./,
        /^172\.(1[6-9]|2\d|3[01])\./,
        /^192\.168\./,
        /^0\./,
        /^169\.254\./,           // AWS metadata / link-local
        /^metadata\.google/,     // GCP metadata
        /^\[::1\]$/,             // IPv6 loopback
        /^\[fd/i,                // IPv6 private
        /^\[fe80:/i,             // IPv6 link-local
      ]
      if (blockedPatterns.some(p => p.test(hostname))) {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    // Fetch the image server-side (no CORS restriction on server)
    const response = await fetch(parsed.toString(), {
      headers: { 'User-Agent': 'PSP.Pro/1.0 (logo-color-extractor)' },
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Could not fetch image: ${response.status}` }, { status: 400 })
    }

    const contentType = response.headers.get('content-type') || 'image/png'
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'URL does not point to an image' }, { status: 400 })
    }

    const buffer = await response.arrayBuffer()

    // Return with CORS headers so canvas can read it
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400', // cache 1 day
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to proxy image' }, { status: 500 })
  }
}
