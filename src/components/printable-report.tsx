'use client'

interface Metric {
  key: string
  label: string
  value: number
  unit: string
  verified?: boolean
}

interface Session {
  id: string
  type: string
  date: string
  status: string
  coachName?: string | null
  coachNotes?: string | null
}

interface Milestone {
  id: number
  title: string
  date: string
  value: string
  achieved: boolean
}

interface PrintableReportProps {
  athleteName: string
  sport: string
  metrics: Metric[]
  sessions: Session[]
  milestones: Milestone[]
  peakVelocity?: number | null
  completedSessions: number
  completedDrills: number
}

export function PrintableReport({
  athleteName,
  sport,
  metrics,
  sessions,
  milestones,
  peakVelocity,
  completedSessions,
  completedDrills,
}: PrintableReportProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  const recentSessions = sessions.slice(0, 20)
  const achievedMilestones = milestones.filter(m => m.achieved)

  return (
    <div id="printable-report" className="hidden print:block bg-white text-gray-900 font-sans p-0 m-0">
      <style>{`
        @media print {
          body > *:not(#printable-root) { display: none !important; }
          #printable-report { display: block !important; }
          @page { margin: 0.5in; size: letter portrait; }
          .page-break { page-break-before: always; }
          .no-break { page-break-inside: avoid; }
        }
      `}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #B8301A 0%, #FF6B35 100%)', color: 'white', padding: '32px', marginBottom: '24px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', margin: '0 0 4px', letterSpacing: '-0.5px' }}>PSP.Pro</h1>
            <p style={{ fontSize: '13px', margin: '0', opacity: 0.8 }}>Proper Sports Performance</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', margin: '0', opacity: 0.7 }}>Generated</p>
            <p style={{ fontSize: '12px', margin: '2px 0 0', fontWeight: '600' }}>{today}</p>
          </div>
        </div>
        <div style={{ marginTop: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px' }}>{athleteName}</h2>
          <p style={{ fontSize: '14px', margin: '0', opacity: 0.85, textTransform: 'capitalize' }}>Athlete Progress Report · {sport}</p>
        </div>
      </div>

      {/* Key Stats */}
      <div className="no-break" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Sessions Completed', value: completedSessions },
          { label: 'Drills Completed', value: completedDrills },
          { label: 'Peak Velocity', value: peakVelocity ? `${peakVelocity} mph` : '—' },
        ].map((stat) => (
          <div key={stat.label} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</p>
            <p style={{ fontSize: '24px', fontWeight: '800', margin: '0', color: '#B8301A' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Metrics Table */}
      {metrics.length > 0 && (
        <div className="no-break" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 12px', borderBottom: '2px solid #B8301A', paddingBottom: '6px', color: '#111827' }}>
            Performance Metrics — {sport.charAt(0).toUpperCase() + sport.slice(1)}
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', border: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Metric</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', border: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Value</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', border: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, i) => (
                <tr key={m.key} style={{ background: i % 2 === 0 ? 'white' : '#f9fafb' }}>
                  <td style={{ padding: '7px 12px', border: '1px solid #e5e7eb', color: '#374151' }}>{m.label}</td>
                  <td style={{ padding: '7px 12px', border: '1px solid #e5e7eb', textAlign: 'right', fontWeight: '700', color: '#111827' }}>
                    {m.value} {m.unit}
                  </td>
                  <td style={{ padding: '7px 12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px',
                      background: m.verified ? '#dcfce7' : '#f3f4f6',
                      color: m.verified ? '#16a34a' : '#6b7280',
                    }}>
                      {m.verified ? 'PSP Verified' : 'Self-Reported'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Session History */}
      {recentSessions.length > 0 && (
        <div className="no-break page-break" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 12px', borderBottom: '2px solid #B8301A', paddingBottom: '6px', color: '#111827' }}>
            Session History (Last {recentSessions.length})
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', border: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', border: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Service</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', border: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Coach</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', border: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map((s, i) => (
                <tr key={s.id} style={{ background: i % 2 === 0 ? 'white' : '#f9fafb' }}>
                  <td style={{ padding: '7px 12px', border: '1px solid #e5e7eb', color: '#374151' }}>
                    {new Date(s.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '7px 12px', border: '1px solid #e5e7eb', color: '#374151' }}>{s.type}</td>
                  <td style={{ padding: '7px 12px', border: '1px solid #e5e7eb', color: '#374151' }}>{s.coachName || '—'}</td>
                  <td style={{ padding: '7px 12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px',
                      background: s.status === 'completed' ? '#dcfce7' : s.status === 'confirmed' ? '#dbeafe' : '#f3f4f6',
                      color: s.status === 'completed' ? '#16a34a' : s.status === 'confirmed' ? '#1d4ed8' : '#6b7280',
                    }}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Milestones */}
      {achievedMilestones.length > 0 && (
        <div className="no-break" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 12px', borderBottom: '2px solid #B8301A', paddingBottom: '6px', color: '#111827' }}>
            Milestones Achieved
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {achievedMilestones.map((m) => (
              <div key={m.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>🏆</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', margin: '0', color: '#111827' }}>{m.title}</p>
                  <p style={{ fontSize: '11px', margin: '2px 0 0', color: '#6b7280' }}>{m.date} · {m.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0' }}>
          PSP.Pro · Proper Sports Performance · Virginia Beach, VA · propersports.pro
        </p>
        <p style={{ fontSize: '11px', color: '#d1d5db', margin: '4px 0 0', fontStyle: 'italic' }}>
          Progression Over Perfection
        </p>
      </div>
    </div>
  )
}
