import { useUserRole } from './use-user-role'

export type PermissionAction =
  | 'delete_session'
  | 'delete_athlete'
  | 'delete_drill'
  | 'delete_performance_metric'
  | 'modify_session'
  | 'modify_athlete'

export interface PermissionCheck {
  canDoDirectly: boolean
  requiresApproval: boolean
  isMasterAdmin: boolean
  reason?: string
}

/**
 * Hook to check user permissions and determine if actions can be done directly
 * or require master admin approval based on impact
 */
export function usePermissions() {
  const { profile, isCoach, isAdmin } = useUserRole()
  const isMasterAdmin = profile?.role === 'master_admin'

  /**
   * Check if user can perform an action directly or needs approval
   *
   * @param action - The action type
   * @param metadata - Context about the action (e.g., hasAthletes, isOldData)
   */
  const checkPermission = (
    action: PermissionAction,
    metadata?: {
      hasAthletes?: boolean
      isOwnData?: boolean
      isRecent?: boolean // Within last 7 days
      isPastSession?: boolean
      hasCompletions?: boolean
      hasPerformanceData?: boolean
    }
  ): PermissionCheck => {
    // Master admins can do everything directly
    if (isMasterAdmin) {
      return {
        canDoDirectly: true,
        requiresApproval: false,
        isMasterAdmin: true,
      }
    }

    // Non-coaches/admins can't do any of these actions
    if (!isCoach && !isAdmin) {
      return {
        canDoDirectly: false,
        requiresApproval: false,
        isMasterAdmin: false,
        reason: 'Insufficient permissions',
      }
    }

    // Determine if action can be done directly based on impact
    switch (action) {
      case 'delete_session':
        // Can delete directly if: no athletes enrolled AND not a past session
        if (!metadata?.hasAthletes && !metadata?.isPastSession) {
          return {
            canDoDirectly: true,
            requiresApproval: false,
            isMasterAdmin: false,
          }
        }
        return {
          canDoDirectly: false,
          requiresApproval: true,
          isMasterAdmin: false,
          reason: metadata?.hasAthletes
            ? 'Session has athletes enrolled'
            : 'Cannot delete past sessions without approval',
        }

      case 'delete_athlete':
        // Can delete directly if: no performance data and no bookings
        if (!metadata?.hasPerformanceData && !metadata?.hasAthletes) {
          return {
            canDoDirectly: true,
            requiresApproval: false,
            isMasterAdmin: false,
          }
        }
        return {
          canDoDirectly: false,
          requiresApproval: true,
          isMasterAdmin: false,
          reason: 'Athlete has historical data',
        }

      case 'delete_drill':
        // Can delete directly if: not assigned to any athletes
        if (!metadata?.hasAthletes) {
          return {
            canDoDirectly: true,
            requiresApproval: false,
            isMasterAdmin: false,
          }
        }
        return {
          canDoDirectly: false,
          requiresApproval: true,
          isMasterAdmin: false,
          reason: 'Drill is assigned to athletes',
        }

      case 'delete_performance_metric':
        // Can delete directly if: own data and recent (< 7 days)
        if (metadata?.isOwnData && metadata?.isRecent) {
          return {
            canDoDirectly: true,
            requiresApproval: false,
            isMasterAdmin: false,
          }
        }
        return {
          canDoDirectly: false,
          requiresApproval: true,
          isMasterAdmin: false,
          reason: !metadata?.isOwnData
            ? 'Cannot delete metrics from other coaches'
            : 'Cannot delete old metrics without approval',
        }

      case 'modify_session':
        // Can modify directly if: future session OR no athletes
        if (!metadata?.isPastSession || !metadata?.hasAthletes) {
          return {
            canDoDirectly: true,
            requiresApproval: false,
            isMasterAdmin: false,
          }
        }
        return {
          canDoDirectly: false,
          requiresApproval: true,
          isMasterAdmin: false,
          reason: 'Cannot modify past sessions with athletes without approval',
        }

      case 'modify_athlete':
        // Coaches can always modify athlete profiles
        return {
          canDoDirectly: true,
          requiresApproval: false,
          isMasterAdmin: false,
        }

      default:
        return {
          canDoDirectly: false,
          requiresApproval: true,
          isMasterAdmin: false,
          reason: 'Unknown action type',
        }
    }
  }

  return {
    isMasterAdmin,
    isCoach,
    isAdmin,
    checkPermission,
  }
}
