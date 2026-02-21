'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { FileBarChart, Loader2, TrendingUp, Target, Calendar, Dumbbell, Star, ArrowRight } from 'lucide-react'

export default function ProgressReportPage() {
  const { profile, isCoach, isAdmin, impersonatedUserId } = useUserRole()
  const effectiveUserId = impersonatedUserId || profile?.id
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!effectiveUserId) return

    async function fetchReport() {
      try {
        const res = await fetch('/api/reports/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ athleteId: effectiveUserId, sendEmailReport: false }),
        })
        const data = await res.json()
        if (data.report) setReport(data.report)
        else setError('No data available yet')
      } catch {
        setError('Failed to load report')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [effectiveUserId])

  if (loading) {
    return (
      <div className="min-h-screen px-3 py-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange animate-spin mx-auto mb-4" />
          <p className="text-cyan-800 dark:text-white/60">Generating your progress report...</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen px-3 py-4 md:p-8">
        <div className="glass-card p-8 text-center max-w-lg mx-auto">
          <FileBarChart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Report Data Yet</h2>
          <p className="text-sm text-slate-500 dark:text-white/50">Complete some sessions and log metrics to see your progress report.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-3 py-4 md:p-8 pb-24 lg:pb-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <FileBarChart className="w-8 h-8 text-orange" />
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white">Progress Report</h1>
        </div>
        <p className="text-cyan-800 dark:text-white/60 mb-8">{report.sport} | {report.periodLabel}</p>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-4 text-center">
            <Calendar className="w-6 h-6 text-cyan mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{report.sessionsCompleted}</p>
            <p className="text-xs text-slate-500 dark:text-white/50">Sessions</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Dumbbell className="w-6 h-6 text-orange mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{report.drillsCompleted}</p>
            <p className="text-xs text-slate-500 dark:text-white/50">Drills Done</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{report.personalRecords.length}</p>
            <p className="text-xs text-slate-500 dark:text-white/50">New PRs</p>
          </div>
        </div>

        {/* Personal Records */}
        {report.personalRecords.length > 0 && (
          <div className="glass-card p-6 mb-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Personal Records
            </h3>
            <div className="flex flex-wrap gap-2">
              {report.personalRecords.map((pr: any, i: number) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange/10 to-cyan/10 border border-orange/20 text-sm font-medium text-slate-900 dark:text-white">
                  {pr.label}: {pr.value}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metrics */}
        {report.metrics.length > 0 && (
          <div className="glass-card p-6 mb-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan" />
              Performance Metrics
            </h3>
            <div className="space-y-3">
              {report.metrics.map((m: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-white/5">
                  <span className="text-sm text-slate-700 dark:text-white/70">{m.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 dark:text-white">{m.current} {m.unit}</span>
                    {m.previous && (
                      <span className={`text-xs font-medium ${m.improved ? 'text-green-500' : 'text-red-400'}`}>
                        {m.improved ? '↑' : '↓'} from {m.previous}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goals */}
        {report.goals.length > 0 && (
          <div className="glass-card p-6 mb-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-orange" />
              Goals Progress
            </h3>
            <div className="space-y-4">
              {report.goals.map((g: any, i: number) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700 dark:text-white/70">{g.name}</span>
                    <span className="text-sm font-bold text-orange">{Math.min(100, Math.round(g.percentComplete))}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan to-orange rounded-full transition-all"
                      style={{ width: `${Math.min(100, g.percentComplete)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coach Notes */}
        {report.coachNotes.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Coach Notes</h3>
            <div className="space-y-3">
              {report.coachNotes.map((n: any, i: number) => (
                <div key={i} className="p-3 rounded-lg border-l-3 border-orange bg-orange/5">
                  <p className="text-sm font-semibold text-orange">{n.title}</p>
                  <p className="text-sm text-slate-600 dark:text-white/70 mt-1">{n.content}</p>
                  <p className="text-xs text-slate-400 mt-1">{n.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
