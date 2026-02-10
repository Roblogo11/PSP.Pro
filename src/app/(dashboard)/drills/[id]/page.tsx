'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import {
  ArrowLeft,
  Clock,
  TrendingUp,
  Tag,
  CheckCircle,
  Play,
  Award,
  Dumbbell
} from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { useUserRole } from '@/lib/hooks/use-user-role'

type Drill = Database['public']['Tables']['drills']['Row']

export default function DrillDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isImpersonating, impersonatedUserId } = useUserRole()
  const [drill, setDrill] = useState<Drill | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)
  const [completionCount, setCompletionCount] = useState(0)

  useEffect(() => {
    if (params.id) {
      fetchDrill(params.id as string)
    }
  }, [params.id, impersonatedUserId])

  const fetchDrill = async (id: string) => {
    try {
      const supabase = createClient()

      // Fetch drill
      const { data: drillData, error: drillError } = await supabase
        .from('drills')
        .select('*')
        .eq('id', id)
        .single()

      if (drillError) throw drillError

      setDrill(drillData)

      // Increment view count
      await supabase.rpc('increment_drill_views', { drill_uuid: id })

      // Check if user has completed this drill (use impersonated user if active)
      let userId = impersonatedUserId
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser()
        userId = user?.id || null
      }

      if (userId) {
        const { data: completions } = await supabase
          .from('drill_completions')
          .select('*')
          .eq('user_id', userId)
          .eq('drill_id', id)

        setCompletionCount(completions?.length || 0)
        setIsCompleted(!!completions && completions.length > 0)
      }
    } catch (error) {
      console.error('Error fetching drill:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsCompleted = async () => {
    if (isImpersonating) return
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || !drill) return

      const { error } = await supabase.from('drill_completions').insert({
        user_id: user.id,
        drill_id: drill.id,
      })

      if (error) throw error

      setIsCompleted(true)
      setCompletionCount((prev) => prev + 1)
    } catch (error) {
      console.error('Error marking drill as completed:', error)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const difficultyColors = {
    beginner: 'text-green-400 bg-green-400/10 border-green-400/20',
    intermediate: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    advanced: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  }

  if (loading) {
    return (
      <div className="min-h-screen px-3 py-4 md:p-6 lg:p-10">
        <div className="skeleton glass-card p-12 h-96" />
      </div>
    )
  }

  if (!drill) {
    return (
      <div className="min-h-screen px-3 py-4 md:p-6 lg:p-10 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Drill Not Found</h1>
          <Link href="/drills" className="btn-primary">
            Back to Training
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-3 py-4 md:p-6 lg:p-10">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-cyan-800 dark:text-white hover:text-orange transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Training
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <div className="glass-card overflow-hidden">
            <div className="relative aspect-video bg-cyan-900 flex items-center justify-center">
              {drill.video_url ? (
                <iframe
                  src={drill.video_url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <Play className="w-20 h-20 text-orange/50" />
                  <p className="text-cyan-800 dark:text-white">Video coming soon</p>
                </div>
              )}
            </div>
          </div>

          {/* Title & Meta */}
          <div className="glass-card p-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">
                  {drill.title}
                </h1>
                <p className="text-lg text-cyan-700 dark:text-white">{drill.description}</p>
              </div>

              {isImpersonating ? (
                <div className="ml-4 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 font-semibold flex items-center gap-2 text-sm">
                  Read-only mode
                </div>
              ) : !isCompleted ? (
                <button
                  onClick={markAsCompleted}
                  className="btn-primary flex items-center gap-2 ml-4"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark Complete
                </button>
              ) : (
                <div className="ml-4 px-4 py-2 bg-green-400/10 border border-green-400/20 rounded-xl text-green-400 font-semibold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Completed {completionCount}x
                </div>
              )}
            </div>

            {/* Meta Tags */}
            <div className="flex flex-wrap gap-3">
              {drill.tags && drill.tags.length > 0 && (
                <span className="px-3 py-2 bg-orange/10 text-orange text-sm font-medium rounded-lg border border-orange/20">
                  {drill.tags[0]}
                </span>
              )}
              <span
                className={`px-3 py-2 text-sm font-medium rounded-lg border capitalize ${
                  difficultyColors[drill.difficulty as keyof typeof difficultyColors]
                }`}
              >
                {drill.difficulty}
              </span>
              <span className="px-3 py-2 bg-cyan-50/50 text-cyan-700 dark:text-white text-sm font-medium rounded-lg border border-cyan-200/40 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formatDuration(drill.duration)}
              </span>
            </div>
          </div>

          {/* Instructions */}
          {drill.description && (
            <div className="glass-card p-8">
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">
                Instructions
              </h2>
              <div className="prose prose-invert prose-orange max-w-none">
                <ReactMarkdown>{drill.description}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-4">
              Drill Info
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-cyan-800 dark:text-white">Duration</span>
                <span className="text-slate-900 dark:text-white font-semibold">
                  {formatDuration(drill.duration)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cyan-800 dark:text-white">Your Completions</span>
                <span className="text-slate-900 dark:text-white font-semibold">{completionCount}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {drill.tags && drill.tags.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-orange" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {drill.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-cyan-50/50 text-cyan-700 dark:text-white text-sm rounded-lg border border-cyan-200/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
