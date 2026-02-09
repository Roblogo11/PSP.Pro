import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Tables to clean up in order (reverse dependency)
const CLEANUP_ORDER = [
  'drill_completions',
  'assigned_drills',
  'athlete_performance_notes',
  'athlete_performance_goals',
  'athlete_performance_metrics',
  'velocity_logs',
  'bookings',
  'athlete_packages',
  'available_slots',
]

// Tables that may have Stripe payment intents to refund
const STRIPE_TABLES = ['bookings', 'athlete_packages']

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'master_admin') {
      return NextResponse.json({ error: 'Master admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { simulationId } = body

    if (!simulationId) {
      return NextResponse.json({ error: 'simulationId is required' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Verify this simulation belongs to the current user
    const { data: session } = await adminClient
      .from('simulation_sessions')
      .select('id, admin_id, cleaned_up')
      .eq('id', simulationId)
      .eq('admin_id', user.id)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Simulation session not found' }, { status: 404 })
    }

    if (session.cleaned_up) {
      return NextResponse.json({ error: 'Simulation already cleaned up' }, { status: 400 })
    }

    const summary: Record<string, number> = {}
    let stripeRefunds = 0

    // Process each table in cleanup order
    for (const tableName of CLEANUP_ORDER) {
      const { data: records } = await adminClient
        .from('simulation_data_log')
        .select('record_id')
        .eq('simulation_id', simulationId)
        .eq('table_name', tableName)

      if (!records || records.length === 0) continue

      const ids = records.map(r => r.record_id)

      // Refund Stripe payments for applicable tables
      if (STRIPE_TABLES.includes(tableName)) {
        const { data: stripeRecords } = await adminClient
          .from(tableName)
          .select('stripe_payment_intent_id')
          .in('id', ids)
          .not('stripe_payment_intent_id', 'is', null)

        if (stripeRecords && stripeRecords.length > 0) {
          // Import Stripe test instance for refunds
          try {
            const Stripe = (await import('stripe')).default
            const testKey = process.env.STRIPE_SECRET_KEY_TEST
            if (testKey && !testKey.includes('PASTE_YOUR')) {
              const stripeTest = new Stripe(testKey, {
                apiVersion: '2026-01-28.clover',
                typescript: true,
              })

              for (const rec of stripeRecords) {
                try {
                  await stripeTest.refunds.create({
                    payment_intent: rec.stripe_payment_intent_id,
                  })
                  stripeRefunds++
                } catch {
                  // Test payments may already be refunded or expired — continue
                }
              }
            }
          } catch {
            // Stripe not available — continue with DB cleanup
          }
        }
      }

      // Delete the records from the actual table
      const { error: deleteError } = await adminClient
        .from(tableName)
        .delete()
        .in('id', ids)

      if (deleteError) {
        console.error(`Error deleting from ${tableName}:`, deleteError)
      }

      summary[tableName] = ids.length
    }

    // Clean up the simulation data log entries
    await adminClient
      .from('simulation_data_log')
      .delete()
      .eq('simulation_id', simulationId)

    // Mark session as cleaned up
    await adminClient
      .from('simulation_sessions')
      .update({
        cleaned_up: true,
        ended_at: new Date().toISOString(),
      })
      .eq('id', simulationId)

    return NextResponse.json({
      cleaned: true,
      summary,
      stripeRefunds,
      message: 'Simulation data cleaned up successfully.',
    })
  } catch (error: any) {
    console.error('Simulation cleanup error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
