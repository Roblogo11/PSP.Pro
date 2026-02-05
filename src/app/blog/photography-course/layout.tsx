import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Photography Course: Things to Know Before Picking Up the Camera | ShockAI Blog',
  description: 'Before diving into photography, understand your camera, lighting, composition, and gear essentials. Complete beginner guide with interactive space-themed experience.',
  keywords: ['photography course', 'beginner photography', 'camera basics', 'lighting photography', 'composition rules', 'photography tips', 'ShockAI', 'Norfolk photography'],
  openGraph: {
    title: 'Free Photography Course: Things to Know Before Picking Up the Camera',
    description: 'Complete beginner guide covering camera basics, lighting, composition, and gear essentials.',
    type: 'article',
    publishedTime: '2026-01-29T00:00:00.000Z',
    authors: ['Robbie Creates'],
    siteName: 'ShockAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Photography Course',
    description: 'Everything you need to know before picking up the camera.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
