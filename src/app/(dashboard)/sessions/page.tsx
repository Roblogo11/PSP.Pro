'use client'

import { useState } from 'react'
import { Calendar, Clock, MapPin, Video, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function SessionsPage() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')

  // Mock sessions data
  const sessions = [
    {
      id: 1,
      type: 'Velocity Training',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      time: '4:00 PM - 5:00 PM',
      coach: 'Coach Mike',
      location: 'PSP Training Center',
      status: 'upcoming',
      hasVideo: false,
    },
    {
      id: 2,
      type: 'Hitting Mechanics',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: '3:00 PM - 4:00 PM',
      coach: 'Coach Sarah',
      location: 'PSP Training Center',
      status: 'upcoming',
      hasVideo: false,
    },
    {
      id: 3,
      type: 'Pitching Session',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      time: '5:00 PM - 6:00 PM',
      coach: 'Coach Mike',
      location: 'PSP Training Center',
      status: 'completed',
      hasVideo: true,
      notes: 'Great velocity gains! Peak: 72 mph (+3 from last session)',
    },
    {
      id: 4,
      type: 'Movement Assessment',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      time: '2:00 PM - 3:00 PM',
      coach: 'Coach Sarah',
      location: 'PSP Training Center',
      status: 'completed',
      hasVideo: true,
      notes: 'Mobility improvements noted. Continue hip flexibility work.',
    },
  ]

  const filteredSessions = sessions.filter((session) => {
    if (filter === 'all') return true
    return session.status === filter || (filter === 'past' && session.status === 'completed')
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <AlertCircle className="w-5 h-5 text-orange" />
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 lg:pb-8 relative">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
          Training <span className="text-gradient-orange">Sessions</span>
        </h1>
        <p className="text-slate-400 text-lg">
          View and manage your training schedule
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['all', 'upcoming', 'past'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType as typeof filter)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
              filter === filterType
                ? 'bg-orange text-white shadow-glow-orange'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className="command-panel hover:border-orange/30 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                {getStatusIcon(session.status)}
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-orange transition-colors">
                    {session.type}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">{session.coach}</p>
                </div>
              </div>
              {session.hasVideo && (
                <div className="px-3 py-1 bg-cyan/20 border border-cyan/30 rounded-full flex items-center gap-2">
                  <Video className="w-4 h-4 text-cyan" />
                  <span className="text-xs font-semibold text-cyan">Video Available</span>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-3 text-slate-300">
                <Calendar className="w-5 h-5 text-orange" />
                <span>{format(session.date, 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Clock className="w-5 h-5 text-orange" />
                <span>{session.time}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <MapPin className="w-5 h-5 text-orange" />
                <span>{session.location}</span>
              </div>
            </div>

            {session.notes && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-sm text-slate-400">
                  <span className="font-semibold text-white">Notes:</span> {session.notes}
                </p>
              </div>
            )}

            {session.status === 'upcoming' && (
              <div className="mt-4 pt-4 border-t border-white/5 flex gap-3">
                <button className="btn-ghost text-sm py-2">Cancel Session</button>
                <button className="btn-ghost text-sm py-2">Reschedule</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="command-panel text-center py-12">
          <p className="text-slate-400 text-lg mb-4">No sessions found</p>
          <button className="btn-primary">Book a Session</button>
        </div>
      )}
    </div>
  )
}
