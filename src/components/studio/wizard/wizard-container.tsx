'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { WizardProgress } from './wizard-progress'
import { WizardNav } from './wizard-nav'
import {
  StepName,
  StepRole,
  StepSource,
  StepTransition,
  StepDestination,
  StepTiming,
  StepTags,
  StepReview,
} from './steps'
import { templateStorage } from '@/lib/studio/template-storage'
import { TransitionTemplate, createEmptyTemplate } from '@/types/studio'
import {
  GenerativeMotion,
  GridPattern,
  FloatingShapes,
} from '@/components/generative-motion'

const STEPS = [
  { id: 1, label: 'Name', component: StepName },
  { id: 2, label: 'Role', component: StepRole },
  { id: 3, label: 'Source', component: StepSource },
  { id: 4, label: 'Transition', component: StepTransition },
  { id: 5, label: 'Destination', component: StepDestination },
  { id: 6, label: 'Timing', component: StepTiming },
  { id: 7, label: 'Tags', component: StepTags },
  { id: 8, label: 'Review', component: StepReview },
]

interface WizardContainerProps {
  existingTemplate?: TransitionTemplate
}

export function WizardContainer({ existingTemplate }: WizardContainerProps) {
  const router = useRouter()
  const { address } = useAccount()
  const [step, setStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [template, setTemplate] = useState<Partial<TransitionTemplate>>(
    existingTemplate || createEmptyTemplate()
  )

  const updateTemplate = useCallback((updates: Partial<TransitionTemplate>) => {
    setTemplate((prev) => ({ ...prev, ...updates }))
  }, [])

  const nextStep = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, STEPS.length))
  }, [])

  const prevStep = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 1))
  }, [])

  const goToStep = useCallback((targetStep: number) => {
    setStep(targetStep)
  }, [])

  const canProceed = useMemo(() => {
    switch (step) {
      case 1:
        return !!template.name?.trim()
      case 2:
        return !!template.role?.value?.trim()
      case 3:
        return !!template.sourceState?.value?.trim()
      case 4:
        return !!template.transitionMechanic?.value?.trim()
      case 5:
        return !!template.destinationState?.value?.trim()
      case 6:
      case 7:
        return true
      case 8:
        return (
          !!template.name?.trim() &&
          !!template.role?.value?.trim() &&
          !!template.sourceState?.value?.trim() &&
          !!template.transitionMechanic?.value?.trim() &&
          !!template.destinationState?.value?.trim()
        )
      default:
        return true
    }
  }, [step, template])

  const saveTemplate = useCallback(async () => {
    if (!address || !canProceed) return

    setIsSaving(true)
    try {
      if (existingTemplate) {
        templateStorage.update(address, existingTemplate.id, template)
        router.push(`/studio/templates/${existingTemplate.id}`)
      } else {
        const saved = templateStorage.create(
          address,
          template as Omit<TransitionTemplate, 'id' | 'createdAt' | 'updatedAt' | 'walletAddress'>
        )
        router.push(`/studio/templates/${saved.id}`)
      }
    } catch (error) {
      console.error('Failed to save template:', error)
      setIsSaving(false)
    }
  }, [address, template, existingTemplate, router, canProceed])

  const CurrentStep = STEPS[step - 1].component

  return (
    <div className="min-h-screen relative pb-24">
      <div className="absolute inset-0 -z-10">
        <GenerativeMotion />
        <GridPattern />
        <FloatingShapes />
      </div>

      <WizardProgress
        currentStep={step}
        steps={STEPS}
        onStepClick={goToStep}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <CurrentStep template={template} updateTemplate={updateTemplate} />
        </motion.div>
      </AnimatePresence>

      <WizardNav
        currentStep={step}
        totalSteps={STEPS.length}
        onNext={nextStep}
        onPrev={prevStep}
        onSave={saveTemplate}
        isSaving={isSaving}
        canProceed={canProceed}
      />
    </div>
  )
}
