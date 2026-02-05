'use client'

import { useState, useCallback, useMemo } from 'react'
import { Lock, Unlock, Plus, X, Info } from 'lucide-react'
import { Variable, extractVariables } from '@/types/studio'

interface ComponentEditorProps {
  label: string
  description?: string
  placeholder?: string
  value: string
  locked: boolean
  variables: Variable[]
  onChange: (value: string) => void
  onLockToggle: (locked: boolean) => void
  onVariablesChange: (variables: Variable[]) => void
  tips?: string[]
}

export function ComponentEditor({
  label,
  description,
  placeholder,
  value,
  locked,
  variables,
  onChange,
  onLockToggle,
  onVariablesChange,
  tips,
}: ComponentEditorProps) {
  const [showVariableEditor, setShowVariableEditor] = useState(false)

  const detectedKeys = useMemo(() => extractVariables(value), [value])

  const handleAddVariable = useCallback(
    (key: string) => {
      if (variables.find((v) => v.key === key)) return
      onVariablesChange([
        ...variables,
        {
          key,
          label: key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, ' '),
          defaultValue: '',
          type: 'text',
        },
      ])
    },
    [variables, onVariablesChange]
  )

  const handleRemoveVariable = useCallback(
    (key: string) => {
      onVariablesChange(variables.filter((v) => v.key !== key))
    },
    [variables, onVariablesChange]
  )

  const handleUpdateVariable = useCallback(
    (key: string, updates: Partial<Variable>) => {
      onVariablesChange(
        variables.map((v) => (v.key === key ? { ...v, ...updates } : v))
      )
    },
    [variables, onVariablesChange]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">{label}</h3>
          {description && (
            <p className="text-sm text-gray-400 mt-1">{description}</p>
          )}
        </div>

        <button
          onClick={() => onLockToggle(!locked)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
            locked
              ? 'bg-secondary/10 text-secondary border border-secondary/20'
              : 'bg-dark-200 text-gray-400 border border-white/10 hover:border-white/20'
          }`}
        >
          {locked ? (
            <>
              <Lock className="w-4 h-4" />
              <span className="text-sm">Locked</span>
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              <span className="text-sm">Unlocked</span>
            </>
          )}
        </button>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
        className="w-full px-4 py-3 bg-dark-100 border border-secondary/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all resize-none font-mono text-sm"
      />

      {detectedKeys.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              Detected variables: {detectedKeys.length}
            </span>
            <button
              onClick={() => setShowVariableEditor(!showVariableEditor)}
              className="text-sm text-secondary hover:underline"
            >
              {showVariableEditor ? 'Hide' : 'Configure'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {detectedKeys.map((key) => {
              const hasConfig = variables.find((v) => v.key === key)
              return (
                <span
                  key={key}
                  className={`px-2 py-1 text-sm rounded font-mono ${
                    hasConfig
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  }`}
                >
                  {`{{${key}}}`}
                  {!hasConfig && (
                    <button
                      onClick={() => handleAddVariable(key)}
                      className="ml-2 hover:text-orange-300"
                    >
                      <Plus className="w-3 h-3 inline" />
                    </button>
                  )}
                </span>
              )
            })}
          </div>

          {showVariableEditor && variables.length > 0 && (
            <div className="space-y-3 p-4 bg-dark-200/50 rounded-lg border border-white/5">
              {variables.map((variable) => (
                <div
                  key={variable.key}
                  className="flex items-start gap-4 p-3 bg-dark-100 rounded-lg"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-secondary">
                        {`{{${variable.key}}}`}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={variable.label}
                      onChange={(e) =>
                        handleUpdateVariable(variable.key, { label: e.target.value })
                      }
                      placeholder="Display label"
                      className="w-full px-3 py-1.5 text-sm bg-dark-200 border border-white/10 rounded text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-secondary"
                    />
                    <input
                      type="text"
                      value={variable.defaultValue}
                      onChange={(e) =>
                        handleUpdateVariable(variable.key, {
                          defaultValue: e.target.value,
                        })
                      }
                      placeholder="Default value"
                      className="w-full px-3 py-1.5 text-sm bg-dark-200 border border-white/10 rounded text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-secondary"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveVariable(variable.key)}
                    className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tips && tips.length > 0 && (
        <div className="p-4 rounded-lg bg-dark-200/50 border border-secondary/10">
          <div className="flex items-center gap-2 text-sm font-medium text-secondary mb-2">
            <Info className="w-4 h-4" />
            Tips
          </div>
          <ul className="text-sm text-gray-400 space-y-1">
            {tips.map((tip, i) => (
              <li key={i}>• {tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
