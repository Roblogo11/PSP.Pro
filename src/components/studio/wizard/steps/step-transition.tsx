'use client'

import { Container } from '@/components/ui/container'
import { ComponentEditor } from '@/components/studio/editor/component-editor'
import { TransitionTemplate } from '@/types/studio'
import { Lock, Wand2 } from 'lucide-react'

interface StepTransitionProps {
  template: Partial<TransitionTemplate>
  updateTemplate: (updates: Partial<TransitionTemplate>) => void
}

const TRANSITION_PRESETS = [
  {
    label: 'Liquid Morph',
    value: `The image begins to liquefy from the center outward - reality becoming fluid, mercury-like. Colors bleed and stretch as if the frame itself is melting under extreme heat. The distortion ripples outward in concentric waves, each wave carrying fragments of the current scene while revealing glimpses of what lies beneath. At peak displacement, when the image is most abstract and unrecognizable, there's a moment of beautiful chaos - pure color and motion. Then surface tension snaps everything back into focus, but we're somewhere new. The transition feels organic, inevitable, like watching ice melt in reverse.`,
  },
  {
    label: 'Hyper Zoom Punch',
    value: `The camera rockets forward with impossible momentum - a hyperdrive jump through visual space. Motion blur streaks the periphery into speed lines while the center focal point remains sharp, drawing the eye like a target. The sense of velocity is overwhelming, compressing space and time. Frame rate appears to shift, strobing between moments. The zoom doesn't slow gradually - it STOPS, hard, with an almost physical impact that you feel in your chest. The new scene slams into existence at the exact moment of deceleration, perfectly synced to create that satisfying punch of arrival.`,
  },
  {
    label: 'Data Corruption',
    value: `The image fractures into digital chaos - datamoshing artifacts cascade across the frame like a corrupted file struggling to render. Macroblocks scatter and multiply, I-frames ghost and echo, colors shift through compression artifacts that feel both broken and beautiful. The glitch isn't random - it has rhythm, building in intensity like a system overload. Scan lines tear horizontally, vertical hold slips, the image fights itself. Then, in one frame, the corruption RESOLVES - not gradually but instantaneously - and we're somewhere completely different, as if the glitch was a portal between realities.`,
  },
  {
    label: 'Particle Dissolve',
    value: `The scene begins to disintegrate into millions of luminous particles - each pixel becoming a floating point of light that drifts with intention. The dissolution starts subtle, edges softening first, then accelerating until the entire frame is a cloud of glowing dust suspended in space. There's a moment of pure abstraction - just light and motion, the previous image now just a memory held in particle positions. Then the particles begin to migrate, flowing like a murmuration of starlings, reorganizing themselves into new shapes, new colors, new meaning. The reformation is hypnotic, watching order emerge from beautiful chaos.`,
  },
  {
    label: 'Geometric Shatter',
    value: `The frame explodes into sharp geometric fragments - triangles, hexagons, irregular polygons - each shard containing a piece of the image like a shattered mirror. The pieces don't just fall; they rotate in 3D space, catching light on their edges, reflecting and refracting. Time seems to slow during the shatter, letting you appreciate the destruction. Then the fragments begin their choreographed dance toward reassembly, but they're carrying different content now - pieces of the new scene sliding into place like a cosmic puzzle solving itself. The final piece locks in with a satisfying click, and we're through.`,
  },
]

export function StepTransition({ template, updateTemplate }: StepTransitionProps) {
  const applyPreset = (preset: (typeof TRANSITION_PRESETS)[0]) => {
    updateTemplate({
      transitionMechanic: { ...template.transitionMechanic!, value: preset.value, locked: true, variables: [] },
    })
  }

  return (
    <Container size="md" className="py-12">
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Transition Mechanic
          </h2>
          <p className="text-gray-400">
            The core motion logic that defines this transition
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <Wand2 className="w-4 h-4" />
            Quick Fill
          </div>
          <div className="flex flex-wrap gap-2">
            {TRANSITION_PRESETS.map((preset) => (
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

        <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-secondary mt-0.5" />
            <div>
              <p className="text-sm text-secondary font-medium">
                This is the heart of your template
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Lock this component to preserve the transition&apos;s signature motion
                across different scenarios. The mechanic should be reusable regardless
                of subject matter.
              </p>
            </div>
          </div>
        </div>

        <ComponentEditor
          label="Transition Mechanic"
          description="The signature motion that makes this transition unique"
          placeholder="e.g., The frame begins to ripple outward from the center like liquid. Elements stretch and morph as the camera appears to push through a membrane of reality, warping the perspective until it snaps into the new scene..."
          value={template.transitionMechanic?.value || ''}
          locked={template.transitionMechanic?.locked ?? true}
          variables={template.transitionMechanic?.variables || []}
          onChange={(value) =>
            updateTemplate({
              transitionMechanic: { ...template.transitionMechanic!, value },
            })
          }
          onLockToggle={(locked) =>
            updateTemplate({
              transitionMechanic: { ...template.transitionMechanic!, locked },
            })
          }
          onVariablesChange={(variables) =>
            updateTemplate({
              transitionMechanic: { ...template.transitionMechanic!, variables },
            })
          }
          tips={[
            'Describe the actual motion and visual transformation',
            'This should be scene-agnostic - focus on the effect itself',
            'Locking this component is recommended for repeatability',
            'Avoid scene-specific details that would limit reuse',
          ]}
        />
      </div>
    </Container>
  )
}
