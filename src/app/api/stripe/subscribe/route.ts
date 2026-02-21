import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe/server'

/**
 * POST /api/stripe/subscribe
 * Create a Stripe Checkout session for Elite membership subscription
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tier_slug } = body

    if (!tier_slug || tier_slug !== 'elite_membership') {
      return NextResponse.json({ error: 'Invalid membership tier' }, { status: 400 })
    }

    // Get tier details
    const adminClient = createAdminClient()
    const { data: tier } = await adminClient
      .from('membership_tiers')
      .select('*')
      .eq('slug', tier_slug)
      .eq('is_active', true)
      .single()

    if (!tier) {
      return NextResponse.json({ error: 'Membership tier not found' }, { status: 404 })
    }

    // Get user profile
    const { data: profile } = await adminClient
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    const stripe = await getStripe()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://psp.pro'

    // Create or retrieve Stripe customer
    let customerId: string | undefined
    const { data: existingMembership } = await adminClient
      .from('athlete_memberships')
      .select('stripe_customer_id')
      .eq('athlete_id', user.id)
      .single()

    if (existingMembership?.stripe_customer_id) {
      customerId = existingMembership.stripe_customer_id
    }

    // Build checkout session params
    const sessionParams: any = {
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            recurring: { interval: 'month' },
            product_data: {
              name: `PSP.Pro ${tier.name} Membership`,
              description: tier.description,
            },
            unit_amount: tier.price_cents,
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/memberships?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/memberships?canceled=true`,
      metadata: {
        user_id: user.id,
        tier_slug: tier_slug,
        type: 'membership_subscription',
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          tier_slug: tier_slug,
        },
      },
    }

    // If we have a stripe_price_id configured on the tier, use that instead
    if (tier.stripe_price_id) {
      sessionParams.line_items = [{ price: tier.stripe_price_id, quantity: 1 }]
    }

    if (customerId) {
      sessionParams.customer = customerId
    } else {
      sessionParams.customer_email = user.email || profile?.email
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Subscription checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription checkout' },
      { status: 500 }
    )
  }
}
