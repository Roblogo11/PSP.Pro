import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { randomUUID } from 'crypto'

// GET - Check current tour status
export async function GET() {
  try {
    const cookieHeader = (await import('next/headers')).cookies
    const cookieStore = await cookieHeader()
    const tourId = cookieStore.get('tour_id_ui')?.value || null
    const tourActive = cookieStore.get('tour_active_ui')?.value === 'true'

    return NextResponse.json({ active: tourActive, tourId })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Start a tour session
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tourId = randomUUID()

    // Record in simulation_sessions table with type = 'tour'
    const adminClient = createAdminClient()
    const { error: insertError } = await adminClient
      .from('simulation_sessions')
      .insert({
        id: tourId,
        admin_id: user.id,
        simulated_role: 'tour',
      })

    if (insertError) {
      // Table may not have tour type yet — continue without DB record
      console.warn('Tour session DB insert failed (non-fatal):', insertError.message)
    }

    const response = NextResponse.json({
      active: true,
      tourId,
      message: 'Tour started! All data created during the tour will be cleaned up when you finish.',
    })

    const maxAge = 60 * 60 * 2 // 2 hours

    // UI-readable cookies (httpOnly: false so JS can read them)
    response.cookies.set('tour_id_ui', tourId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    response.cookies.set('tour_active_ui', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    // httpOnly versions for server-side checks
    response.cookies.set('tour_id', tourId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    // Auto-enable Stripe test mode during tour
    response.cookies.set('stripe_test_mode', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    response.cookies.set('stripe_test_mode_ui', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    return response
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - End tour session (triggers cleanup)
export async function DELETE() {
  try {
    const cookieHeader = (await import('next/headers')).cookies
    const cookieStore = await cookieHeader()
    const tourId = cookieStore.get('tour_id')?.value

    if (tourId) {
      // Run cleanup
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const adminClient = createAdminClient()

        // Tables to clean up in reverse dependency order
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

          await adminClient
            .from(tableName)
            .delete()
            .in('id', ids)
        }

        // Clean up log entries
        await adminClient
          .from('simulation_data_log')
          .delete()
          .eq('simulation_id', tourId)

        // Mark session ended
        await adminClient
          .from('simulation_sessions')
          .update({ ended_at: new Date().toISOString(), cleaned_up: true })
          .eq('id', tourId)
      }
    }

    const response = NextResponse.json({ active: false, message: 'Tour complete! All practice data cleaned up. 🎉' })

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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
