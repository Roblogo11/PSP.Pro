import { Metadata } from 'next'
import { PAGE_METADATA } from '@/lib/metadata'

export const metadata: Metadata = PAGE_METADATA.seo

export default function SEOLayout({ children }: { children: React.ReactNode }) {
  return children
}
