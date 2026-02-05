'use client'

import { ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WizardNavProps {
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrev: () => void
  onSave: () => void
  isSaving?: boolean
  canProceed?: boolean
}

export function WizardNav({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSave,
  isSaving = false,
  canProceed = true,
}: WizardNavProps) {
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-dark-100/95 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onPrev}
            disabled={isFirstStep}
            className={isFirstStep ? 'opacity-0 pointer-events-none' : ''}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </Button>

          <div className="text-sm text-gray-400">
            {currentStep} / {totalSteps}
          </div>

          {isLastStep ? (
            <Button onClick={onSave} disabled={isSaving || !canProceed}>
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Template
                </>
              )}
            </Button>
          ) : (
            <Button onClick={onNext} disabled={!canProceed}>
              Next
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
