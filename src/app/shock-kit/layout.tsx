import { Metadata } from 'next'
import { PAGE_METADATA } from '@/lib/metadata'

export const metadata: Metadata = PAGE_METADATA.shockKit

export default function ShockKitLayout({ children }: { children: React.ReactNode }) {
  return children
}
