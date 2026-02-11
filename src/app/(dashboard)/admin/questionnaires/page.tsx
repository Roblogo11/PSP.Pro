'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Plus, Edit2, Trash2, X, Loader2, ClipboardCheck, Users,
  CheckCircle, XCircle, Send, Eye,
} from 'lucide-react'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { useRouter } from 'next/navigation'

interface Question {
  text: string
  correct_answer: boolean
}

interface Questionnaire {
  id: string
  title: string
  description: string | null
  questions: Question[]
  category: string | null
  published: boolean
  created_by: string | null
  created_at: string
  assignment_count?: number
}

export default function AdminQuestionnairesPage() {
  const supabase = createClient()
  const { isCoach, isAdmin, profile, loading: roleLoading } = useUserRole()
  const router = useRouter()

  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [loading, setLoading] = useState(true)

  // Form
  const [showForm, setShowForm] = useState(false)
  const [editingQ, setEditingQ] = useState<Questionnaire | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    published: true,
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Assign
  const [assignQ, setAssignQ] = useState<Questionnaire | null>(null)
  const [athletes, setAthletes] = useState<any[]>([])
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([])
  const [assignDueDate, setAssignDueDate] = useState('')
  const [assignNotes, setAssignNotes] = useState('')
  const [assignSubmitting, setAssignSubmitting] = useState(false)

  // View responses
  const [viewQ, setViewQ] = useState<Questionnaire | null>(null)
  const [responses, setResponses] = useState<any[]>([])

  useEffect(() => {
    if (!roleLoading && profile && !isCoach && !isAdmin) {
      router.push('/locker')
    }
  }, [roleLoading, profile, isCoach, isAdmin, router])

  useEffect(() => {
    if (profile) fetchQuestionnaires()
  }, [profile])

  const fetchQuestionnaires = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('questionnaires')
      .select('*, assigned_questionnaires(id)')
      .order('created_at', { ascending: false })

    if (data) {
      setQuestionnaires(data.map((q: any) => ({
        ...q,
        assignment_count: q.assigned_questionnaires?.length || 0,
      })))
    }
    setLoading(false)
  }

  const openNewForm = () => {
    setEditingQ(null)
    setFormData({ title: '', description: '', category: '', published: true })
    setQuestions([])
    setShowForm(true)
  }

  const openEditForm = (q: Questionnaire) => {
    setEditingQ(q)
    setFormData({
      title: q.title,
      description: q.description || '',
      category: q.category || '',
      published: q.published,
    })
    setQuestions(q.questions || [])
    setShowForm(true)
  }

  const addQuestion = () => {
    if (!newQuestion.trim()) return
    setQuestions([...questions, { text: newQuestion.trim(), correct_answer: newAnswer }])
    setNewQuestion('')
    setNewAnswer(true)
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || questions.length === 0) {
      alert('Please add a title and at least one question.')
      return
    }

    setSubmitting(true)
    const payload = {
      title: formData.title,
      description: formData.description || null,
      category: formData.category || null,
      published: formData.published,
      questions,
    }

    if (editingQ) {
      const { error } = await supabase.from('questionnaires').update(payload).eq('id', editingQ.id)
      if (error) { alert(`Error: ${error.message}`); setSubmitting(false); return }
    } else {
      const { error } = await supabase.from('questionnaires').insert({ ...payload, created_by: profile?.id })
      if (error) { alert(`Error: ${error.message}`); setSubmitting(false); return }
    }

    setSubmitting(false)
    setShowForm(false)
    fetchQuestionnaires()
  }

  const deleteQuestionnaire = async (id: string) => {
    if (!confirm('Delete this questionnaire? This cannot be undone.')) return
    await supabase.from('questionnaires').delete().eq('id', id)
    fetchQuestionnaires()
  }

  // Assign
  const openAssign = async (q: Questionnaire) => {
    setAssignQ(q)
    setSelectedAthletes([])
    setAssignDueDate('')
    setAssignNotes('')
    const { data } = await supabase.from('profiles').select('id, full_name').eq('role', 'athlete').order('full_name')
    setAthletes(data || [])
  }

  const handleAssign = async () => {
    if (!assignQ || selectedAthletes.length === 0) return
    setAssignSubmitting(true)

    const inserts = selectedAthletes.map(athleteId => ({
      user_id: athleteId,
      questionnaire_id: assignQ.id,
      assigned_by_id: profile?.id,
      due_date: assignDueDate || null,
      notes: assignNotes || null,
    }))

    const { error } = await supabase.from('assigned_questionnaires').insert(inserts)
    if (error) { alert(`Error: ${error.message}`); setAssignSubmitting(false); return }

    setAssignSubmitting(false)
    setAssignQ(null)
    fetchQuestionnaires()
  }

  // View responses
  const openResponses = async (q: Questionnaire) => {
    setViewQ(q)
    const { data } = await supabase
      .from('assigned_questionnaires')
      .select('*, user:user_id(full_name)')
      .eq('questionnaire_id', q.id)
      .order('created_at', { ascending: false })
    setResponses(data || [])
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
            <span className="text-gradient-orange">Questionnaires</span>
          </h1>
          <p className="text-cyan-800 dark:text-white text-lg">
            Create and assign check-ins for your athletes
          </p>
        </div>
        <button onClick={openNewForm} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          New Questionnaire
        </button>
      </div>

      {/* List */}
      {questionnaires.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ClipboardCheck className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No questionnaires yet</h3>
          <p className="text-cyan-700 dark:text-white/70 mb-4">Create true/false check-ins for your athletes.</p>
          <button onClick={openNewForm} className="btn-primary">Create Questionnaire</button>
        </div>
      ) : (
        <div className="space-y-4">
          {questionnaires.map(q => (
            <div key={q.id} className="glass-card p-5 rounded-2xl border border-cyan-200/40 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{q.title}</h3>
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${q.published ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'}`}>
                    {q.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                {q.description && <p className="text-sm text-cyan-700 dark:text-white/70 mb-1">{q.description}</p>}
                <div className="flex items-center gap-4 text-sm text-cyan-700 dark:text-white/60">
                  <span>{q.questions.length} questions</span>
                  <span>{q.assignment_count} assigned</span>
                  {q.category && <span className="uppercase text-xs font-semibold">{q.category}</span>}
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button onClick={() => openAssign(q)} className="px-3 py-1.5 bg-cyan/10 hover:bg-cyan/20 text-cyan rounded-lg text-xs font-semibold transition-colors flex items-center gap-1">
                  <Send className="w-3 h-3" /> Assign
                </button>
                <button onClick={() => openResponses(q)} className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Responses
                </button>
                <button onClick={() => openEditForm(q)} className="px-3 py-1.5 bg-cyan/10 hover:bg-cyan/20 text-cyan rounded-lg text-xs font-semibold transition-colors flex items-center gap-1">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                {isAdmin && (
                  <button onClick={() => deleteQuestionnaire(q.id)} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-cyan-200/40 shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingQ ? 'Edit Questionnaire' : 'New Questionnaire'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-cyan-50/50 rounded-lg">
                <X className="w-5 h-5 text-cyan-800 dark:text-white" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Pre-Game Mental Check-In"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description..."
                  rows={2}
                  className={inputClasses + ' resize-none'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Mental, Physical, Recovery..."
                  className={inputClasses}
                />
              </div>

              {/* Questions Builder */}
              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">
                  Questions ({questions.length})
                </label>

                {/* Existing Questions */}
                <div className="space-y-2 mb-3">
                  {questions.map((q, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-cyan-50/30 dark:bg-white/5 border border-cyan-200/20">
                      <span className="text-sm font-bold text-cyan-600 dark:text-white/50 w-6 text-center">{idx + 1}</span>
                      <p className="flex-1 text-sm text-slate-900 dark:text-white">{q.text}</p>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${q.correct_answer ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {q.correct_answer ? 'True' : 'False'}
                      </span>
                      <button type="button" onClick={() => removeQuestion(idx)} className="p-1 hover:bg-red-500/20 rounded">
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Question */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={e => setNewQuestion(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addQuestion() } }}
                    placeholder="Type a question..."
                    className={inputClasses + ' flex-1'}
                  />
                  <button
                    type="button"
                    onClick={() => setNewAnswer(!newAnswer)}
                    className={`px-3 py-2 rounded-xl text-sm font-bold border transition-all ${
                      newAnswer
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}
                  >
                    {newAnswer ? 'T' : 'F'}
                  </button>
                  <button
                    type="button"
                    onClick={addQuestion}
                    disabled={!newQuestion.trim()}
                    className="btn-primary px-3"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-cyan-700 dark:text-white/50 mt-1">
                  Click T/F to toggle the correct answer, then click + to add
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={e => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 rounded border-cyan-200/40 text-orange focus:ring-orange"
                />
                <span className="text-sm font-medium text-cyan-700 dark:text-white">Published</span>
              </label>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Saving...' : editingQ ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setAssignQ(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-cyan-200/40 shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Assign Questionnaire</h3>
                <p className="text-sm text-cyan-800 dark:text-white/70">{assignQ.title}</p>
              </div>
              <button onClick={() => setAssignQ(null)} className="p-2 hover:bg-cyan-50/50 rounded-lg">
                <X className="w-5 h-5 text-cyan-800 dark:text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Due Date (optional)</label>
                <input
                  type="date"
                  value={assignDueDate}
                  onChange={e => setAssignDueDate(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Notes (optional)</label>
                <textarea
                  value={assignNotes}
                  onChange={e => setAssignNotes(e.target.value)}
                  placeholder="Any instructions..."
                  rows={2}
                  className={inputClasses + ' resize-none'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-2">Select Athletes</label>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {athletes.map(a => (
                    <label key={a.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-cyan-50/30 dark:hover:bg-white/5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAthletes.includes(a.id)}
                        onChange={e => setSelectedAthletes(e.target.checked
                          ? [...selectedAthletes, a.id]
                          : selectedAthletes.filter(id => id !== a.id)
                        )}
                        className="w-4 h-4 rounded border-cyan-200/40 text-orange focus:ring-orange"
                      />
                      <span className="text-sm text-slate-900 dark:text-white">{a.full_name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setAssignQ(null)} className="btn-ghost">Cancel</button>
              <button
                onClick={handleAssign}
                disabled={selectedAthletes.length === 0 || assignSubmitting}
                className="btn-primary flex items-center gap-2"
              >
                {assignSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Assign {selectedAthletes.length > 0 && `(${selectedAthletes.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Responses Modal */}
      {viewQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setViewQ(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-cyan-200/40 shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Responses</h3>
                <p className="text-sm text-cyan-800 dark:text-white/70">{viewQ.title}</p>
              </div>
              <button onClick={() => setViewQ(null)} className="p-2 hover:bg-cyan-50/50 rounded-lg">
                <X className="w-5 h-5 text-cyan-800 dark:text-white" />
              </button>
            </div>

            {responses.length === 0 ? (
              <p className="text-sm text-cyan-700 dark:text-white/60 text-center py-8">No responses yet.</p>
            ) : (
              <div className="space-y-3">
                {responses.map(r => (
                  <div key={r.id} className="p-4 rounded-xl bg-cyan-50/30 dark:bg-white/5 border border-cyan-200/20">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{r.user?.full_name || 'Unknown'}</p>
                      <div className="flex items-center gap-2">
                        {r.completed ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-semibold border border-green-500/30">
                            <CheckCircle className="w-3 h-3" />
                            {r.score !== null && `${r.score}/${viewQ.questions.length}`}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-semibold border border-amber-500/30">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                    {r.due_date && (
                      <p className="text-xs text-cyan-700 dark:text-white/50">Due: {new Date(r.due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
