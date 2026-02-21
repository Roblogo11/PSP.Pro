import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe/server'

/**
 * POST /api/stripe/installment-checkout
 * Create a subscription-mode checkout for package installment payments
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { packageId, installments } = await request.json()

    if (!packageId || !installments || installments < 2 || installments > 4) {
      return NextResponse.json({ error: 'Invalid installment plan' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Fetch package details
    const { data: pkg } = await adminClient
      .from('training_packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single()

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    // Calculate per-installment amount
    const totalCents = pkg.price_cents
    const perInstallmentCents = Math.ceil(totalCents / installments)

    const stripe = await getStripe()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://psp.pro'

    // Create subscription checkout with fixed billing cycles
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email!,
      line_items: [{
        price_data: {
          currency: 'usd',
          recurring: { interval: 'month' },
          product_data: {
            name: `${pkg.name} (${installments} payments)`,
            description: `Training package: ${pkg.sessions_included} sessions — Payment ${1} of ${installments}`,
          },
          unit_amount: perInstallmentCents,
        },
        quantity: 1,
      }],
      subscription_data: {
        metadata: {
          user_id: user.id,
          package_id: packageId,
          installments_total: installments.toString(),
          sessions_included: pkg.sessions_included.toString(),
          type: 'installment_package',
        },
      },
      metadata: {
        type: 'installment_package',
        user_id: user.id,
        package_id: packageId,
        installments_total: installments.toString(),
        sessions_included: pkg.sessions_included.toString(),
      },
      success_url: `${appUrl}/booking/success?method=installment&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Installment checkout error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create installment checkout' }, { status: 500 })
  }
}
