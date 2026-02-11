'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Plus, Edit2, Trash2, X, Loader2, Video, Users, GripVertical,
  ChevronUp, ChevronDown, Eye, EyeOff, Play, BookOpen,
} from 'lucide-react'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { useRouter } from 'next/navigation'

interface CourseLesson {
  id?: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  sort_order: number
  duration_seconds: number
  is_preview: boolean
}

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  thumbnail_url: string | null
  category: string | null
  price_cents: number
  pricing_type: 'free' | 'one_time' | 'monthly'
  stripe_price_id: string | null
  is_active: boolean
  included_in_membership: boolean
  created_by: string | null
  created_at: string
  lessons?: CourseLesson[]
  enrollment_count?: number
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function AdminCoursesPage() {
  const supabase = createClient()
  const { isCoach, isAdmin, profile, loading: roleLoading } = useUserRole()
  const router = useRouter()

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  // Course form
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    category: '',
    price_cents: 0,
    pricing_type: 'free' as 'free' | 'one_time' | 'monthly',
    is_active: true,
    included_in_membership: false,
  })
  const [submitting, setSubmitting] = useState(false)

  // Lesson manager
  const [managingCourse, setManagingCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<CourseLesson[]>([])
  const [lessonForm, setLessonForm] = useState({ title: '', video_url: '', description: '', duration_seconds: 0, is_preview: false })
  const [lessonSubmitting, setLessonSubmitting] = useState(false)

  // Enrollment
  const [enrollCourse, setEnrollCourse] = useState<Course | null>(null)
  const [athletes, setAthletes] = useState<any[]>([])
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([])
  const [enrollSubmitting, setEnrollSubmitting] = useState(false)

  useEffect(() => {
    if (!roleLoading && profile && !isCoach && !isAdmin) {
      router.push('/locker')
    }
  }, [roleLoading, profile, isCoach, isAdmin, router])

  useEffect(() => {
    if (profile) fetchCourses()
  }, [profile])

  const fetchCourses = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('courses')
      .select('*, course_lessons(id), course_enrollments(id)')
      .order('created_at', { ascending: false })

    if (data) {
      setCourses(data.map((c: any) => ({
        ...c,
        lessons: undefined,
        enrollment_count: c.course_enrollments?.length || 0,
        lesson_count: c.course_lessons?.length || 0,
      })))
    }
    setLoading(false)
  }

  const openNewForm = () => {
    setEditingCourse(null)
    setFormData({ title: '', description: '', thumbnail_url: '', category: '', price_cents: 0, pricing_type: 'free', is_active: true, included_in_membership: false })
    setShowForm(true)
  }

  const openEditForm = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      description: course.description || '',
      thumbnail_url: course.thumbnail_url || '',
      category: course.category || '',
      price_cents: course.price_cents,
      pricing_type: course.pricing_type,
      is_active: course.is_active,
      included_in_membership: course.included_in_membership,
    })
    setShowForm(true)
  }

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setSubmitting(true)
    const slug = slugify(formData.title)
    const payload = { ...formData, slug }

    if (editingCourse) {
      const { error } = await supabase.from('courses').update(payload).eq('id', editingCourse.id)
      if (error) { alert(`Error: ${error.message}`); setSubmitting(false); return }
    } else {
      const { error } = await supabase.from('courses').insert({ ...payload, created_by: profile?.id })
      if (error) { alert(`Error: ${error.message}`); setSubmitting(false); return }
    }

    setSubmitting(false)
    setShowForm(false)
    fetchCourses()
  }

  const deleteCourse = async (id: string) => {
    if (!confirm('Delete this course and all its lessons? This cannot be undone.')) return
    await supabase.from('courses').delete().eq('id', id)
    fetchCourses()
  }

  // Lesson management
  const openLessonManager = async (course: Course) => {
    setManagingCourse(course)
    const { data } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('course_id', course.id)
      .order('sort_order')
    setLessons(data || [])
    setLessonForm({ title: '', video_url: '', description: '', duration_seconds: 0, is_preview: false })
  }

  const addLesson = async () => {
    if (!managingCourse || !lessonForm.title || !lessonForm.video_url) return
    setLessonSubmitting(true)

    const { error } = await supabase.from('course_lessons').insert({
      course_id: managingCourse.id,
      title: lessonForm.title,
      video_url: lessonForm.video_url,
      description: lessonForm.description || null,
      duration_seconds: lessonForm.duration_seconds || null,
      is_preview: lessonForm.is_preview,
      sort_order: lessons.length,
    })

    if (error) { alert(`Error: ${error.message}`); setLessonSubmitting(false); return }

    setLessonForm({ title: '', video_url: '', description: '', duration_seconds: 0, is_preview: false })
    setLessonSubmitting(false)

    // Refresh lessons
    const { data } = await supabase.from('course_lessons').select('*').eq('course_id', managingCourse.id).order('sort_order')
    setLessons(data || [])
  }

  const deleteLesson = async (lessonId: string) => {
    if (!managingCourse) return
    await supabase.from('course_lessons').delete().eq('id', lessonId)
    setLessons(lessons.filter(l => l.id !== lessonId))
  }

  const moveLesson = async (index: number, direction: 'up' | 'down') => {
    if (!managingCourse) return
    const newLessons = [...lessons]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= newLessons.length) return

    ;[newLessons[index], newLessons[swapIndex]] = [newLessons[swapIndex], newLessons[index]]
    setLessons(newLessons)

    // Update sort_order in DB
    await Promise.all(
      newLessons.map((l, i) =>
        supabase.from('course_lessons').update({ sort_order: i }).eq('id', l.id!)
      )
    )
  }

  // Enrollment
  const openEnrollModal = async (course: Course) => {
    setEnrollCourse(course)
    setSelectedAthletes([])
    const { data } = await supabase.from('profiles').select('id, full_name').eq('role', 'athlete').order('full_name')
    setAthletes(data || [])
  }

  const handleEnroll = async () => {
    if (!enrollCourse || selectedAthletes.length === 0) return
    setEnrollSubmitting(true)

    const inserts = selectedAthletes.map(athleteId => ({
      athlete_id: athleteId,
      course_id: enrollCourse.id,
      payment_status: 'comp',
    }))

    const { error } = await supabase.from('course_enrollments').upsert(inserts, { onConflict: 'athlete_id,course_id' })
    if (error) { alert(`Error: ${error.message}`); setEnrollSubmitting(false); return }

    setEnrollSubmitting(false)
    setEnrollCourse(null)
    fetchCourses()
  }

  const inputClasses = 'w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan/50'

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-2">
            Manage <span className="text-gradient-orange">Courses</span>
          </h1>
          <p className="text-cyan-800 dark:text-white text-lg">
            Create video course bundles for your athletes
          </p>
        </div>
        <button onClick={openNewForm} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          New Course
        </button>
      </div>

      {/* Course Grid */}
      {courses.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <BookOpen className="w-12 h-12 text-cyan-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No courses yet</h3>
          <p className="text-cyan-700 dark:text-white/70 mb-4">Create your first video course to get started.</p>
          <button onClick={openNewForm} className="btn-primary">Create Course</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="glass-card p-5 rounded-2xl border border-cyan-200/40 hover:border-cyan/40 transition-all">
              {/* Thumbnail */}
              {course.thumbnail_url && (
                <div className="mb-4 rounded-xl overflow-hidden aspect-video bg-slate-800">
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Info */}
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{course.title}</h3>
                <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${course.is_active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'}`}>
                  {course.is_active ? 'Active' : 'Draft'}
                </span>
              </div>

              {course.description && (
                <p className="text-sm text-cyan-700 dark:text-white/70 mb-3 line-clamp-2">{course.description}</p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-cyan-700 dark:text-white/70 mb-4">
                <div className="flex items-center gap-1">
                  <Video className="w-4 h-4" />
                  <span>{(course as any).lesson_count || 0} lessons</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.enrollment_count || 0} enrolled</span>
                </div>
                <span className={`font-semibold ${course.pricing_type === 'free' ? 'text-green-400' : 'text-orange'}`}>
                  {course.pricing_type === 'free' ? 'Free' : `$${(course.price_cents / 100).toFixed(2)}${course.pricing_type === 'monthly' ? '/mo' : ''}`}
                </span>
              </div>

              {course.included_in_membership && (
                <div className="mb-3 px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded-lg text-xs font-semibold text-purple-400 inline-block">
                  Included for Members
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => openLessonManager(course)} className="px-3 py-1.5 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1">
                  <Play className="w-3 h-3" /> Lessons
                </button>
                <button onClick={() => openEnrollModal(course)} className="px-3 py-1.5 bg-cyan/10 hover:bg-cyan/20 text-cyan rounded-lg text-xs font-semibold transition-colors flex items-center gap-1">
                  <Users className="w-3 h-3" /> Enroll
                </button>
                <button onClick={() => openEditForm(course)} className="px-3 py-1.5 bg-cyan/10 hover:bg-cyan/20 text-cyan rounded-lg text-xs font-semibold transition-colors flex items-center gap-1">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                {isAdmin && (
                  <button onClick={() => deleteCourse(course.id)} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Course Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-cyan-200/40 shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingCourse ? 'Edit Course' : 'New Course'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-cyan-50/50 rounded-lg">
                <X className="w-5 h-5 text-cyan-800 dark:text-white" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Drill Bank, Pitching Fundamentals..."
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What athletes will learn..."
                  rows={3}
                  className={inputClasses + ' resize-none'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Thumbnail URL</label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={e => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://..."
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Pitching, Hitting, Agility..."
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Pricing</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { value: 'free', label: 'Free' },
                    { value: 'one_time', label: 'One-Time' },
                    { value: 'monthly', label: 'Monthly' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, pricing_type: opt.value as any, price_cents: opt.value === 'free' ? 0 : formData.price_cents })}
                      className={`p-2 rounded-xl text-center border text-sm font-semibold transition-all ${
                        formData.pricing_type === opt.value
                          ? 'bg-orange/10 border-orange/50 text-orange'
                          : 'bg-cyan-50/30 border-cyan-200/40 text-slate-700 dark:text-white hover:border-cyan/40'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {formData.pricing_type !== 'free' && (
                  <div>
                    <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">
                      Price ($) {formData.pricing_type === 'monthly' ? '/month' : ''}
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={(formData.price_cents / 100).toFixed(2)}
                      onChange={e => setFormData({ ...formData, price_cents: Math.round(parseFloat(e.target.value || '0') * 100) })}
                      className={inputClasses}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-cyan-200/40 text-orange focus:ring-orange"
                  />
                  <span className="text-sm font-medium text-cyan-700 dark:text-white">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.included_in_membership}
                    onChange={e => setFormData({ ...formData, included_in_membership: e.target.checked })}
                    className="w-4 h-4 rounded border-cyan-200/40 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-cyan-700 dark:text-white">Included for Members</span>
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Manager Modal */}
      {managingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setManagingCourse(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-cyan-200/40 shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Manage Lessons</h3>
                <p className="text-sm text-cyan-800 dark:text-white/70">{managingCourse.title}</p>
              </div>
              <button onClick={() => setManagingCourse(null)} className="p-2 hover:bg-cyan-50/50 rounded-lg">
                <X className="w-5 h-5 text-cyan-800 dark:text-white" />
              </button>
            </div>

            {/* Lesson List */}
            <div className="space-y-2 mb-6">
              {lessons.length === 0 ? (
                <p className="text-sm text-cyan-700 dark:text-white/60 text-center py-4">No lessons yet. Add your first one below.</p>
              ) : (
                lessons.map((lesson, idx) => (
                  <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-xl bg-cyan-50/30 dark:bg-white/5 border border-cyan-200/20">
                    <span className="text-sm font-bold text-cyan-600 dark:text-white/50 w-6 text-center">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{lesson.title}</p>
                      <p className="text-xs text-cyan-700 dark:text-white/50 truncate">{lesson.video_url}</p>
                    </div>
                    {lesson.is_preview && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-semibold rounded-lg border border-green-500/30">Preview</span>
                    )}
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveLesson(idx, 'up')} disabled={idx === 0} className="p-1 hover:bg-cyan/20 rounded disabled:opacity-30">
                        <ChevronUp className="w-4 h-4 text-cyan-800 dark:text-white" />
                      </button>
                      <button onClick={() => moveLesson(idx, 'down')} disabled={idx === lessons.length - 1} className="p-1 hover:bg-cyan/20 rounded disabled:opacity-30">
                        <ChevronDown className="w-4 h-4 text-cyan-800 dark:text-white" />
                      </button>
                      <button onClick={() => deleteLesson(lesson.id!)} className="p-1 hover:bg-red-500/20 rounded">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Lesson Form */}
            <div className="border-t border-cyan-200/20 pt-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Add Lesson</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={lessonForm.title}
                  onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder="Lesson title *"
                  className={inputClasses}
                />
                <input
                  type="url"
                  value={lessonForm.video_url}
                  onChange={e => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                  placeholder="Video URL (YouTube, Vimeo, or direct) *"
                  className={inputClasses}
                />
                <input
                  type="text"
                  value={lessonForm.description}
                  onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })}
                  placeholder="Brief description (optional)"
                  className={inputClasses}
                />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lessonForm.is_preview}
                      onChange={e => setLessonForm({ ...lessonForm, is_preview: e.target.checked })}
                      className="w-4 h-4 rounded border-cyan-200/40 text-green-500 focus:ring-green-500"
                    />
                    <span className="text-sm text-cyan-700 dark:text-white">Free preview</span>
                  </label>
                  <button
                    type="button"
                    onClick={addLesson}
                    disabled={!lessonForm.title || !lessonForm.video_url || lessonSubmitting}
                    className="btn-primary flex items-center gap-2 text-sm ml-auto"
                  >
                    {lessonSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Athletes Modal */}
      {enrollCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setEnrollCourse(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-cyan-200/40 shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Enroll Athletes</h3>
                <p className="text-sm text-cyan-800 dark:text-white/70">{enrollCourse.title}</p>
              </div>
              <button onClick={() => setEnrollCourse(null)} className="p-2 hover:bg-cyan-50/50 rounded-lg">
                <X className="w-5 h-5 text-cyan-800 dark:text-white" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {athletes.map(a => (
                <label key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-cyan-50/30 dark:hover:bg-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAthletes.includes(a.id)}
                    onChange={e => {
                      setSelectedAthletes(e.target.checked
                        ? [...selectedAthletes, a.id]
                        : selectedAthletes.filter(id => id !== a.id))
                    }}
                    className="w-4 h-4 rounded border-cyan-200/40 text-orange focus:ring-orange"
                  />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{a.full_name}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setEnrollCourse(null)} className="btn-ghost">Cancel</button>
              <button
                onClick={handleEnroll}
                disabled={selectedAthletes.length === 0 || enrollSubmitting}
                className="btn-primary flex items-center gap-2"
              >
                {enrollSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Enroll {selectedAthletes.length > 0 && `(${selectedAthletes.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
