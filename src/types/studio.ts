// Shock Studio - AI Video Transition Template Types

export interface Variable {
  key: string
  label: string
  defaultValue: string
  type: 'text' | 'select' | 'number'
  options?: string[] // for select type
}

export interface TemplateComponent {
  value: string
  locked: boolean
  variables: Variable[]
}

export interface StyleTiming {
  duration: string
  motionCurve: string
  energy: 'low' | 'medium' | 'high' | 'cinematic'
  locked: boolean
}

export interface TransitionTemplate {
  id: string
  walletAddress: string
  name: string
  version: number
  createdAt: string
  updatedAt: string
  role: TemplateComponent
  sourceState: TemplateComponent
  transitionMechanic: TemplateComponent
  destinationState: TemplateComponent
  styleTiming: StyleTiming
  tags: string[]
  category: string
}

// Wizard state for creating/editing templates
export interface WizardState {
  step: number
  template: Partial<TransitionTemplate>
}

// Default empty template for wizard initialization
export const createEmptyTemplate = (): Omit<TransitionTemplate, 'id' | 'walletAddress' | 'createdAt' | 'updatedAt'> => ({
  name: '',
  version: 1,
  role: { value: '', locked: false, variables: [] },
  sourceState: { value: '', locked: false, variables: [] },
  transitionMechanic: { value: '', locked: true, variables: [] },
  destinationState: { value: '', locked: false, variables: [] },
  styleTiming: {
    duration: '2s',
    motionCurve: 'ease-in-out',
    energy: 'medium',
    locked: false,
  },
  tags: [],
  category: '',
})

// Extract variables from text using {{KEY}} syntax
export function extractVariables(text: string): string[] {
  const regex = /\{\{(\w+)\}\}/g
  const matches: string[] = []
  let match
  while ((match = regex.exec(text)) !== null) {
    if (!matches.includes(match[1])) {
      matches.push(match[1])
    }
  }
  return matches
}

// Replace variables in text with values
export function replaceVariables(text: string, values: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] || `{{${key}}}`)
}
