import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripeLiveInstance } from '@/lib/stripe/server'

// GET /api/stripe/connect/status
// Returns the current Stripe Connect account status for a coach or organization
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()
    const org_id = req.nextUrl.searchParams.get('org_id')

    // If org_id provided, check org-level Stripe account first
    if (org_id) {
      const { data: org } = await adminClient
        .from('organizations')
        .select('stripe_connect_account_id, stripe_connect_status, platform_fee_percent')
        .eq('id', org_id)
        .maybeSingle()

      if (org?.stripe_connect_account_id) {
        const stripe = getStripeLiveInstance()
        const stripeAccount = await stripe.accounts.retrieve(org.stripe_connect_account_id)

        const status = stripeAccount.charges_enabled ? 'active'
          : stripeAccount.details_submitted ? 'pending'
          : 'not_connected'

        // Sync status to org table
        if (status !== org.stripe_connect_status) {
          await adminClient.from('organizations').update({
            stripe_connect_status: status,
          }).eq('id', org_id)
        }

        return NextResponse.json({
          connected: stripeAccount.charges_enabled,
          status,
          charges_enabled: stripeAccount.charges_enabled,
          payouts_enabled: stripeAccount.payouts_enabled,
          details_submitted: stripeAccount.details_submitted,
          coach_revenue_percent: 100 - (org.platform_fee_percent || 15),
          stripe_account_id: org.stripe_connect_account_id,
          source: 'organization',
        })
      }
    }

    // Fall back to coach-level payout account
    const query = adminClient
      .from('coach_payout_accounts')
      .select('*')
      .eq('coach_id', user.id)
    if (org_id) query.eq('org_id', org_id)
    const { data: account } = await query.maybeSingle()

    if (!account?.stripe_account_id) {
      return NextResponse.json({ connected: false, status: 'not_connected' })
    }

    // Sync status from Stripe
    const stripe = getStripeLiveInstance()
    const stripeAccount = await stripe.accounts.retrieve(account.stripe_account_id)

    const status = stripeAccount.charges_enabled ? 'active'
      : stripeAccount.details_submitted ? 'pending'
      : 'not_connected'

    // Update DB if changed
    if (status !== account.account_status) {
      await adminClient.from('coach_payout_accounts').update({
        account_status: status,
        charges_enabled: stripeAccount.charges_enabled,
        payouts_enabled: stripeAccount.payouts_enabled,
        details_submitted: stripeAccount.details_submitted,
      }).eq('id', account.id)
    }

    return NextResponse.json({
      connected: stripeAccount.charges_enabled,
      status,
      charges_enabled: stripeAccount.charges_enabled,
      payouts_enabled: stripeAccount.payouts_enabled,
      details_submitted: stripeAccount.details_submitted,
      coach_revenue_percent: account.coach_revenue_percent,
      stripe_account_id: account.stripe_account_id,
      source: 'coach',
    })
  } catch (err: any) {
    console.error('Stripe Connect status error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH /api/stripe/connect/status — update revenue split
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { coach_revenue_percent, org_id } = await req.json()
    if (typeof coach_revenue_percent !== 'number' || coach_revenue_percent < 0 || coach_revenue_percent > 100) {
      return NextResponse.json({ error: 'Invalid revenue percent' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Only master_admin or org owner can change split
    const { data: profile } = await adminClient
      .from('profiles').select('role').eq('id', user.id).single()

    if (!profile || !['admin', 'master_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const query = adminClient
      .from('coach_payout_accounts')
      .update({ coach_revenue_percent })
      .eq('coach_id', user.id)
    if (org_id) query.eq('org_id', org_id)
    await query

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
