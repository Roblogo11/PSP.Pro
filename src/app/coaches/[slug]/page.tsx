import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { InfoSidebar } from '@/components/layout/info-sidebar'
import { FunnelNav } from '@/components/navigation/funnel-nav'
import { Star, Award, Calendar, ChevronLeft } from 'lucide-react'

export const revalidate = 60

async function getCoach(slug: string) {
  try {
    const adminClient = createAdminClient()
    const { data } = await adminClient
      .from('profiles')
      .select('id, full_name, avatar_url, bio, specialties, years_experience, certifications, profile_slug, role')
      .eq('profile_slug', slug)
      .in('role', ['coach', 'admin', 'master_admin'])
      .single()
    return data
  } catch {
    return null
  }
}

async function getCoachStats(coachId: string) {
  try {
    const adminClient = createAdminClient()
    const { count: totalSessions } = await adminClient
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('coach_id', coachId)
      .eq('status', 'completed')

    const { data: athletes } = await adminClient
      .from('bookings')
      .select('athlete_id')
      .eq('coach_id', coachId)
    const uniqueAthletes = new Set((athletes || []).map((b: any) => b.athlete_id)).size

    return { totalSessions: totalSessions || 0, uniqueAthletes }
  } catch {
    return { totalSessions: 0, uniqueAthletes: 0 }
  }
}

export default async function CoachProfilePage({ params }: { params: { slug: string } }) {
  const coach = await getCoach(params.slug)
  if (!coach) notFound()

  const stats = await getCoachStats(coach.id)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <InfoSidebar hideMobileNav />

      <main className="lg:ml-80 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-12 pb-32">
          {/* Back */}
          <Link href="/coaches" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm mb-8">
            <ChevronLeft className="w-4 h-4" />
            All Coaches
          </Link>

          {/* Profile Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6">
            {/* Hero gradient */}
            <div className="h-32 bg-gradient-to-br from-orange/30 via-slate-900 to-cyan/20" />

            <div className="px-6 pb-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange/40 to-cyan/20 flex items-center justify-center -mt-12 mb-4 border-4 border-slate-950 overflow-hidden">
                {coach.avatar_url ? (
                  <img src={coach.avatar_url} alt={coach.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-white">{coach.full_name?.[0] || 'C'}</span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-white mb-1">{coach.full_name}</h1>
              {coach.years_experience && (
                <p className="text-white/50 flex items-center gap-1.5 mb-4">
                  <Star className="w-4 h-4 text-orange" />
                  {coach.years_experience} years of coaching experience
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange">{stats.totalSessions}+</p>
                  <p className="text-xs text-white/50 mt-1">Sessions Coached</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-cyan">{stats.uniqueAthletes}+</p>
                  <p className="text-xs text-white/50 mt-1">Athletes Trained</p>
                </div>
              </div>

              {/* Bio */}
              {coach.bio && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-white mb-2">About</h2>
                  <p className="text-white/60 leading-relaxed">{coach.bio}</p>
                </div>
              )}

              {/* Specialties */}
              {coach.specialties && coach.specialties.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-white mb-3">Specialties</h2>
                  <div className="flex flex-wrap gap-2">
                    {coach.specialties.map((s: string) => (
                      <span key={s} className="px-3 py-1.5 bg-orange/10 border border-orange/20 text-orange text-sm font-semibold rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {coach.certifications && coach.certifications.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-orange" />
                    Certifications
                  </h2>
                  <ul className="space-y-2">
                    {coach.certifications.map((cert: string) => (
                      <li key={cert} className="flex items-center gap-2 text-white/70 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange flex-shrink-0" />
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA */}
              <Link
                href={`/booking?coach=${coach.id}`}
                className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-orange to-amber-500 text-white font-bold rounded-xl hover:from-orange/90 hover:to-amber-500/90 transition-all shadow-lg shadow-orange/30 text-lg"
              >
                <Calendar className="w-5 h-5" />
                Book a Session with {coach.full_name?.split(' ')[0]}
              </Link>
            </div>
          </div>
        </div>
      </main>

      <FunnelNav />
    </div>
  )
}
