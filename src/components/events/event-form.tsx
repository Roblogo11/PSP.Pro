'use client'

import { useState } from 'react'
import { CalendarDays, Loader2, Plus, X } from 'lucide-react'
import { formatEventRange } from '@/lib/events/format'

interface Props {
  services?: { id: string; name: string }[]
  onCreated?: () => void
}

/**
 * Create a multi-day event (e.g. a 3-day camp).
 *
 * ⚠ The API creates ONE slot per day in the range. Don't try to create slots
 * here — the slot-count triggers and hourly heal depend on that shape.
 */
export function EventForm({ services = [], onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '12:00',
    location: '',
    maxParticipants: 12,
    price: '',
    serviceId: '',
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.startDate || !form.endDate) {
      setError('Name, start date and end date are required')
      return
    }
    if (form.endDate < form.startDate) {
      setError('End date must be on or after the start date')
      return
    }

    setSaving(true)
    setError(null)

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        description: form.description.trim() || null,
        startDate: form.startDate,
        endDate: form.endDate,
        startTime: form.startTime,
        endTime: form.endTime,
        location: form.location.trim() || null,
        maxParticipants: Number(form.maxParticipants) || 1,
        priceCents: form.price ? Math.round(parseFloat(form.price) * 100) : null,
        serviceId: form.serviceId || null,
      }),
    })

    const data = await res.json().catch(() => ({}))
    setSaving(false)

    if (!res.ok) {
      setError(data.error || 'Could not create the event')
      return
    }

    setOpen(false)
    setForm({
      name: '', description: '', startDate: '', endDate: '',
      startTime: '09:00', endTime: '12:00', location: '',
      maxParticipants: 12, price: '', serviceId: '',
    })
    onCreated?.()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2 min-h-[48px]">
        <CalendarDays className="w-4 h-4" />
        New Multi-Day Event
      </button>
    )
  }

  const inputCls = 'w-full min-h-[48px] px-3 rounded-xl border border-cyan-200/50 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
  const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5'

  return (
    <div className="glass-card p-5 rounded-2xl border border-cyan-200/40 dark:border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-orange" />
          New Multi-Day Event
        </h3>
        <button onClick={() => setOpen(false)} aria-label="Close" className="p-1">
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className={labelCls}>Event name</label>
          <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="e.g. Summer Pitching Camp" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Start date</label>
            <input type="date" className={inputCls} value={form.startDate} onChange={e => set('startDate', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>End date</label>
            <input type="date" className={inputCls} value={form.endDate} min={form.startDate} onChange={e => set('endDate', e.target.value)} />
          </div>
        </div>

        {form.startDate && form.endDate && form.endDate >= form.startDate && (
          <p className="text-sm font-semibold text-orange">
            {formatEventRange(form.startDate, form.endDate)}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Daily start</label>
            <input type="time" className={inputCls} value={form.startTime} onChange={e => set('startTime', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Daily end</label>
            <input type="time" className={inputCls} value={form.endTime} onChange={e => set('endTime', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Max athletes</label>
            <input type="number" min={1} className={inputCls} value={form.maxParticipants}
              onChange={e => set('maxParticipants', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Price ($)</label>
            <input type="number" step="0.01" min={0} className={inputCls} value={form.price}
              onChange={e => set('price', e.target.value)} placeholder="150.00" />
          </div>
        </div>

        <div>
          <label className={labelCls}>Location</label>
          <input className={inputCls} value={form.location} onChange={e => set('location', e.target.value)}
            placeholder="PSP Training Facility" />
        </div>

        {services.length > 0 && (
          <div>
            <label className={labelCls}>Link to service (optional)</label>
            <select className={inputCls} value={form.serviceId} onChange={e => set('serviceId', e.target.value)}>
              <option value="">None</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className={labelCls}>Description</label>
          <textarea className={`${inputCls} py-2 min-h-[80px]`} value={form.description}
            onChange={e => set('description', e.target.value)} placeholder="What athletes will work on…" />
        </div>

        {error && <p className="text-sm font-semibold text-orange">{error}</p>}

        <button onClick={handleSubmit} disabled={saving}
          className="btn-primary w-full flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {saving ? 'Creating…' : 'Create Event'}
        </button>
      </div>
    </div>
  )
}
