'use client'

import { useEffect, useMemo, useState } from 'react'
import { X, Search, Image as ImageIcon, Link as LinkIcon, Check, Loader2 } from 'lucide-react'

interface MediaItem {
  id: string
  url: string
  thumbnail: string
  filename: string
  category: string
  title?: string
}

interface MediaPickerProps {
  value: string | null
  onChange: (url: string | null) => void
  label?: string
  hint?: string
  className?: string
}

export function MediaPicker({ value, onChange, label = 'Image', hint, className = '' }: MediaPickerProps) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'library' | 'url'>('library')
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [urlInput, setUrlInput] = useState('')

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch('/api/media')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setItems(data.items || []))
      .catch(err => console.error('Failed to load media:', err))
      .finally(() => setLoading(false))
  }, [open])

  const categories = useMemo(() => {
    const set = new Set(items.map(i => i.category).filter(Boolean))
    return ['all', ...Array.from(set).sort()]
  }, [items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter(item => {
      if (category !== 'all' && item.category !== category) return false
      if (!q) return true
      return (
        item.filename.toLowerCase().includes(q) ||
        (item.title?.toLowerCase().includes(q) ?? false) ||
        item.category.toLowerCase().includes(q)
      )
    })
  }, [items, query, category])

  const pick = (url: string) => {
    onChange(url)
    setOpen(false)
  }

  const submitUrl = () => {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    onChange(trimmed)
    setUrlInput('')
    setOpen(false)
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-white mb-2">{label}</label>
      )}

      <div className="flex items-stretch gap-2">
        <div className="flex-1 min-h-[44px] rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900/40 overflow-hidden flex items-center">
          {value ? (
            <div className="flex items-center gap-2 w-full px-2 py-1">
              <img src={value} alt="" className="w-10 h-10 rounded object-cover bg-slate-100 dark:bg-slate-800" onError={(e) => { e.currentTarget.style.opacity = '0.3' }} />
              <span className="text-xs text-slate-600 dark:text-white/70 truncate flex-1" title={value}>{value}</span>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="text-slate-500 hover:text-red-500 p-1"
                aria-label="Clear image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span className="px-3 text-sm text-slate-400 dark:text-white/40">No image selected</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-4 py-2 min-h-[44px] rounded-lg bg-cyan text-white font-semibold text-sm hover:bg-cyan/90 transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <ImageIcon className="w-4 h-4" />
          {value ? 'Change' : 'Choose image'}
        </button>
      </div>

      {hint && <p className="mt-1 text-xs text-slate-500 dark:text-white/50">{hint}</p>}

      {open && (
        <div
          className="fixed inset-0 z-[200] bg-slate-900/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-4xl h-[90vh] sm:h-[80vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-white/10">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select an image</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-white"
                aria-label="Close picker"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setTab('library')}
                className={`flex-1 px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                  tab === 'library'
                    ? 'text-cyan border-b-2 border-cyan'
                    : 'text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" /> Library
              </button>
              <button
                type="button"
                onClick={() => setTab('url')}
                className={`flex-1 px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                  tab === 'url'
                    ? 'text-cyan border-b-2 border-cyan'
                    : 'text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LinkIcon className="w-4 h-4" /> Paste URL
              </button>
            </div>

            {tab === 'library' ? (
              <>
                <div className="px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search images..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 min-h-[40px] rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-3 py-2 min-h-[40px] rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  {loading ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-cyan" />
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <ImageIcon className="w-12 h-12 text-slate-300 dark:text-white/20 mb-3" />
                      <p className="text-slate-600 dark:text-white/60 mb-1">
                        {query || category !== 'all' ? 'No images match your filters' : 'No images available yet'}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-white/40">
                        Try the Paste URL tab to use an external image
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {filtered.map(item => {
                        const selected = value === item.url
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => pick(item.url)}
                            className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              selected
                                ? 'border-cyan ring-2 ring-cyan/40'
                                : 'border-transparent hover:border-cyan/40'
                            }`}
                            title={item.title || item.filename}
                          >
                            <img
                              src={item.thumbnail || item.url}
                              alt={item.title || item.filename}
                              className="w-full h-full object-cover bg-slate-100 dark:bg-slate-800 group-hover:scale-105 transition-transform"
                              loading="lazy"
                            />
                            {selected && (
                              <div className="absolute top-1 right-1 bg-cyan rounded-full p-1">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                              <p className="text-[10px] text-white truncate font-medium">
                                {item.title || item.filename}
                              </p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <label className="block text-sm font-semibold text-slate-700 dark:text-white mb-2">Image URL</label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submitUrl() } }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 min-h-[44px] rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  autoFocus
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-white/50">
                  Paste a direct link to an external image (jpg, png, webp, gif). YouTube thumbnails work too.
                </p>
                {urlInput && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-slate-700 dark:text-white mb-2">Preview</p>
                    <img
                      src={urlInput}
                      alt="Preview"
                      className="max-w-xs rounded-lg border border-slate-200 dark:border-white/10"
                      onError={(e) => { e.currentTarget.style.opacity = '0.3' }}
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={submitUrl}
                  disabled={!urlInput.trim()}
                  className="mt-4 px-4 py-2 min-h-[44px] rounded-lg bg-cyan text-white font-semibold text-sm hover:bg-cyan/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Use this URL
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
