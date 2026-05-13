'use client'

import { useState, useMemo } from 'react'

interface ExpandableTextProps {
  text: string
  /** How many characters to show before truncating. Default 220. */
  previewChars?: number
  className?: string
  /** Extra className applied to the inner <p> tags */
  paragraphClassName?: string
}

/**
 * Renders long text with proper paragraph breaks and a collapsed-by-default
 * preview. Splits on double-newlines OR sentence boundaries near common
 * structural cues ("Phase X:", "Step 1:", "How to do it:", etc.) so dense
 * coaching/instructional copy reads cleanly instead of as a wall.
 */
export function ExpandableText({
  text,
  previewChars = 220,
  className = '',
  paragraphClassName = '',
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false)

  const paragraphs = useMemo(() => splitToParagraphs(text), [text])

  if (!text?.trim()) return null

  const fullText = paragraphs.join(' ')
  const needsTruncation = fullText.length > previewChars + 50

  if (!needsTruncation) {
    return (
      <div className={className}>
        {paragraphs.map((p, i) => (
          <p key={i} className={`${paragraphClassName} ${i > 0 ? 'mt-3' : ''}`}>
            {p}
          </p>
        ))}
      </div>
    )
  }

  // Build preview by accumulating paragraphs until we hit the char budget
  let acc = ''
  const preview: string[] = []
  for (const p of paragraphs) {
    if (acc.length + p.length > previewChars && preview.length > 0) break
    preview.push(p)
    acc += p
  }
  if (preview.length === 0) {
    // Single mega-paragraph: hard-truncate at word boundary
    const cut = paragraphs[0].slice(0, previewChars)
    const lastSpace = cut.lastIndexOf(' ')
    preview.push((lastSpace > previewChars - 60 ? cut.slice(0, lastSpace) : cut) + '…')
  }

  const displayed = expanded ? paragraphs : preview

  return (
    <div className={className}>
      {displayed.map((p, i) => (
        <p key={i} className={`${paragraphClassName} ${i > 0 ? 'mt-3' : ''}`}>
          {p}
        </p>
      ))}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="mt-2 text-sm font-semibold text-orange hover:text-orange/80 transition-colors"
      >
        {expanded ? 'Show less' : 'Read more'}
      </button>
    </div>
  )
}

/**
 * Splits long unstructured text into readable paragraphs.
 * Strategy (in order):
 *   1. If text already has double-newlines, respect those.
 *   2. Otherwise, split on sentence boundaries that precede structural cues
 *      like "Phase 1:", "Step 1:", "The Setup:", capital-letter headings, etc.
 *   3. Fall back to splitting every ~3-4 sentences for readability.
 */
function splitToParagraphs(input: string): string[] {
  if (!input) return []
  const trimmed = input.trim()

  // 1) Existing double-newlines win
  if (/\n\s*\n/.test(trimmed)) {
    return trimmed
      .split(/\n\s*\n/)
      .map(p => p.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
  }

  const flat = trimmed.replace(/\s+/g, ' ')

  // 2) Split before structural cues that look like inline headings
  // Pattern: a capitalized phrase ending in a colon, preceded by a sentence end.
  // e.g. ". The Setup:", ". Phase 1:", ". How to do it effectively:"
  const headingPattern = /(?<=[.!?])\s+(?=[A-Z][A-Za-z0-9 &/-]{2,40}:\s)/g
  let paragraphs = flat.split(headingPattern).map(s => s.trim()).filter(Boolean)

  // 3) If we still have any monster paragraph (>500 chars), chunk by sentences
  paragraphs = paragraphs.flatMap(p => (p.length > 500 ? chunkBySentences(p, 3) : [p]))

  return paragraphs
}

function chunkBySentences(text: string, sentencesPerChunk: number): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text]
  const chunks: string[] = []
  for (let i = 0; i < sentences.length; i += sentencesPerChunk) {
    chunks.push(sentences.slice(i, i + sentencesPerChunk).join('').trim())
  }
  return chunks.filter(Boolean)
}
