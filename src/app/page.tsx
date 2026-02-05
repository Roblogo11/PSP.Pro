import { Hero } from '@/components/sections/hero'
import { GalleryShowcase } from '@/components/sections/gallery-showcase'
import { Features } from '@/components/sections/features'
import { Metrics } from '@/components/sections/metrics'
import { Process } from '@/components/sections/process'
import { FAQ } from '@/components/sections/faq'
import { Contact } from '@/components/sections/contact'
import { Footer } from '@/components/sections/footer'
import { FunnelNav } from '@/components/navigation/funnel-nav'
import { FunnelBridge } from '@/components/navigation/funnel-bridge'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <GalleryShowcase />
      <Features />
      <Metrics />
      <Process />
      <FAQ />
      {/* Narrative Bridge: Hook to Video */}
      <FunnelBridge variant="home-to-video" />
      <Contact />
      <Footer />
      <FunnelNav />
    </main>
  )
}
