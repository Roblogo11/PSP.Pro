'use client'

import { useState, useCallback } from 'react'
import { Container } from '@/components/ui/container'
import { TransitionTemplate } from '@/types/studio'
import { Tag, X, Plus } from 'lucide-react'

interface StepTagsProps {
  template: Partial<TransitionTemplate>
  updateTemplate: (updates: Partial<TransitionTemplate>) => void
}

const SUGGESTED_TAGS = [
  'cinematic',
  'smooth',
  'fast',
  'slow',
  'dramatic',
  'subtle',
  'modern',
  'retro',
  'glitch',
  'organic',
  'geometric',
  'liquid',
  'particle',
  'zoom',
  'pan',
  'rotate',
]

export function StepTags({ template, updateTemplate }: StepTagsProps) {
  const [inputValue, setInputValue] = useState('')
  const tags = template.tags || []

  const addTag = useCallback(
    (tag: string) => {
      const normalized = tag.toLowerCase().trim()
      if (normalized && !tags.includes(normalized)) {
        updateTemplate({ tags: [...tags, normalized] })
      }
      setInputValue('')
    },
    [tags, updateTemplate]
  )

  const removeTag = useCallback(
    (tag: string) => {
      updateTemplate({ tags: tags.filter((t) => t !== tag) })
    },
    [tags, updateTemplate]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    }
  }

  return (
    <Container size="md" className="py-12">
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Tags</h2>
          <p className="text-gray-400">
            Add tags to help organize and find your templates
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Tag className="w-4 h-4" />
              Add Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a tag and press Enter"
                className="flex-1 px-4 py-3 bg-dark-100 border border-secondary/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
              />
              <button
                onClick={() => addTag(inputValue)}
                disabled={!inputValue.trim()}
                className="px-4 py-3 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg hover:bg-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div>
            <p className="text-sm text-gray-400 mb-3">Suggested tags:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
                <button
                  key={tag}
                  onClick={() => addTag(tag)}
                  className="px-3 py-1.5 text-sm bg-dark-100 text-gray-400 border border-white/10 rounded-full hover:border-secondary/40 hover:text-secondary transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
