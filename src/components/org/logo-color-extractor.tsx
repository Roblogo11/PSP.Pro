'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Loader2, Wand2, RefreshCw, Check, Upload, Link } from 'lucide-react'

interface ExtractedColor {
  hex: string
  rgb: [number, number, number]
  prominence: number // 0-100
}

interface LogoColorExtractorProps {
  currentLogoUrl: string | null
  currentPrimary: string
  currentSecondary: string
  onApply: (logoUrl: string, primary: string, secondary: string) => void
}

// ── Color Math ────────────────────────────────────────────────

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

function colorDistance(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2)
}

function getLuminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

// Simple median-cut color quantization — fast, no deps
function extractDominantColors(imageData: Uint8ClampedArray, count = 8): ExtractedColor[] {
  const pixels: [number, number, number][] = []

  // Sample every 4th pixel (skip fully transparent)
  for (let i = 0; i < imageData.length; i += 16) {
    const a = imageData[i + 3]
    if (a < 128) continue // skip transparent
    const r = imageData[i]
    const g = imageData[i + 1]
    const b = imageData[i + 2]
    // Skip near-white and near-black (boring)
    const lum = getLuminance(r, g, b)
    if (lum > 0.93 || lum < 0.06) continue
    pixels.push([r, g, b])
  }

  if (pixels.length === 0) return []

  // K-means with k=count, 12 iterations
  const k = Math.min(count, pixels.length)
  // Init centroids by spreading across the pixel array
  let centroids: [number, number, number][] = Array.from({ length: k }, (_, i) =>
    pixels[Math.floor(i * pixels.length / k)]
  )

  for (let iter = 0; iter < 12; iter++) {
    const clusters: [number, number, number][][] = Array.from({ length: k }, () => [])

    for (const px of pixels) {
      let minDist = Infinity
      let nearest = 0
      for (let j = 0; j < k; j++) {
        const d = colorDistance(px, centroids[j])
        if (d < minDist) { minDist = d; nearest = j }
      }
      clusters[nearest].push(px)
    }

    centroids = clusters.map((cluster, i) => {
      if (cluster.length === 0) return centroids[i]
      const r = Math.round(cluster.reduce((s, p) => s + p[0], 0) / cluster.length)
      const g = Math.round(cluster.reduce((s, p) => s + p[1], 0) / cluster.length)
      const b = Math.round(cluster.reduce((s, p) => s + p[2], 0) / cluster.length)
      return [r, g, b]
    })

    // Early exit if centroids stable
    if (iter > 4) break
  }

  // Score by cluster size and saturation
  const clusterSizes: number[] = Array(k).fill(0)
  for (const px of pixels) {
    let minDist = Infinity, nearest = 0
    for (let j = 0; j < k; j++) {
      const d = colorDistance(px, centroids[j])
      if (d < minDist) { minDist = d; nearest = j }
    }
    clusterSizes[nearest]++
  }

  const total = pixels.length
  return centroids
    .map((c, i) => ({
      hex: rgbToHex(c[0], c[1], c[2]),
      rgb: c,
      prominence: Math.round((clusterSizes[i] / total) * 100),
    }))
    .filter(c => c.prominence > 0)
    .sort((a, b) => {
      // Sort by prominence but boost saturated colors
      const satA = getSaturation(a.rgb)
      const satB = getSaturation(b.rgb)
      return (b.prominence * (1 + satB)) - (a.prominence * (1 + satA))
    })
    .slice(0, 8)
}

function getSaturation([r, g, b]: [number, number, number]): number {
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  return max === 0 ? 0 : (max - min) / max
}

function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return getLuminance(r, g, b) > 0.5 ? '#1e293b' : '#ffffff'
}

// ── Component ─────────────────────────────────────────────────

export function LogoColorExtractor({
  currentLogoUrl,
  currentPrimary,
  currentSecondary,
  onApply,
}: LogoColorExtractorProps) {
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl || '')
  const [urlInput, setUrlInput] = useState(currentLogoUrl || '')
  const [colors, setColors] = useState<ExtractedColor[]>([])
  const [primary, setPrimary] = useState(currentPrimary)
  const [secondary, setSecondary] = useState(currentSecondary)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'url' | 'upload'>('url')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const runExtraction = useCallback((proxyUrl: string, originalUrl: string) => {
    const img = new window.Image()
    // No crossOrigin needed — our proxy returns Access-Control-Allow-Origin: *

    img.onload = () => {
      try {
        const canvas = canvasRef.current!
        const size = 120
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, size, size)
        const imageData = ctx.getImageData(0, 0, size, size).data
        const extracted = extractDominantColors(imageData)
        if (extracted.length === 0) {
          setError('Could not extract colors — image may be too dark, too light, or mostly transparent. Try a different logo.')
        } else {
          setColors(extracted)
          if (extracted[0]) setPrimary(extracted[0].hex)
          if (extracted[1]) setSecondary(extracted[1].hex)
        }
      } catch (e: any) {
        setError('Color extraction failed: ' + (e?.message || 'unknown error'))
      } finally {
        setExtracting(false)
      }
    }

    img.onerror = () => {
      setError('Could not load image through proxy. Make sure the URL points directly to an image file (JPG, PNG, SVG, WebP).')
      setExtracting(false)
    }

    img.src = proxyUrl
    setLogoUrl(originalUrl)
  }, [])

  const extractFromUrl = useCallback((url: string) => {
    if (!url) return
    setExtracting(true)
    setError('')
    setColors([])

    // Route through server proxy to bypass CORS
    const proxyUrl = `/api/org/proxy-image?url=${encodeURIComponent(url)}`
    runExtraction(proxyUrl, url)
  }, [runExtraction])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Max 5MB'); return }

    setExtracting(true)
    setError('')

    // Upload to PSP blog storage endpoint (reuse existing upload route)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/blog/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed')
      setUrlInput(data.url)
      extractFromUrl(data.url)
    } catch (err: any) {
      setError(err.message)
      setExtracting(false)
    }
  }

  const handleApply = () => {
    onApply(logoUrl || urlInput, primary, secondary)
  }

  return (
    <div className="space-y-5">
      {/* Hidden canvas for pixel sampling */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${mode === 'url' ? 'bg-cyan-100 dark:bg-cyan/10 text-cyan-800 dark:text-cyan-300' : 'text-slate-500 dark:text-white/50 hover:text-slate-700'}`}
        >
          <Link className="w-3.5 h-3.5" /> Paste URL
        </button>
        <button
          onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${mode === 'upload' ? 'bg-cyan-100 dark:bg-cyan/10 text-cyan-800 dark:text-cyan-300' : 'text-slate-500 dark:text-white/50 hover:text-slate-700'}`}
        >
          <Upload className="w-3.5 h-3.5" /> Upload
        </button>
      </div>

      {/* URL input */}
      {mode === 'url' && (
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="https://yourteam.com/logo.png"
              className="input-field flex-1 text-sm"
            />
            <button
              onClick={() => extractFromUrl(urlInput)}
              disabled={extracting || !urlInput}
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
            >
              {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              Scan
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-white/40">
            Must be a <strong>direct image URL</strong> ending in .png, .jpg, .svg, or .webp — not a webpage.{' '}
            <span className="text-slate-400 dark:text-white/30">Tip: right-click your logo on any website → &quot;Copy image address&quot;</span>
          </p>
        </div>
      )}

      {/* File upload */}
      {mode === 'upload' && (
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={extracting}
            className="w-full border-2 border-dashed border-cyan-200/40 hover:border-cyan-400/60 rounded-xl p-6 text-center transition-colors group"
          >
            {extracting ? (
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-2" />
            ) : (
              <Upload className="w-8 h-8 text-cyan-400/60 group-hover:text-cyan-400 mx-auto mb-2 transition-colors" />
            )}
            <p className="text-sm text-slate-600 dark:text-white/60">
              {extracting ? 'Uploading & scanning...' : 'Click to upload logo (JPG, PNG, SVG — max 5MB)'}
            </p>
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
      )}

      {/* Logo preview */}
      {logoUrl && !error && (
        <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt="Logo preview" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Logo loaded</p>
            <p className="text-xs text-slate-500 dark:text-white/50 truncate">{logoUrl}</p>
          </div>
          <button onClick={() => extractFromUrl(logoUrl)} disabled={extracting} className="text-cyan-500 hover:text-cyan-400 p-1">
            <RefreshCw className={`w-4 h-4 ${extracting ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}

      {/* Color swatches */}
      {colors.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-cyan-500" />
            Colors extracted from your logo — pick one for each slot
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Primary slot */}
            <div>
              <p className="text-xs font-semibold text-cyan-700 dark:text-white/60 uppercase tracking-wider mb-2">Primary</p>
              <div className="flex flex-wrap gap-2">
                {colors.map(c => (
                  <button
                    key={c.hex + 'p'}
                    title={c.hex}
                    onClick={() => setPrimary(c.hex)}
                    className="relative w-9 h-9 rounded-lg border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: c.hex,
                      borderColor: primary === c.hex ? '#fff' : 'transparent',
                      boxShadow: primary === c.hex ? `0 0 0 2px ${c.hex}` : 'none',
                    }}
                  >
                    {primary === c.hex && (
                      <Check className="w-4 h-4 absolute inset-0 m-auto" style={{ color: getContrastColor(c.hex) }} />
                    )}
                  </button>
                ))}
                {/* Manual fallback */}
                <input
                  type="color"
                  value={primary}
                  onChange={e => setPrimary(e.target.value)}
                  title="Custom color"
                  className="w-9 h-9 rounded-lg cursor-pointer border-2 border-dashed border-cyan-200/40"
                />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-md" style={{ backgroundColor: primary }} />
                <span className="text-xs font-mono text-slate-500 dark:text-white/50">{primary}</span>
              </div>
            </div>

            {/* Secondary slot */}
            <div>
              <p className="text-xs font-semibold text-cyan-700 dark:text-white/60 uppercase tracking-wider mb-2">Secondary</p>
              <div className="flex flex-wrap gap-2">
                {colors.map(c => (
                  <button
                    key={c.hex + 's'}
                    title={c.hex}
                    onClick={() => setSecondary(c.hex)}
                    className="relative w-9 h-9 rounded-lg border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: c.hex,
                      borderColor: secondary === c.hex ? '#fff' : 'transparent',
                      boxShadow: secondary === c.hex ? `0 0 0 2px ${c.hex}` : 'none',
                    }}
                  >
                    {secondary === c.hex && (
                      <Check className="w-4 h-4 absolute inset-0 m-auto" style={{ color: getContrastColor(c.hex) }} />
                    )}
                  </button>
                ))}
                <input
                  type="color"
                  value={secondary}
                  onChange={e => setSecondary(e.target.value)}
                  title="Custom color"
                  className="w-9 h-9 rounded-lg cursor-pointer border-2 border-dashed border-cyan-200/40"
                />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-md" style={{ backgroundColor: secondary }} />
                <span className="text-xs font-mono text-slate-500 dark:text-white/50">{secondary}</span>
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div className="rounded-xl border border-cyan-200/20 overflow-hidden">
            <div className="px-3 py-2 text-xs text-slate-500 dark:text-white/40 font-medium bg-slate-50 dark:bg-slate-800/50">
              Live Preview
            </div>
            <div className="p-4 flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${primary}15, ${secondary}10)` }}>
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {logoUrl ? <img src={logoUrl} alt="logo" className="w-full h-full object-contain" /> : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: primary }}>A</div>
                )}
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: primary }}>Your Academy Name</p>
                <p className="text-xs" style={{ color: secondary }}>Your tagline here</p>
              </div>
              <button
                className="ml-auto px-4 py-2 rounded-lg text-white text-sm font-bold"
                style={{ backgroundColor: primary }}
              >
                Book Now
              </button>
            </div>
          </div>

          {/* Apply button */}
          <button
            onClick={handleApply}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3"
          >
            <Check className="w-4 h-4" />
            Apply Logo + Colors to My Org
          </button>
        </div>
      )}
    </div>
  )
}
