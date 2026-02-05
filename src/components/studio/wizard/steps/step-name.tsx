'use client'

import { Container } from '@/components/ui/container'
import { TransitionTemplate } from '@/types/studio'
import { Sparkles, Wand2 } from 'lucide-react'

interface StepNameProps {
  template: Partial<TransitionTemplate>
  updateTemplate: (updates: Partial<TransitionTemplate>) => void
}

const NAME_PRESETS = [
  { name: 'Liquid Morph', category: 'Morph' },
  { name: 'Cinematic Zoom Punch', category: 'Zoom' },
  { name: 'Glitch Portal', category: 'Glitch' },
  { name: 'Smoke Reveal', category: 'Organic' },
  { name: 'Geometric Wipe', category: 'Wipe' },
]

export function StepName({ template, updateTemplate }: StepNameProps) {
  const applyPreset = (preset: (typeof NAME_PRESETS)[0]) => {
    updateTemplate({ name: preset.name, category: preset.category })
  }

  return (
    <Container size="sm" className="py-12">
      <div className="space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-4">
            <Sparkles className="w-8 h-8 text-secondary" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Name Your Template
          </h2>
          <p className="text-gray-400">
            Give your transition template a memorable name
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Template Name
            </label>
            <input
              type="text"
              value={template.name || ''}
              onChange={(e) => updateTemplate({ name: e.target.value })}
              placeholder="e.g., Liquid Morph Transition"
              className="w-full px-4 py-3 bg-dark-100 border border-secondary/20 rounded-lg text-white text-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category (optional)
            </label>
            <select
              value={template.category || ''}
              onChange={(e) => updateTemplate({ category: e.target.value })}
              className="w-full px-4 py-3 bg-dark-100 border border-secondary/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
            >
              <option value="">Select a category</option>
              <option value="Morph">Morph</option>
              <option value="Zoom">Zoom</option>
              <option value="Slide">Slide</option>
              <option value="Fade">Fade</option>
              <option value="Wipe">Wipe</option>
              <option value="3D">3D</option>
              <option value="Particle">Particle</option>
              <option value="Glitch">Glitch</option>
              <option value="Organic">Organic</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
              <Wand2 className="w-4 h-4" />
              Quick Fill
            </div>
            <div className="flex flex-wrap gap-2">
              {NAME_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-2 text-sm bg-dark-100 text-gray-300 border border-white/10 rounded-lg hover:border-secondary/40 hover:text-secondary transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
