'use client'

import { useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { TransitionTemplate } from '@/types/studio'
import { templateStorage } from '@/lib/studio/template-storage'
import { TemplateCard } from './template-card'

interface TemplateGridProps {
  templates: TransitionTemplate[]
  walletAddress: string
  onRefresh: () => void
}

export function TemplateGrid({ templates, walletAddress, onRefresh }: TemplateGridProps) {
  const handleDelete = useCallback(
    (id: string) => {
      if (confirm('Are you sure you want to delete this template?')) {
        templateStorage.delete(walletAddress, id)
        onRefresh()
      }
    },
    [walletAddress, onRefresh]
  )

  const handleDuplicate = useCallback(
    (id: string) => {
      templateStorage.duplicate(walletAddress, id)
      onRefresh()
    },
    [walletAddress, onRefresh]
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence mode="popLayout">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onDelete={() => handleDelete(template.id)}
            onDuplicate={() => handleDuplicate(template.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
