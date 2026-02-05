import { Metadata } from 'next'
import { PAGE_METADATA } from '@/lib/metadata'

export const metadata: Metadata = PAGE_METADATA.podcast

export default function PodcastLayout({ children }: { children: React.ReactNode }) {
  return children
}
