import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()

    // Fetch all user data in parallel
    const [
      { data: profile },
      { data: bookings },
      { data: packages },
      { data: metrics },
    ] = await Promise.all([
      adminClient.from('profiles').select('*').eq('id', user.id).single(),
      adminClient.from('bookings').select(`
        id, booking_date, start_time, end_time, status,
        payment_status, amount_cents, payment_method,
        coach_notes, created_at,
        service:service_id(name),
        coach:coach_id(full_name)
      `).eq('athlete_id', user.id).order('booking_date', { ascending: false }),
      adminClient.from('athlete_packages').select(`
        id, sessions_total, sessions_used, payment_status,
        amount_cents, expires_at, is_active, created_at,
        package:package_id(name)
      `).eq('athlete_id', user.id),
      adminClient.from('athlete_performance_metrics').select('*').eq('athlete_id', user.id),
    ])

    const exportData = {
      exported_at: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      profile: profile ? {
        full_name: profile.full_name,
        age: profile.age,
        sports: profile.sports,
        athlete_type: profile.athlete_type,
        phone: profile.phone,
        location: profile.location,
        parent_guardian_name: profile.parent_guardian_name,
        parent_guardian_email: profile.parent_guardian_email,
        newsletter_consent: profile.newsletter_consent,
        marketing_consent: profile.marketing_consent,
        data_consent: profile.data_consent,
        data_consent_at: profile.data_consent_at,
        leaderboard_opt_in: profile.leaderboard_opt_in,
        region: profile.region,
        notification_preferences: profile.notification_preferences,
        role: profile.role,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      } : null,
      bookings: (bookings || []).map(b => ({
        id: b.id,
        service: (b.service as any)?.name,
        coach: (b.coach as any)?.full_name,
        date: b.booking_date,
        start_time: b.start_time,
        end_time: b.end_time,
        status: b.status,
        payment_status: b.payment_status,
        amount_paid: b.amount_cents ? `$${(b.amount_cents / 100).toFixed(2)}` : null,
        coach_notes: b.coach_notes,
        booked_at: b.created_at,
      })),
      training_packages: (packages || []).map(p => ({
        id: p.id,
        package: (p.package as any)?.name,
        sessions_total: p.sessions_total,
        sessions_used: p.sessions_used,
        sessions_remaining: p.sessions_total - p.sessions_used,
        payment_status: p.payment_status,
        amount_paid: p.amount_cents ? `$${(p.amount_cents / 100).toFixed(2)}` : null,
        expires_at: p.expires_at,
        is_active: p.is_active,
        purchased_at: p.created_at,
      })),
      performance_metrics: metrics || [],
    }

    const json = JSON.stringify(exportData, null, 2)

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="psp-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (err: any) {
    console.error('Export data error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
