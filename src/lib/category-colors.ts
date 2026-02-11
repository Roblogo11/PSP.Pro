// Dynamic category color palette
// Assigns colors based on category name — any new category automatically gets a color

const PALETTE = [
  { bg: 'bg-orange/20', text: 'text-orange', border: 'border-orange/50', bgLight: 'bg-orange/10', borderLight: 'border-orange/20' },
  { bg: 'bg-cyan/20', text: 'text-cyan', border: 'border-cyan/50', bgLight: 'bg-cyan/10', borderLight: 'border-cyan/20' },
  { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50', bgLight: 'bg-purple-500/10', borderLight: 'border-purple-500/20' },
  { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50', bgLight: 'bg-green-500/10', borderLight: 'border-green-500/20' },
  { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50', bgLight: 'bg-blue-500/10', borderLight: 'border-blue-500/20' },
  { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/50', bgLight: 'bg-pink-500/10', borderLight: 'border-pink-500/20' },
  { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50', bgLight: 'bg-yellow-500/10', borderLight: 'border-yellow-500/20' },
  { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50', bgLight: 'bg-red-500/10', borderLight: 'border-red-500/20' },
]

function hashCategory(category: string): number {
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

export function getCategoryColor(category: string) {
  const index = hashCategory(category.toLowerCase()) % PALETTE.length
  const p = PALETTE[index]
  return `${p.bg} ${p.text} ${p.border}`
}

export function getCategoryColorLight(category: string) {
  const index = hashCategory(category.toLowerCase()) % PALETTE.length
  const p = PALETTE[index]
  return `${p.bgLight} ${p.text} ${p.borderLight}`
}

export function getCategoryTextColor(category: string) {
  const index = hashCategory(category.toLowerCase()) % PALETTE.length
  return PALETTE[index].text
}

// Default categories shown as suggestions when no services exist yet
export const DEFAULT_CATEGORIES = ['individual', 'group', 'package', 'specialty']

// Check if a service should show max_participants UI
export function isGroupCategory(category: string): boolean {
  return category.toLowerCase().includes('group')
}
