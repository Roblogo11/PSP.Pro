import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit, getClientIP } from '@/lib/rate-limit'
import { auditLog } from '@/lib/audit'

/**
 * POST /api/bookings/checkin — coach checks in or marks no-show for a booking
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    const { allowed } = rateLimit(`checkin:${ip}`, { limit: 30, windowSec: 60 })
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['coach', 'admin', 'master_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const { bookingId, action } = await request.json()

    if (!bookingId || !['checkin', 'no_show', 'complete'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const now = new Date().toISOString()

    // Verify coach owns this booking (admins/master_admin can check in any)
    if (profile.role === 'coach') {
      const { data: booking } = await adminClient
        .from('bookings')
        .select('coach_id')
        .eq('id', bookingId)
        .single()

      if (!booking || booking.coach_id !== user.id) {
        return NextResponse.json({ error: 'You can only check in your own sessions' }, { status: 403 })
      }
    }

    if (action === 'checkin') {
      await adminClient.from('bookings').update({
        checked_in_at: now,
        checked_in_by: user.id,
        status: 'confirmed',
      }).eq('id', bookingId)
    } else if (action === 'no_show') {
      await adminClient.from('bookings').update({
        status: 'no-show',
        no_show_marked_at: now,
      }).eq('id', bookingId)
    } else if (action === 'complete') {
      await adminClient.from('bookings').update({
        status: 'completed',
        completed_at: now,
      }).eq('id', bookingId)
    }

    auditLog({
      userId: user.id,
      action: `booking.${action}`,
      resourceType: 'booking',
      resourceId: bookingId,
      ip: getClientIP(request),
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Check-in error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
