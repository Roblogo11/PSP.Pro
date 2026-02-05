import { Metadata } from 'next'
import { PAGE_METADATA } from '@/lib/metadata'

export const metadata: Metadata = PAGE_METADATA.photography

export default function PhotographyLayout({ children }: { children: React.ReactNode }) {
  return children
}
