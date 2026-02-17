'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, BookOpen, CheckCircle, Circle, Lock, Play, Video, Loader2 } from 'lucide-react'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { VideoPlayer } from '@/components/ui/video-player'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Lesson {
  id: string
  title: string
  description: string | null
  video_url: string
  sort_order: number
  duration_seconds: number | null
  is_preview: boolean
  completed: boolean
}

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  thumbnail_url: string | null
  category: string | null
  price_cents: number
  pricing_type: string
  included_in_membership: boolean
}

export default function CourseDetailPage() {
  const supabase = createClient()
  const params = useParams()
  const slug = params.slug as string
  const { profile, loading: roleLoading, impersonatedUserId } = useUserRole()

  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [markingComplete, setMarkingComplete] = useState(false)

  const effectiveUserId = impersonatedUserId || profile?.id

  useEffect(() => {
    if (effectiveUserId && slug) fetchCourse()
  }, [effectiveUserId, slug])

  const fetchCourse = async () => {
    setLoading(true)

    // Fetch course
    const { data: courseData } = await supabase
      .from('courses')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!courseData) { setLoading(false); return }
    setCourse(courseData)

    // Check enrollment
    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('athlete_id', effectiveUserId!)
      .eq('course_id', courseData.id)
      .maybeSingle()

    setEnrolled(!!enrollment)

    // Fetch lessons
    const { data: lessonData } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('course_id', courseData.id)
      .order('sort_order')

    // Fetch progress
    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('lesson_id, completed')
      .eq('athlete_id', effectiveUserId!)

    const completedSet = new Set(
      (progressData || []).filter(p => p.completed).map(p => p.lesson_id)
    )

    const mappedLessons: Lesson[] = (lessonData || []).map(l => ({
      ...l,
      completed: completedSet.has(l.id),
    }))

    setLessons(mappedLessons)

    // Auto-select first incomplete lesson, or first lesson
    const firstIncomplete = mappedLessons.find(l => !l.completed)
    setActiveLesson(firstIncomplete || mappedLessons[0] || null)

    setLoading(false)
  }

  const handleEnroll = async () => {
    if (!effectiveUserId || !course) return
    const { error } = await supabase.from('course_enrollments').insert({
      athlete_id: effectiveUserId,
      course_id: course.id,
      payment_status: 'free',
    })
    if (!error) {
      setEnrolled(true)
    }
  }

  const toggleComplete = async (lesson: Lesson) => {
    if (!effectiveUserId || !enrolled) return
    setMarkingComplete(true)

    const newCompleted = !lesson.completed

    if (newCompleted) {
      await supabase.from('lesson_progress').upsert({
        athlete_id: effectiveUserId,
        lesson_id: lesson.id,
        completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'athlete_id,lesson_id' })
    } else {
      await supabase.from('lesson_progress').update({
        completed: false,
        completed_at: null,
      }).eq('athlete_id', effectiveUserId).eq('lesson_id', lesson.id)
    }

    setLessons(lessons.map(l => l.id === lesson.id ? { ...l, completed: newCompleted } : l))
    if (activeLesson?.id === lesson.id) {
      setActiveLesson({ ...lesson, completed: newCompleted })
    }
    setMarkingComplete(false)
  }

  const completedCount = lessons.filter(l => l.completed).length
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Course not found</h2>
        <Link href="/courses" className="text-orange hover:underline">Back to courses</Link>
      </div>
    )
  }

  const canAccess = enrolled || (activeLesson?.is_preview)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Back Link */}
      <Link href="/courses" className="inline-flex items-center gap-2 text-cyan-700 dark:text-white/70 hover:text-orange transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">All Courses</span>
      </Link>

      {/* Course Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            {course.category && (
              <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase mb-1 block">{course.category}</span>
            )}
            <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-2">
              {course.title}
            </h1>
            {course.description && (
              <p className="text-cyan-800 dark:text-white/70 text-lg max-w-2xl">{course.description}</p>
            )}
          </div>

          {!enrolled && (
            <button onClick={handleEnroll} className="btn-primary flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {course.pricing_type === 'free' || course.included_in_membership ? 'Enroll Free' : 'Enroll Now'}
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {enrolled && lessons.length > 0 && (
          <div className="mt-6 glass-card p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {completedCount} of {lessons.length} lessons completed
              </span>
              <span className="text-sm font-bold text-orange">{progressPercent}%</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-orange rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Main Content: Video + Lesson List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2">
          {activeLesson && (enrolled || activeLesson.is_preview) ? (
            <div>
              <div className="rounded-2xl overflow-hidden bg-black mb-4">
                <VideoPlayer url={activeLesson.video_url} title={activeLesson.title} />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{activeLesson.title}</h2>
                  {activeLesson.description && (
                    <p className="text-sm text-cyan-700 dark:text-white/70">{activeLesson.description}</p>
                  )}
                </div>
                {enrolled && (
                  <button
                    onClick={() => toggleComplete(activeLesson)}
                    disabled={markingComplete}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      activeLesson.completed
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-cyan-50/50 text-cyan-700 dark:text-white border border-cyan-200/40 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {activeLesson.completed ? 'Completed' : 'Mark Complete'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-slate-800 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <Lock className="w-12 h-12 text-cyan-600 mx-auto mb-3" />
                <p className="text-white font-semibold mb-1">Enroll to access</p>
                <p className="text-sm text-white/60">This lesson requires enrollment</p>
              </div>
            </div>
          )}
        </div>

        {/* Lesson Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl border border-cyan-200/40 overflow-hidden">
            <div className="p-4 border-b border-cyan-200/20">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-cyan" />
                Lessons ({lessons.length})
              </h3>
            </div>
            <div className="divide-y divide-cyan-200/10 max-h-[600px] overflow-y-auto">
              {lessons.map((lesson, idx) => {
                const isActive = activeLesson?.id === lesson.id
                const canWatch = enrolled || lesson.is_preview

                return (
                  <button
                    key={lesson.id}
                    onClick={() => canWatch && setActiveLesson(lesson)}
                    disabled={!canWatch}
                    className={`w-full text-left p-4 transition-all ${
                      isActive
                        ? 'bg-orange/10 border-l-2 border-l-orange'
                        : canWatch
                          ? 'hover:bg-cyan-50/30 dark:hover:bg-white/5'
                          : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {lesson.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : canWatch ? (
                          <Circle className="w-5 h-5 text-cyan-600 dark:text-white/40" />
                        ) : (
                          <Lock className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${isActive ? 'text-orange' : 'text-slate-900 dark:text-white'}`}>
                          {idx + 1}. {lesson.title}
                        </p>
                        {lesson.is_preview && !enrolled && (
                          <span className="text-[10px] font-semibold text-green-400 uppercase">Free preview</span>
                        )}
                      </div>
                      {isActive && canWatch && (
                        <Play className="w-4 h-4 text-orange flex-shrink-0" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
