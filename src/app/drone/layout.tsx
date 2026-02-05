import { Metadata } from 'next'
import { PAGE_METADATA } from '@/lib/metadata'

export const metadata: Metadata = PAGE_METADATA.drone

export default function DroneLayout({ children }: { children: React.ReactNode }) {
  return children
}
