'use client'

import { useEffect, useState } from 'react'
import { Clock, DollarSign, Users, RotateCcw } from 'lucide-react'
import { getCategoryColorLight, isGroupCategory } from '@/lib/category-colors'
import { VideoPlayer } from '@/components/ui/video-player'
import { createClient } from '@/lib/supabase/client'

interface Service {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price_cents: number
  category: string
  max_participants: number
  video_url?: string | null
}

interface ServiceSelectorProps {
  services: Service[]
  selectedServiceId: string | null
  onSelectService: (serviceId: string) => void
}

export function ServiceSelector({ services, selectedServiceId, onSelectService }: ServiceSelectorProps) {
  const [recentServiceIds, setRecentServiceIds] = useState<string[]>([])

  // Fetch recent services the user has booked
  useEffect(() => {
    async function fetchRecentServices() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('bookings')
        .select('service_id')
        .eq('athlete_id', user.id)
        .in('status', ['completed', 'confirmed'])
        .order('booking_date', { ascending: false })
        .limit(20)

      if (data) {
        // Get unique service IDs (most recent first), max 3
        const seen = new Set<string>()
        const unique: string[] = []
        for (const b of data) {
          if (b.service_id && !seen.has(b.service_id)) {
            seen.add(b.service_id)
            unique.push(b.service_id)
            if (unique.length >= 3) break
          }
        }
        setRecentServiceIds(unique)
      }
    }

    fetchRecentServices()
  }, [])

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`
  const getCategoryColor = getCategoryColorLight

  const recentServices = recentServiceIds
    .map(id => services.find(s => s.id === id))
    .filter(Boolean) as Service[]

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Select a Service</h3>
        <p className="text-sm text-cyan-700 dark:text-white">Choose the training session that fits your goals</p>
      </div>

      {/* Recent Services Quick Pick */}
      {recentServices.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <RotateCcw className="w-4 h-4 text-orange" />
            <h4 className="text-sm font-bold text-orange">Quick Rebook</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recentServices.map(service => (
              <button
                key={`recent-${service.id}`}
                onClick={() => onSelectService(service.id)}
                className={`
                  text-left p-3 rounded-xl border-2 transition-all duration-200
                  ${
                    selectedServiceId === service.id
                      ? 'border-orange bg-orange/10 shadow-lg shadow-orange/20'
                      : 'border-orange/30 bg-orange/5 hover:border-orange/60 hover:bg-orange/10'
                  }
                `}
              >
                <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{service.name}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-cyan-700 dark:text-white">
                  <span>{service.duration_minutes} min</span>
                  <span className="font-semibold text-orange">{formatPrice(service.price_cents)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Full Service Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map(service => {
          const isSelected = selectedServiceId === service.id

          return (
            <button
              key={service.id}
              onClick={() => onSelectService(service.id)}
              className={`
                text-left p-5 rounded-xl border-2 transition-all duration-200
                ${
                  isSelected
                    ? 'border-orange bg-orange/5 shadow-lg shadow-orange/20 scale-[1.02]'
                    : 'border-cyan-200/40 bg-cyan-50/50 hover:border-orange/50 hover:bg-orange/5'
                }
              `}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{service.name}</h4>
                  <p className="text-sm text-cyan-700 dark:text-white line-clamp-2">{service.description}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-semibold uppercase border ${getCategoryColor(
                    service.category
                  )}`}
                >
                  {service.category}
                </span>
              </div>

              {/* Details */}
              <div className="flex items-center gap-4 text-sm text-cyan-700 dark:text-white">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan" />
                  <span>{service.duration_minutes} min</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="font-semibold">{formatPrice(service.price_cents)}</span>
                </div>

                {isGroupCategory(service.category) && (
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span>Max {service.max_participants}</span>
                  </div>
                )}

                {service.video_url && (
                  <VideoPlayer url={service.video_url} title={service.name} thumbnail />
                )}
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-orange/20">
                  <div className="flex items-center gap-2 text-orange text-sm font-semibold">
                    <div className="w-2 h-2 rounded-full bg-orange animate-pulse" />
                    <span>Selected</span>
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
