'use client'

import { useState } from 'react'
import { galleryCategories } from '@/config/gallery-categories'

export default function AdminUploadPage() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [galleryType, setGalleryType] = useState<'photography' | 'video' | 'drone' | 'podcast' | 'media-production' | 'motion-graphics' | 'digital-builds' | 'website-redesign'>('photography')
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [featured, setFeatured] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file')
  const [mediaUrl, setMediaUrl] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      if (res.ok) {
        setIsAuthenticated(true)
        setMessage('')
      } else {
        setMessage('Invalid password')
      }
    } catch {
      setMessage('Connection error')
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate based on upload mode
    if (uploadMode === 'file' && !file) {
      setMessage('Please select a file')
      return
    }
    if (uploadMode === 'url' && !mediaUrl) {
      setMessage('Please enter a URL')
      return
    }
    if (!category) {
      setMessage('Please select a category')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('type', galleryType)
      formData.append('category', category)
      formData.append('title', title || (uploadMode === 'file' ? file?.name || '' : 'Linked Media'))
      formData.append('description', description)
      formData.append('featured', featured.toString())
      formData.append('uploadMode', uploadMode)

      if (uploadMode === 'file' && file) {
        formData.append('file', file)
      } else if (uploadMode === 'url') {
        formData.append('mediaUrl', mediaUrl)
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✓ ${uploadMode === 'file' ? 'Upload' : 'Link added'} successful!`)
        // Reset form
        setFile(null)
        setMediaUrl('')
        setTitle('')
        setDescription('')
        setFeatured(false)
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setMessage(`✗ ${uploadMode === 'file' ? 'Upload' : 'Link'} failed: ${data.error}`)
      }
    } catch (error) {
      setMessage(`✗ ${uploadMode === 'file' ? 'Upload' : 'Link'} failed: ${error}`)
    } finally {
      setUploading(false)
    }
  }

  const availableCategories = galleryCategories[galleryType]

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-6">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="Enter admin password"
              />
            </div>
            {message && (
              <p className="text-red-400 text-sm">{message}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Gallery Upload</h1>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-gray-400 hover:text-white transition"
            >
              Logout
            </button>
          </div>

          <form onSubmit={handleUpload} className="space-y-6">
            {/* Gallery Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gallery Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(['photography', 'video', 'drone', 'podcast', 'media-production', 'motion-graphics', 'digital-builds', 'website-redesign'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setGalleryType(type)
                      setCategory('') // Reset category when type changes
                    }}
                    className={`py-3 px-4 rounded font-medium capitalize transition ${
                      galleryType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {type.replace(/-/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select a category...</option>
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload Mode Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload Method
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`py-3 px-4 rounded font-medium transition ${
                    uploadMode === 'file'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`py-3 px-4 rounded font-medium transition ${
                    uploadMode === 'url'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Add URL Link
                </button>
              </div>
            </div>

            {/* File Upload */}
            {uploadMode === 'file' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  File
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700"
                />
                {file && (
                  <p className="mt-2 text-sm text-gray-400">
                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            )}

            {/* URL Input */}
            {uploadMode === 'url' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Media URL
                </label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="https://youtube.com/... or https://vimeo.com/... or any image/video URL"
                />
                <p className="mt-2 text-sm text-gray-400">
                  Supports: YouTube, Vimeo, direct image/video URLs
                </p>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title (optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="Enter title..."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="Enter description..."
              />
            </div>

            {/* Featured */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="featured" className="ml-2 text-sm text-gray-300">
                Mark as featured
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded transition"
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded ${
                message.startsWith('✓')
                  ? 'bg-green-900 text-green-200'
                  : 'bg-red-900 text-red-200'
              }`}>
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
