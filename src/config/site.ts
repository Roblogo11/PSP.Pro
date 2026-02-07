/**
 * CENTRALIZED SITE CONFIGURATION
 *
 * PSP.Pro - ProPer Sports Performance
 * Athletic training platform for baseball and softball athletes
 */

export const siteConfig = {
  // Meta Information
  meta: {
    title: "PSP.Pro | ProPer Sports Performance - Elite Athletic Training",
    description: "Elite baseball and softball training in Virginia Beach. Track velocity, master mechanics, and dominate the diamond with data-driven performance.",
    url: "https://propersports.pro",
    ogImage: "/images/PSP-black-300x99-1.png",
    logo: "/images/PSP-black-300x99-1.png",
  },

  // Hero Section
  hero: {
    headline: "PSP.Pro",
    subheadline: "PSP.Pro",
    description: "Progression Over Perfection",
    cta: {
      primary: "Start Training",
      secondary: "View Dashboard Demo",
    },
    emailPlaceholder: "Your email address",
    emailSubtext: "Join our newsletter for training tips",
    backgroundVideo: "",
    image: "/images/PSP-black-300x99-1.png",
  },

  // Features
  features: {
    sectionTitle: "Your Athletic Command Center",
    sectionSubtitle: "Train Like a Pro. Perform Like a Champion.",
    items: [
      {
        id: "1",
        icon: "Target",
        title: "Velocity Tracking",
        description: "Track your throwing velocity and monitor improvements over time",
        size: "default",
        image: "/images/PSP-black-300x99-1.png",
        cta: "Learn More",
        href: "/get-started"
      }
    ] as Array<{ id: string; icon: string; title: string; description: string; size?: string; image: string; cta?: string; href?: string }>,
  },

  // Services
  services: {
    sectionTitle: "Training Programs",
    sectionSubtitle: "Specialized coaching for every aspect of your game",
    items: [],
  },

  // Metrics
  metrics: {
    sectionTitle: "Track Your Progress",
    sectionSubtitle: "Results that speak for themselves",
    stats: [
      { id: "1", value: "500+", label: "Athletes Trained", description: "Elite athletes trained to peak performance" },
      { id: "2", value: "+5 MPH", label: "Avg Velocity Gain", description: "Average velocity improvement per athlete" },
      { id: "3", value: "100+", label: "Training Drills", description: "Specialized drills in our training library" },
      { id: "4", value: "95%", label: "Goal Achievement", description: "Athletes reaching their performance goals" },
    ],
  },

  // Process
  process: {
    sectionTitle: "How It Works",
    sectionSubtitle: "Your journey to peak performance",
    steps: [
      { id: "1", number: 1, title: "Assessment", description: "Evaluate your current performance and set goals", icon: "Target", cta: "Get Started", href: "/get-started", image: "/images/PSP-black-300x99-1.png" }
    ] as Array<{ id: string; number: number; title: string; description: string; icon: string; cta?: string; href?: string; image: string }>,
  },

  // Testimonials
  testimonials: {
    sectionTitle: "What Our Athletes Say",
    items: [],
  },

  // FAQ
  faq: {
    sectionTitle: "Frequently Asked Questions",
    sectionSubtitle: "Everything you need to know about our training programs",
    questions: [
      {
        id: "1",
        question: "What training programs do you offer?",
        answer: "We offer specialized baseball and softball training programs focused on velocity development, mechanics improvement, and overall athletic performance."
      }
    ] as Array<{ id: string; question: string; answer: string }>,
  },

  // Contact
  contact: {
    sectionTitle: "Get in Touch",
    sectionSubtitle: "Ready to Start Your Training Journey?",
    description: "Join Virginia Beach's premier athletic training facility and take your performance to the next level.",
    emailPlaceholder: "Your email address",
    cta: "Get Started",
    email: "info@propersports.pro",
    phone: "(757) 123-4567",
    address: "Virginia Beach, VA",
    hours: "Monday-Friday: 3PM-9PM, Saturday: 9AM-5PM",
  },

  // Footer
  footer: {
    copyright: "© 2026 ProPer Sports Performance LLC. All rights reserved.",
    tagline: "Progression Over Perfection",
    description: "Elite baseball and softball training in Virginia Beach. Progression over perfection.",
    social: [
      { name: "Twitter", icon: "Twitter", url: "#" }
    ] as Array<{ name: string; icon: string; url: string }>,
    links: [
      {
        title: "Company",
        items: [
          { name: "About", href: "/about" },
          { name: "Contact", href: "/contact" }
        ]
      }
    ] as Array<{ title: string; items: Array<{ name: string; href: string }> }>,
  },
}
