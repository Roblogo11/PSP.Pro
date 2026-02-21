import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memberships | PSP.Pro',
  description: 'Choose your development path. BASIC (Free) or ELITE ($60/month) membership tiers for athlete development at Proper Sports Performance.',
}

export default function MembershipsLayout({ children }: { children: React.ReactNode }) {
  return children
}
