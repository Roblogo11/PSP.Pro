import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { auditLog } from '@/lib/audit'
import { getClientIP } from '@/lib/rate-limit'

// POST /api/admin/apply-promo
// Body: { booking_id: string, promo_code: string, refund_difference?: boolean }
//
// Applies a promo code to an existing booking. Behavior depends on payment_status:
//   - 'pending' (pay-on-site or unpaid): just discount the amount_cents (no refund needed).
//   - 'paid' (Stripe): if refund_difference=true and stripe_payment_intent_id exists,
//     issue a partial refund for the discount amount.
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'master_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden — admins only' }, { status: 403 })
    }

    const { booking_id, promo_code, refund_difference } = await request.json() as {
      booking_id: string
      promo_code: string
      refund_difference?: boolean
    }

    if (!booking_id || !promo_code) {
      return NextResponse.json({ error: 'booking_id and promo_code are required' }, { status: 400 })
    }

    // Fetch booking
    const { data: booking, error: bookingError } = await adminClient
      .from('bookings')
      .select('id, amount_cents, payment_status, stripe_payment_intent_id, promo_code, status')
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'Cannot apply promo to a cancelled booking' }, { status: 400 })
    }

    if (booking.promo_code) {
      return NextResponse.json(
        { error: `Booking already has promo "${booking.promo_code}" applied. Reverse it first if you want to swap.` },
        { status: 409 },
      )
    }

    // Validate promo
    const trimmedPromo = promo_code.trim().toUpperCase()
    const { data: promo } = await adminClient
      .from('promo_codes')
      .select('id, code, discount_type, discount_value, max_uses, current_uses, expires_at, is_active, min_amount_cents')
      .eq('code', trimmedPromo)
      .eq('is_active', true)
      .single()

    if (!promo) return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 })
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Promo code has expired' }, { status: 400 })
    }
    if (promo.max_uses && promo.current_uses >= promo.max_uses) {
      return NextResponse.json({ error: 'Promo code usage limit reached' }, { status: 400 })
    }
    const originalAmount = booking.amount_cents || 0
    if (promo.min_amount_cents && originalAmount < promo.min_amount_cents) {
      return NextResponse.json(
        { error: `Promo requires min $${(promo.min_amount_cents / 100).toFixed(2)} (booking is $${(originalAmount / 100).toFixed(2)})` },
        { status: 400 },
      )
    }

    // Calculate discount
    const discountCents = promo.discount_type === 'percentage'
      ? Math.floor(originalAmount * (promo.discount_value / 100))
      : Math.min(promo.discount_value, originalAmount)
    const newAmount = Math.max(0, originalAmount - discountCents)

    // Refund the difference if booking was paid via Stripe
    let refundId: string | null = null
    if (
      booking.payment_status === 'paid' &&
      booking.stripe_payment_intent_id &&
      refund_difference !== false &&  // default to true for paid bookings
      discountCents > 0
    ) {
      if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json(
          { error: 'Stripe is not configured — cannot issue refund' },
          { status: 500 },
        )
      }
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-09-30.acacia' as any })
      try {
        const refund = await stripe.refunds.create({
          payment_intent: booking.stripe_payment_intent_id,
          amount: discountCents,
          reason: 'requested_by_customer',
          metadata: {
            booking_id,
            promo_code: promo.code,
            applied_by: user.id,
          },
        })
        refundId = refund.id
      } catch (err: any) {
        return NextResponse.json(
          { error: `Stripe refund failed: ${err.message || 'unknown'}` },
          { status: 500 },
        )
      }
    }

    // Update booking. promo_code column added in migration 057;
    // if it's missing, retry without it (the discount + audit note still apply).
    const baseUpdate: Record<string, unknown> = {
      amount_cents: newAmount,
      internal_notes: [
        `Promo "${promo.code}" applied by ${profile.role} (-$${(discountCents / 100).toFixed(2)})`,
        refundId ? `Stripe refund: ${refundId}` : null,
      ].filter(Boolean).join(' | '),
    }

    let updateResult = await adminClient
      .from('bookings')
      .update({ ...baseUpdate, promo_code: promo.code })
      .eq('id', booking_id)

    if (updateResult.error?.message?.includes('promo_code')) {
      console.warn('apply-promo: promo_code column missing (migration 057 pending), retrying without it')
      updateResult = await adminClient
        .from('bookings')
        .update(baseUpdate)
        .eq('id', booking_id)
    }

    if (updateResult.error) {
      return NextResponse.json({ error: `Failed to update booking: ${updateResult.error.message}` }, { status: 500 })
    }

    // Increment promo usage
    await adminClient.rpc('increment_promo_usage', { promo_id: promo.id })

    auditLog({
      userId: user.id,
      action: 'promo_applied_to_booking',
      resourceType: 'booking',
      resourceId: booking_id,
      metadata: {
        promo_code: promo.code,
        discount_cents: discountCents,
        refund_id: refundId,
        original_amount_cents: originalAmount,
        new_amount_cents: newAmount,
      },
      ip: getClientIP(request),
    })

    return NextResponse.json({
      success: true,
      promo_code: promo.code,
      discount_cents: discountCents,
      new_amount_cents: newAmount,
      refund_id: refundId,
    })
  } catch (error) {
    console.error('Apply promo error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
