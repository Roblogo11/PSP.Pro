/**
 * PSP.Pro SITE CONFIGURATION
 *
 * Centralized configuration for Proper Sports Performance platform
 * Virginia Beach/Norfolk area athletic training
 */

export const pspConfig = {
  // Meta Information
  meta: {
    title: "PSP.Pro | Proper Sports Performance",
    description: "Elite athletic training for softball, basketball, and soccer athletes in Virginia Beach. Master mechanics, build speed, and dominate your competition.",
    url: "https://propersports.pro",
    ogImage: "/images/psp-og-image.jpg",
    logo: "/images/psp-logo.svg",
    keywords: [
      "softball training Virginia Beach",
      "basketball training Virginia Beach",
      "soccer training Norfolk",
      "velocity training",
      "athletic performance",
      "speed mechanics",
      "sports performance training",
    ],
  },

  // Business Information
  business: {
    name: "Proper Sports Performance",
    shortName: "PSP.Pro",
    tagline: "Elite Athletic Training Platform",
    location: {
      city: "Virginia Beach",
      state: "VA",
      region: "Hampton Roads",
      area: "Virginia Beach / Norfolk / Chesapeake",
    },
    contact: {
      email: "info@propersports.pro",
      phone: "(757) XXX-XXXX",
    },
    hours: {
      weekday: "3:00 PM - 9:00 PM",
      saturday: "9:00 AM - 5:00 PM",
      sunday: "Closed",
    },
  },

  // Navigation
  navigation: {
    dashboard: [
      { label: 'Athlete Locker', href: '/locker', icon: 'LayoutDashboard' },
      { label: 'Drill Bank', href: '/drills', icon: 'Dumbbell' },
      { label: 'Sessions', href: '/sessions', icon: 'Calendar' },
      { label: 'Progress', href: '/progress', icon: 'TrendingUp' },
      { label: 'Booking', href: '/booking', icon: 'Clock' },
      { label: 'Settings', href: '/settings', icon: 'Settings' },
    ],
    marketing: [
      { label: 'Home', href: '/' },
      { label: 'Programs', href: '/programs' },
      { label: 'About', href: '/about' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
    ],
  },

  // Training Programs
  programs: {
    softball: {
      title: "Softball Excellence",
      description: "Build speed, power, and consistency for competitive softball.",
      features: [
        "Pitching Mechanics",
        "Hitting Development",
        "Speed Training",
        "Fielding & Game Strategy",
      ],
    },
    basketball: {
      title: "Basketball Performance",
      description: "Develop court speed, agility, and explosive athleticism.",
      features: [
        "Speed & Agility",
        "Vertical Leap Development",
        "Court Movement",
        "Strength & Conditioning",
      ],
    },
    soccer: {
      title: "Soccer Training",
      description: "Build endurance, footwork, and field awareness for competitive soccer.",
      features: [
        "Speed & Endurance",
        "Agility & Footwork",
        "Strength Training",
        "Game Performance",
      ],
    },
  },

  // Pricing Tiers
  pricing: {
    tiers: [
      {
        id: 'starter',
        name: 'Starter',
        price: 99,
        period: 'month',
        description: 'Perfect for athletes getting started',
        features: [
          '4 sessions per month',
          'Access to Drill Bank',
          'Velocity tracking',
          'Mobile app access',
          'Progress reports',
        ],
        cta: 'Join the Team',
      },
      {
        id: 'athlete',
        name: 'Athlete',
        price: 179,
        period: 'month',
        description: 'For serious competitors',
        features: [
          '8 sessions per month',
          'All Starter features',
          'Custom training plan',
          '1-on-1 coaching',
          'Video analysis',
          'Priority booking',
        ],
        cta: 'Go Pro',
        popular: true,
      },
      {
        id: 'elite',
        name: 'Elite',
        price: 299,
        period: 'month',
        description: 'Maximum performance gains',
        features: [
          'Unlimited sessions',
          'All Athlete features',
          'Dedicated coach',
          'Nutrition guidance',
          'Recovery protocols',
          'Competition prep',
          'Parent dashboard',
        ],
        cta: 'Join Elite',
      },
    ],
  },

  // Testimonials
  testimonials: [
    {
      id: 1,
      name: "Jake Martinez",
      role: "Softball, Age 16",
      content: "Increased my velocity from 76 to 83 mph in just 3 months. The coaching and drill bank are game-changers.",
      rating: 5,
      avatar: "/images/avatars/athlete-1.jpg",
    },
    {
      id: 2,
      name: "Sarah Thompson",
      role: "Softball, Age 14",
      content: "The progress tracking keeps me motivated. I can see exactly how I'm improving every week.",
      rating: 5,
      avatar: "/images/avatars/athlete-2.jpg",
    },
    {
      id: 3,
      name: "Mike Johnson",
      role: "Parent",
      content: "As a parent, I love the transparency. I can see every session, every drill, and my son's progress in real-time.",
      rating: 5,
      avatar: "/images/avatars/parent-1.jpg",
    },
  ],

  // Social Links
  social: {
    instagram: "https://instagram.com/psp.pro",
    facebook: "https://facebook.com/propersports",
    twitter: "https://twitter.com/psppro",
    youtube: "https://youtube.com/@psppro",
  },

  // Features
  features: {
    dashboard: [
      {
        title: "Velocity Tracking",
        description: "Real-time velocity monitoring with beautiful visualizations",
        icon: "TrendingUp",
      },
      {
        title: "Drill Bank",
        description: "Extensive library of professional training videos",
        icon: "Video",
      },
      {
        title: "Progress Analytics",
        description: "Data-driven insights into your athletic development",
        icon: "BarChart",
      },
      {
        title: "Mobile First",
        description: "Train anywhere with our optimized mobile experience",
        icon: "Smartphone",
      },
    ],
  },

  // Footer
  footer: {
    tagline: "Elite Athletic Training Platform",
    description: "Proper Sports Performance is Virginia Beach's premier athletic training facility for softball, basketball, and soccer athletes.",
    copyright: `© ${new Date().getFullYear()} Proper Sports Performance. All rights reserved.`,
    links: [
      {
        title: "Platform",
        items: [
          { name: "Athlete Locker", href: "/locker" },
          { name: "Drill Bank", href: "/drills" },
          { name: "Progress Tracking", href: "/progress" },
        ],
      },
      {
        title: "Company",
        items: [
          { name: "About PSP", href: "/about" },
          { name: "Our Programs", href: "/programs" },
          { name: "Pricing", href: "/pricing" },
          { name: "Contact", href: "/contact" },
        ],
      },
      {
        title: "Resources",
        items: [
          { name: "Blog", href: "/blog" },
          { name: "Training Tips", href: "/blog/tips" },
          { name: "Success Stories", href: "/blog/stories" },
        ],
      },
      {
        title: "Legal",
        items: [
          { name: "Privacy Policy", href: "/privacy" },
          { name: "Terms of Service", href: "/terms" },
          { name: "Waiver", href: "/waiver" },
        ],
      },
    ],
  },
}

export type PSPConfig = typeof pspConfig
