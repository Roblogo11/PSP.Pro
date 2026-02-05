'use client'

import { useState } from 'react'
import { Twitter, Linkedin, Instagram, Youtube, Music, MapPin, ChevronDown, LucideIcon } from 'lucide-react'
import Image from 'next/image'
import { siteConfig } from '@/config/site'
import { Container } from '@/components/ui/container'

const iconMap: Record<string, LucideIcon> = {
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Music,
}

export function Footer() {
  const [isMapOpen, setIsMapOpen] = useState(false)

  return (
    <footer className="bg-dark-300 border-t border-secondary/10">
      <Container>
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            {/* Brand */}
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-4">
                <Image
                  src={siteConfig.meta.logo}
                  alt="Logo"
                  width={60}
                  height={60}
                  className="drop-shadow-lg"
                />
                <h3 className="text-2xl font-bold text-white">
                  {siteConfig.footer.tagline}
                </h3>
                <p className="text-gray-400">
                  {siteConfig.footer.description}
                </p>
              </div>

              {/* Social Links */}
              <div className="flex gap-4">
                {siteConfig.footer.social.map((social) => {
                  const Icon = iconMap[social.icon]
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg bg-dark-100 text-gray-400 hover:text-secondary hover:bg-dark-200 border border-secondary/10 hover:border-secondary/30 transition-all"
                      aria-label={social.name}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Links */}
            {siteConfig.footer.links.map((group) => (
              <div key={group.title}>
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                  {group.title}
                </h4>
                <ul className="space-y-3">
                  {group.items.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-secondary transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Location Section */}
        <div className="py-8 border-t border-secondary/10">
          <div className="text-center">
            <button
              onClick={() => setIsMapOpen(!isMapOpen)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary/10 border border-secondary/20 backdrop-blur-sm hover:bg-secondary/20 hover:border-secondary/40 transition-all group"
            >
              <MapPin className="w-4 h-4 text-secondary" />
              <span className="text-sm text-secondary font-medium">See Reviews</span>
              <ChevronDown className={`w-4 h-4 text-secondary transition-transform duration-300 ${isMapOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Collapsible Map Content */}
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isMapOpen ? 'max-h-[650px] opacity-100 mt-8' : 'max-h-0 opacity-0'}`}>
            <div className="text-center mb-6">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Shock Media Productions
              </h3>
              <p className="text-gray-400">Norfolk, VA | Serving Hampton Roads & Beyond</p>
            </div>

            <div className="flex justify-center w-full">
              <div className="w-full max-w-[800px]">
                <div className="relative w-full" style={{ paddingBottom: '35%' }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d817928.3911902515!2d-76.80390516877753!3d36.793764492389535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89ba97da4f99bf65%3A0x2f62f00a80f12eeb!2sShock%20Media%20Productions!5e0!3m2!1sen!2sus!4v1769044824178!5m2!1sen!2sus"
                    className="absolute top-0 left-0 w-full h-full rounded-xl border border-secondary/20 shadow-2xl hover:border-secondary/40 transition-all"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-secondary/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              {siteConfig.footer.copyright}
            </p>
            <div className="flex gap-6">
              <a href="/privacy" className="text-sm text-gray-500 hover:text-secondary transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-sm text-gray-500 hover:text-secondary transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
