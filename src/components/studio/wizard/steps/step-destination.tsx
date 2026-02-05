'use client'

import { Container } from '@/components/ui/container'
import { ComponentEditor } from '@/components/studio/editor/component-editor'
import { TransitionTemplate } from '@/types/studio'
import { Wand2 } from 'lucide-react'

interface StepDestinationProps {
  template: Partial<TransitionTemplate>
  updateTemplate: (updates: Partial<TransitionTemplate>) => void
}

const DESTINATION_PRESETS = [
  {
    label: 'Power Position',
    value: `We land on {{NEW_SUBJECT}} in a commanding hero shot - low angle looking up, emphasizing stature and authority. The frame is stable now, grounded after the chaos of transition. Dramatic lighting sculpts their form - perhaps a strong backlight creating a halo effect, or hard side light adding dimension and mystery. The background falls away into controlled darkness or atmospheric depth, every element supporting the subject's dominance of the frame. This is a moment of arrival, of presence established.`,
  },
  {
    label: 'Breathe Wide',
    value: `The frame exhales into a sweeping vista of {{NEW_LOCATION}} - the scale shift from intimate to epic creates an emotional reset. The camera has found its resting place on a composition that could hang in a gallery: perfect balance, leading lines drawing the eye deep into the frame, atmospheric perspective creating layers of depth. There's stillness here after the motion, a moment for the viewer to orient themselves in this new world. The light tells us time and place; the composition tells us meaning.`,
  },
  {
    label: 'Intimate Reveal',
    value: `We resolve on a tight, intimate frame of {{NEW_SUBJECT}} - close enough to count eyelashes, to see the texture of skin, to read micro-expressions. The shallow depth of field creates a world where only this moment matters. The lighting has shifted to something softer, more personal - perhaps practical sources that feel naturalistic, or carefully controlled key light that flatters while revealing truth. This proximity creates immediate connection; we're not observers anymore, we're confidants.`,
  },
  {
    label: 'Negative Space',
    value: `{{NEW_SCENE}} settles into a composition that breathes with intentional emptiness - the subject occupies perhaps a third of the frame, the rest given over to space that speaks. This negative space isn't empty; it's full of implication, of room for thought, of visual rest that makes the subject more potent by contrast. The framing feels deliberate, almost architectural. Colors are restrained, possibly near-monochromatic. Every element earns its place.`,
  },
  {
    label: 'Dynamic Angle',
    value: `The camera finds an unexpected angle on {{NEW_SUBJECT}} - perhaps a dutch tilt that energizes the frame, or an extreme perspective that transforms the familiar into something fresh. The composition breaks rules intentionally: maybe the subject bleeds off frame, or converging lines create tension. The lighting is bold, possibly colored, definitely dramatic. This isn't a resting point; it's a launching pad. The transition delivered us here, and here promises more to come.`,
  },
]

export function StepDestination({ template, updateTemplate }: StepDestinationProps) {
  const applyPreset = (preset: (typeof DESTINATION_PRESETS)[0]) => {
    updateTemplate({
      destinationState: { ...template.destinationState!, value: preset.value, variables: [] },
    })
  }

  return (
    <Container size="md" className="py-12">
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Destination State
          </h2>
          <p className="text-gray-400">
            Describe the outgoing shot or ending point of the transition
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <Wand2 className="w-4 h-4" />
            Quick Fill
          </div>
          <div className="flex flex-wrap gap-2">
            {DESTINATION_PRESETS.map((preset) => (
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
          label="Destination State"
          description="The visual context after the transition completes"
          placeholder="e.g., The scene resolves into {{NEW_SUBJECT}} now occupying the frame. The {{NEW_ENVIRONMENT}} comes into focus as the camera settles..."
          value={template.destinationState?.value || ''}
          locked={template.destinationState?.locked || false}
          variables={template.destinationState?.variables || []}
          onChange={(value) =>
            updateTemplate({
              destinationState: { ...template.destinationState!, value },
            })
          }
          onLockToggle={(locked) =>
            updateTemplate({
              destinationState: { ...template.destinationState!, locked },
            })
          }
          onVariablesChange={(variables) =>
            updateTemplate({
              destinationState: { ...template.destinationState!, variables },
            })
          }
          tips={[
            'Describe the final frame after the transition',
            'Include how the camera and subject have changed',
            'Use different variables than the source for contrast',
          ]}
        />
      </div>
    </Container>
  )
}
