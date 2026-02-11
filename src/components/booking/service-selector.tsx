'use client'

import { Clock, DollarSign, Users } from 'lucide-react'
import { getCategoryColorLight, isGroupCategory } from '@/lib/category-colors'

interface Service {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price_cents: number
  category: string
  max_participants: number
}

interface ServiceSelectorProps {
  services: Service[]
  selectedServiceId: string | null
  onSelectService: (serviceId: string) => void
}

export function ServiceSelector({ services, selectedServiceId, onSelectService }: ServiceSelectorProps) {
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const getCategoryColor = getCategoryColorLight

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Select a Service</h3>
        <p className="text-sm text-cyan-700 dark:text-white">Choose the training session that fits your goals</p>
      </div>

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
