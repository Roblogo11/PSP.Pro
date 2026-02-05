import { Metadata } from 'next'
import { PAGE_METADATA } from '@/lib/metadata'

export const metadata: Metadata = PAGE_METADATA.websiteHelp

export default function WebsiteHelpLayout({ children }: { children: React.ReactNode }) {
  return children
}
