'use client'

import { useState } from 'react'
import { ImageUpload } from '@/components/admin/image-upload'
import { PLACEHOLDER_IMAGES, IMAGE_SPECS } from '@/lib/placeholder-images'
import { createClient } from '@/lib/supabase/client'
import { Image as ImageIcon, Info } from 'lucide-react'

export default function AdminImagesPage() {
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: boolean }>({})

  const handleUpload = async (file: File, category: string, path: string) => {
    const supabase = createClient()

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${path}-${Date.now()}.${fileExt}`
      const filePath = `${category}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('images').getPublicUrl(filePath)

      // Update configuration in database (you can create a table for this)
      // For now, we'll just log the success
      console.log('Image uploaded successfully:', publicUrl)

      setUploadStatus((prev) => ({ ...prev, [path]: true }))

      return publicUrl
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">
          Image <span className="text-gradient-orange">Management</span>
        </h1>
        <p className="text-lg text-slate-400">
          Replace placeholder images with high-quality team photography
        </p>
      </div>

      {/* Instructions */}
      <div className="glass-card p-6 mb-8 border-cyan/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-cyan/10 rounded-xl">
            <Info className="w-6 h-6 text-cyan" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Image Guidelines</h3>
            <ul className="text-sm text-slate-300 space-y-2">
              <li>• Upload images matching the exact aspect ratio for best results</li>
              <li>• Use high-resolution images (at least 2x the display dimensions)</li>
              <li>• File size should be under 5MB - compress if needed</li>
              <li>• WebP format recommended for best performance</li>
              <li>• Ensure proper lighting and clear subject focus</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Image Specs Reference */}
      <div className="glass-card p-6 mb-8">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-orange" />
          Image Specifications
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(IMAGE_SPECS).map(([name, spec]) => (
            <div key={name} className="p-4 bg-white/5 rounded-xl">
              <p className="text-sm font-semibold text-white mb-1">{name}</p>
              <p className="text-xs text-slate-400">{spec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Sections */}
      <div className="space-y-12">
        {/* Hero Section */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Hero Section</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <ImageUpload
              category="Hero Banner"
              currentImage={PLACEHOLDER_IMAGES.hero.main}
              aspectRatio="16/9"
              dimensions="1920x1080px"
              description={PLACEHOLDER_IMAGES.hero.note}
              onUpload={(file) => handleUpload(file, 'hero', 'main')}
            />
          </div>
        </section>

        {/* Feature Cards */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Feature Cards</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <ImageUpload
              category="Velocity Tracking"
              currentImage={PLACEHOLDER_IMAGES.features.velocityTracking}
              aspectRatio="3/2"
              dimensions="600x400px"
              description="Screenshot of velocity dashboard with performance charts"
              onUpload={(file) => handleUpload(file, 'features', 'velocity-tracking')}
            />
            <ImageUpload
              category="Drill Bank"
              currentImage={PLACEHOLDER_IMAGES.features.drillBank}
              aspectRatio="3/2"
              dimensions="600x400px"
              description="Athletes training with professional equipment"
              onUpload={(file) => handleUpload(file, 'features', 'drill-bank')}
            />
            <ImageUpload
              category="Personalized Training"
              currentImage={PLACEHOLDER_IMAGES.features.personalizedTraining}
              aspectRatio="3/2"
              dimensions="600x400px"
              description="One-on-one coaching session"
              onUpload={(file) => handleUpload(file, 'features', 'personalized-training')}
            />
          </div>
        </section>

        {/* Coach Headshots */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Coach Headshots</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <ImageUpload
              category="Coach Rachel"
              currentImage={PLACEHOLDER_IMAGES.coaches.rachel}
              aspectRatio="1/1"
              dimensions="400x400px"
              description={PLACEHOLDER_IMAGES.coaches.alt.rachel}
              onUpload={(file) => handleUpload(file, 'coaches', 'rachel')}
            />
            <ImageUpload
              category="Coach Mike"
              currentImage={PLACEHOLDER_IMAGES.coaches.mike}
              aspectRatio="1/1"
              dimensions="400x400px"
              description={PLACEHOLDER_IMAGES.coaches.alt.mike}
              onUpload={(file) => handleUpload(file, 'coaches', 'mike')}
            />
            <ImageUpload
              category="Coach Sarah"
              currentImage={PLACEHOLDER_IMAGES.coaches.sarah}
              aspectRatio="1/1"
              dimensions="400x400px"
              description={PLACEHOLDER_IMAGES.coaches.alt.sarah}
              onUpload={(file) => handleUpload(file, 'coaches', 'sarah')}
            />
          </div>
        </section>

        {/* Facility Photos */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Facility Photos</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <ImageUpload
              category="Training Center"
              currentImage={PLACEHOLDER_IMAGES.facility.training}
              aspectRatio="16/9"
              dimensions="1200x675px"
              description={PLACEHOLDER_IMAGES.facility.alt.training}
              onUpload={(file) => handleUpload(file, 'facility', 'training')}
            />
            <ImageUpload
              category="Equipment"
              currentImage={PLACEHOLDER_IMAGES.facility.equipment}
              aspectRatio="16/9"
              dimensions="1200x675px"
              description={PLACEHOLDER_IMAGES.facility.alt.equipment}
              onUpload={(file) => handleUpload(file, 'facility', 'equipment')}
            />
            <ImageUpload
              category="Indoor Bay"
              currentImage={PLACEHOLDER_IMAGES.facility.indoor}
              aspectRatio="16/9"
              dimensions="1200x675px"
              description={PLACEHOLDER_IMAGES.facility.alt.indoor}
              onUpload={(file) => handleUpload(file, 'facility', 'indoor')}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
