'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  category: string
  currentImage?: string
  aspectRatio: string
  dimensions: string
  onUpload: (file: File) => Promise<void>
  description?: string
}

export function ImageUpload({
  category,
  currentImage,
  aspectRatio,
  dimensions,
  onUpload,
  description,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    setUploading(true)
    setError(null)
    setSuccess(false)

    try {
      await onUpload(file)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleClear = () => {
    setPreview(null)
    setError(null)
    setSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white mb-1">{category}</h3>
        <div className="flex items-center gap-4 text-sm text-cyan-700 dark:text-white">
          <span>Aspect Ratio: {aspectRatio}</span>
          <span>•</span>
          <span>Dimensions: {dimensions}</span>
        </div>
        {description && (
          <p className="text-sm text-cyan-700 dark:text-white mt-2">{description}</p>
        )}
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl transition-all ${
          dragActive
            ? 'border-cyan bg-cyan/10'
            : preview
              ? 'border-green-400/30 bg-green-400/5'
              : 'border-cyan-700/50 hover:border-cyan-600/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative" style={{ aspectRatio }}>
            <Image
              src={preview}
              alt={`${category} preview`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover rounded-lg"
            />
            {/* Clear Button */}
            <button
              onClick={handleClear}
              aria-label="Remove image"
              className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-500 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {/* Success Overlay */}
            {success && (
              <div className="absolute inset-0 bg-green-400/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <div className="bg-green-400/90 px-6 py-3 rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">Uploaded!</span>
                </div>
              </div>
            )}

            {/* Loading Overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <div className="bg-cyan/90 px-6 py-3 rounded-xl">
                  <span className="text-white font-semibold">Uploading...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className="p-12 text-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange/10 rounded-full mb-4">
              <ImageIcon className="w-8 h-8 text-orange" />
            </div>
            <p className="text-white font-semibold mb-2">
              Drop image here or click to upload
            </p>
            <p className="text-sm text-cyan-700 dark:text-white">
              PNG, JPG, WebP up to 5MB
            </p>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Button */}
      {!preview && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
        >
          <Upload className="w-5 h-5" />
          <span>Choose Image</span>
        </button>
      )}
    </div>
  )
}
