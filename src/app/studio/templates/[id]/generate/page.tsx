'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import { ArrowLeft, Copy, Check, Eye, RotateCcw, Sparkles, ChefHat } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { templateStorage } from '@/lib/studio/template-storage'
import { Variable, replaceVariables, TransitionTemplate } from '@/types/studio'
import {
  GenerativeMotion,
  GridPattern,
  FloatingShapes,
} from '@/components/generative-motion'

// Cook the prompt into a mega-prompt with extra sauce
function cookPrompt(
  template: TransitionTemplate,
  variableValues: Record<string, string>,
  allVariables: Variable[]
): string {
  const values = { ...variableValues }
  allVariables.forEach((v) => {
    if (!values[v.key]) {
      values[v.key] = `[${v.key}]`
    }
  })

  // Get timing specs
  const fps = template.styleTiming.duration.includes('slow') ? '24fps' :
              template.styleTiming.duration.includes('fast') ? '60fps' : '30fps'
  const duration = template.styleTiming.duration.includes('1s') ? '1 second' :
                   template.styleTiming.duration.includes('2s') ? '2 seconds' :
                   template.styleTiming.duration.includes('3s') ? '3 seconds' :
                   template.styleTiming.duration.includes('5s') ? '5 seconds' : '3 seconds'
  const resolution = '4K (3840x2160)'
  const aspectRatio = '16:9 cinematic widescreen'

  // Energy to visual language
  const energyDescriptor = {
    low: 'Slow, deliberate, meditative pace. Every frame breathes. Movements are graceful and unhurried.',
    medium: 'Balanced rhythm with dynamic moments. The pace feels natural yet engaging.',
    high: 'Aggressive, punchy, high-impact energy. Rapid movements and sharp cuts.',
    cinematic: 'Epic, theatrical, larger-than-life presence. Hollywood-grade visual storytelling.',
  }[template.styleTiming.energy] || 'Cinematic pacing with intentional rhythm.'

  // Motion curve descriptions
  const curveDescriptor = template.styleTiming.motionCurve.includes('ease-in-out')
    ? 'Smooth acceleration and deceleration - organic, natural motion'
    : template.styleTiming.motionCurve.includes('ease-out')
    ? 'Quick start with gentle settle - punchy impact with soft landing'
    : template.styleTiming.motionCurve.includes('ease-in')
    ? 'Gradual build to rapid climax - tension and release'
    : template.styleTiming.motionCurve.includes('linear')
    ? 'Constant velocity - mechanical, precise, robotic feel'
    : 'Custom easing curve for unique motion signature'

  const cookedPrompt = `═══════════════════════════════════════════════════════════════
                    CINEMATIC TRANSITION PROMPT
                         Template: ${template.name}
═══════════════════════════════════════════════════════════════

▼ TECHNICAL SPECIFICATIONS
────────────────────────────────────────────────────────────────
Resolution:     ${resolution}
Aspect Ratio:   ${aspectRatio}
Frame Rate:     ${fps} for ${template.styleTiming.energy === 'cinematic' ? 'film-like motion blur' : 'smooth playback'}
Duration:       ${duration}
Motion Curve:   ${curveDescriptor}

▼ CREATIVE DIRECTION
────────────────────────────────────────────────────────────────
${energyDescriptor}

▼ DIRECTOR'S INTENT
────────────────────────────────────────────────────────────────
${replaceVariables(template.role.value, values)}

═══════════════════════════════════════════════════════════════
                         SCENE BREAKDOWN
═══════════════════════════════════════════════════════════════

▼ OPENING SHOT (Source State)
────────────────────────────────────────────────────────────────
${replaceVariables(template.sourceState.value, values)}

Camera: Establish visual anchor point. Composition is intentional - every element serves the upcoming transition. Lighting should feel motivated and natural while supporting the mood.


▼ THE TRANSITION (Core Mechanic)
────────────────────────────────────────────────────────────────
${replaceVariables(template.transitionMechanic.value, values)}

Technical Notes:
- Motion should feel ${template.styleTiming.energy === 'cinematic' ? 'epic and theatrical' : template.styleTiming.energy === 'high' ? 'aggressive and impactful' : 'smooth and intentional'}
- Maintain visual continuity through the transformation
- Peak visual complexity occurs at the midpoint
- The transition IS the story - make it count


▼ LANDING SHOT (Destination State)
────────────────────────────────────────────────────────────────
${replaceVariables(template.destinationState.value, values)}

Camera: The landing should feel earned. The viewer should understand they've arrived somewhere new, but the journey was worth it. Hold on the final frame - let it breathe.

═══════════════════════════════════════════════════════════════
                      VISUAL ENHANCEMENT NOTES
═══════════════════════════════════════════════════════════════

Color Science:
- Rich, cinematic color grading with controlled contrast
- Shadows hold detail without crushing blacks
- Highlights are protected with subtle roll-off
- Color temperature shifts can emphasize the transition

Depth & Atmosphere:
- Utilize atmospheric perspective for depth
- Consider light particles, haze, or volumetric elements
- Depth of field should guide viewer attention

Sound Design Sync Points (for editor reference):
- Transition initiation: potential bass hit or whoosh
- Peak complexity: cymbal swell or impact
- Resolution: tonal landing or silence for contrast

═══════════════════════════════════════════════════════════════
                         AI MODEL GUIDANCE
═══════════════════════════════════════════════════════════════

Generate this transition as a single, continuous shot with no cuts.
The camera movement should be motivated and purposeful.
All visual transformations should maintain photorealistic quality.
Physics should be respected unless explicitly breaking them for effect.
The overall aesthetic should feel premium, polished, and cinematic.

Priority: VISUAL STORYTELLING > Technical perfection

═══════════════════════════════════════════════════════════════
                    Generated by Shock Studio
                         ${new Date().toLocaleDateString()}
═══════════════════════════════════════════════════════════════`

  return cookedPrompt
}

export default function GeneratePage() {
  const params = useParams()
  const router = useRouter()
  const { address } = useAccount()
  const [copied, setCopied] = useState(false)
  const [cookedCopied, setCookedCopied] = useState(false)
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [showCooked, setShowCooked] = useState(false)

  const template = useMemo(() => {
    if (!address || !params.id) return null
    return templateStorage.getById(address, params.id as string)
  }, [address, params.id])

  const allVariables = useMemo(() => {
    if (!template) return []
    const vars: Variable[] = []
    const seen = new Set<string>()
    const addVars = (componentVars: Variable[] = []) => {
      componentVars.forEach((v) => {
        if (!seen.has(v.key)) {
          seen.add(v.key)
          vars.push(v)
        }
      })
    }
    addVars(template.role.variables)
    addVars(template.sourceState.variables)
    addVars(template.transitionMechanic.variables)
    addVars(template.destinationState.variables)
    return vars
  }, [template])

  // Initialize with defaults
  useEffect(() => {
    const defaults = allVariables.reduce((acc, v) => {
      acc[v.key] = v.defaultValue || ''
      return acc
    }, {} as Record<string, string>)
    setVariableValues(defaults)
  }, [allVariables])

  const generatedPrompt = useMemo(() => {
    if (!template) return ''

    const values = { ...variableValues }
    // Replace unfilled variables with placeholder
    allVariables.forEach((v) => {
      if (!values[v.key]) {
        values[v.key] = `[${v.key}]`
      }
    })

    let prompt = `${replaceVariables(template.role.value, values)}\n\n`
    prompt += `SOURCE: ${replaceVariables(template.sourceState.value, values)}\n\n`
    prompt += `TRANSITION: ${replaceVariables(template.transitionMechanic.value, values)}\n\n`
    prompt += `DESTINATION: ${replaceVariables(template.destinationState.value, values)}\n\n`
    prompt += `TIMING: ${template.styleTiming.duration}, ${template.styleTiming.motionCurve}, ${template.styleTiming.energy} energy`

    return prompt
  }, [template, variableValues, allVariables])

  const cookedPrompt = useMemo(() => {
    if (!template) return ''
    return cookPrompt(template, variableValues, allVariables)
  }, [template, variableValues, allVariables])

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [generatedPrompt])

  const handleCopyCooked = useCallback(async () => {
    await navigator.clipboard.writeText(cookedPrompt)
    setCookedCopied(true)
    setTimeout(() => setCookedCopied(false), 2000)
  }, [cookedPrompt])

  const handleReset = useCallback(() => {
    const defaults = allVariables.reduce((acc, v) => {
      acc[v.key] = v.defaultValue || ''
      return acc
    }, {} as Record<string, string>)
    setVariableValues(defaults)
  }, [allVariables])

  const updateVariable = useCallback((key: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Template not found</p>
          <Link href="/studio">
            <Button variant="outline">Back to Studio</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 -z-10">
        <GenerativeMotion />
        <GridPattern />
        <FloatingShapes />
      </div>

      <Container className="py-8 md:py-12">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-dark-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {template.name}
            </h1>
            <p className="text-gray-400 mt-1">Fill in variables and generate</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                Variables ({allVariables.length})
              </h2>
              {allVariables.length > 0 && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              )}
            </div>

            {allVariables.length === 0 ? (
              <div className="p-6 rounded-lg bg-dark-100/80 backdrop-blur-sm border border-white/5 text-center">
                <p className="text-gray-400">
                  This template has no variables. The prompt is ready to copy.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {allVariables.map((variable) => (
                  <div
                    key={variable.key}
                    className="p-4 rounded-lg bg-dark-100/80 backdrop-blur-sm border border-white/5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-white">
                        {variable.label}
                      </label>
                      <span className="text-xs font-mono text-secondary">
                        {`{{${variable.key}}}`}
                      </span>
                    </div>
                    {variable.type === 'select' && variable.options ? (
                      <select
                        value={variableValues[variable.key] || ''}
                        onChange={(e) => updateVariable(variable.key, e.target.value)}
                        className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-secondary"
                      >
                        <option value="">Select...</option>
                        {variable.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : variable.type === 'number' ? (
                      <input
                        type="number"
                        value={variableValues[variable.key] || ''}
                        onChange={(e) => updateVariable(variable.key, e.target.value)}
                        placeholder={variable.defaultValue || 'Enter a number...'}
                        className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary"
                      />
                    ) : (
                      <input
                        type="text"
                        value={variableValues[variable.key] || ''}
                        onChange={(e) => updateVariable(variable.key, e.target.value)}
                        placeholder={variable.defaultValue || 'Enter value...'}
                        className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {showCooked ? (
                  <>
                    <ChefHat className="w-5 h-5 text-secondary" />
                    Cooked Prompt
                  </>
                ) : (
                  <>
                    <Eye className="w-5 h-5" />
                    Live Preview
                  </>
                )}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCooked(!showCooked)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                    showCooked
                      ? 'bg-secondary/20 border-secondary text-secondary'
                      : 'bg-dark-200 border-white/10 text-gray-400 hover:border-secondary/40 hover:text-secondary'
                  }`}
                >
                  {showCooked ? 'View Raw' : 'View Cooked'}
                </button>
                {showCooked ? (
                  <Button onClick={handleCopyCooked} className="bg-gradient-to-r from-secondary to-pink-500 hover:opacity-90">
                    {cookedCopied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Copy Cooked
                      </>
                    )}
                  </Button>
                ) : (
                  <Button onClick={handleCopy} variant="outline">
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Raw
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {!showCooked && (
              <button
                onClick={() => setShowCooked(true)}
                className="w-full p-4 rounded-lg bg-gradient-to-r from-secondary/10 to-pink-500/10 border border-secondary/30 hover:border-secondary/60 transition-all group"
              >
                <div className="flex items-center justify-center gap-3">
                  <ChefHat className="w-6 h-6 text-secondary group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <p className="text-white font-semibold">Cook This Prompt</p>
                    <p className="text-xs text-gray-400">Add mega-prompt structure, tech specs, and cinematic flourishes</p>
                  </div>
                  <Sparkles className="w-5 h-5 text-pink-400 animate-pulse" />
                </div>
              </button>
            )}

            <div className={`p-6 rounded-lg backdrop-blur-sm border min-h-[500px] overflow-auto ${
              showCooked
                ? 'bg-gradient-to-br from-secondary/5 to-pink-500/5 border-secondary/20'
                : 'bg-dark-100/80 border-white/5'
            }`}>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                {(showCooked ? cookedPrompt : generatedPrompt).split(/(\[[A-Z_]+\])/).map((part, i) => {
                  if (/^\[[A-Z_]+\]$/.test(part)) {
                    return (
                      <span
                        key={i}
                        className="text-orange-400 bg-orange-500/10 px-1 rounded"
                      >
                        {part}
                      </span>
                    )
                  }
                  return part
                })}
              </pre>
            </div>

            <p className="text-xs text-gray-500 text-center">
              {showCooked ? (
                <>Extra sauce added: tech specs, cinematic flourishes, and AI guidance</>
              ) : (
                <>Unfilled variables are shown in{' '}<span className="text-orange-400">[BRACKETS]</span></>
              )}
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}
