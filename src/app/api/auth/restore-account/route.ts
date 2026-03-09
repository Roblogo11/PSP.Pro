import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Called after signup if the user accepts the restore offer.
// Restores profile snapshot and bookings into the new account.
export async function POST(request: NextRequest) {
  try {
    const { archiveId } = await request.json()
    if (!archiveId) return NextResponse.json({ error: 'Missing archiveId' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()

    // Fetch the archive
    const { data: archive, error: fetchErr } = await adminClient
      .from('archived_accounts')
      .select('*')
      .eq('id', archiveId)
      .eq('email', user.email)
      .is('restore_accepted_at', null)
      .single()

    if (fetchErr || !archive) {
      return NextResponse.json({ error: 'Archive not found or already restored' }, { status: 404 })
    }

    const profile = archive.profile_snapshot
    const bookings: any[] = archive.bookings_snapshot ?? []
    const metrics: any[] = archive.metrics_snapshot ?? []

    // Restore profile (merge snapshot into new account, keep new auth id)
    if (profile) {
      const { id: _oldId, ...profileFields } = profile
      await adminClient.from('profiles').update({
        full_name: profileFields.full_name,
        sports: profileFields.sports,
        athlete_type: profileFields.athlete_type,
        age: profileFields.age,
        avatar_url: profileFields.avatar_url ?? null,
        region: profileFields.region ?? null,
        leaderboard_opt_in: profileFields.leaderboard_opt_in ?? false,
        newsletter_consent: profileFields.newsletter_consent ?? false,
        data_consent: profileFields.data_consent ?? true,
        data_consent_at: profileFields.data_consent_at ?? null,
      }).eq('id', user.id)
    }

    // Restore bookings — remap user_id to new account
    if (bookings.length > 0) {
      const remapped = bookings.map(({ id: _id, ...b }) => ({
        ...b,
        user_id: user.id,
        restored_from_archive: true,
      }))
      await adminClient.from('bookings').insert(remapped)
    }

    // Restore metrics — remap user_id to new account
    if (metrics.length > 0) {
      const remapped = metrics.map(({ id: _id, ...m }) => ({
        ...m,
        user_id: user.id,
      }))
      await adminClient.from('athlete_performance_metrics').insert(remapped)
    }

    // Mark archive as restored
    await adminClient.from('archived_accounts').update({
      restore_accepted_at: new Date().toISOString(),
      restore_offered_at: archive.restore_offered_at ?? new Date().toISOString(),
      restored_to_user_id: user.id,
    }).eq('id', archiveId)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Restore account error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
