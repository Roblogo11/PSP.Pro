import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/bookings/checkin — coach checks in or marks no-show for a booking
 */
export async function POST(request: NextRequest) {
  try {
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

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
