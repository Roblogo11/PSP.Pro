'use client'

import { Container } from '@/components/ui/container'
import { ComponentEditor } from '@/components/studio/editor/component-editor'
import { TransitionTemplate } from '@/types/studio'
import { Wand2 } from 'lucide-react'

interface StepSourceProps {
  template: Partial<TransitionTemplate>
  updateTemplate: (updates: Partial<TransitionTemplate>) => void
}

const SOURCE_PRESETS = [
  {
    label: 'Hero Portrait',
    value: `The frame opens on a striking portrait composition - {{SUBJECT}} fills two-thirds of the frame, positioned slightly off-center using the rule of thirds. Shot on an 85mm lens at f/1.4, the background melts into creamy bokeh with hints of {{ENVIRONMENT}} colors bleeding through. Rim lighting carves out the silhouette while a soft key light reveals texture and dimension. The subject's gaze is directed just past camera, creating intrigue. Shallow depth of field isolates every detail of their expression.`,
  },
  {
    label: 'Epic Wide Establish',
    value: `A sweeping wide shot establishes the grandeur of {{LOCATION}} - captured at golden hour when the light paints everything in warm amber and long shadows stretch across the frame. Shot on a 24mm lens to emphasize scale, the composition layers foreground interest, midground action, and a dramatic sky. {{SUBJECT}} appears small against the vast environment, emphasizing their journey. The camera holds rock-steady on a tripod, letting the environment breathe and the viewer absorb every detail.`,
  },
  {
    label: 'Macro Detail',
    value: `Extreme macro shot reveals the hidden world of {{OBJECT}} - every texture amplified to abstract beauty. Shot at 1:1 magnification, the depth of field is razor thin, only millimeters in focus. Light rakes across the surface, revealing patterns invisible to the naked eye. Colors saturate and shapes become geometric. The stillness is meditative. We see familiar things made alien, intimate details that tell a larger story about craftsmanship, nature, or decay.`,
  },
  {
    label: 'Overhead Symmetry',
    value: `Perfect bird's eye view looking straight down at {{SCENE}} - the composition is deliberately symmetrical, almost Wes Anderson-like in its precision. Every element is placed with intention, creating patterns that satisfy on a subconscious level. {{SUBJECT}} occupies the dead center, a human element grounding the geometric arrangement. Shot from a drone or high jib, the perspective flattens depth and emphasizes the graphic quality of the arrangement. Colors are carefully coordinated.`,
  },
  {
    label: 'Run & Gun Follow',
    value: `Handheld tracking shot pursues {{SUBJECT}} through {{ENVIRONMENT}} - the camera is alive, breathing with the action, close enough to feel the energy but skilled enough to keep the subject sharp. Shot on a wide 18mm lens to exaggerate movement and maintain focus in chaotic conditions. Natural light sources streak and flare as we move. The frame has controlled chaos - motivated movement, not random shaking. Every step forward builds momentum toward what's coming next.`,
  },
]

export function StepSource({ template, updateTemplate }: StepSourceProps) {
  const applyPreset = (preset: (typeof SOURCE_PRESETS)[0]) => {
    updateTemplate({
      sourceState: { ...template.sourceState!, value: preset.value, variables: [] },
    })
  }

  return (
    <Container size="md" className="py-12">
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Source State</h2>
          <p className="text-gray-400">
            Describe the incoming shot or starting point of the transition
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <Wand2 className="w-4 h-4" />
            Quick Fill
          </div>
          <div className="flex flex-wrap gap-2">
            {SOURCE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className="px-3 py-2 text-sm bg-dark-100 text-gray-300 border border-white/10 rounded-lg hover:border-secondary/40 hover:text-secondary transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <ComponentEditor
          label="Source State"
          description="The visual context before the transition begins"
          placeholder="e.g., A {{SUBJECT}} is centered in frame, surrounded by {{ENVIRONMENT}}. The camera holds steady on a medium shot..."
          value={template.sourceState?.value || ''}
          locked={template.sourceState?.locked || false}
          variables={template.sourceState?.variables || []}
          onChange={(value) =>
            updateTemplate({
              sourceState: { ...template.sourceState!, value },
            })
          }
          onLockToggle={(locked) =>
            updateTemplate({
              sourceState: { ...template.sourceState!, locked },
            })
          }
          onVariablesChange={(variables) =>
            updateTemplate({
              sourceState: { ...template.sourceState!, variables },
            })
          }
          tips={[
            'Describe what the viewer sees before the transition',
            'Include camera position, framing, and mood',
            'Use variables like {{SUBJECT}} and {{ENVIRONMENT}} for flexibility',
          ]}
        />
      </div>
    </Container>
  )
}
