'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface Step {
  id: number
  label: string
}

interface WizardProgressProps {
  currentStep: number
  steps: Step[]
  onStepClick: (step: number) => void
}

export function WizardProgress({ currentStep, steps, onStepClick }: WizardProgressProps) {
  return (
    <div className="py-6 px-4 md:px-8 border-b border-white/5 bg-dark-100/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto">
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = step.id < currentStep
            const isCurrent = step.id === currentStep
            const isClickable = step.id <= currentStep

            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={`flex items-center gap-2 ${
                    isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-secondary text-white ring-4 ring-secondary/20'
                        : 'bg-dark-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <span
                    className={`text-sm ${
                      isCurrent
                        ? 'text-white font-medium'
                        : isCompleted
                        ? 'text-gray-300'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>

                {index < steps.length - 1 && (
                  <div className="w-12 lg:w-20 h-px mx-2 bg-dark-200">
                    <motion.div
                      className="h-full bg-secondary"
                      initial={{ width: 0 }}
                      animate={{ width: isCompleted ? '100%' : '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm font-medium text-white">
              {steps[currentStep - 1]?.label}
            </span>
          </div>
          <div className="h-2 bg-dark-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
