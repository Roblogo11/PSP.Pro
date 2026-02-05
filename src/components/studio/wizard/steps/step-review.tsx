'use client'

import { useMemo } from 'react'
import { Container } from '@/components/ui/container'
import { TransitionTemplate, replaceVariables, Variable } from '@/types/studio'
import { Check, Lock, Unlock, AlertCircle } from 'lucide-react'

interface StepReviewProps {
  template: Partial<TransitionTemplate>
  updateTemplate: (updates: Partial<TransitionTemplate>) => void
}

interface ReviewSectionProps {
  label: string
  value: string
  locked: boolean
  variables: Variable[]
}

function ReviewSection({ label, value, locked, variables }: ReviewSectionProps) {
  const preview = useMemo(() => {
    const defaults = variables.reduce((acc, v) => {
      acc[v.key] = v.defaultValue || `[${v.key}]`
      return acc
    }, {} as Record<string, string>)
    return replaceVariables(value, defaults)
  }, [value, variables])

  return (
    <div className="p-4 bg-dark-100 rounded-lg border border-white/5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-400">{label}</span>
        <span
          className={`flex items-center gap-1 text-xs ${
            locked ? 'text-secondary' : 'text-gray-500'
          }`}
        >
          {locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          {locked ? 'Locked' : 'Unlocked'}
        </span>
      </div>
      <p className="text-sm text-white whitespace-pre-wrap">
        {preview || <span className="text-gray-500 italic">Not set</span>}
      </p>
      {variables.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/5">
          <span className="text-xs text-gray-500">
            {variables.length} variable{variables.length !== 1 ? 's' : ''}:{' '}
            {variables.map((v) => v.key).join(', ')}
          </span>
        </div>
      )}
    </div>
  )
}

export function StepReview({ template }: StepReviewProps) {
  const isComplete = useMemo(() => {
    return (
      template.name &&
      template.role?.value &&
      template.sourceState?.value &&
      template.transitionMechanic?.value &&
      template.destinationState?.value
    )
  }, [template])

  const allVariables = useMemo(() => {
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
    addVars(template.role?.variables)
    addVars(template.sourceState?.variables)
    addVars(template.transitionMechanic?.variables)
    addVars(template.destinationState?.variables)
    return vars
  }, [template])

  return (
    <Container size="md" className="py-12">
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Review Template</h2>
          <p className="text-gray-400">
            Review your template before saving
          </p>
        </div>

        {!isComplete && (
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5" />
              <div>
                <p className="text-sm text-orange-400 font-medium">
                  Template incomplete
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Please fill in all required fields before saving.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="p-4 bg-dark-200/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {template.name || 'Untitled Template'}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-400">v{template.version || 1}</span>
                  {template.category && (
                    <span className="px-2 py-0.5 text-xs rounded bg-accent/10 text-accent">
                      {template.category}
                    </span>
                  )}
                </div>
              </div>
              {isComplete && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">Ready to save</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <ReviewSection
              label="Role / Perspective"
              value={template.role?.value || ''}
              locked={template.role?.locked || false}
              variables={template.role?.variables || []}
            />
            <ReviewSection
              label="Source State"
              value={template.sourceState?.value || ''}
              locked={template.sourceState?.locked || false}
              variables={template.sourceState?.variables || []}
            />
            <ReviewSection
              label="Transition Mechanic"
              value={template.transitionMechanic?.value || ''}
              locked={template.transitionMechanic?.locked || false}
              variables={template.transitionMechanic?.variables || []}
            />
            <ReviewSection
              label="Destination State"
              value={template.destinationState?.value || ''}
              locked={template.destinationState?.locked || false}
              variables={template.destinationState?.variables || []}
            />

            <div className="p-4 bg-dark-100 rounded-lg border border-white/5">
              <span className="text-sm font-medium text-gray-400">Style & Timing</span>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 text-sm bg-dark-200 rounded text-white">
                  {template.styleTiming?.duration || '2s'}
                </span>
                <span className="px-2 py-1 text-sm bg-dark-200 rounded text-white capitalize">
                  {template.styleTiming?.motionCurve || 'ease-in-out'}
                </span>
                <span className="px-2 py-1 text-sm bg-dark-200 rounded text-white capitalize">
                  {template.styleTiming?.energy || 'medium'} energy
                </span>
              </div>
            </div>
          </div>

          {allVariables.length > 0 && (
            <div className="p-4 bg-dark-200/50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-3">
                All Variables ({allVariables.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {allVariables.map((v) => (
                  <span
                    key={v.key}
                    className="px-2 py-1 text-sm font-mono bg-secondary/10 text-secondary rounded"
                  >
                    {`{{${v.key}}}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {template.tags && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm bg-secondary/10 text-secondary rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}
