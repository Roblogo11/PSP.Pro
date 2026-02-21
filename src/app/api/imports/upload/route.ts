import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { parseDeviceCSV } from '@/lib/imports/parsers'

/**
 * POST /api/imports/upload — upload and process device CSV data
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify staff role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['coach', 'admin', 'master_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const { athleteId, deviceType, csvData, fileName } = await request.json()

    if (!athleteId || !deviceType || !csvData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Parse the CSV data
    const parseResult = parseDeviceCSV(csvData, deviceType)

    if (parseResult.records.length === 0) {
      return NextResponse.json({
        error: 'No valid records found in CSV',
        errors: parseResult.errors,
      }, { status: 400 })
    }

    // Create import record
    const { data: importRecord, error: importError } = await adminClient
      .from('device_imports')
      .insert({
        athlete_id: athleteId,
        device_type: deviceType,
        imported_by: user.id,
        file_name: fileName || `${deviceType}_import.csv`,
        records_count: parseResult.records.length,
        status: 'processing',
        raw_data: { records: parseResult.records, errors: parseResult.errors },
      })
      .select('id')
      .single()

    if (importError) {
      return NextResponse.json({ error: importError.message }, { status: 500 })
    }

    // Insert metrics for each record
    let processed = 0
    const insertErrors: string[] = []

    for (const record of parseResult.records) {
      const metricData: any = {
        athlete_id: athleteId,
        recorded_by: user.id,
        test_date: record.test_date,
        custom_metrics: { metrics: record.custom_metrics, device: deviceType },
        notes: `Imported from ${deviceType}`,
      }

      // Map direct DB columns
      if (record.throwing_velocity_mph) metricData.throwing_velocity_mph = record.throwing_velocity_mph
      if (record.bat_speed_mph) metricData.bat_speed_mph = record.bat_speed_mph
      if (record.exit_velocity_mph) metricData.exit_velocity_mph = record.exit_velocity_mph
      if (record.launch_angle_degrees) metricData.launch_angle_degrees = record.launch_angle_degrees

      const { error: metricError } = await adminClient
        .from('athlete_performance_metrics')
        .insert(metricData)

      if (metricError) {
        insertErrors.push(`Record ${processed + 1}: ${metricError.message}`)
      } else {
        processed++
      }
    }

    // Update import status
    await adminClient
      .from('device_imports')
      .update({
        records_processed: processed,
        status: processed === parseResult.records.length ? 'completed' : 'completed',
        error_message: insertErrors.length > 0 ? insertErrors.join('; ') : null,
      })
      .eq('id', importRecord.id)

    return NextResponse.json({
      success: true,
      importId: importRecord.id,
      totalRecords: parseResult.records.length,
      processed,
      errors: [...parseResult.errors, ...insertErrors],
    })
  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
