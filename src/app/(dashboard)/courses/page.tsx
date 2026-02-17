'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, Video, Play, CheckCircle, Loader2 } from 'lucide-react'
import { useUserRole } from '@/lib/hooks/use-user-role'
import Link from 'next/link'

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  thumbnail_url: string | null
  category: string | null
  price_cents: number
  pricing_type: string
  is_active: boolean
  included_in_membership: boolean
  lesson_count: number
  enrolled: boolean
  progress: number // 0-100
}

export default function CoursesPage() {
  const supabase = createClient()
  const { profile, isCoach, isAdmin, loading: roleLoading, impersonatedUserId } = useUserRole()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'enrolled' | 'available'>('all')

  const effectiveUserId = impersonatedUserId || profile?.id

  useEffect(() => {
    if (effectiveUserId) fetchCourses()
  }, [effectiveUserId])

  const fetchCourses = async () => {
    setLoading(true)

    // Fetch all active courses with lesson counts
    const { data: coursesData } = await supabase
      .from('courses')
      .select('*, course_lessons(id)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (!coursesData) { setLoading(false); return }

    // Fetch user's enrollments
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('course_id')
      .eq('athlete_id', effectiveUserId!)

    const enrolledIds = new Set((enrollments || []).map(e => e.course_id))

    // Fetch lesson progress for enrolled courses
    const { data: progress } = await supabase
      .from('lesson_progress')
      .select('lesson_id, completed')
      .eq('athlete_id', effectiveUserId!)

    const completedLessons = new Set((progress || []).filter(p => p.completed).map(p => p.lesson_id))

    // Get lesson IDs per course for progress calculation
    const courseList: Course[] = coursesData.map((c: any) => {
      const lessonIds = (c.course_lessons || []).map((l: any) => l.id)
      const completedCount = lessonIds.filter((id: string) => completedLessons.has(id)).length
      const totalLessons = lessonIds.length

      return {
        id: c.id,
        title: c.title,
        slug: c.slug,
        description: c.description,
        thumbnail_url: c.thumbnail_url,
        category: c.category,
        price_cents: c.price_cents,
        pricing_type: c.pricing_type,
        is_active: c.is_active,
        included_in_membership: c.included_in_membership,
        lesson_count: totalLessons,
        enrolled: enrolledIds.has(c.id),
        progress: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
      }
    })

    setCourses(courseList)
    setLoading(false)
  }

  const handleEnroll = async (courseId: string) => {
    if (!effectiveUserId) return

    const { error } = await supabase.from('course_enrollments').insert({
      athlete_id: effectiveUserId,
      course_id: courseId,
      payment_status: 'free',
    })

    if (error) {
      console.error('Enrollment error:', error)
      return
    }

    fetchCourses()
  }

  const filtered = courses.filter(c => {
    if (filter === 'enrolled') return c.enrolled
    if (filter === 'available') return !c.enrolled
    return true
  })

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-2">
          Video <span className="text-gradient-orange">Courses</span>
        </h1>
        <p className="text-cyan-800 dark:text-white text-lg">
          Level up your game with expert training videos
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        {[
          { value: 'all', label: 'All Courses' },
          { value: 'enrolled', label: 'My Courses' },
          { value: 'available', label: 'Available' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value as any)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === f.value
                ? 'bg-orange text-white shadow-lg shadow-orange/30'
                : 'glass-card text-slate-700 dark:text-white hover:bg-cyan-50/50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <BookOpen className="w-12 h-12 text-cyan-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {filter === 'enrolled' ? 'No enrolled courses' : 'No courses available'}
          </h3>
          <p className="text-cyan-700 dark:text-white/70">
            {filter === 'enrolled' ? 'Browse available courses to get started.' : 'Check back soon for new courses.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(course => (
            <div key={course.id} className="glass-card rounded-2xl border border-cyan-200/40 overflow-hidden hover:border-cyan/40 transition-all group">
              {/* Thumbnail */}
              <div className="aspect-video bg-slate-800 relative overflow-hidden">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-cyan-600" />
                  </div>
                )}
                {/* Overlay badge */}
                {course.enrolled && course.progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-700">
                    <div className="h-full bg-orange transition-all" style={{ width: `${course.progress}%` }} />
                  </div>
                )}
              </div>

              <div className="p-5">
                {/* Category & Price */}
                <div className="flex items-center justify-between mb-2">
                  {course.category && (
                    <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase">{course.category}</span>
                  )}
                  <span className={`text-sm font-bold ${course.pricing_type === 'free' || course.included_in_membership ? 'text-green-400' : 'text-orange'}`}>
                    {course.pricing_type === 'free' || course.included_in_membership
                      ? 'Free'
                      : `$${(course.price_cents / 100).toFixed(2)}${course.pricing_type === 'monthly' ? '/mo' : ''}`
                    }
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{course.title}</h3>
                {course.description && (
                  <p className="text-sm text-cyan-700 dark:text-white/70 mb-3 line-clamp-2">{course.description}</p>
                )}

                <div className="flex items-center gap-3 text-sm text-cyan-700 dark:text-white/60 mb-4">
                  <div className="flex items-center gap-1">
                    <Video className="w-4 h-4" />
                    <span>{course.lesson_count} lessons</span>
                  </div>
                  {course.enrolled && course.progress > 0 && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>{course.progress}% complete</span>
                    </div>
                  )}
                </div>

                {course.enrolled ? (
                  <Link href={`/courses/${course.slug}`}>
                    <button className="btn-primary w-full flex items-center justify-center gap-2">
                      <Play className="w-4 h-4" />
                      {course.progress > 0 ? 'Continue' : 'Start Course'}
                    </button>
                  </Link>
                ) : (
                  <button onClick={() => handleEnroll(course.id)} className="btn-primary w-full flex items-center justify-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {course.pricing_type === 'free' || course.included_in_membership ? 'Enroll Free' : 'Enroll Now'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
