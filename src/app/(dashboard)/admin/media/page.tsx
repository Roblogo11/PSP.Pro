'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { createClient } from '@/lib/supabase/client'
import {
  Search, Filter, Trash2, Edit2, ExternalLink,
  Image as ImageIcon, Video, Link2, Star, X, Check,
  HardDrive, Cloud, Database, ChevronDown, Home, Loader2,
  Plus, Eye, EyeOff, FileText, Newspaper, LayoutGrid,
  Upload, Youtube
} from 'lucide-react'

// ─── Blog Types ─────────────────────────────────────────────
interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  category: string
  thumbnail_url: string | null
  published: boolean
  featured: boolean
  read_time: string
  author_id: string | null
  created_at: string
  updated_at: string
}

const BLOG_CATEGORIES = [
  'General', 'Pitching', 'Hitting', 'Recovery', 'Speed & Agility',
  'Nutrition', 'Mental Game', 'Strength', 'Coaching Tips'
]

// ─── Media Types ────────────────────────────────────────────
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

// ─── Utilities ──────────────────────────────────────────────
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

function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  if (match && match[2].length === 11) return match[2]
  if (url.includes('youtube.com/embed/')) {
    return url.split('embed/')[1].split('?')[0]
  }
  return null
}

function getThumbnailUrl(item: GalleryItem): string | null {
  const youtubeId = getYouTubeId(item.url)
  if (youtubeId) return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(item.url)) return item.url
  if (item.thumbnail && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.thumbnail)) return item.thumbnail
  return null
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function ContentHub() {
  const router = useRouter()
  const { profile, isCoach, isAdmin, loading: authLoading } = useUserRole()
  const isStaff = isCoach || isAdmin

  const [activeTab, setActiveTab] = useState<'blog' | 'media'>('blog')

  // Redirect non-staff
  useEffect(() => {
    if (!authLoading && !isStaff) {
      router.push('/admin')
    }
  }, [authLoading, isStaff, router])

  if (authLoading || !isStaff) {
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
    <div className="min-h-screen bg-gray-900 px-3 py-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Content Hub</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage blog posts and media</p>
          </div>
          <a
            href="/admin"
            className="flex items-center gap-2 bg-cyan-900 hover:bg-cyan-800/30 text-white font-medium py-2 px-4 rounded-lg transition border border-cyan-200/40"
          >
            <Home className="w-4 h-4" />
            Admin Dashboard
          </a>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-gray-800 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('blog')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md font-medium text-sm transition-all ${
              activeTab === 'blog'
                ? 'bg-orange text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            Blog Posts
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-md font-medium text-sm transition-all ${
              activeTab === 'media'
                ? 'bg-orange text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Media Gallery
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'blog' ? (
          <BlogTab profile={profile} />
        ) : (
          <MediaTab isAdmin={isAdmin} />
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// BLOG TAB
// ═══════════════════════════════════════════════════════════
function BlogTab({ profile }: { profile: { id: string; full_name?: string | null } | null }) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all')

  // Edit/Create modal
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'General',
    thumbnail_url: '',
    published: false,
    featured: false,
    read_time: '5 min read',
  })

  // Delete
  const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setPosts(data || [])
    } catch (err) {
      console.error('Failed to fetch blog posts:', err)
      setError('Failed to load blog posts. Make sure the blog_posts table exists.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (
          !post.title.toLowerCase().includes(query) &&
          !post.excerpt?.toLowerCase().includes(query) &&
          !post.category.toLowerCase().includes(query)
        ) return false
      }
      if (filterCategory !== 'all' && post.category !== filterCategory) return false
      if (filterStatus === 'published' && !post.published) return false
      if (filterStatus === 'draft' && post.published) return false
      return true
    })
  }, [posts, searchQuery, filterCategory, filterStatus])

  const openCreateModal = () => {
    setPostForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'General',
      thumbnail_url: '',
      published: false,
      featured: false,
      read_time: '5 min read',
    })
    setEditingPost(null)
    setIsCreating(true)
  }

  const openEditModal = (post: BlogPost) => {
    setPostForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      category: post.category,
      thumbnail_url: post.thumbnail_url || '',
      published: post.published,
      featured: post.featured,
      read_time: post.read_time,
    })
    setEditingPost(post)
    setIsCreating(true)
  }

  const handleSavePost = async () => {
    if (!postForm.title.trim() || !postForm.slug.trim()) {
      setError('Title and slug are required')
      return
    }

    setSaving(true)
    setError('')
    try {
      const supabase = createClient()

      const postData = {
        title: postForm.title.trim(),
        slug: postForm.slug.trim(),
        excerpt: postForm.excerpt.trim() || null,
        content: postForm.content,
        category: postForm.category,
        thumbnail_url: postForm.thumbnail_url.trim() || null,
        published: postForm.published,
        featured: postForm.featured,
        read_time: postForm.read_time.trim() || '5 min read',
        author_id: profile?.id || null,
      }

      if (editingPost) {
        // Update
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id)

        if (updateError) throw updateError
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from('blog_posts')
          .insert(postData)

        if (insertError) throw insertError
      }

      await fetchPosts()
      setIsCreating(false)
      setEditingPost(null)
    } catch (err: any) {
      console.error('Save error:', err)
      if (err?.message?.includes('duplicate key') || err?.message?.includes('unique')) {
        setError('A post with this slug already exists. Please use a different slug.')
      } else {
        setError(err?.message || 'Failed to save post')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublished = async (post: BlogPost) => {
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({ published: !post.published })
        .eq('id', post.id)

      if (updateError) throw updateError
      await fetchPosts()
    } catch (err) {
      console.error('Toggle error:', err)
      setError('Failed to update post status')
    }
  }

  const handleDeletePost = async () => {
    if (!deletingPost) return
    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', deletingPost.id)

      if (deleteError) throw deleteError
      await fetchPosts()
      setDeletingPost(null)
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete post')
    }
  }

  // Insert text at cursor position in content textarea
  const insertAtCursor = (text: string) => {
    const textarea = contentRef.current
    if (!textarea) {
      setPostForm(prev => ({ ...prev, content: prev.content + '\n' + text }))
      return
    }
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const before = postForm.content.substring(0, start)
    const after = postForm.content.substring(end)
    const needsNewline = before.length > 0 && !before.endsWith('\n') ? '\n' : ''
    const newContent = before + needsNewline + text + '\n' + after
    setPostForm(prev => ({ ...prev, content: newContent }))
    // Restore focus after state update
    setTimeout(() => {
      textarea.focus()
      const newPos = start + needsNewline.length + text.length + 1
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }

  // Upload image for blog content
  const handleImageUpload = async (file: File, isThumbnail: boolean = false) => {
    if (file.size > 5 * 1024 * 1024) {
      setError('Image too large (max 5MB)')
      return
    }
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext || !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      setError('Invalid file type. Use JPG, PNG, GIF, or WebP')
      return
    }

    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/blog/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')

      if (isThumbnail) {
        setPostForm(prev => ({ ...prev, thumbnail_url: data.url }))
      } else {
        insertAtCursor(`![${file.name}](${data.url})`)
      }
    } catch (err: any) {
      setError(err.message || 'Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  // Prompt for YouTube URL and insert embed
  const handleYouTubeEmbed = () => {
    const url = prompt('Paste a YouTube or Vimeo video URL:')
    if (!url) return

    // Validate it looks like a video URL
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be')
    const isVimeo = url.includes('vimeo.com')
    if (!isYouTube && !isVimeo) {
      setError('Please paste a valid YouTube or Vimeo URL')
      return
    }
    insertAtCursor(`[video](${url})`)
  }

  const publishedCount = posts.filter(p => p.published).length
  const draftCount = posts.filter(p => !p.published).length

  return (
    <>
      {/* Blog Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          label="Total Posts"
          value={posts.length.toString()}
        />
        <StatCard
          icon={<Eye className="w-5 h-5" />}
          label="Published"
          value={publishedCount.toString()}
          color="text-green-400"
        />
        <StatCard
          icon={<EyeOff className="w-5 h-5" />}
          label="Drafts"
          value={draftCount.toString()}
          color="text-yellow-400"
        />
        <StatCard
          icon={<Star className="w-5 h-5" />}
          label="Featured"
          value={posts.filter(p => p.featured).length.toString()}
          color="text-orange"
        />
      </div>

      {/* Filters + New Post */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-cyan"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-cyan"
          >
            <option value="all">All Categories</option>
            {BLOG_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'published' | 'draft')}
            className="px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-cyan"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>

          {/* New Post Button */}
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-orange hover:bg-orange/80 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            New Post
          </button>
        </div>
        <div className="mt-3 text-sm text-gray-400">
          Showing {filteredPosts.length} of {posts.length} posts
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900 text-red-200 p-4 rounded-lg">
          {error}
          <button onClick={() => setError('')} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Posts List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-orange animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Loading blog posts...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <Newspaper className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">
            {posts.length === 0 ? 'No blog posts yet' : 'No posts match your filters'}
          </p>
          {posts.length === 0 && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-orange hover:bg-orange/80 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              Create Your First Post
            </button>
          )}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Post</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredPosts.map(post => (
                  <tr key={post.id} className="hover:bg-gray-750">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* Thumbnail */}
                        <div className="w-14 h-14 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          {post.thumbnail_url ? (
                            <img
                              src={post.thumbnail_url}
                              alt={post.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium truncate max-w-[300px]">{post.title}</p>
                            {post.featured && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                          </div>
                          <p className="text-gray-400 text-xs truncate max-w-[300px]">
                            /{post.slug} &middot; {post.read_time}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-cyan/10 text-cyan text-xs rounded-full border border-cyan/20">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleTogglePublished(post)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition ${
                          post.published
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30'
                        }`}
                      >
                        {post.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {post.published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {formatDate(post.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(post)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {post.published && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition"
                            title="View on site"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => setDeletingPost(post)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition"
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

      {/* Create/Edit Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/70 flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg max-w-3xl w-full my-8">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingPost ? 'Edit Post' : 'New Blog Post'}
                </h2>
                <button
                  onClick={() => { setIsCreating(false); setEditingPost(null); setError('') }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 block">Title</label>
                  <input
                    type="text"
                    value={postForm.title}
                    onChange={(e) => {
                      const title = e.target.value
                      setPostForm(prev => ({
                        ...prev,
                        title,
                        // Auto-generate slug only when creating new
                        ...(!editingPost ? { slug: slugify(title) } : {})
                      }))
                    }}
                    placeholder="5 Keys to Increasing Pitching Velocity"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-cyan"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 block">
                    URL Slug
                    <span className="text-gray-500 font-normal ml-2">/blog/{postForm.slug || '...'}</span>
                  </label>
                  <input
                    type="text"
                    value={postForm.slug}
                    onChange={(e) => setPostForm(prev => ({ ...prev, slug: slugify(e.target.value) }))}
                    placeholder="increasing-pitching-velocity"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-cyan"
                  />
                </div>

                {/* Row: Category + Read Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-1.5 block">Category</label>
                    <select
                      value={postForm.category}
                      onChange={(e) => setPostForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-cyan"
                    >
                      {BLOG_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-1.5 block">Read Time</label>
                    <input
                      type="text"
                      value={postForm.read_time}
                      onChange={(e) => setPostForm(prev => ({ ...prev, read_time: e.target.value }))}
                      placeholder="5 min read"
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-cyan"
                    />
                  </div>
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 block">
                    Thumbnail Image
                  </label>
                  <div className="flex items-center gap-3">
                    {postForm.thumbnail_url ? (
                      <div className="relative w-20 h-14 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={postForm.thumbnail_url}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                        <button
                          type="button"
                          onClick={() => setPostForm(prev => ({ ...prev, thumbnail_url: '' }))}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded border border-gray-600 transition text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      {postForm.thumbnail_url ? 'Change' : 'Upload Thumbnail'}
                    </button>
                    <span className="text-gray-500 text-xs">or</span>
                    <input
                      type="text"
                      value={postForm.thumbnail_url}
                      onChange={(e) => setPostForm(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                      placeholder="Paste URL..."
                      className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-cyan text-sm"
                    />
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, true)
                        e.target.value = ''
                      }}
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 block">Excerpt</label>
                  <textarea
                    value={postForm.excerpt}
                    onChange={(e) => setPostForm(prev => ({ ...prev, excerpt: e.target.value }))}
                    rows={2}
                    placeholder="A short summary that appears on the blog listing page..."
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-cyan resize-none"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 block">
                    Content
                    <span className="text-gray-500 font-normal ml-2">Supports Markdown (## headings, **bold**, - lists)</span>
                  </label>
                  {/* Media Toolbar */}
                  <div className="flex items-center gap-2 mb-2 p-2 bg-gray-700/50 rounded-t border border-gray-600 border-b-0">
                    <label
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition cursor-pointer ${
                        uploading
                          ? 'bg-gray-600 text-gray-400 cursor-wait'
                          : 'bg-cyan-900/50 hover:bg-cyan-900 text-cyan border border-cyan/30'
                      }`}
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ImageIcon className="w-4 h-4" />
                      )}
                      {uploading ? 'Uploading...' : 'Add Image'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file, false)
                          e.target.value = ''
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleYouTubeEmbed}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/50 hover:bg-red-900 text-red-400 border border-red-500/30 rounded text-sm font-medium transition"
                    >
                      <Youtube className="w-4 h-4" />
                      Embed Video
                    </button>
                    <span className="text-gray-500 text-xs ml-auto">Images: max 5MB | Videos: YouTube/Vimeo links</span>
                  </div>
                  <textarea
                    ref={contentRef}
                    value={postForm.content}
                    onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={12}
                    placeholder="Write your blog post content here...&#10;&#10;## Use Markdown Headings&#10;&#10;- And bullet points&#10;- **Bold text** for emphasis&#10;&#10;Add images with the toolbar above, or type:&#10;![alt text](/media/blog/image.jpg)&#10;&#10;Embed videos:&#10;[video](https://youtube.com/watch?v=...)"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-b border border-gray-600 focus:outline-none focus:border-cyan resize-y font-mono text-sm"
                  />
                </div>

                {/* Toggles: Published + Featured */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setPostForm(prev => ({ ...prev, published: !prev.published }))}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        postForm.published ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          postForm.published ? 'translate-x-[22px]' : 'translate-x-0.5'
                        }`}
                      />
                    </div>
                    <span className="text-gray-300 text-sm font-medium">
                      {postForm.published ? 'Published' : 'Draft'}
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setPostForm(prev => ({ ...prev, featured: !prev.featured }))}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        postForm.featured ? 'bg-orange' : 'bg-gray-600'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          postForm.featured ? 'translate-x-[22px]' : 'translate-x-0.5'
                        }`}
                      />
                    </div>
                    <span className="text-gray-300 text-sm font-medium">
                      {postForm.featured ? 'Featured' : 'Not Featured'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Error in modal */}
              {error && (
                <div className="mt-4 bg-red-900/50 text-red-300 p-3 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setIsCreating(false); setEditingPost(null); setError('') }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2.5 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePost}
                  disabled={saving}
                  className="flex-1 bg-orange hover:bg-orange/80 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingPost ? 'Save Changes' : 'Create Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPost && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">Delete Post?</h2>
            <p className="text-gray-400 mb-2">Are you sure you want to delete this blog post?</p>
            <p className="text-white font-medium mb-4">{deletingPost.title}</p>
            <p className="text-red-400 text-sm mb-6">
              This action cannot be undone. The post will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingPost(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// MEDIA TAB (existing functionality preserved)
// ═══════════════════════════════════════════════════════════
function MediaTab({ isAdmin }: { isAdmin: boolean }) {
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

  const fetchMedia = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/media')
      if (!response.ok) throw new Error('Failed to fetch media')
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
    if (isAdmin) fetchMedia()
  }, [isAdmin])

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          item.title?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.filename.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }
      if (filterType !== 'all') {
        const itemType = item.id.split('/')[0]
        if (itemType !== filterType) return false
      }
      if (filterMediaType !== 'all' && item.type !== filterMediaType) return false
      if (filterFeatured !== null && item.featured !== filterFeatured) return false
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
        headers: { 'Content-Type': 'application/json' },
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

  return (
    <>
      {/* Stats Cards */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Database className="w-5 h-5" />} label="Total Items" value={items.length.toString()} />
          <StatCard icon={<HardDrive className="w-5 h-5" />} label="Total Size" value={formatBytes(items.reduce((acc, item) => acc + (item.fileSize || 0), 0))} />
          <StatCard icon={<ImageIcon className="w-5 h-5" />} label="Local Files" value={items.filter(item => !item.isExternal).length.toString()} />
          <StatCard icon={<Cloud className="w-5 h-5" />} label="External URLs" value={items.filter(item => item.isExternal).length.toString()} />
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, description, filename..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
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
        <div className="mt-3 text-sm text-gray-400">
          Showing {filteredItems.length} of {items.length} items
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900 text-red-200 p-4 rounded-lg">
          {error}
          <button onClick={() => setError('')} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Media Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading media...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <p className="text-gray-400">No media items found</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Preview</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Title / Filename</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Gallery</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Size</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
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
                                  {item.type === 'url' ? <Link2 className="w-6 h-6 text-gray-400" /> : <Video className="w-6 h-6 text-gray-400" />}
                                </div>
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
                          return (
                            <div className="w-full h-full flex items-center justify-center">
                              {item.type === 'url' ? <Link2 className="w-6 h-6 text-gray-400" /> : <Video className="w-6 h-6 text-gray-400" />}
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
                            <p className="text-gray-400 text-xs truncate max-w-[200px]">{item.filename}</p>
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
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">{item.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-400">
                        {item.type === 'image' && <ImageIcon className="w-4 h-4" />}
                        {item.type === 'video' && <Video className="w-4 h-4" />}
                        {item.type === 'url' && <Link2 className="w-4 h-4" />}
                        <span className="text-xs capitalize">{item.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {item.fileSize ? formatBytes(item.fileSize) : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {formatDate(item.uploadDate)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(item)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition" title="View">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button onClick={() => setDeletingItem(item)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition" title="Delete">
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
                  <p className="text-gray-400 text-sm capitalize">{type.replace(/-/g, ' ')}</p>
                  <p className="text-white font-medium mt-1">{typeStats.count} items</p>
                  <p className="text-gray-400 text-xs">{formatBytes(typeStats.size)}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Edit Media</h2>
                <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="media-featured"
                    checked={editForm.featured}
                    onChange={(e) => setEditForm(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="media-featured" className="text-gray-300">Featured Item</label>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    External URL (CDN)
                    <span className="text-gray-500 font-normal ml-2">- Replace local with hosted URL</span>
                  </label>
                  <input
                    type="url"
                    value={editForm.externalUrl}
                    onChange={(e) => setEditForm(prev => ({ ...prev, externalUrl: e.target.value }))}
                    placeholder="https://cdn.example.com/image.jpg"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Show in Galleries
                    <span className="text-gray-500 font-normal ml-2">- Item appears in all selected</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GALLERY_TYPES.map(gallery => (
                      <button
                        key={gallery}
                        onClick={() => toggleGallery(gallery)}
                        className={`px-3 py-1 rounded text-sm transition ${
                          editForm.galleries.includes(gallery)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        {gallery.replace(/-/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setEditingItem(null)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition">
                  Cancel
                </button>
                <button onClick={handleSaveEdit} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition">
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
            <p className="text-gray-400 mb-2">Are you sure you want to delete this item?</p>
            <p className="text-white font-medium mb-4 break-all">{deletingItem.title || deletingItem.filename}</p>
            <p className="text-red-400 text-sm mb-6">
              This action cannot be undone. The file and its thumbnail will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingItem(null)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition">
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════
function StatCard({ icon, label, value, color = 'text-blue-400' }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className={color}>{icon}</div>
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-white font-bold text-xl">{value}</p>
        </div>
      </div>
    </div>
  )
}
