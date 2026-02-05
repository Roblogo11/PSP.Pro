import { TransitionTemplate } from '@/types/studio'

const STORAGE_PREFIX = 'shock-studio-templates'

function getStorageKey(walletAddress: string): string {
  return `${STORAGE_PREFIX}-${walletAddress.toLowerCase()}`
}

export const templateStorage = {
  // Get all templates for a wallet
  getAll(walletAddress: string): TransitionTemplate[] {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem(getStorageKey(walletAddress))
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  // Get single template by ID
  getById(walletAddress: string, id: string): TransitionTemplate | null {
    const templates = this.getAll(walletAddress)
    return templates.find((t) => t.id === id) || null
  },

  // Create new template
  create(
    walletAddress: string,
    template: Omit<TransitionTemplate, 'id' | 'createdAt' | 'updatedAt' | 'walletAddress'>
  ): TransitionTemplate {
    const templates = this.getAll(walletAddress)
    const now = new Date().toISOString()
    const newTemplate: TransitionTemplate = {
      ...template,
      id: crypto.randomUUID(),
      walletAddress: walletAddress.toLowerCase(),
      createdAt: now,
      updatedAt: now,
    }
    templates.push(newTemplate)
    localStorage.setItem(getStorageKey(walletAddress), JSON.stringify(templates))
    return newTemplate
  },

  // Update existing template
  update(
    walletAddress: string,
    id: string,
    updates: Partial<TransitionTemplate>
  ): TransitionTemplate | null {
    const templates = this.getAll(walletAddress)
    const index = templates.findIndex((t) => t.id === id)
    if (index === -1) return null

    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(getStorageKey(walletAddress), JSON.stringify(templates))
    return templates[index]
  },

  // Delete template
  delete(walletAddress: string, id: string): boolean {
    const templates = this.getAll(walletAddress)
    const filtered = templates.filter((t) => t.id !== id)
    if (filtered.length === templates.length) return false
    localStorage.setItem(getStorageKey(walletAddress), JSON.stringify(filtered))
    return true
  },

  // Duplicate template
  duplicate(walletAddress: string, id: string): TransitionTemplate | null {
    const original = this.getById(walletAddress, id)
    if (!original) return null

    const { id: _id, createdAt: _created, updatedAt: _updated, walletAddress: _wallet, ...rest } = original
    return this.create(walletAddress, {
      ...rest,
      name: `${original.name} (Copy)`,
      version: 1,
    })
  },

  // Export template as JSON
  exportToJson(template: TransitionTemplate): string {
    return JSON.stringify(template, null, 2)
  },

  // Import template from JSON
  importFromJson(walletAddress: string, json: string): TransitionTemplate | null {
    try {
      const parsed = JSON.parse(json) as TransitionTemplate
      const { id: _id, createdAt: _created, updatedAt: _updated, walletAddress: _wallet, ...rest } = parsed
      return this.create(walletAddress, rest)
    } catch {
      return null
    }
  },
}
