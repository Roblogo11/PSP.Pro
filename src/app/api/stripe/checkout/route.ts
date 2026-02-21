import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createBookingCheckoutSession } from '@/lib/stripe/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { serviceId, bookingData, promoCode } = body

    // Fetch service details
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single()

    if (serviceError || !service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (!service.is_active) {
      return NextResponse.json({ error: 'This service is no longer available' }, { status: 400 })
    }

    // Get user profile (with membership tier) + coach's Stripe Connect account
    const adminClient = createAdminClient()
    const [{ data: profile }, coachConnectData] = await Promise.all([
      adminClient.from('profiles').select('full_name, membership_tier').eq('id', user.id).single(),
      // If booking has a coach_id, look up their connected account
      bookingData?.coach_id
        ? adminClient
            .from('coach_payout_accounts')
            .select('stripe_account_id, coach_revenue_percent, charges_enabled')
            .eq('coach_id', bookingData.coach_id)
            .eq('account_status', 'active')
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ])

    // ── Calculate discounts ──────────────────────────────────────
    let finalPrice = service.price_cents
    const originalPrice = service.price_cents
    let eliteDiscountApplied = false
    let promoDiscountApplied = false
    let promoCodeId: string | null = null
    let promoDiscountLabel = ''

    // 1) Elite membership discount (10% off)
    if (profile?.membership_tier === 'elite') {
      finalPrice = Math.round(finalPrice * 0.9)
      eliteDiscountApplied = true
    }

    // 2) Promo code discount (stacks on top of elite)
    if (promoCode) {
      const { data: promo } = await adminClient
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase().trim())
        .eq('is_active', true)
        .single()

      if (promo) {
        const now = new Date()
        const notExpired = !promo.expires_at || new Date(promo.expires_at) > now
        const notMaxedOut = !promo.max_uses || promo.current_uses < promo.max_uses
        const meetsMinimum = finalPrice >= promo.min_amount_cents
        const validType = promo.applies_to === 'all' || promo.applies_to === 'booking'

        if (notExpired && notMaxedOut && meetsMinimum && validType) {
          if (promo.discount_type === 'percentage') {
            finalPrice = Math.round(finalPrice * (1 - promo.discount_value / 100))
            promoDiscountLabel = `${promo.discount_value}% off`
          } else {
            finalPrice = Math.max(0, finalPrice - promo.discount_value)
            promoDiscountLabel = `$${(promo.discount_value / 100).toFixed(2)} off`
          }
          promoDiscountApplied = true
          promoCodeId = promo.id
        }
      }
    }

    // Determine if we can do a split payment
    const connectAccount = coachConnectData?.data
    const canSplit = connectAccount?.charges_enabled && connectAccount?.stripe_account_id

    // Validate origin to prevent open redirect
    const allowedOrigins = [process.env.NEXT_PUBLIC_SITE_URL, 'http://localhost:3000', 'https://psp-pro.vercel.app'].filter(Boolean)
    const requestOrigin = request.headers.get('origin')
    const origin = requestOrigin && allowedOrigins.includes(requestOrigin) ? requestOrigin : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')

    // Build description with discounts
    let description = `Training session: ${service.name}`
    if (eliteDiscountApplied) description += ' (Elite 10% discount)'
    if (promoDiscountApplied) description += ` (Promo: ${promoDiscountLabel})`

    const session = await createBookingCheckoutSession({
      serviceId: service.id,
      serviceName: service.name,
      serviceDescription: description,
      priceInCents: finalPrice,
      athleteId: user.id,
      athleteEmail: user.email!,
      bookingData,
      successUrl: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/booking?canceled=true`,
      // Discount metadata
      originalPriceCents: originalPrice,
      eliteDiscount: eliteDiscountApplied,
      promoCodeId: promoCodeId || undefined,
      promoCode: promoDiscountApplied ? promoCode : undefined,
      // Stripe Connect split payment params (only if coach has connected account)
      ...(canSplit && {
        stripeConnectAccountId: connectAccount.stripe_account_id,
        coachRevenuePercent: connectAccount.coach_revenue_percent,
      }),
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error?.message || error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
