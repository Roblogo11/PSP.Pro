'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { createClient } from '@/lib/supabase/client'
import { Inbox, Mail, Phone, User, Calendar, Tag, ChevronDown, ChevronUp, Loader2, ArrowLeft, Search } from 'lucide-react'

interface Submission {
  id: string
  name: string
  email: string
  phone: string | null
  interest: string | null
  message: string
  created_at: string
}

export default function SubmissionsPage() {
  const router = useRouter()
  const { isAdmin, isCoach, loading } = useUserRole()
  const supabase = createClient()

  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [fetching, setFetching] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!loading && !isAdmin && !isCoach) router.replace('/admin')
  }, [loading, isAdmin, isCoach, router])

  useEffect(() => {
    async function fetchSubmissions() {
      const { data } = await supabase
        .from('contact_submissions')
        .select('id, name, email, phone, interest, message, created_at')
        .order('created_at', { ascending: false })
        .limit(200)
      setSubmissions(data || [])
      setFetching(false)
    }
    fetchSubmissions()
  }, [supabase])

  const filtered = submissions.filter(s =>
    !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.message.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (d: string) => new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-orange animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-3 py-4 md:p-8 pb-24 lg:pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/admin')} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500 dark:text-white/50" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange/20 rounded-xl flex items-center justify-center">
              <Inbox className="w-5 h-5 text-orange" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Contact Submissions</h1>
              <p className="text-sm text-slate-500 dark:text-white/50">{submissions.length} total · Join the Team + Contact forms</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or message..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="command-panel p-12 text-center">
            <Inbox className="w-12 h-12 text-slate-300 dark:text-white/20 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-white/50">{search ? 'No results found' : 'No submissions yet'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(sub => (
              <div key={sub.id} className="command-panel overflow-hidden">
                {/* Row header */}
                <button
                  onClick={() => setExpanded(expanded === sub.id ? null : sub.id)}
                  className="w-full flex items-center gap-4 p-4 md:p-5 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange/30 to-cyan/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-white">{sub.name.charAt(0).toUpperCase()}</span>
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 dark:text-white">{sub.name}</span>
                      {sub.interest && (
                        <span className="px-2 py-0.5 rounded-full bg-orange/10 text-orange text-[10px] font-bold uppercase tracking-wide border border-orange/20">
                          {sub.interest.replace(/-/g, ' ')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-sm text-cyan-600 dark:text-cyan">{sub.email}</span>
                      {sub.phone && <span className="text-sm text-slate-500 dark:text-white/50">{sub.phone}</span>}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-white/30 mt-0.5 truncate">{sub.message}</p>
                  </div>

                  {/* Date + toggle */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-slate-400 dark:text-white/30 hidden sm:block">{formatDate(sub.created_at)}</span>
                    {expanded === sub.id
                      ? <ChevronUp className="w-4 h-4 text-slate-400" />
                      : <ChevronDown className="w-4 h-4 text-slate-400" />
                    }
                  </div>
                </button>

                {/* Expanded details */}
                {expanded === sub.id && (
                  <div className="px-4 md:px-5 pb-5 border-t border-slate-100 dark:border-white/10">
                    <div className="grid sm:grid-cols-2 gap-4 pt-4 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 dark:text-white/40 uppercase tracking-wide font-bold">Full Name</p>
                          <p className="text-sm text-slate-900 dark:text-white font-semibold">{sub.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 dark:text-white/40 uppercase tracking-wide font-bold">Email</p>
                          <a href={`mailto:${sub.email}`} className="text-sm text-cyan-600 dark:text-cyan hover:underline">{sub.email}</a>
                        </div>
                      </div>
                      {sub.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <div>
                            <p className="text-[10px] text-slate-400 dark:text-white/40 uppercase tracking-wide font-bold">Phone</p>
                            <a href={`tel:${sub.phone}`} className="text-sm text-slate-900 dark:text-white hover:underline">{sub.phone}</a>
                          </div>
                        </div>
                      )}
                      {sub.interest && (
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <div>
                            <p className="text-[10px] text-slate-400 dark:text-white/40 uppercase tracking-wide font-bold">Interest</p>
                            <p className="text-sm text-slate-900 dark:text-white capitalize">{sub.interest.replace(/-/g, ' ')}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 dark:text-white/40 uppercase tracking-wide font-bold">Submitted</p>
                          <p className="text-sm text-slate-900 dark:text-white">{formatDate(sub.created_at)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <p className="text-[10px] text-slate-400 dark:text-white/40 uppercase tracking-wide font-bold mb-2">Message</p>
                      <p className="text-sm text-slate-700 dark:text-white/80 leading-relaxed whitespace-pre-wrap">{sub.message}</p>
                    </div>

                    {/* Quick reply */}
                    <div className="flex gap-3 mt-4">
                      <a
                        href={`mailto:${sub.email}?subject=Re: Your PSP.Pro Inquiry`}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange text-white text-sm font-semibold hover:bg-orange/90 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        Reply via Email
                      </a>
                      {sub.phone && (
                        <a
                          href={`tel:${sub.phone}`}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan/10 border border-cyan/30 text-cyan-700 dark:text-cyan text-sm font-semibold hover:bg-cyan/20 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          Call
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
