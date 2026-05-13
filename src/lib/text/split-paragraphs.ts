/**
 * Splits long unstructured text into readable chunks.
 * Strategy (in order):
 *   1. If text already has double-newlines, respect those.
 *   2. Otherwise, split on sentence boundaries that precede structural cues
 *      like "Phase 1:", "Step 1:", "The Setup:", capital-letter headings, etc.
 *   3. Any chunk still >500 chars gets chunked by every 3 sentences.
 *
 * Returns an array of paragraph strings. Each chunk also exposes a derived
 * `heading` (the inline "Foo:" prefix if present, else a short snippet).
 */

export interface Chunk {
  /** Full paragraph text */
  text: string
  /** Short heading derived from the chunk: an inline "Foo:" prefix or a snippet */
  heading: string
}

export function splitToParagraphs(input: string): string[] {
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
  // Pattern: a sentence end followed by a Capitalized phrase ending in a colon.
  // e.g. ". The Setup:", ". Phase 1:", ". How to do it effectively:"
  const headingPattern = /(?<=[.!?])\s+(?=[A-Z][A-Za-z0-9 &/-]{2,40}:\s)/g
  let paragraphs = flat.split(headingPattern).map(s => s.trim()).filter(Boolean)

  // 3) Chunk any monster paragraph (>500 chars) by sentences
  paragraphs = paragraphs.flatMap(p => (p.length > 500 ? chunkBySentences(p, 3) : [p]))

  return paragraphs
}

export function chunkBySentences(text: string, sentencesPerChunk: number): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text]
  const chunks: string[] = []
  for (let i = 0; i < sentences.length; i += sentencesPerChunk) {
    chunks.push(sentences.slice(i, i + sentencesPerChunk).join('').trim())
  }
  return chunks.filter(Boolean)
}

/**
 * Splits text into Chunk objects with derived headings. Each chunk:
 *  - If it starts with "Heading: ..." → heading is the part before the colon
 *  - Else → heading is the first ~3 words of the chunk
 *
 * Returns at most `maxChunks` (caller can truncate further if needed).
 */
export function splitToChunks(input: string, maxChunks = 9): Chunk[] {
  const paragraphs = splitToParagraphs(input)
  if (paragraphs.length === 0) return []

  let result = paragraphs.map(p => deriveChunk(p))

  // If we have more than maxChunks, merge tail chunks into the last one
  // so user still sees all the content but the grid stays manageable.
  if (result.length > maxChunks) {
    const head = result.slice(0, maxChunks - 1)
    const tail = result.slice(maxChunks - 1)
    const merged = tail.map(c => c.text).join(' ')
    result = [...head, deriveChunk(merged)]
  }

  return result
}

function deriveChunk(text: string): Chunk {
  // "Heading: rest of text" → heading="Heading"
  const colonMatch = text.match(/^([A-Z][A-Za-z0-9 &/-]{2,40}):\s/)
  if (colonMatch) {
    return { text, heading: shortenHeading(colonMatch[1]) }
  }
  // Else: first 3-5 words as the heading
  const words = text.split(/\s+/).slice(0, 4)
  return { text, heading: shortenHeading(words.join(' ')) }
}

function shortenHeading(s: string): string {
  const trimmed = s.trim()
  if (trimmed.length <= 24) return trimmed
  return trimmed.slice(0, 22) + '…'
}
