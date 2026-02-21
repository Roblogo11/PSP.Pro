'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserRole } from '@/lib/hooks/use-user-role'
import {
  Upload, Video, Link2, Camera, Sun, User2, Loader2,
  CheckCircle2, AlertCircle, Play, X, ChevronDown, ChevronUp,
  Eye, Crosshair, Lightbulb, Film,
} from 'lucide-react'
import { toastError } from '@/lib/toast'

type SubmissionType = 'upload' | 'youtube'

const FILMING_GUIDELINES = [
  {
    icon: Camera,
    title: 'Camera Angle',
    description: 'Film from the side (3rd base side for RHP, 1st base side for LHP). Camera should be at hip height, perpendicular to the pitcher.',
    color: 'cyan',
  },
  {
    icon: User2,
    title: 'Full Body View',
    description: 'Make sure the entire body is in frame from start to finish — from the wind-up through the follow-through. Don\'t cut off the feet or the hand.',
    color: 'orange',
  },
  {
    icon: Sun,
    title: 'Proper Lighting',
    description: 'Film in well-lit conditions. Avoid backlighting (don\'t film toward the sun). Indoor facilities with overhead lighting work great.',
    color: 'yellow',
  },
  {
    icon: Film,
    title: 'Slow Motion',
    description: 'Use slow-motion recording (120fps or 240fps) if your phone supports it. This allows us to break down mechanics frame-by-frame.',
    color: 'green',
  },
  {
    icon: Crosshair,
    title: 'Close-Up: Arm Action',
    description: 'If possible, get a second clip zoomed in on the arm from behind or slightly offset. This helps analyze arm slot, elbow position, and wrist snap.',
    color: 'purple',
  },
  {
    icon: Eye,
    title: 'Front View',
    description: 'A front-facing angle (from catcher\'s perspective) shows stride direction, glove side, and head position at release. Great supplemental footage.',
    color: 'blue',
  },
]

export default function VideoAnalysisPage() {
  const supabase = createClient()
  const { profile, isCoach, isAdmin } = useUserRole()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [submissionType, setSubmissionType] = useState<SubmissionType>('upload')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [athleteName, setAthleteName] = useState('')
  const [notes, setNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [success, setSuccess] = useState(false)
  const [showGuidelines, setShowGuidelines] = useState(true)

  // Athletes to assign to (for coaches)
  const [athletes, setAthletes] = useState<any[]>([])
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('')

  // Fetch athletes for coach view
  useEffect(() => {
    if ((isCoach || isAdmin) && profile) {
      supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'athlete')
        .order('full_name')
        .then(({ data }: { data: any }) => setAthletes(data || []))
    }
  }, [isCoach, isAdmin, profile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/mov']
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|mov|avi|webm)$/i)) {
      toastError('Please upload a video file (MP4, MOV, AVI, or WebM)')
      return
    }

    // 200MB limit
    if (file.size > 200 * 1024 * 1024) {
      toastError('Video must be under 200MB')
      return
    }

    setVideoFile(file)
    setVideoPreviewUrl(URL.createObjectURL(file))
  }, [])

  const clearVideo = () => {
    setVideoFile(null)
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
    setVideoPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const validateYoutubeUrl = (url: string) => {
    return /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[\w-]+/.test(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (uploading) return

    if (submissionType === 'youtube' && !validateYoutubeUrl(youtubeUrl)) {
      toastError('Please enter a valid YouTube URL')
      return
    }

    if (submissionType === 'upload' && !videoFile) {
      toastError('Please select a video file to upload')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      let videoUrl = ''

      if (submissionType === 'youtube') {
        videoUrl = youtubeUrl
        setUploadProgress(50)
      } else if (videoFile) {
        // Upload to Supabase storage
        const ext = videoFile.name.split('.').pop() || 'mp4'
        const fileName = `video-analysis/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        setUploadProgress(10)

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, videoFile, {
            contentType: videoFile.type,
            upsert: false,
          })

        if (uploadError) throw uploadError

        setUploadProgress(70)

        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(fileName)

        videoUrl = urlData.publicUrl
      }

      setUploadProgress(80)

      // Save the submission to database
      const submissionData: Record<string, any> = {
        athlete_id: (isCoach || isAdmin) ? (selectedAthleteId || profile?.id) : profile?.id,
        submitted_by: profile?.id,
        video_url: videoUrl,
        source_type: submissionType,
        notes: notes || null,
        athlete_name: athleteName || profile?.full_name || null,
        status: 'pending',
      }

      const { error: insertError } = await supabase
        .from('video_analysis_submissions')
        .insert(submissionData)

      if (insertError) throw insertError

      setUploadProgress(100)
      setSuccess(true)
    } catch (error: any) {
      console.error('Upload error:', error)
      toastError(error.message || 'Failed to submit video. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setSuccess(false)
    setVideoFile(null)
    setVideoPreviewUrl(null)
    setYoutubeUrl('')
    setNotes('')
    setAthleteName('')
    setSelectedAthleteId('')
    setUploadProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (success) {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto">
        <div className="glass-card p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Video Submitted!</h1>
          <p className="text-cyan-700 dark:text-white/70 mb-8 max-w-md mx-auto">
            Your video has been submitted for analysis. A coach will review it and provide detailed feedback on your mechanics.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={resetForm} className="btn-primary">
              Submit Another Video
            </button>
            <a href="/sessions" className="btn-ghost border border-cyan-200/30">
              View Sessions
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Video Analysis
        </h1>
        <p className="text-cyan-700 dark:text-white/70 text-lg">
          Upload your pitching or hitting video for professional analysis by our coaching staff.
        </p>
      </div>

      {/* Filming Guidelines */}
      <div className="glass-card mb-8 overflow-hidden">
        <button
          onClick={() => setShowGuidelines(!showGuidelines)}
          className="w-full flex items-center justify-between p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange/20 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-orange" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Filming Guidelines</h2>
              <p className="text-sm text-cyan-700 dark:text-white/60">Follow these tips for the best analysis results</p>
            </div>
          </div>
          {showGuidelines ? (
            <ChevronUp className="w-5 h-5 text-cyan-600 dark:text-white/50" />
          ) : (
            <ChevronDown className="w-5 h-5 text-cyan-600 dark:text-white/50" />
          )}
        </button>

        {showGuidelines && (
          <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FILMING_GUIDELINES.map((guide) => (
              <div key={guide.title} className="p-4 rounded-xl bg-cyan-50/30 dark:bg-white/5 border border-cyan-200/20">
                <div className="flex items-center gap-2 mb-2">
                  <guide.icon className={`w-4 h-4 text-${guide.color}-500 dark:text-${guide.color}-400`} />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{guide.title}</h3>
                </div>
                <p className="text-xs text-cyan-700 dark:text-white/60 leading-relaxed">{guide.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit}>
        <div className="glass-card p-6 space-y-6">
          {/* Submission Type Toggle */}
          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">How would you like to submit your video?</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSubmissionType('upload')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-medium transition-all ${
                  submissionType === 'upload'
                    ? 'bg-cyan/10 border-cyan/50 text-cyan-600 dark:text-cyan'
                    : 'bg-cyan-50/30 dark:bg-white/5 border-cyan-200/20 text-cyan-700 dark:text-white/60 hover:border-cyan-300/40'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload Video
              </button>
              <button
                type="button"
                onClick={() => setSubmissionType('youtube')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-medium transition-all ${
                  submissionType === 'youtube'
                    ? 'bg-cyan/10 border-cyan/50 text-cyan-600 dark:text-cyan'
                    : 'bg-cyan-50/30 dark:bg-white/5 border-cyan-200/20 text-cyan-700 dark:text-white/60 hover:border-cyan-300/40'
                }`}
              >
                <Link2 className="w-4 h-4" />
                YouTube Link
              </button>
            </div>
          </div>

          {/* Upload Area */}
          {submissionType === 'upload' ? (
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">Video File</label>
              {videoFile ? (
                <div className="relative rounded-xl overflow-hidden bg-black">
                  {videoPreviewUrl && (
                    <video
                      src={videoPreviewUrl}
                      controls
                      className="w-full max-h-64 object-contain"
                    />
                  )}
                  <div className="p-3 bg-cyan-50/30 dark:bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Video className="w-4 h-4 text-cyan-600 dark:text-cyan flex-shrink-0" />
                      <span className="text-sm text-slate-900 dark:text-white truncate">{videoFile.name}</span>
                      <span className="text-xs text-cyan-600 dark:text-white/50 flex-shrink-0">
                        ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
                      </span>
                    </div>
                    <button type="button" onClick={clearVideo} className="p-1 hover:bg-red-500/20 rounded">
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-cyan-200/40 dark:border-white/20 rounded-xl p-10 text-center cursor-pointer hover:border-cyan/50 hover:bg-cyan-50/10 dark:hover:bg-white/5 transition-all"
                >
                  <Upload className="w-10 h-10 text-cyan-400 dark:text-white/40 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-cyan-600 dark:text-white/50">
                    MP4, MOV, AVI, or WebM — Max 200MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,.mp4,.mov,.avi,.webm"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">YouTube URL</label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-3 bg-cyan-50/50 dark:bg-white/5 border border-cyan-200/40 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-cyan-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan/50"
              />
              <p className="text-xs text-cyan-600 dark:text-white/50 mt-2">
                Paste your YouTube or YouTube Shorts link
              </p>
            </div>
          )}

          {/* Coach: select athlete */}
          {(isCoach || isAdmin) && (
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">Athlete</label>
              <select
                value={selectedAthleteId}
                onChange={(e) => setSelectedAthleteId(e.target.value)}
                className="w-full px-4 py-3 bg-cyan-50/50 dark:bg-white/5 border border-cyan-200/40 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan/50"
              >
                <option value="">Select athlete (or submit for yourself)</option>
                {athletes.map((a) => (
                  <option key={a.id} value={a.id}>{a.full_name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Athlete Name (for non-logged-in context) */}
          {!isCoach && !isAdmin && (
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">Athlete Name</label>
              <input
                type="text"
                value={athleteName}
                onChange={(e) => setAthleteName(e.target.value)}
                placeholder={profile?.full_name || 'Your name'}
                className="w-full px-4 py-3 bg-cyan-50/50 dark:bg-white/5 border border-cyan-200/40 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-cyan-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan/50"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">
              Notes for the Coach <span className="font-normal text-cyan-600 dark:text-white/50">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any specific areas you'd like feedback on? (e.g., arm slot, hip rotation, stride length...)"
              className="w-full px-4 py-3 bg-cyan-50/50 dark:bg-white/5 border border-cyan-200/40 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-cyan-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan/50 resize-none"
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-cyan-700 dark:text-white/70">
                  {uploadProgress < 70 ? 'Uploading video...' : uploadProgress < 100 ? 'Saving submission...' : 'Complete!'}
                </span>
                <span className="font-bold text-cyan-600 dark:text-cyan">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-cyan-100/30 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan to-orange rounded-full transition-all duration-500"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading || (submissionType === 'upload' && !videoFile) || (submissionType === 'youtube' && !youtubeUrl)}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Submit for Analysis
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
