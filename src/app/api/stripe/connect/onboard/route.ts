import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripeLiveInstance } from '@/lib/stripe/server'

// POST /api/stripe/connect/onboard
// Creates or resumes a Stripe Connect Express onboarding link for the current coach
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single()

    if (!profile || !['coach', 'admin', 'master_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Only coaches can connect Stripe accounts' }, { status: 403 })
    }

    const { org_id } = await req.json().catch(() => ({}))
    const stripe = getStripeLiveInstance()
    const origin = req.headers.get('origin') || 'https://propersports.pro'

    // If org_id provided, check if org already has a Stripe account
    if (org_id) {
      const { data: org } = await adminClient
        .from('organizations')
        .select('stripe_connect_account_id, name')
        .eq('id', org_id)
        .maybeSingle()

      let accountId = org?.stripe_connect_account_id

      if (!accountId) {
        // Create a new Express connected account for the org
        const account = await stripe.accounts.create({
          type: 'express',
          country: 'US',
          email: user.email,
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          business_profile: {
            name: org?.name || 'PSP Organization',
            product_description: 'Sports performance coaching and training sessions',
          },
          metadata: {
            org_id,
            owner_id: user.id,
            platform: 'PSP.Pro',
          },
        })
        accountId = account.id

        // Save to org record
        await adminClient.from('organizations').update({
          stripe_connect_account_id: accountId,
          stripe_connect_status: 'pending',
        }).eq('id', org_id)
      }

      // Generate onboarding link
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${origin}/admin/org?tab=payouts&status=refresh`,
        return_url: `${origin}/admin/org?tab=payouts&status=connected`,
        type: 'account_onboarding',
      })

      return NextResponse.json({ url: accountLink.url })
    }

    // Coach-level Stripe account (no org_id)
    const query = adminClient
      .from('coach_payout_accounts')
      .select('stripe_account_id, account_status')
      .eq('coach_id', user.id)
    const { data: existing } = await query.maybeSingle()

    let accountId = existing?.stripe_account_id

    if (!accountId) {
      // Create a new Express connected account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: profile.full_name || 'PSP Coach',
          product_description: 'Sports performance coaching and training sessions',
        },
        metadata: {
          coach_id: user.id,
          platform: 'PSP.Pro',
        },
      })
      accountId = account.id

      // Upsert payout account record
      await adminClient.from('coach_payout_accounts').upsert({
        coach_id: user.id,
        org_id: null,
        stripe_account_id: accountId,
        stripe_account_type: 'express',
        account_status: 'pending',
      }, { onConflict: 'coach_id,org_id' })
    }

    // Generate onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/admin/org?tab=payouts&status=refresh`,
      return_url: `${origin}/admin/org?tab=payouts&status=connected`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (err: any) {
    console.error('Stripe Connect onboard error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
