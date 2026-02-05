'use client'

import { Container } from '@/components/ui/container'
import { TransitionTemplate } from '@/types/studio'
import { Lock, Unlock, Clock, Waves, Zap } from 'lucide-react'

interface StepTimingProps {
  template: Partial<TransitionTemplate>
  updateTemplate: (updates: Partial<TransitionTemplate>) => void
}

const DURATIONS = ['0.5s', '1s', '1.5s', '2s', '2.5s', '3s', '4s', '5s']
const CURVES = [
  'linear',
  'ease-in',
  'ease-out',
  'ease-in-out',
  'dramatic',
  'bounce',
  'elastic',
]
const ENERGIES = [
  { value: 'low', label: 'Low', description: 'Subtle and calm' },
  { value: 'medium', label: 'Medium', description: 'Balanced motion' },
  { value: 'high', label: 'High', description: 'Dynamic and punchy' },
  { value: 'cinematic', label: 'Cinematic', description: 'Epic and theatrical' },
] as const

export function StepTiming({ template, updateTemplate }: StepTimingProps) {
  const timing = template.styleTiming || {
    duration: '2s',
    motionCurve: 'ease-in-out',
    energy: 'medium' as const,
    locked: false,
  }

  const updateTiming = (updates: Partial<typeof timing>) => {
    updateTemplate({
      styleTiming: { ...timing, ...updates },
    })
  }

  return (
    <Container size="md" className="py-12">
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Style & Timing</h2>
          <p className="text-gray-400">
            Define the rhythm and feel of the transition
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => updateTiming({ locked: !timing.locked })}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              timing.locked
                ? 'bg-secondary/10 text-secondary border border-secondary/20'
                : 'bg-dark-200 text-gray-400 border border-white/10 hover:border-white/20'
            }`}
          >
            {timing.locked ? (
              <>
                <Lock className="w-4 h-4" />
                <span className="text-sm">Locked</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span className="text-sm">Unlocked</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
              <Clock className="w-4 h-4" />
              Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => updateTiming({ duration: d })}
                  className={`py-3 rounded-lg border transition-all ${
                    timing.duration === d
                      ? 'bg-secondary/10 border-secondary text-secondary'
                      : 'bg-dark-100 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
              <Waves className="w-4 h-4" />
              Motion Curve
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CURVES.map((c) => (
                <button
                  key={c}
                  onClick={() => updateTiming({ motionCurve: c })}
                  className={`py-3 rounded-lg border transition-all capitalize ${
                    timing.motionCurve === c
                      ? 'bg-secondary/10 border-secondary text-secondary'
                      : 'bg-dark-100 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
              <Zap className="w-4 h-4" />
              Energy Level
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ENERGIES.map((e) => (
                <button
                  key={e.value}
                  onClick={() => updateTiming({ energy: e.value })}
                  className={`p-4 rounded-lg border transition-all text-left ${
                    timing.energy === e.value
                      ? 'bg-secondary/10 border-secondary'
                      : 'bg-dark-100 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div
                    className={`font-medium ${
                      timing.energy === e.value ? 'text-secondary' : 'text-white'
                    }`}
                  >
                    {e.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{e.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
