/**
 * Placeholder Image Configuration
 *
 * These URLs use placehold.co for proper aspect ratio placeholders.
 * Replace these with your actual high-quality images maintaining the same dimensions.
 *
 * Color scheme:
 * - Background: 0f1419 (dark blue-gray)
 * - Primary: 00b4d8 (cyan)
 * - Accent: b8301a (orange)
 */

export const PLACEHOLDER_IMAGES = {
  // Hero Section - 16:9 aspect ratio (1920x1080)
  hero: {
    main: '/images/Proper Sports Performance.jpg',
    alt: 'Proper Sports Performance training facility',
    width: 1920,
    height: 1080
  },

  // Feature Cards - 3:2 aspect ratio (600x400)
  features: {
    velocityTracking: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&h=400&fit=crop&q=80',
    drillBank: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=400&fit=crop&q=80',
    personalizedTraining: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=400&fit=crop&q=80',
    alt: {
      velocityTracking: 'Velocity tracking dashboard with performance charts',
      drillBank: 'Athletes training with professional equipment',
      personalizedTraining: 'One-on-one coaching session'
    },
    width: 600,
    height: 400,
    note: 'Replace with: Screenshot of velocity dashboard, drill thumbnails, coach-athlete training photos'
  },

  // Coach Headshots - 1:1 square (400x400)
  coaches: {
    rachel: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&q=80',
    mike: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&q=80',
    sarah: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&q=80',
    alt: {
      rachel: 'Coach Rachel - Lead Pitching Coach',
      mike: 'Coach Mike - Velocity Training Specialist',
      sarah: 'Coach Sarah - Movement & Mechanics Coach'
    },
    width: 400,
    height: 400,
    note: 'Replace with: Professional headshots of actual coaches - friendly, approachable, in PSP gear'
  },

  // Facility Photos - 16:9 aspect ratio (1200x675)
  facility: {
    training: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=675&fit=crop&q=80',
    equipment: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&h=675&fit=crop&q=80',
    indoor: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1200&h=675&fit=crop&q=80',
    alt: {
      training: 'PSP Training Center main facility',
      equipment: 'Professional training equipment and technology',
      indoor: 'Indoor training bay with batting cages'
    },
    width: 1200,
    height: 675,
    note: 'Replace with: Actual facility photos showing training spaces, equipment, technology setup'
  },

  // Before/After Comparison - 4:3 aspect ratio (800x600)
  beforeAfter: {
    pitchingForm: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=600&fit=crop&q=80',
    battingStance: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=600&fit=crop&q=80',
    width: 800,
    height: 600,
    alt: 'Training progress comparison',
    note: 'Replace with: Side-by-side before/after mechanics screenshots from video analysis'
  },

  // Training Programs - 3:2 aspect ratio (600x400)
  programs: {
    oneOnOne: 'https://images.unsplash.com/photo-1578432156326-d23924cce2e4?w=600&h=400&fit=crop&q=80',
    group: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=600&h=400&fit=crop&q=80',
    monthly: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=600&h=400&fit=crop&q=80',
    alt: {
      oneOnOne: '1-on-1 personalized coaching session',
      group: 'Group speed and agility training',
      monthly: 'Monthly training membership program'
    },
    width: 600,
    height: 400,
    note: 'Replace with: Actual photos of 1-on-1 sessions, group training, and membership athletes'
  },

  // Drill Thumbnails - 16:9 aspect ratio (320x180)
  drills: {
    placeholder: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=320&h=180&fit=crop&q=80',
    width: 320,
    height: 180,
    alt: 'Training drill demonstration',
    note: 'Replace with: Video thumbnails from actual drill demonstrations - freeze frame of key positions'
  },

  // Dashboard Profile - 1:1 square (200x200)
  profile: {
    placeholder: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80',
    width: 200,
    height: 200,
    alt: 'Athlete profile photo',
    note: 'Replace with: User-uploaded athlete photos'
  },

  // Achievement Badges - 1:1 square (120x120)
  badges: {
    velocityMilestone: 'https://placehold.co/120x120/0f1419/00b4d8?text=+5MPH&font=roboto',
    streakMaster: 'https://placehold.co/120x120/0f1419/b8301a?text=7+Days&font=roboto',
    drillComplete: 'https://placehold.co/120x120/0f1419/10b981?text=100%25&font=roboto',
    width: 120,
    height: 120,
    alt: {
      velocityMilestone: 'Velocity Milestone Badge',
      streakMaster: 'Training Streak Badge',
      drillComplete: 'Drill Completion Badge'
    },
    note: 'Replace with: Custom illustrated achievement badges - trophy icons, velocity lightning bolts, etc.'
  }
}

/**
 * Utility function to get placeholder URL with branded colors
 * Use this when you need a quick branded placeholder
 */
export function getBrandedPlaceholder(width: number, height: number, text: string = '') {
  const encodedText = encodeURIComponent(text)
  return `https://placehold.co/${width}x${height}/0f1419/00b4d8?text=${encodedText}&font=roboto`
}

/**
 * Image dimension reference for photographers
 * Use these exact dimensions when shooting/editing photos for replacement
 */
export const IMAGE_SPECS = {
  'Hero Banner': '1920x1080px (16:9) - Landscape action shot with room for text overlay',
  'Feature Cards': '600x400px (3:2) - Horizontal orientation, clear subject focus',
  'Coach Headshots': '400x400px (1:1) - Square crop, eye-level, professional lighting',
  'Facility Photos': '1200x675px (16:9) - Wide angle, well-lit, show space and equipment',
  'Drill Thumbnails': '320x180px (16:9) - Clear demonstration of movement, freeze at key position',
  'Profile Photos': '200x200px (1:1) - Square crop, athlete face clearly visible',
  'Achievement Badges': '120x120px (1:1) - Illustrated graphics, not photos, transparent background PNG'
}
