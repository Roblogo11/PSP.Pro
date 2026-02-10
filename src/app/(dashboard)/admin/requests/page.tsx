'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserRole } from '@/lib/hooks/use-user-role'
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  FileText,
  User,
  Calendar,
  AlertCircle,
} from 'lucide-react'

interface ActionRequest {
  id: string
  action_type: string
  target_id: string
  target_table: string
  reason: string | null
  status: 'pending' | 'approved' | 'denied'
  metadata: any
  created_at: string
  reviewed_at: string | null
  requester: {
    id: string
    full_name: string
    role: string
  }
  reviewer: {
    id: string
    full_name: string
    role: string
  } | null
}

export default function RequestsPage() {
  const router = useRouter()
  const { profile, loading: profileLoading } = useUserRole()
  const [requests, setRequests] = useState<ActionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'denied'>('pending')
  const [processingId, setProcessingId] = useState<string | null>(null)

  const isMasterAdmin = profile?.role === 'master_admin'

  // Redirect if not authorized
  useEffect(() => {
    if (!profileLoading && !isMasterAdmin) {
      router.push('/admin')
    }
  }, [profileLoading, isMasterAdmin, router])

  // Load requests
  useEffect(() => {
    if (!profile) return
    loadRequests()
  }, [profile, activeTab])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/actions/request?status=${activeTab}`)
      const data = await response.json()

      if (response.ok) {
        setRequests(data.requests || [])
      } else {
        console.error('Error loading requests:', data.error)
      }
    } catch (error) {
      console.error('Error loading requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (requestId: string, action: 'approve' | 'deny', execute: boolean = true) => {
    setProcessingId(requestId)
    try {
      const response = await fetch('/api/actions/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          action,
          execute,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(`✅ Request ${action}d successfully!${data.executed ? '\nAction executed.' : ''}`)
        loadRequests()
      } else {
        throw new Error(data.error || 'Failed to review request')
      }
    } catch (error: any) {
      console.error('Review error:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setProcessingId(null)
    }
  }

  const getActionLabel = (actionType: string) => {
    return actionType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange/10 text-orange text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        )
      case 'denied':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Denied
          </span>
        )
    }
  }

  if (profileLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange" />
      </div>
    )
  }

  if (!isMasterAdmin) {
    return null
  }

  return (
    <div className="px-3 py-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
          Action Requests
        </h1>
        <p className="text-cyan-800 dark:text-white">
          Review and approve deletion requests from coaches
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {(['pending', 'approved', 'denied'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-orange text-white'
                : 'bg-cyan-50/50 text-cyan-600 hover:bg-white/10'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FileText className="w-12 h-12 text-cyan-700 dark:text-white mx-auto mb-4" />
          <p className="text-cyan-800 dark:text-white">No {activeTab} requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {getActionLabel(request.action_type)}
                    </h3>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="space-y-2 text-sm text-cyan-800 dark:text-white">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>
                        Requested by: <span className="text-slate-900 dark:text-white">{request.requester.full_name}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(request.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {request.reason && (
                      <div className="flex items-start gap-2 mt-3">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-orange" />
                        <span className="text-orange">{request.reason}</span>
                      </div>
                    )}

                    {request.metadata && Object.keys(request.metadata).length > 0 && (
                      <div className="mt-3 p-3 rounded-lg bg-cyan-50/50 border border-cyan-200/40">
                        <p className="text-xs text-cyan-800 dark:text-white mb-1">Additional Info:</p>
                        <pre className="text-xs text-cyan-800 dark:text-white">
                          {JSON.stringify(request.metadata, null, 2)}
                        </pre>
                      </div>
                    )}

                    {request.reviewed_at && request.reviewer && (
                      <div className="mt-3 pt-3 border-t border-cyan-200/40">
                        <p className="text-xs">
                          Reviewed by <span className="text-slate-900 dark:text-white">{request.reviewer.full_name}</span> on{' '}
                          {new Date(request.reviewed_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons (only for pending) */}
                {request.status === 'pending' && (
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleReview(request.id, 'approve')}
                      disabled={processingId === request.id}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 font-medium transition-colors disabled:opacity-50"
                    >
                      {processingId === request.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve & Execute
                    </button>
                    <button
                      onClick={() => handleReview(request.id, 'deny')}
                      disabled={processingId === request.id}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 font-medium transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Deny
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
