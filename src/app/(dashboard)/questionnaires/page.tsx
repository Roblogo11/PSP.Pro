'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ClipboardCheck, CheckCircle, XCircle, Clock, Loader2, ChevronRight } from 'lucide-react'
import { useUserRole } from '@/lib/hooks/use-user-role'

interface Question {
  text: string
  correct_answer: boolean
}

interface Assignment {
  id: string
  questionnaire_id: string
  due_date: string | null
  notes: string | null
  completed: boolean
  completed_at: string | null
  responses: { question_index: number; answer: boolean }[] | null
  score: number | null
  questionnaire: {
    id: string
    title: string
    description: string | null
    questions: Question[]
    category: string | null
  }
}

export default function QuestionnairesPage() {
  const supabase = createClient()
  const { profile, loading: roleLoading, impersonatedUserId } = useUserRole()

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null)
  const [answers, setAnswers] = useState<Record<number, boolean>>({})
  const [submittingQuiz, setSubmittingQuiz] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const effectiveUserId = impersonatedUserId || profile?.id

  useEffect(() => {
    if (effectiveUserId) fetchAssignments()
  }, [effectiveUserId])

  const fetchAssignments = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('assigned_questionnaires')
      .select('*, questionnaire:questionnaire_id(*)')
      .eq('user_id', effectiveUserId!)
      .order('created_at', { ascending: false })

    setAssignments((data || []) as Assignment[])
    setLoading(false)
  }

  const startQuiz = (assignment: Assignment) => {
    setActiveAssignment(assignment)
    setAnswers({})
    setShowResults(false)

    // If already completed, show results
    if (assignment.completed && assignment.responses) {
      const answerMap: Record<number, boolean> = {}
      assignment.responses.forEach(r => { answerMap[r.question_index] = r.answer })
      setAnswers(answerMap)
      setShowResults(true)
    }
  }

  const handleSubmitQuiz = async () => {
    if (!activeAssignment || !effectiveUserId) return

    const questions = activeAssignment.questionnaire.questions
    const allAnswered = questions.every((_, idx) => answers[idx] !== undefined)
    if (!allAnswered) {
      alert('Please answer all questions before submitting.')
      return
    }

    setSubmittingQuiz(true)

    const responseData = questions.map((_, idx) => ({
      question_index: idx,
      answer: answers[idx],
    }))

    const score = questions.reduce((acc, q, idx) => {
      return acc + (answers[idx] === q.correct_answer ? 1 : 0)
    }, 0)

    const { error } = await supabase
      .from('assigned_questionnaires')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
        responses: responseData,
        score,
      })
      .eq('id', activeAssignment.id)

    if (error) {
      alert(`Error: ${error.message}`)
      setSubmittingQuiz(false)
      return
    }

    setSubmittingQuiz(false)
    setShowResults(true)

    // Update local state
    setAssignments(prev =>
      prev.map(a => a.id === activeAssignment.id
        ? { ...a, completed: true, completed_at: new Date().toISOString(), responses: responseData, score }
        : a
      )
    )
    setActiveAssignment(prev => prev ? { ...prev, completed: true, score, responses: responseData } : null)
  }

  const filtered = assignments.filter(a => {
    if (filter === 'pending') return !a.completed
    if (filter === 'completed') return a.completed
    return true
  })

  const pendingCount = assignments.filter(a => !a.completed).length
  const completedCount = assignments.filter(a => a.completed).length

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-2">
          <span className="text-gradient-orange">Check-Ins</span>
        </h1>
        <p className="text-cyan-800 dark:text-white text-lg">
          Complete questionnaires assigned by your coaches
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass-card p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-amber-400">{pendingCount}</p>
          <p className="text-sm text-cyan-700 dark:text-white/70">Pending</p>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-green-400">{completedCount}</p>
          <p className="text-sm text-cyan-700 dark:text-white/70">Completed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        {[
          { value: 'all', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'completed', label: 'Completed' },
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

      {/* Quiz Taking Mode */}
      {activeAssignment ? (
        <div className="glass-card rounded-2xl border border-cyan-200/40 p-6">
          {/* Quiz Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{activeAssignment.questionnaire.title}</h2>
              {activeAssignment.questionnaire.description && (
                <p className="text-sm text-cyan-700 dark:text-white/70">{activeAssignment.questionnaire.description}</p>
              )}
            </div>
            <button onClick={() => setActiveAssignment(null)} className="btn-ghost text-sm">
              Back to List
            </button>
          </div>

          {showResults && activeAssignment.score !== null && (
            <div className={`mb-6 p-4 rounded-xl border ${
              activeAssignment.score === activeAssignment.questionnaire.questions.length
                ? 'bg-green-500/10 border-green-500/30'
                : activeAssignment.score >= activeAssignment.questionnaire.questions.length * 0.7
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-red-500/10 border-red-500/30'
            }`}>
              <p className="text-lg font-bold text-slate-900 dark:text-white text-center">
                Score: {activeAssignment.score} / {activeAssignment.questionnaire.questions.length}
                {' '}
                ({Math.round((activeAssignment.score / activeAssignment.questionnaire.questions.length) * 100)}%)
              </p>
            </div>
          )}

          {/* Questions */}
          <div className="space-y-4">
            {activeAssignment.questionnaire.questions.map((q, idx) => {
              const answered = answers[idx] !== undefined
              const isCorrect = showResults && answers[idx] === q.correct_answer

              return (
                <div key={idx} className={`p-4 rounded-xl border ${
                  showResults
                    ? isCorrect
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                    : 'bg-cyan-50/30 dark:bg-white/5 border-cyan-200/20'
                }`}>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    {idx + 1}. {q.text}
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => !showResults && setAnswers({ ...answers, [idx]: true })}
                      disabled={showResults}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                        answers[idx] === true
                          ? showResults
                            ? q.correct_answer === true
                              ? 'bg-green-500/30 border-green-500/50 text-green-400'
                              : 'bg-red-500/30 border-red-500/50 text-red-400'
                            : 'bg-orange/20 border-orange/50 text-orange'
                          : 'bg-cyan-50/30 border-cyan-200/40 text-slate-700 dark:text-white hover:bg-cyan/10'
                      }`}
                    >
                      True
                    </button>
                    <button
                      type="button"
                      onClick={() => !showResults && setAnswers({ ...answers, [idx]: false })}
                      disabled={showResults}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                        answers[idx] === false
                          ? showResults
                            ? q.correct_answer === false
                              ? 'bg-green-500/30 border-green-500/50 text-green-400'
                              : 'bg-red-500/30 border-red-500/50 text-red-400'
                            : 'bg-orange/20 border-orange/50 text-orange'
                          : 'bg-cyan-50/30 border-cyan-200/40 text-slate-700 dark:text-white hover:bg-cyan/10'
                      }`}
                    >
                      False
                    </button>
                  </div>
                  {showResults && (
                    <p className={`text-xs mt-2 font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {isCorrect ? 'Correct!' : `Incorrect — answer is ${q.correct_answer ? 'True' : 'False'}`}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Submit */}
          {!showResults && !activeAssignment.completed && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmitQuiz}
                disabled={submittingQuiz}
                className="btn-primary flex items-center gap-2"
              >
                {submittingQuiz && <Loader2 className="w-4 h-4 animate-spin" />}
                {submittingQuiz ? 'Submitting...' : 'Submit Answers'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Assignment List */
        filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <ClipboardCheck className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {filter === 'pending' ? 'All caught up!' : 'No check-ins yet'}
            </h3>
            <p className="text-cyan-700 dark:text-white/70">
              {filter === 'pending' ? "You've completed all your questionnaires." : 'Your coaches will assign check-ins here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(a => (
              <button
                key={a.id}
                onClick={() => startQuiz(a)}
                className="w-full glass-card p-4 rounded-xl border border-cyan-200/40 hover:border-cyan/40 transition-all text-left flex items-center gap-4"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  a.completed
                    ? 'bg-green-500/20'
                    : 'bg-amber-500/20'
                }`}>
                  {a.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{a.questionnaire.title}</p>
                  <div className="flex items-center gap-3 text-xs text-cyan-700 dark:text-white/60">
                    <span>{a.questionnaire.questions.length} questions</span>
                    {a.due_date && (
                      <span>Due: {new Date(a.due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    )}
                    {a.completed && a.score !== null && (
                      <span className="text-green-400 font-semibold">Score: {a.score}/{a.questionnaire.questions.length}</span>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-cyan-600 dark:text-white/40 flex-shrink-0" />
              </button>
            ))}
          </div>
        )
      )}
    </div>
  )
}
