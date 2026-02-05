import { Metadata } from 'next'
import { PAGE_METADATA } from '@/lib/metadata'

export const metadata: Metadata = PAGE_METADATA.video

export default function VideoLayout({ children }: { children: React.ReactNode }) {
  return children
}
