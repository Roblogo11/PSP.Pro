'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, User, Save, Loader2, Check } from 'lucide-react'
import { toastError, toastSuccess } from '@/lib/toast'

interface Child {
  id: string
  parent_id: string
  child_name: string
  child_age: number | null
  athlete_type: string | null
  sports: string[] | null
  notes: string | null
  avatar_url: string | null
}

interface Props {
  activeChildId: string | null
  onActiveChildChange?: (childId: string) => void
}

const SPORT_OPTIONS = [
  { value: 'softball', label: 'Softball' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'soccer', label: 'Soccer' },
]

export default function ChildrenManager({ activeChildId, onActiveChildChange }: Props) {
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAge, setNewAge] = useState('')
  const [newSport, setNewSport] = useState('softball')
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    void loadChildren()
  }, [])

  async function loadChildren() {
    setLoading(true)
    try {
      const res = await fetch('/api/parent/children')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load children')
      setChildren(data.children || [])
    } catch (err: any) {
      toastError(err.message || 'Failed to load children')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd() {
    if (!newName.trim()) {
      toastError('Please enter the child\'s name')
      return
    }
    setAdding(true)
    try {
      const res = await fetch('/api/parent/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_name: newName.trim(),
          child_age: newAge ? parseInt(newAge) : null,
          athlete_type: newSport,
          sports: [newSport],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add child')
      toastSuccess(`Added ${newName.trim()}`)
      setNewName('')
      setNewAge('')
      await loadChildren()
    } catch (err: any) {
      toastError(err.message || 'Failed to add child')
    } finally {
      setAdding(false)
    }
  }

  async function handleUpdate(child: Child) {
    setSavingId(child.id)
    try {
      const res = await fetch(`/api/parent/children/${child.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_name: child.child_name,
          child_age: child.child_age,
          athlete_type: child.athlete_type,
          sports: child.sports,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      toastSuccess('Saved')
    } catch (err: any) {
      toastError(err.message || 'Failed to save')
    } finally {
      setSavingId(null)
    }
  }

  async function handleDelete(child: Child) {
    if (!confirm(`Remove ${child.child_name}? Their bookings and metrics stay in the system.`)) return
    try {
      const res = await fetch(`/api/parent/children/${child.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to remove')
      toastSuccess('Removed')
      await loadChildren()
    } catch (err: any) {
      toastError(err.message || 'Failed to remove')
    }
  }

  async function handleSetActive(childId: string) {
    try {
      const res = await fetch('/api/parent/active-child', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_id: childId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to switch')
      toastSuccess('Active athlete switched')
      onActiveChildChange?.(childId)
    } catch (err: any) {
      toastError(err.message || 'Failed to switch')
    }
  }

  if (loading) {
    return <div className="p-4 text-sm text-cyan-700 dark:text-white/60">Loading children…</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <User className="w-5 h-5 text-purple-500" />
          Your Athletes
        </h3>
        <p className="text-xs text-slate-500 dark:text-white/50">
          Manage one or more children under this account. Switch the active athlete to book sessions or view their progress.
        </p>
      </div>

      <div className="space-y-3">
        {children.map((child) => {
          const isActive = activeChildId === child.id
          return (
            <div
              key={child.id}
              className={`p-4 rounded-xl border transition-colors ${
                isActive
                  ? 'bg-purple-500/10 border-purple-500/40'
                  : 'bg-white/80 dark:bg-cyan-900/20 shadow-sm dark:shadow-none border-cyan-700/40'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  {isActive && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/30 text-purple-200">
                      Active
                    </span>
                  )}
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {child.child_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!isActive && (
                    <button
                      onClick={() => handleSetActive(child.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-300 hover:bg-purple-500/25 font-semibold"
                    >
                      Set Active
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(child)}
                    aria-label="Remove child"
                    className="p-1.5 rounded-lg hover:bg-red-500/15 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-white/50 uppercase mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={child.child_name}
                    onChange={(e) =>
                      setChildren((prev) =>
                        prev.map((c) => (c.id === child.id ? { ...c, child_name: e.target.value } : c)),
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-white/50 uppercase mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={17}
                    value={child.child_age ?? ''}
                    onChange={(e) =>
                      setChildren((prev) =>
                        prev.map((c) =>
                          c.id === child.id ? { ...c, child_age: e.target.value ? parseInt(e.target.value) : null } : c,
                        ),
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-white/50 uppercase mb-1">
                    Sport
                  </label>
                  <select
                    value={child.athlete_type || ''}
                    onChange={(e) =>
                      setChildren((prev) =>
                        prev.map((c) =>
                          c.id === child.id ? { ...c, athlete_type: e.target.value, sports: [e.target.value] } : c,
                        ),
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-slate-900 dark:text-white text-sm"
                  >
                    {SPORT_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-3">
                <button
                  onClick={() => handleUpdate(child)}
                  disabled={savingId === child.id}
                  className="text-xs px-3 py-1.5 rounded-lg bg-orange/20 text-orange hover:bg-orange/30 font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingId === child.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Save
                </button>
              </div>
            </div>
          )
        })}

        {children.length === 0 && (
          <div className="p-4 rounded-xl bg-white/80 dark:bg-cyan-900/10 shadow-sm dark:shadow-none border border-dashed border-cyan-700/40 text-center text-sm text-cyan-700 dark:text-white/60">
            No athletes yet. Add your first child below.
          </div>
        )}
      </div>

      {/* Add new child */}
      <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5">
        <h4 className="text-sm font-semibold text-purple-600 dark:text-purple-300 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Another Athlete
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <input
            type="text"
            placeholder="Child's name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-slate-900 dark:text-white text-sm"
          />
          <input
            type="number"
            min={5}
            max={17}
            placeholder="Age"
            value={newAge}
            onChange={(e) => setNewAge(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-slate-900 dark:text-white text-sm"
          />
          <select
            value={newSport}
            onChange={(e) => setNewSport(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-slate-900 dark:text-white text-sm"
          >
            {SPORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAdd}
          disabled={adding}
          className="w-full md:w-auto px-4 py-2 rounded-lg bg-purple-500/30 text-purple-200 hover:bg-purple-500/40 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add Athlete
        </button>
      </div>
    </div>
  )
}
