import { createAdminClient } from '@/lib/supabase/admin'

interface AuditEntry {
  userId: string | null
  action: string
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, unknown>
  ip?: string
}

/**
 * Log a sensitive action to the audit_log table.
 * Fire-and-forget — never throws, never blocks the request.
 */
export function auditLog(entry: AuditEntry): void {
  try {
    const supabase = createAdminClient()
    supabase
      .from('audit_log')
      .insert({
        user_id: entry.userId,
        action: entry.action,
        resource_type: entry.resourceType || null,
        resource_id: entry.resourceId || null,
        metadata: entry.metadata || {},
        ip_address: entry.ip || null,
      })
      .then(({ error }) => {
        if (error) console.error('Audit log error:', error.message)
      })
  } catch {
    // Never let audit logging break the request
  }
}
