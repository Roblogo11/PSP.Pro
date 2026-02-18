'use client'

import { useState } from 'react'
import { toastSuccess, toastError } from '@/lib/toast'
import { Trash2, AlertCircle, Loader2, FileText } from 'lucide-react'
import { usePermissions } from '@/lib/hooks/use-permissions'
import type { PermissionAction } from '@/lib/hooks/use-permissions'

interface ActionButtonProps {
  actionType: PermissionAction
  targetId: string
  targetTable: string
  metadata?: {
    hasAthletes?: boolean
    isOwnData?: boolean
    isRecent?: boolean
    isPastSession?: boolean
    hasCompletions?: boolean
    hasPerformanceData?: boolean
  }
  onSuccess?: () => void
  deleteEndpoint?: string
  label?: string
  variant?: 'danger' | 'warning'
  size?: 'sm' | 'md'
}

/**
 * Smart action button that shows either:
 * - "Delete" button (if can do directly)
 * - "Request Deletion" button (if requires approval)
 * - Nothing (if no permission)
 */
export function ActionButton({
  actionType,
  targetId,
  targetTable,
  metadata = {},
  onSuccess,
  deleteEndpoint,
  label,
  variant = 'danger',
  size = 'md',
}: ActionButtonProps) {
  const { checkPermission, isMasterAdmin } = usePermissions()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const permission = checkPermission(actionType, metadata)

  // Don't show button if no permission at all
  if (!permission.canDoDirectly && !permission.requiresApproval) {
    return null
  }

  const handleDirectDelete = async () => {
    if (!permission.canDoDirectly) return

    setLoading(true)
    try {
      // Use provided endpoint or default session endpoint
      const endpoint = deleteEndpoint || `/api/sessions/delete?id=${targetId}`

      const response = await fetch(endpoint, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        // Check if it requires approval
        if (data.requiresApproval) {
          toastError(
            `This action requires master admin approval. Reason: ${data.reason}. Use "Request Deletion" instead.`
          )
          return
        }
        throw new Error(data.error || 'Failed to delete')
      }

      toastSuccess('Deleted successfully!')
      onSuccess?.()
    } catch (error: any) {
      console.error('Delete error:', error)
      toastError(`Error: ${error.message}`)
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  const handleRequestDeletion = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/actions/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type: actionType,
          target_id: targetId,
          target_table: targetTable,
          reason: permission.reason,
          metadata,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      toastSuccess('Deletion request submitted. A master admin will review your request.')
      onSuccess?.()
    } catch (error: any) {
      console.error('Request error:', error)
      toastError(`Error: ${error.message}`)
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  const buttonClasses = `
    inline-flex items-center gap-2 px-${size === 'sm' ? '3' : '4'} py-${size === 'sm' ? '2' : '3'}
    rounded-lg font-medium transition-colors
    ${
      variant === 'danger'
        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
        : 'bg-orange/10 text-orange hover:bg-orange/20 border border-orange/20'
    }
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'

  // Show confirmation dialog
  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="glass-card p-6 max-w-md">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-orange flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {permission.canDoDirectly ? 'Confirm Deletion' : 'Request Deletion'}
              </h3>
              <p className="text-cyan-700 dark:text-white text-sm mb-3">
                {permission.canDoDirectly
                  ? 'Are you sure you want to delete this? This action cannot be undone.'
                  : `This action requires master admin approval. ${permission.reason || ''}`}
              </p>
              {!permission.canDoDirectly && (
                <div className="bg-orange/10 border border-orange/20 rounded-lg p-3 mb-3">
                  <p className="text-sm text-orange">
                    A master admin will review and approve/deny your request.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={
                permission.canDoDirectly ? handleDirectDelete : handleRequestDeletion
              }
              disabled={loading}
              className={buttonClasses}
            >
              {loading ? (
                <>
                  <Loader2 className={`${iconSize} animate-spin`} />
                  <span>{permission.canDoDirectly ? 'Deleting...' : 'Submitting...'}</span>
                </>
              ) : (
                <>
                  {permission.canDoDirectly ? (
                    <Trash2 className={iconSize} />
                  ) : (
                    <FileText className={iconSize} />
                  )}
                  <span>
                    {permission.canDoDirectly ? 'Yes, Delete' : 'Submit Request'}
                  </span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-cyan-50/50 hover:bg-white/10 text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show the trigger button
  return (
    <button onClick={() => setShowConfirm(true)} className={buttonClasses}>
      {permission.canDoDirectly ? (
        <>
          <Trash2 className={iconSize} />
          <span>{label || (isMasterAdmin ? 'Delete' : 'Delete')}</span>
        </>
      ) : (
        <>
          <FileText className={iconSize} />
          <span>{label || 'Request Deletion'}</span>
        </>
      )}
    </button>
  )
}
