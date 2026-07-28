'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, Loader2, TrendingUp } from 'lucide-react'
import { SPORT_METRICS } from '@/lib/hooks/use-athlete-metrics'

interface Props {
  athleteId: string
  /** For multi-child parent accounts — stamps the row so children stay separate. */
  childId?: string | null
  childName?: string | null
  onSaved?: () => void
}

const SPORTS = [
  { key: 'softball', label: 'Softball' },
  { key: 'basketball', label: 'Basketball' },
  { key: 'soccer', label: 'Soccer' },
  { key: 'athleticism', label: 'Athleticism' },
]

/**
 * Lets a PARENT log a data point (e.g. a velocity PR) between sessions.
 *
 * ⚠ Parent-entered rows are always Self-Reported, never PSP Verified. The DB
 * trigger from migration 063 forces verified=false regardless of what the
 * client sends, and the leaderboard excludes entered_by_role='parent' outright.
 * Don't add a "verified" control here — only a coach can confirm a number.
 */
export function LogDataPoint({ athleteId, childId, childName, onSaved }: Props) {
  const [open, setOpen] = useState(false)
  const [sport, setSport] = useState('softball')
  const [metricKey, setMetricKey] = useState('')
  const [value, setValue] = useState('')
  const [pitchType, setPitchType] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const metrics = SPORT_METRICS[sport] || []
  const selected = metrics.find(m => m.key === metricKey)
  // Pitch type only makes sense for pitching velocity.
  const showPitchType = metricKey === 'pitching_velocity' || metricKey.startsWith('velo_')

  const reset = () => {
    setMetricKey(''); setValue(''); setPitchType(''); setNotes('')
    setDate(new Date().toISOString().slice(0, 10)); setError(null)
  }

  const handleSave = async () => {
    if (!metricKey || !value.trim()) {
      setError('Pick what you measured and enter a value')
      return
    }
    const num = parseFloat(value)
    if (isNaN(num)) { setError('Value must be a number'); return }

    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const def = metrics.find(m => m.key === metricKey)

      const row: Record<string, any> = {
        athlete_id: athleteId,
        recorded_by: athleteId,
        test_date: date,
        notes: notes.trim() || null,
        entered_by_role: 'parent',
        custom_metrics: {
          sport,
          verified: false, // DB trigger enforces this too — belt and braces.
          metrics: { [metricKey]: num },
          ...(showPitchType && pitchType ? { pitch_type: pitchType } : {}),
        },
      }
      if (childId) row.child_id = childId
      if (def?.dbColumn) row[def.dbColumn] = num

      const { error: insertError } = await supabase
        .from('athlete_performance_metrics')
        .upsert(row, { onConflict: 'athlete_id,test_date' })

      if (insertError) throw insertError

      reset()
      setOpen(false)
      onSaved?.()
    } catch (err: any) {
      setError(err?.message || 'Could not save that entry')
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn-primary flex items-center gap-2 min-h-[48px]"
      >
        <Plus className="w-4 h-4" />
        Log a Data Point
      </button>
    )
  }

  return (
    <div className="glass-card p-5 rounded-2xl border border-cyan-200/40 dark:border-white/10">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange" />
          <h3 className="font-bold text-slate-900 dark:text-white">
            Log a Data Point{childName ? ` — ${childName}` : ''}
          </h3>
        </div>
        <button onClick={() => { setOpen(false); reset() }} aria-label="Close" className="p-1">
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Sport</label>
          <select
            value={sport}
            onChange={e => { setSport(e.target.value); setMetricKey('') }}
            className="w-full min-h-[48px] px-3 rounded-xl border border-cyan-200/50 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {SPORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">What did you measure?</label>
          <select
            value={metricKey}
            onChange={e => setMetricKey(e.target.value)}
            className="w-full min-h-[48px] px-3 rounded-xl border border-cyan-200/50 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="">Select…</option>
            {metrics.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Value{selected ? ` (${selected.unit})` : ''}
            </label>
            <input
              type="number" inputMode="decimal" step="0.01"
              value={value} onChange={e => setValue(e.target.value)}
              placeholder="e.g. 52.5"
              className="w-full min-h-[48px] px-3 rounded-xl border border-cyan-200/50 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Date</label>
            <input
              type="date" value={date} onChange={e => setDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="w-full min-h-[48px] px-3 rounded-xl border border-cyan-200/50 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {showPitchType && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Pitch type</label>
            <select
              value={pitchType} onChange={e => setPitchType(e.target.value)}
              className="w-full min-h-[48px] px-3 rounded-xl border border-cyan-200/50 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">Not specified</option>
              {['Fastball', 'Change-up', 'Drop Ball', 'Rise Ball', 'Screwball', 'Curveball'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Notes (optional)</label>
          <input
            type="text" value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="e.g. new PR at Saturday scrimmage"
            className="w-full min-h-[48px] px-3 rounded-xl border border-cyan-200/50 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        {error && <p className="text-sm font-semibold text-orange">{error}</p>}

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Entries you add are marked <strong>Self-Reported</strong>. Your coach can confirm
          them as PSP Verified at your next session.
        </p>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save Data Point'}
        </button>
      </div>
    </div>
  )
}
