/**
 * Device-specific CSV parsers for wearable/device data import.
 * Each parser takes CSV text and returns normalized metric records.
 */

export interface ParsedMetric {
  test_date: string
  custom_metrics: Record<string, number>
  // Direct DB column mappings when available
  throwing_velocity_mph?: number
  bat_speed_mph?: number
  exit_velocity_mph?: number
  launch_angle_degrees?: number
}

export interface ParseResult {
  records: ParsedMetric[]
  errors: string[]
  deviceType: string
}

// Parse CSV text to rows
function csvToRows(csv: string): string[][] {
  const lines = csv.trim().split('\n')
  return lines.map(line => {
    const values: string[] = []
    let current = ''
    let inQuotes = false
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())
    return values
  })
}

/**
 * Rapsodo Pitching CSV Parser
 * Expected columns: Date, Velocity (mph), Spin Rate (rpm), Spin Efficiency (%),
 *                    Horizontal Break (in), Vertical Break (in), Strike Zone (T/F)
 */
export function parseRapsodo(csv: string): ParseResult {
  const rows = csvToRows(csv)
  const errors: string[] = []
  const records: ParsedMetric[] = []

  if (rows.length < 2) {
    return { records: [], errors: ['File is empty or has no data rows'], deviceType: 'rapsodo' }
  }

  const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, '_'))

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (row.length < 2) continue

    try {
      const getValue = (keys: string[]): number | undefined => {
        for (const key of keys) {
          const idx = headers.findIndex(h => h.includes(key))
          if (idx >= 0 && row[idx]) {
            const val = parseFloat(row[idx])
            if (!isNaN(val)) return val
          }
        }
        return undefined
      }

      const dateIdx = headers.findIndex(h => h.includes('date'))
      let testDate = new Date().toISOString().split('T')[0]
      if (dateIdx >= 0 && row[dateIdx]) {
        const parsed = new Date(row[dateIdx])
        if (!isNaN(parsed.getTime())) {
          testDate = parsed.toISOString().split('T')[0]
        }
      }

      const velocity = getValue(['velocity', 'speed', 'velo'])
      const spinRate = getValue(['spin_rate', 'spin', 'rpm'])
      const spinEfficiency = getValue(['spin_eff', 'efficiency'])
      const hBreak = getValue(['horizontal_break', 'h_break', 'hbreak'])
      const vBreak = getValue(['vertical_break', 'v_break', 'vbreak'])

      records.push({
        test_date: testDate,
        throwing_velocity_mph: velocity,
        custom_metrics: {
          ...(velocity !== undefined && { pitching_velocity: velocity }),
          ...(spinRate !== undefined && { spin_rate: spinRate }),
          ...(spinEfficiency !== undefined && { spin_efficiency: spinEfficiency }),
          ...(hBreak !== undefined && { horizontal_break: hBreak }),
          ...(vBreak !== undefined && { vertical_break: vBreak }),
        },
      })
    } catch (err) {
      errors.push(`Row ${i + 1}: Failed to parse`)
    }
  }

  return { records, errors, deviceType: 'rapsodo' }
}

/**
 * Blast Motion Bat Sensor CSV Parser
 * Expected columns: Date, Bat Speed (mph), Hand Speed (mph), Time to Contact (s),
 *                    Attack Angle (deg), Power (kW)
 */
export function parseBlastMotion(csv: string): ParseResult {
  const rows = csvToRows(csv)
  const errors: string[] = []
  const records: ParsedMetric[] = []

  if (rows.length < 2) {
    return { records: [], errors: ['File is empty'], deviceType: 'blast_motion' }
  }

  const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, '_'))

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (row.length < 2) continue

    try {
      const getValue = (keys: string[]): number | undefined => {
        for (const key of keys) {
          const idx = headers.findIndex(h => h.includes(key))
          if (idx >= 0 && row[idx]) {
            const val = parseFloat(row[idx])
            if (!isNaN(val)) return val
          }
        }
        return undefined
      }

      const dateIdx = headers.findIndex(h => h.includes('date'))
      let testDate = new Date().toISOString().split('T')[0]
      if (dateIdx >= 0 && row[dateIdx]) {
        const parsed = new Date(row[dateIdx])
        if (!isNaN(parsed.getTime())) testDate = parsed.toISOString().split('T')[0]
      }

      const batSpeed = getValue(['bat_speed', 'batspeed'])
      const handSpeed = getValue(['hand_speed', 'handspeed'])
      const timeToContact = getValue(['time_to_contact', 'contact_time'])
      const attackAngle = getValue(['attack_angle', 'swing_angle'])
      const power = getValue(['power', 'peak_power'])

      records.push({
        test_date: testDate,
        bat_speed_mph: batSpeed,
        launch_angle_degrees: attackAngle,
        custom_metrics: {
          ...(batSpeed !== undefined && { bat_speed: batSpeed }),
          ...(handSpeed !== undefined && { hand_speed: handSpeed }),
          ...(timeToContact !== undefined && { time_to_contact: timeToContact }),
          ...(attackAngle !== undefined && { attack_angle: attackAngle }),
          ...(power !== undefined && { peak_power: power }),
        },
      })
    } catch (err) {
      errors.push(`Row ${i + 1}: Failed to parse`)
    }
  }

  return { records, errors, deviceType: 'blast_motion' }
}

/**
 * Pocket Radar CSV Parser
 * Expected columns: Speed (mph), Date, Time
 */
export function parsePocketRadar(csv: string): ParseResult {
  const rows = csvToRows(csv)
  const errors: string[] = []
  const records: ParsedMetric[] = []

  if (rows.length < 2) {
    return { records: [], errors: ['File is empty'], deviceType: 'pocket_radar' }
  }

  const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, '_'))

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (row.length < 1) continue

    try {
      const speedIdx = headers.findIndex(h => h.includes('speed') || h.includes('mph') || h.includes('velocity'))
      const dateIdx = headers.findIndex(h => h.includes('date'))

      let testDate = new Date().toISOString().split('T')[0]
      if (dateIdx >= 0 && row[dateIdx]) {
        const parsed = new Date(row[dateIdx])
        if (!isNaN(parsed.getTime())) testDate = parsed.toISOString().split('T')[0]
      }

      const speed = speedIdx >= 0 ? parseFloat(row[speedIdx]) : parseFloat(row[0])
      if (isNaN(speed)) continue

      records.push({
        test_date: testDate,
        throwing_velocity_mph: speed,
        custom_metrics: { velocity: speed },
      })
    } catch (err) {
      errors.push(`Row ${i + 1}: Failed to parse`)
    }
  }

  return { records, errors, deviceType: 'pocket_radar' }
}

/**
 * HitTrax CSV Parser
 * Expected columns: Date, Exit Velocity, Launch Angle, Distance, Result
 */
export function parseHitTrax(csv: string): ParseResult {
  const rows = csvToRows(csv)
  const errors: string[] = []
  const records: ParsedMetric[] = []

  if (rows.length < 2) {
    return { records: [], errors: ['File is empty'], deviceType: 'hittrax' }
  }

  const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, '_'))

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (row.length < 2) continue

    try {
      const getValue = (keys: string[]): number | undefined => {
        for (const key of keys) {
          const idx = headers.findIndex(h => h.includes(key))
          if (idx >= 0 && row[idx]) {
            const val = parseFloat(row[idx])
            if (!isNaN(val)) return val
          }
        }
        return undefined
      }

      const dateIdx = headers.findIndex(h => h.includes('date'))
      let testDate = new Date().toISOString().split('T')[0]
      if (dateIdx >= 0 && row[dateIdx]) {
        const parsed = new Date(row[dateIdx])
        if (!isNaN(parsed.getTime())) testDate = parsed.toISOString().split('T')[0]
      }

      const exitVelo = getValue(['exit_velocity', 'exit_velo', 'ev'])
      const launchAngle = getValue(['launch_angle', 'la'])
      const distance = getValue(['distance', 'dist'])

      records.push({
        test_date: testDate,
        exit_velocity_mph: exitVelo,
        launch_angle_degrees: launchAngle,
        custom_metrics: {
          ...(exitVelo !== undefined && { exit_velocity: exitVelo }),
          ...(launchAngle !== undefined && { launch_angle: launchAngle }),
          ...(distance !== undefined && { hit_distance: distance }),
        },
      })
    } catch (err) {
      errors.push(`Row ${i + 1}: Failed to parse`)
    }
  }

  return { records, errors, deviceType: 'hittrax' }
}

export function parseDeviceCSV(csv: string, deviceType: string): ParseResult {
  switch (deviceType) {
    case 'rapsodo': return parseRapsodo(csv)
    case 'blast_motion': return parseBlastMotion(csv)
    case 'pocket_radar': return parsePocketRadar(csv)
    case 'hittrax': return parseHitTrax(csv)
    default: return { records: [], errors: [`Unknown device type: ${deviceType}`], deviceType }
  }
}
