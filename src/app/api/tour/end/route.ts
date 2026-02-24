import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/tour/end
 * Lightweight endpoint for navigator.sendBeacon() — fires when user
 * closes the tab/browser while tour is active. Mirrors the DELETE
 * handler in /api/tour but accepts POST (sendBeacon only sends POST).
 */
export async function POST() {
  try {
    const cookieHeader = (await import('next/headers')).cookies
    const cookieStore = await cookieHeader()
    const tourId = cookieStore.get('tour_id')?.value

    if (tourId) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const adminClient = createAdminClient()

        const CLEANUP_ORDER = [
          'drill_completions',
          'assigned_drills',
          'athlete_performance_metrics',
          'velocity_logs',
          'bookings',
          'athlete_packages',
          'available_slots',
        ]

        for (const tableName of CLEANUP_ORDER) {
          const { data: records } = await adminClient
            .from('simulation_data_log')
            .select('record_id')
            .eq('simulation_id', tourId)
            .eq('table_name', tableName)

          if (!records || records.length === 0) continue

          const ids = records.map((r: any) => r.record_id)
          await adminClient.from(tableName).delete().in('id', ids)
        }

        await adminClient
          .from('simulation_data_log')
          .delete()
          .eq('simulation_id', tourId)

        await adminClient
          .from('simulation_sessions')
          .update({ ended_at: new Date().toISOString(), cleaned_up: true })
          .eq('id', tourId)
      }
    }

    const response = NextResponse.json({ ok: true })

    const cookieNames = ['tour_id', 'tour_id_ui', 'tour_active_ui', 'stripe_test_mode', 'stripe_test_mode_ui']
    for (const name of cookieNames) {
      response.cookies.set(name, '', {
        httpOnly: name === 'tour_id' || name === 'stripe_test_mode',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      })
    }

    return response
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
