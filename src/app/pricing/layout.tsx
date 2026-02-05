import { Metadata } from 'next'
import { PAGE_METADATA } from '@/lib/metadata'

export const metadata: Metadata = PAGE_METADATA.pricing

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
