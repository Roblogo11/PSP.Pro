import { createHmac } from 'crypto'

function getSecret(): string {
  return process.env.UNSUBSCRIBE_SECRET || process.env.NEXTAUTH_SECRET || 'psp-unsub-fallback-secret'
}

export function generateUnsubscribeToken(email: string): string {
  return createHmac('sha256', getSecret()).update(email.toLowerCase()).digest('hex')
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = generateUnsubscribeToken(email)
  // Constant-time comparison to prevent timing attacks
  if (expected.length !== token.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ token.charCodeAt(i)
  }
  return diff === 0
}

export function buildUnsubscribeUrl(email: string, baseUrl = 'https://propersports.pro'): string {
  const token = generateUnsubscribeToken(email)
  return `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
}
