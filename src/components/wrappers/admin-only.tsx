'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { Loader2 } from 'lucide-react'

interface AdminOnlyProps {
  children: React.ReactNode
  requireMasterAdmin?: boolean
}

/**
 * Wrapper component that protects admin/coach-only pages
 * Automatically redirects non-authorized users to /locker
 *
 * Usage:
 * ```tsx
 * export default function MyAdminPage() {
 *   return (
 *     <AdminOnly>
 *       <YourPageContent />
 *     </AdminOnly>
 *   )
 * }
 *
 * // For master admin only:
 * <AdminOnly requireMasterAdmin>
 *   <SuperAdminContent />
 * </AdminOnly>
 * ```
 */
export function AdminOnly({ children, requireMasterAdmin = false }: AdminOnlyProps) {
  const router = useRouter()
  const { profile, isCoach, isAdmin, isMasterAdmin, loading } = useUserRole()

  useEffect(() => {
    if (loading) return

    // Check if user has required permissions
    const hasAccess = requireMasterAdmin
      ? isMasterAdmin
      : (isCoach || isAdmin)

    if (!hasAccess) {
      router.push('/locker')
    }
  }, [loading, isCoach, isAdmin, isMasterAdmin, requireMasterAdmin, router])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange animate-spin mx-auto mb-4" />
          <p className="text-cyan-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Check access again after loading
  const hasAccess = requireMasterAdmin
    ? isMasterAdmin
    : (isCoach || isAdmin)

  if (!hasAccess) {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
}
