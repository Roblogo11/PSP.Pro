import { Metadata } from 'next'
import { PAGE_METADATA } from '@/lib/metadata'

export const metadata: Metadata = PAGE_METADATA.getStarted

export default function GetStartedLayout({ children }: { children: React.ReactNode }) {
  return children
}
