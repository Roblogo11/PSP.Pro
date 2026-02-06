'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUserRole } from '@/lib/hooks/use-user-role'
import {
  Search, Filter, Trash2, Edit2, ExternalLink,
  Image as ImageIcon, Video, Link2, Star, X, Check,
  HardDrive, Cloud, Database, ChevronDown, Home, Loader2
} from 'lucide-react'

interface GalleryItem {
  id: string
  filename: string
  url: string
  thumbnail: string
  title?: string
  description?: string
  category: string
  type: 'image' | 'video' | 'url'
  uploadDate: string
  featured?: boolean
  isExternal?: boolean
  externalUrl?: string
  galleries?: string[]
  primaryGallery?: string
  fileSize?: number
  originalName?: string
}

interface MediaStats {
  total?: number
  totalSize?: number
  totalItems?: number
  byType?: Record<string, number | { count: number; size: number }>
  byCategory?: Record<string, number>
  externalCount?: number
  localCount?: number
}

const GALLERY_TYPES = [
  'training-drills', 'athlete-progress', 'facility',
  'session-highlights', 'testimonials', 'equipment', 'events'
]

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Helper to extract YouTube video ID
function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  if (match && match[2].length === 11) return match[2]
  if (url.includes('youtube.com/embed/')) {
    return url.split('embed/')[1].split('?')[0]
  }
  return null
}

// Get thumbnail URL for any media type
function getThumbnailUrl(item: GalleryItem): string | null {
  // For YouTube videos, generate thumbnail from video ID
  const youtubeId = getYouTubeId(item.url)
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
  }

  // For direct image URLs (external images like roblogo.com)
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(item.url)) {
    return item.url
  }

  // If thumbnail field is set and looks like an image
  if (item.thumbnail && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.thumbnail)) {
    return item.thumbnail
  }

  return null
}

export default function MediaDashboard() {
  const router = useRouter()
  const { profile, isAdmin, loading: authLoading } = useUserRole()

  const [items, setItems] = useState<GalleryItem[]>([])
  const [stats, setStats] = useState<MediaStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterMediaType, setFilterMediaType] = useState<string>('all')
  const [filterFeatured, setFilterFeatured] = useState<boolean | null>(null)

  // Edit modal
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    featured: false,
    externalUrl: '',
    galleries: [] as string[]
  })

  // Delete confirmation
  const [deletingItem, setDeletingItem] = useState<GalleryItem | null>(null)

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/admin')
    }
  }, [authLoading, isAdmin, router])

  const fetchMedia = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/media')

      if (!response.ok) {
        throw new Error('Failed to fetch media')
      }

      const data = await response.json()
      setItems(data.items || [])
      setStats(data.stats || null)
    } catch (err) {
      setError('Failed to load media')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin && !authLoading) {
      fetchMedia()
    }
  }, [isAdmin, authLoading])

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          item.title?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.filename.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Gallery type filter
      if (filterType !== 'all') {
        const itemType = item.id.split('/')[0]
        if (itemType !== filterType) return false
      }

      // Media type filter
      if (filterMediaType !== 'all') {
        if (item.type !== filterMediaType) return false
      }

      // Featured filter
      if (filterFeatured !== null) {
        if (item.featured !== filterFeatured) return false
      }

      return true
    })
  }, [items, searchQuery, filterType, filterMediaType, filterFeatured])

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item)
    setEditForm({
      title: item.title || '',
      description: item.description || '',
      featured: item.featured || false,
      externalUrl: item.externalUrl || '',
      galleries: item.galleries || [item.id.split('/')[0]]
    })
  }

  const handleSaveEdit = async () => {
    if (!editingItem) return

    try {
      const response = await fetch('/api/media', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: editingItem.id,
          updates: {
            title: editForm.title,
            description: editForm.description,
            featured: editForm.featured,
            externalUrl: editForm.externalUrl || undefined,
            isExternal: !!editForm.externalUrl,
            galleries: editForm.galleries
          }
        })
      })

      if (!response.ok) throw new Error('Update failed')

      // Refresh data
      await fetchMedia()
      setEditingItem(null)
    } catch (err) {
      console.error('Update error:', err)
      setError('Failed to update item')
    }
  }

  const handleDelete = async () => {
    if (!deletingItem) return

    try {
      const response = await fetch(`/api/media?id=${encodeURIComponent(deletingItem.id)}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Delete failed')

      // Refresh data
      await fetchMedia()
      setDeletingItem(null)
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete item')
    }
  }

  const toggleGallery = (gallery: string) => {
    setEditForm(prev => {
      const galleries = prev.galleries.includes(gallery)
        ? prev.galleries.filter(g => g !== gallery)
        : [...prev.galleries, gallery]
      return { ...prev, galleries }
    })
  }

  // Loading or Access Check
  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange animate-spin mx-auto mb-4" />
          <p className="text-cyan-700 dark:text-white">
            {authLoading ? 'Loading...' : 'Checking access permissions...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Media Hot Route</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all media across galleries</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin"
              className="flex items-center gap-2 bg-cyan-900 hover:bg-cyan-800/30 text-white font-medium py-2 px-4 rounded-lg transition border border-cyan-200/40"
            >
              <Home className="w-4 h-4" />
              Admin Dashboard
            </a>
          </div>
        </div>

        {/* Stats Cards */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Database className="w-5 h-5" />}
              label="Total Items"
              value={items.length.toString()}
            />
            <StatCard
              icon={<HardDrive className="w-5 h-5" />}
              label="Total Size"
              value={formatBytes(items.reduce((acc, item) => acc + (item.fileSize || 0), 0))}
            />
            <StatCard
              icon={<ImageIcon className="w-5 h-5" />}
              label="Local Files"
              value={items.filter(item => !item.isExternal).length.toString()}
            />
            <StatCard
              icon={<Cloud className="w-5 h-5" />}
              label="External URLs"
              value={items.filter(item => item.isExternal).length.toString()}
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, description, filename..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Gallery Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Galleries</option>
              {GALLERY_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>

            {/* Media Type Filter */}
            <select
              value={filterMediaType}
              onChange={(e) => setFilterMediaType(e.target.value)}
              className="px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="url">External URLs</option>
            </select>

            {/* Featured Filter */}
            <select
              value={filterFeatured === null ? 'all' : filterFeatured ? 'featured' : 'not-featured'}
              onChange={(e) => {
                if (e.target.value === 'all') setFilterFeatured(null)
                else if (e.target.value === 'featured') setFilterFeatured(true)
                else setFilterFeatured(false)
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Items</option>
              <option value="featured">Featured Only</option>
              <option value="not-featured">Not Featured</option>
            </select>
          </div>

          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredItems.length} of {items.length} items
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 text-red-200 p-4 rounded-lg">
            {error}
            <button onClick={() => setError('')} className="ml-2 underline">Dismiss</button>
          </div>
        )}

        {/* Media Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Loading media...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">No media items found</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Preview</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Title / Filename</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Gallery</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Size</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-750">
                      <td className="px-4 py-3">
                        <div className="w-16 h-16 bg-gray-700 rounded overflow-hidden relative">
                          {(() => {
                            const thumbUrl = getThumbnailUrl(item)
                            if (thumbUrl) {
                              return (
                                <>
                                  <img
                                    src={thumbUrl}
                                    alt={item.title || item.filename}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none'
                                      const parent = (e.target as HTMLImageElement).parentElement
                                      if (parent) {
                                        const fallback = parent.querySelector('.fallback-icon')
                                        if (fallback) (fallback as HTMLElement).style.display = 'flex'
                                      }
                                    }}
                                  />
                                  <div className="fallback-icon hidden w-full h-full items-center justify-center absolute inset-0">
                                    {item.type === 'url' ? <Link2 className="w-6 h-6 text-gray-500 dark:text-gray-400" /> : <Video className="w-6 h-6 text-gray-500 dark:text-gray-400" />}
                                  </div>
                                  {/* Play icon overlay for videos */}
                                  {(item.type === 'url' && getYouTubeId(item.url)) && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                      <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
                                        <Video className="w-4 h-4 text-white" />
                                      </div>
                                    </div>
                                  )}
                                </>
                              )
                            }
                            // Fallback for items without thumbnails
                            return (
                              <div className="w-full h-full flex items-center justify-center">
                                {item.type === 'url' ? <Link2 className="w-6 h-6 text-gray-500 dark:text-gray-400" /> : <Video className="w-6 h-6 text-gray-500 dark:text-gray-400" />}
                              </div>
                            )
                          })()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {item.featured && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                          {item.isExternal && <Cloud className="w-4 h-4 text-blue-400" />}
                          <div>
                            <p className="text-white font-medium truncate max-w-[200px]">
                              {item.title || item.filename}
                            </p>
                            {item.title && (
                              <p className="text-gray-500 dark:text-gray-400 text-xs truncate max-w-[200px]">
                                {item.filename}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded">
                          {item.id.split('/')[0]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          {item.type === 'image' && <ImageIcon className="w-4 h-4" />}
                          {item.type === 'video' && <Video className="w-4 h-4" />}
                          {item.type === 'url' && <Link2 className="w-4 h-4" />}
                          <span className="text-xs capitalize">{item.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                        {item.fileSize ? formatBytes(item.fileSize) : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                        {formatDate(item.uploadDate)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-white hover:bg-gray-700 rounded transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-white hover:bg-gray-700 rounded transition"
                            title="View"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => setDeletingItem(item)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Gallery Breakdown */}
        {stats && stats.byType && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Storage by Gallery</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {GALLERY_TYPES.map(type => {
                const rawStats = stats.byType?.[type]
                const typeStats = typeof rawStats === 'number'
                  ? { count: rawStats, size: 0 }
                  : rawStats || { count: 0, size: 0 }
                return (
                  <div key={type} className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-500 dark:text-gray-400 text-sm capitalize">
                      {type.replace(/-/g, ' ')}
                    </p>
                    <p className="text-white font-medium mt-1">
                      {typeStats.count} items
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      {formatBytes(typeStats.size)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Edit Media</h2>
                <button
                  onClick={() => setEditingItem(null)}
                  className="text-gray-500 dark:text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 block">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 block">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Featured */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={editForm.featured}
                    onChange={(e) => setEditForm(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="featured" className="text-gray-600 dark:text-gray-300">Featured Item</label>
                </div>

                {/* External URL (CDN Migration) */}
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 block">
                    External URL (CDN)
                    <span className="text-gray-500 dark:text-gray-400 font-normal ml-2">- Replace local with hosted URL</span>
                  </label>
                  <input
                    type="url"
                    value={editForm.externalUrl}
                    onChange={(e) => setEditForm(prev => ({ ...prev, externalUrl: e.target.value }))}
                    placeholder="https://cdn.example.com/image.jpg"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Multi-Gallery Tags */}
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 block">
                    Show in Galleries
                    <span className="text-gray-500 dark:text-gray-400 font-normal ml-2">- Item appears in all selected</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GALLERY_TYPES.map(gallery => (
                      <button
                        key={gallery}
                        onClick={() => toggleGallery(gallery)}
                        className={`px-3 py-1 rounded text-sm transition ${
                          editForm.galleries.includes(gallery)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        {gallery.replace(/-/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">Delete Media?</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              Are you sure you want to delete this item?
            </p>
            <p className="text-white font-medium mb-4 break-all">
              {deletingItem.title || deletingItem.filename}
            </p>
            <p className="text-red-400 text-sm mb-6">
              This action cannot be undone. The file and its thumbnail will be permanently removed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeletingItem(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="text-blue-400">{icon}</div>
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{label}</p>
          <p className="text-white font-bold text-xl">{value}</p>
        </div>
      </div>
    </div>
  )
}
