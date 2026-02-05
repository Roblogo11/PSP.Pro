'use client'

import { useMemo, useCallback, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import {
  ArrowLeft,
  Play,
  Edit,
  Copy,
  Trash2,
  Download,
  Lock,
  Unlock,
  Check,
} from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { templateStorage } from '@/lib/studio/template-storage'
import { Variable, replaceVariables } from '@/types/studio'
import {
  GenerativeMotion,
  GridPattern,
  FloatingShapes,
} from '@/components/generative-motion'

export default function TemplateViewPage() {
  const params = useParams()
  const router = useRouter()
  const { address } = useAccount()
  const [copied, setCopied] = useState(false)

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

  const previewPrompt = useMemo(() => {
    if (!template) return ''
    const defaults = allVariables.reduce((acc, v) => {
      acc[v.key] = v.defaultValue || `[${v.key}]`
      return acc
    }, {} as Record<string, string>)

    let prompt = `${replaceVariables(template.role.value, defaults)}\n\n`
    prompt += `SOURCE: ${replaceVariables(template.sourceState.value, defaults)}\n\n`
    prompt += `TRANSITION: ${replaceVariables(template.transitionMechanic.value, defaults)}\n\n`
    prompt += `DESTINATION: ${replaceVariables(template.destinationState.value, defaults)}\n\n`
    prompt += `TIMING: ${template.styleTiming.duration}, ${template.styleTiming.motionCurve}, ${template.styleTiming.energy} energy`
    return prompt
  }, [template, allVariables])

  const handleDuplicate = useCallback(() => {
    if (!address || !template) return
    const duplicated = templateStorage.duplicate(address, template.id)
    if (duplicated) {
      router.push(`/studio/templates/${duplicated.id}`)
    }
  }, [address, template, router])

  const handleDelete = useCallback(() => {
    if (!address || !template) return
    if (confirm('Are you sure you want to delete this template?')) {
      templateStorage.delete(address, template.id)
      router.push('/studio')
    }
  }, [address, template, router])

  const handleExport = useCallback(() => {
    if (!template) return
    const json = templateStorage.exportToJson(template)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [template])

  const handleCopyPrompt = useCallback(async () => {
    await navigator.clipboard.writeText(previewPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [previewPrompt])

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
          <Link href="/studio">
            <button className="p-2 rounded-lg hover:bg-dark-200 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {template.name}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-400">v{template.version}</span>
              {template.category && (
                <span className="px-2 py-0.5 text-xs rounded bg-accent/10 text-accent">
                  {template.category}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <Link href={`/studio/templates/${template.id}/generate`}>
            <Button>
              <Play className="w-4 h-4 mr-2" />
              Generate Prompt
            </Button>
          </Link>
          <Link href={`/studio/templates/new?edit=${template.id}`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">Template Structure</h2>

            {[
              { label: 'Role', data: template.role },
              { label: 'Source State', data: template.sourceState },
              { label: 'Transition Mechanic', data: template.transitionMechanic },
              { label: 'Destination State', data: template.destinationState },
            ].map(({ label, data }) => (
              <div
                key={label}
                className="p-4 rounded-lg bg-dark-100/80 backdrop-blur-sm border border-white/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-400">{label}</span>
                  <span
                    className={`flex items-center gap-1 text-xs ${
                      data.locked ? 'text-secondary' : 'text-gray-500'
                    }`}
                  >
                    {data.locked ? (
                      <Lock className="w-3 h-3" />
                    ) : (
                      <Unlock className="w-3 h-3" />
                    )}
                    {data.locked ? 'Locked' : 'Unlocked'}
                  </span>
                </div>
                <p className="text-sm text-white whitespace-pre-wrap">
                  {data.value || <span className="text-gray-500 italic">Not set</span>}
                </p>
                {data.variables.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/5 flex flex-wrap gap-1">
                    {data.variables.map((v) => (
                      <span
                        key={v.key}
                        className="px-1.5 py-0.5 text-xs font-mono bg-secondary/10 text-secondary rounded"
                      >
                        {`{{${v.key}}}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="p-4 rounded-lg bg-dark-100/80 backdrop-blur-sm border border-white/5">
              <span className="text-sm font-medium text-gray-400">Style & Timing</span>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 text-sm bg-dark-200 rounded text-white">
                  {template.styleTiming.duration}
                </span>
                <span className="px-2 py-1 text-sm bg-dark-200 rounded text-white capitalize">
                  {template.styleTiming.motionCurve}
                </span>
                <span className="px-2 py-1 text-sm bg-dark-200 rounded text-white capitalize">
                  {template.styleTiming.energy} energy
                </span>
              </div>
            </div>

            {template.tags.length > 0 && (
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Preview (with defaults)</h2>
              <Button variant="outline" size="sm" onClick={handleCopyPrompt}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="p-6 rounded-lg bg-dark-100/80 backdrop-blur-sm border border-white/5 min-h-[400px]">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                {previewPrompt}
              </pre>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
