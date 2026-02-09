/**
 * PSP.Pro Image Configuration
 *
 * All images are real PSP.Pro photography.
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
    velocityTracking: '/images/psp pitcher.jpg',
    drillBank: '/images/Praticing Soccer Drills.jpg',
    personalizedTraining: '/images/PSP Softball Athlete.jpg',
    alt: {
      velocityTracking: 'PSP athlete pitching with coach guidance',
      drillBank: 'Athletes practicing soccer drills on the field',
      personalizedTraining: 'Softball athlete mid-swing during training'
    },
    width: 600,
    height: 400
  },

  // Coach Headshots - 1:1 square (400x400)
  coaches: {
    rachel: '/images/coach rachel psp.jpg',
    mike: '/images/over the shoulder psp pitching.jpg',
    sarah: '/images/psp pitcher.jpg',
    alt: {
      rachel: 'Coach Rachel - Lead Pitching Coach',
      mike: 'PSP coaching session in the facility',
      sarah: 'PSP pitcher training with coach'
    },
    width: 400,
    height: 400
  },

  // Facility Photos - 16:9 aspect ratio (1200x675)
  facility: {
    training: '/images/over the shoulder psp pitching.jpg',
    equipment: '/images/Proper Sports Performance.jpg',
    indoor: '/images/Costal At Bat.jpg',
    alt: {
      training: 'PSP indoor pitching training session',
      equipment: 'Proper Sports Performance training facility',
      indoor: 'Coastal softball game action shot'
    },
    width: 1200,
    height: 675
  },

  // Before/After Comparison - 4:3 aspect ratio (800x600)
  beforeAfter: {
    pitchingForm: '/images/psp pitcher.jpg',
    battingStance: '/images/Costal At Bat.jpg',
    width: 800,
    height: 600,
    alt: 'Training progress comparison'
  },

  // Training Programs - 3:2 aspect ratio (600x400)
  programs: {
    oneOnOne: '/images/psp pitcher.jpg',
    group: '/images/Praticing Soccer Drills.jpg',
    monthly: '/images/Top View Soccer Traing.jpg',
    alt: {
      oneOnOne: 'PSP 1-on-1 pitching session with coach',
      group: 'Group soccer drill training session',
      monthly: 'Aerial view of soccer training with cones'
    },
    width: 600,
    height: 400
  },

  // Drill Thumbnails - 16:9 aspect ratio (320x180)
  drills: {
    placeholder: '/images/PSP Softball Athlete.jpg',
    width: 320,
    height: 180,
    alt: 'PSP softball training drill'
  },

  // Dashboard Profile - 1:1 square (200x200)
  profile: {
    placeholder: '/images/coach rachel psp.jpg',
    width: 200,
    height: 200,
    alt: 'PSP athlete profile'
  },

  // Achievement Badges - 1:1 square (120x120)
  badges: {
    velocityMilestone: '/images/psp pitcher.jpg',
    streakMaster: '/images/Costal At Bat.jpg',
    drillComplete: '/images/Top View Soccer Traing.jpg',
    width: 120,
    height: 120,
    alt: {
      velocityMilestone: 'Velocity Milestone Badge',
      streakMaster: 'Training Streak Badge',
      drillComplete: 'Drill Completion Badge'
    }
  }
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
