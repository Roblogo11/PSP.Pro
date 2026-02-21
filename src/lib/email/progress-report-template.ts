interface ProgressReportData {
  athleteName: string
  sport: string
  periodLabel: string
  metrics: { label: string; current: string; previous: string | null; unit: string; improved: boolean }[]
  goals: { name: string; current: number; target: number; percentComplete: number }[]
  sessionsCompleted: number
  sessionsTotal: number
  drillsCompleted: number
  coachNotes: { title: string; content: string; date: string }[]
  personalRecords: { label: string; value: string; date: string }[]
}

export function getProgressReportEmail(data: ProgressReportData) {
  const metricsRows = data.metrics.map(m => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #ffffff; font-size: 14px;">${m.label}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #ffffff; font-weight: bold; text-align: center;">${m.current} ${m.unit}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: center; color: ${m.improved ? '#22c55e' : m.previous ? '#ef4444' : '#94a3b8'}; font-size: 13px;">
        ${m.previous ? `${m.improved ? '↑' : '↓'} from ${m.previous}` : '—'}
      </td>
    </tr>
  `).join('')

  const goalsRows = data.goals.map(g => {
    const pct = Math.min(100, Math.round(g.percentComplete))
    return `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #ffffff; font-size: 14px;">${g.name}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: center;">
        <div style="background: rgba(255,255,255,0.1); border-radius: 999px; height: 8px; width: 100px; display: inline-block; overflow: hidden;">
          <div style="background: linear-gradient(90deg, #00B4D8, #FF6B00); height: 100%; width: ${pct}%; border-radius: 999px;"></div>
        </div>
        <span style="color: #ffffff; font-size: 12px; margin-left: 8px;">${pct}%</span>
      </td>
    </tr>`
  }).join('')

  const notesSection = data.coachNotes.length > 0 ? data.coachNotes.map(n => `
    <div style="padding: 12px; margin-bottom: 8px; background: rgba(255,255,255,0.05); border-radius: 8px; border-left: 3px solid #FF6B00;">
      <p style="margin: 0 0 4px; font-size: 13px; font-weight: bold; color: #FF6B00;">${n.title}</p>
      <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.7);">${n.content}</p>
      <p style="margin: 4px 0 0; font-size: 11px; color: rgba(255,255,255,0.4);">${n.date}</p>
    </div>
  `).join('') : '<p style="color: rgba(255,255,255,0.5); font-size: 13px;">No coach notes this period.</p>'

  const prsSection = data.personalRecords.length > 0 ? data.personalRecords.map(pr => `
    <span style="display: inline-block; padding: 6px 12px; margin: 4px; background: linear-gradient(135deg, rgba(255,107,0,0.2), rgba(0,180,216,0.1)); border: 1px solid rgba(255,107,0,0.3); border-radius: 8px; font-size: 12px; color: #FF6B00;">
      ⭐ ${pr.label}: ${pr.value} (${pr.date})
    </span>
  `).join('') : ''

  return {
    subject: `${data.athleteName}'s Progress Report — ${data.periodLabel}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #004663 0%, #0088AB 100%); color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background: rgba(255,255,255,0.05); border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
    <!-- Header -->
    <tr>
      <td style="padding: 30px; text-align: center; background: linear-gradient(135deg, rgba(0,180,216,0.2), rgba(255,75,43,0.1));">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">PSP.Pro</h1>
        <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.6);">Athlete Progress Report</p>
      </td>
    </tr>

    <!-- Athlete Info -->
    <tr>
      <td style="padding: 24px 30px 16px;">
        <h2 style="margin: 0; font-size: 22px; color: #FF6B00;">${data.athleteName}</h2>
        <p style="margin: 4px 0 0; font-size: 14px; color: rgba(255,255,255,0.6);">${data.sport} | ${data.periodLabel}</p>
      </td>
    </tr>

    <!-- Quick Stats -->
    <tr>
      <td style="padding: 0 30px 20px;">
        <table width="100%" cellpadding="0" cellspacing="8">
          <tr>
            <td style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; text-align: center; width: 33%;">
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #00B4D8;">${data.sessionsCompleted}</p>
              <p style="margin: 4px 0 0; font-size: 11px; color: rgba(255,255,255,0.5);">Sessions</p>
            </td>
            <td style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; text-align: center; width: 33%;">
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #FF6B00;">${data.drillsCompleted}</p>
              <p style="margin: 4px 0 0; font-size: 11px; color: rgba(255,255,255,0.5);">Drills Done</p>
            </td>
            <td style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; text-align: center; width: 33%;">
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #22c55e;">${data.personalRecords.length}</p>
              <p style="margin: 4px 0 0; font-size: 11px; color: rgba(255,255,255,0.5);">New PRs</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    ${prsSection ? `
    <!-- Personal Records -->
    <tr>
      <td style="padding: 0 30px 20px;">
        <h3 style="margin: 0 0 8px; font-size: 16px; color: #FF6B00;">Personal Records</h3>
        ${prsSection}
      </td>
    </tr>` : ''}

    <!-- Performance Metrics -->
    <tr>
      <td style="padding: 0 30px 20px;">
        <h3 style="margin: 0 0 12px; font-size: 16px;">Performance Metrics</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.03); border-radius: 8px; overflow: hidden;">
          <tr style="background: rgba(255,255,255,0.05);">
            <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: rgba(255,255,255,0.6);">Metric</th>
            <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: rgba(255,255,255,0.6);">Current</th>
            <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: rgba(255,255,255,0.6);">Change</th>
          </tr>
          ${metricsRows || '<tr><td colspan="3" style="padding: 16px; text-align: center; color: rgba(255,255,255,0.4);">No metrics recorded this period</td></tr>'}
        </table>
      </td>
    </tr>

    ${data.goals.length > 0 ? `
    <!-- Goals Progress -->
    <tr>
      <td style="padding: 0 30px 20px;">
        <h3 style="margin: 0 0 12px; font-size: 16px;">Goals Progress</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.03); border-radius: 8px;">
          ${goalsRows}
        </table>
      </td>
    </tr>` : ''}

    <!-- Coach Notes -->
    <tr>
      <td style="padding: 0 30px 20px;">
        <h3 style="margin: 0 0 12px; font-size: 16px;">Coach Notes</h3>
        ${notesSection}
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="padding: 0 30px 30px; text-align: center;">
        <a href="https://psp.pro/progress" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #FF6B00, #FF4B2B); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px;">View Full Dashboard</a>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 30px; text-align: center; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.1);">
        <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.4);">&copy; ${new Date().getFullYear()} Proper Sports Performance | Virginia Beach, VA</p>
      </td>
    </tr>
  </table>
</body>
</html>`
  }
}
