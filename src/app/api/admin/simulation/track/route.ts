import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    // Read simulation_id from httpOnly cookie
    const cookieHeader = (await import('next/headers')).cookies
    const cookieStore = await cookieHeader()
    const simulationId = cookieStore.get('simulation_id')?.value

    // Not in simulation — no-op (return 204)
    if (!simulationId) {
      return new NextResponse(null, { status: 204 })
    }

    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tableName, recordId } = body

    if (!tableName || !recordId) {
      return NextResponse.json({ error: 'tableName and recordId are required' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { error } = await adminClient
      .from('simulation_data_log')
      .insert({
        simulation_id: simulationId,
        table_name: tableName,
        record_id: recordId,
      })

    if (error) {
      console.error('Error tracking simulation data:', error)
      return NextResponse.json({ error: 'Failed to track data' }, { status: 500 })
    }

    return NextResponse.json({ tracked: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
