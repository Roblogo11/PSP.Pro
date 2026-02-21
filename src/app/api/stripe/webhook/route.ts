import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, getStripe } from '@/lib/stripe/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createBookingFromSession } from '@/lib/bookings/create-booking-from-session'
import Stripe from 'stripe'

// Disable body parsing so we can verify the webhook signature
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  try {
    // Verify the webhook signature
    const event = verifyWebhookSignature(body, signature)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'payment_intent.succeeded':
        console.log('Payment succeeded for intent:', (event.data.object as Stripe.PaymentIntent).id)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      // Membership subscription events
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break

      // Installment payment tracking
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    // Return 500 so Stripe retries (3-day window with exponential backoff)
    // This prevents lost bookings from transient DB failures
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient()
  const stripeInstance = await getStripe()

  console.log('Checkout session completed:', session.id)

  const metadata = session.metadata

  if (!metadata) {
    console.error('No metadata in checkout session')
    return
  }

  // Handle booking payment
  if (metadata.booking_data) {
    const result = await createBookingFromSession(supabase, stripeInstance, session)

    if (result.created) {
      console.log('Webhook created booking:', result.bookingId)

      // Record split payout ledger entry if this was a Connect split payment
      if (metadata.connect_account_id && metadata.platform_fee_cents && result.bookingId) {
        try {
          const grossAmount = session.amount_total || 0
          const platformFee = parseInt(metadata.platform_fee_cents)
          const coachAmount = grossAmount - platformFee

          // Find the coach's payout account for this connect account
          const { data: payoutAccount } = await supabase
            .from('coach_payout_accounts')
            .select('id, coach_id')
            .eq('stripe_account_id', metadata.connect_account_id)
            .maybeSingle()

          if (payoutAccount) {
            await supabase.from('coach_payouts').insert({
              booking_id: result.bookingId,
              coach_id: payoutAccount.coach_id,
              payout_account_id: payoutAccount.id,
              gross_amount_cents: grossAmount,
              platform_fee_cents: platformFee,
              coach_amount_cents: coachAmount,
              stripe_payment_intent_id: session.payment_intent as string,
              status: 'transferred',
              transferred_at: new Date().toISOString(),
            })
            console.log('Payout ledger entry created for booking:', result.bookingId)
          }
        } catch (err) {
          console.error('Failed to create payout ledger entry:', err)
          // Non-fatal — booking already created, don't fail the webhook
        }
      }
      // Increment promo code usage if one was applied
      if (metadata.promo_code_id) {
        try {
          const { data: promoRow } = await supabase
            .from('promo_codes')
            .select('current_uses')
            .eq('id', metadata.promo_code_id)
            .single()
          if (promoRow) {
            await supabase
              .from('promo_codes')
              .update({ current_uses: (promoRow.current_uses || 0) + 1 })
              .eq('id', metadata.promo_code_id)
            console.log('Promo code usage incremented:', metadata.promo_code_id)
          }
        } catch (err) {
          console.error('Failed to increment promo code usage:', err)
        }
      }
    } else if (result.reason === 'already_exists') {
      console.log('Booking already exists for session:', session.id)
    } else {
      console.error('Webhook booking creation failed:', result.error)
    }
  }

  // Handle membership subscription checkout
  if (metadata.type === 'membership_subscription' && metadata.user_id && metadata.tier_slug) {
    try {
      const stripeForSub = await getStripe()
      const subscriptionId = session.subscription as string

      // Get subscription details from Stripe
      let subscription: any = null
      if (subscriptionId) {
        subscription = await stripeForSub.subscriptions.retrieve(subscriptionId)
      }

      // Get the tier ID from our DB
      const { data: tier } = await supabase
        .from('membership_tiers')
        .select('id')
        .eq('slug', metadata.tier_slug)
        .single()

      if (tier) {
        // Upsert membership record
        await supabase.from('athlete_memberships').upsert({
          athlete_id: metadata.user_id,
          tier_id: tier.id,
          status: 'active',
          stripe_subscription_id: subscriptionId || null,
          stripe_customer_id: (session.customer as string) || null,
          current_period_start: subscription?.current_period_start
            ? new Date(subscription.current_period_start * 1000).toISOString()
            : new Date().toISOString(),
          current_period_end: subscription?.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'athlete_id' })

        // Update profile tier
        await supabase.from('profiles').update({
          membership_tier: metadata.tier_slug === 'elite_membership' ? 'elite' : 'basic',
        }).eq('id', metadata.user_id)

        console.log('Membership activated for user:', metadata.user_id, 'tier:', metadata.tier_slug)
      }
    } catch (err) {
      console.error('Failed to process membership subscription:', err)
    }
  }

  // Handle package purchase
  if (metadata.package_id) {
    try {
      // IDEMPOTENCY CHECK - prevent duplicate packages if webhook fires twice
      const { data: existingPackage } = await supabase
        .from('athlete_packages')
        .select('id')
        .eq('stripe_payment_intent_id', session.payment_intent as string)
        .single()

      if (existingPackage) {
        console.log('Package already exists for payment:', session.payment_intent)
        return
      }

      const validityDays = 90 // Default to 90 days
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + validityDays)

      const { data: athletePackage, error } = await supabase
        .from('athlete_packages')
        .insert({
          athlete_id: metadata.athlete_id,
          package_id: metadata.package_id,
          sessions_total: parseInt(metadata.sessions_included),
          sessions_used: 0,
          payment_status: 'paid',
          stripe_payment_intent_id: session.payment_intent as string,
          amount_cents: session.amount_total || 0,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating athlete package:', error)
      } else {
        console.log('Athlete package created successfully:', athletePackage.id)

        // Track for simulation cleanup if in simulation mode
        if (metadata.simulation_id) {
          await supabase.from('simulation_data_log').insert({
            simulation_id: metadata.simulation_id,
            table_name: 'athlete_packages',
            record_id: athletePackage.id,
          })
        }
      }
    } catch (err) {
      console.error('Failed to create athlete package:', err)
    }
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const supabase = createAdminClient()

  console.log('Payment failed:', paymentIntent.id)

  // Update booking status if exists
  const { error } = await supabase
    .from('bookings')
    .update({ payment_status: 'failed' })
    .eq('stripe_payment_intent_id', paymentIntent.id)

  if (error) {
    console.error('Error updating booking payment status:', error)
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  const supabase = createAdminClient()
  const userId = subscription.metadata?.user_id
  const tierSlug = subscription.metadata?.tier_slug

  if (!userId) {
    console.log('No user_id in subscription metadata, skipping')
    return
  }

  console.log('Subscription updated:', subscription.id, 'status:', subscription.status)

  const statusMap: Record<string, string> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'cancelled',
    unpaid: 'past_due',
  }

  const membershipStatus = statusMap[subscription.status] || 'active'

  await supabase.from('athlete_memberships').upsert({
    athlete_id: userId,
    tier_id: (await supabase.from('membership_tiers').select('id').eq('slug', tierSlug || 'elite_membership').single()).data?.id,
    status: membershipStatus,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'athlete_id' })

  // Update profile tier based on status
  const isActive = ['active', 'trialing'].includes(subscription.status)
  await supabase.from('profiles').update({
    membership_tier: isActive ? 'elite' : 'basic',
  }).eq('id', userId)
}

async function handleSubscriptionDeleted(subscription: any) {
  const supabase = createAdminClient()
  const userId = subscription.metadata?.user_id

  if (!userId) {
    console.log('No user_id in subscription metadata for deletion, skipping')
    return
  }

  console.log('Subscription cancelled:', subscription.id, 'for user:', userId)

  // Update membership to cancelled
  await supabase.from('athlete_memberships').update({
    status: 'cancelled',
    cancelled_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('athlete_id', userId)

  // Downgrade profile to basic (NEVER delete data)
  await supabase.from('profiles').update({
    membership_tier: 'basic',
  }).eq('id', userId)
}

async function handleInvoicePaid(invoice: any) {
  const supabase = createAdminClient()
  const subscriptionId = invoice.subscription

  if (!subscriptionId) return

  // Check if this is an installment package payment
  const { data: pkg } = await supabase
    .from('athlete_packages')
    .select('id, installment_plan, installments_total, installments_paid')
    .eq('stripe_subscription_id', subscriptionId)
    .eq('installment_plan', true)
    .maybeSingle()

  if (pkg) {
    const newPaid = (pkg.installments_paid || 0) + 1
    await supabase
      .from('athlete_packages')
      .update({ installments_paid: newPaid })
      .eq('id', pkg.id)
    console.log(`Installment ${newPaid}/${pkg.installments_total} paid for package:`, pkg.id)
  }
}
