import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { InfoSidebar } from '@/components/layout/info-sidebar'
import { SpokeNav } from '@/components/navigation/spoke-nav'
import { Users, Star, Calendar } from 'lucide-react'

export const revalidate = 60

async function getCoaches() {
  try {
    const adminClient = createAdminClient()
    const { data } = await adminClient
      .from('profiles')
      .select('id, full_name, avatar_url, bio, specialties, years_experience, certifications, profile_slug, role')
      .in('role', ['coach', 'admin', 'master_admin'])
      .not('bio', 'is', null)
      .order('full_name', { ascending: true })
    return data || []
  } catch {
    return []
  }
}

export default async function CoachesPage() {
  const coaches = await getCoaches()

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <InfoSidebar hideMobileNav />

      <main className="lg:ml-80 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-12 pb-32">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/10 border border-orange/20 text-orange text-sm font-semibold mb-4">
              <Users className="w-4 h-4" />
              Meet the Coaches
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Train with the <span className="text-gradient-orange">Best</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              PSP.Pro coaches are elite trainers dedicated to your athletic development. Softball, basketball, soccer — we&apos;ve got your sport covered.
            </p>
          </div>

          {coaches.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40">Coach profiles coming soon</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coaches.map((coach: any) => (
                <div key={coach.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-orange/30 transition-all group">
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange/30 to-cyan/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {coach.avatar_url ? (
                          <img src={coach.avatar_url} alt={coach.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-black text-white">{coach.full_name?.[0] || 'C'}</span>
                        )}
                      </div>
                      {/* Name + experience */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-white group-hover:text-orange transition-colors">{coach.full_name}</h2>
                        {coach.years_experience && (
                          <p className="text-sm text-white/50 flex items-center gap-1 mt-0.5">
                            <Star className="w-3.5 h-3.5 text-orange" />
                            {coach.years_experience} years experience
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    {coach.bio && (
                      <p className="text-white/60 text-sm leading-relaxed mb-4 line-clamp-3">{coach.bio}</p>
                    )}

                    {/* Specialties */}
                    {coach.specialties && coach.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {coach.specialties.slice(0, 4).map((s: string) => (
                          <span key={s} className="px-2.5 py-1 bg-orange/10 border border-orange/20 text-orange text-xs font-semibold rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/booking?coach=${coach.id}`}
                        className="flex-1 text-center py-2.5 bg-gradient-to-r from-orange to-amber-500 text-white font-bold rounded-xl hover:from-orange/90 hover:to-amber-500/90 transition-all text-sm shadow-lg shadow-orange/20"
                      >
                        Book a Session
                      </Link>
                      {coach.profile_slug && (
                        <Link
                          href={`/coaches/${coach.profile_slug}`}
                          className="px-4 py-2.5 bg-white/5 border border-white/10 text-white/70 rounded-xl hover:bg-white/10 hover:text-white transition-all text-sm font-semibold"
                        >
                          View Profile
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <SpokeNav page="coaches" />
    </div>
  )
}
