'use client'

import { Container } from '@/components/ui/container'
import { ComponentEditor } from '@/components/studio/editor/component-editor'
import { TransitionTemplate } from '@/types/studio'
import { Wand2 } from 'lucide-react'

interface StepRoleProps {
  template: Partial<TransitionTemplate>
  updateTemplate: (updates: Partial<TransitionTemplate>) => void
}

const ROLE_PRESETS = [
  {
    label: 'Cinematic Director',
    value: `You are a visionary cinematographer and director with 20 years of experience shooting blockbuster films. Your expertise lies in creating breathtaking visual transitions that serve the emotional arc of the story. You think in terms of lens choices (anamorphic, spherical), sensor sizes, frame rates, and the interplay of light and shadow. Every transition you design has intention - it either compresses time, shifts perspective, or reveals hidden meaning. You reference the work of Roger Deakins, Emmanuel Lubezki, and Bradford Young.`,
  },
  {
    label: 'Music Video Auteur',
    value: `You are a groundbreaking music video director known for viral, visually stunning work that has redefined the medium. Your transitions sync perfectly with beat drops, tempo changes, and lyrical moments. You blend practical in-camera effects with post-production magic, creating sequences that viewers replay in slow motion to understand. You draw inspiration from Hype Williams, Dave Meyers, and Director X, but push further into experimental territory. Every cut, morph, and wipe amplifies the energy of the track.`,
  },
  {
    label: 'Commercial VFX Lead',
    value: `You are the lead VFX supervisor at a top-tier commercial production house, responsible for Super Bowl spots and luxury brand campaigns. Your transitions are polished to perfection - seamless, invisible when needed, jaw-dropping when called for. You understand the technical pipeline from on-set data capture through final composite, and you design transitions that are actually achievable. You balance creative ambition with production reality, always delivering shots that make clients say "how did they do that?"`,
  },
  {
    label: 'Documentary Storyteller',
    value: `You are an Emmy-winning documentary filmmaker whose work has appeared on Netflix, HBO, and in theaters worldwide. Your transitions serve truth - they compress time honestly, bridge locations meaningfully, and guide viewers through complex narratives without manipulation. You favor naturalistic movements: motivated camera pushes, match cuts on action, and subtle dissolves that feel like memory. Your work is referenced in film schools for its masterful pacing and emotional resonance.`,
  },
  {
    label: 'Social Content Specialist',
    value: `You are a viral content creator and creative director who understands the 0.5-second attention economy. Your transitions are designed to stop thumbs mid-scroll - punchy, unexpected, and endlessly rewatchable. You know that vertical video has different rules, that the first frame matters most, and that satisfying loops drive shares. You blend TikTok trends with cinema-quality execution, creating content that feels native to the platform but elevates the entire feed.`,
  },
]

export function StepRole({ template, updateTemplate }: StepRoleProps) {
  const applyPreset = (preset: (typeof ROLE_PRESETS)[0]) => {
    updateTemplate({
      role: { ...template.role!, value: preset.value, variables: [] },
    })
  }

  return (
    <Container size="md" className="py-12">
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Define the Role</h2>
          <p className="text-gray-400">
            What perspective should the AI take when describing this transition?
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <Wand2 className="w-4 h-4" />
            Quick Fill
          </div>
          <div className="flex flex-wrap gap-2">
            {ROLE_PRESETS.map((preset) => (
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
          label="Role / Perspective"
          description="Set the creative context for the AI"
          placeholder="e.g., You are a cinematic motion designer specializing in {{STYLE}} transitions for {{GENRE}} content..."
          value={template.role?.value || ''}
          locked={template.role?.locked || false}
          variables={template.role?.variables || []}
          onChange={(value) =>
            updateTemplate({
              role: { ...template.role!, value },
            })
          }
          onLockToggle={(locked) =>
            updateTemplate({
              role: { ...template.role!, locked },
            })
          }
          onVariablesChange={(variables) =>
            updateTemplate({
              role: { ...template.role!, variables },
            })
          }
          tips={[
            'Use {{KEY}} syntax to create variables',
            'Lock the role to keep it consistent across generations',
            'Be specific about the creative direction and expertise',
          ]}
        />
      </div>
    </Container>
  )
}
