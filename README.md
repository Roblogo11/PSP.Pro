# ShockAI - Creative Studio Website

A high-performance, AI-first creative studio website built with Next.js 14, Tailwind CSS, and Framer Motion. Features a dynamic gallery system, panel-based navigation, and admin upload capabilities.

## Quick Reference for AI Assistants

> **IMPORTANT**: Read this section first to understand the codebase without crawling all files.

### Key Architecture Decisions

1. **Single Source of Truth**: All gallery data is in `/public/data/galleries.json`
2. **API-Based Galleries**: All 8 gallery pages fetch from `/api/gallery?type={type}`
3. **Vercel Hosting**: Deployed on Vercel (not Hostinger) - supports API routes
4. **External Media**: Images hosted on `roblogo.com`, not in repo

### Critical Files to Know

| File | Purpose |
|------|---------|
| `public/data/galleries.json` | ALL gallery items for ALL 8 galleries |
| `src/lib/gallery.ts` | Gallery CRUD operations, reads/writes galleries.json |
| `src/app/api/gallery/route.ts` | GET endpoint for fetching gallery items |
| `src/app/api/upload/route.ts` | POST endpoint for adding media |
| `src/app/api/auth/route.ts` | Admin password authentication |
| `src/components/gallery/gallery-grid.tsx` | Displays gallery items with lightbox |
| `next.config.js` | Image domains whitelist (roblogo.com, etc.) |

### Gallery Data Structure

```json
// public/data/galleries.json
{
  "photography": {
    "items": [
      {
        "id": "ext-DSC03166",
        "filename": "DSC03166-scaled.jpg",
        "url": "https://roblogo.com/wp-content/uploads/2025/03/DSC03166-scaled.jpg",
        "thumbnail": "https://roblogo.com/wp-content/uploads/2025/03/DSC03166-scaled.jpg",
        "category": "commercial",
        "type": "url",
        "uploadDate": "2026-01-28T12:00:00.000Z",
        "title": "Commercial Photography",
        "description": "Professional photography work",
        "featured": true,
        "isExternal": true,
        "galleries": ["photography"],
        "primaryGallery": "photography"
      }
    ],
    "categories": ["events", "commercial"]
  },
  "motion-graphics": { ... },
  "video": { ... },
  // ... 8 gallery types total
}
```

### How Gallery Pages Work

Every gallery page follows this pattern:

```typescript
// In ExamplesPanel component
useEffect(() => {
  const fetchGallery = async () => {
    const response = await fetch(`/api/gallery?type=${galleryType}`)
    const data = await response.json()
    setGalleryItems(data.items || [])
    setCategories(data.categories || [])
  }
  fetchGallery()
}, [selectedCategory])
```

### Adding New Gallery Items

**Option 1: Edit galleries.json directly**
Add items to the appropriate gallery type's `items` array.

**Option 2: Use admin panel**
Go to `/admin/upload`, login with `ADMIN_PASSWORD`, add URL or upload file.

### Environment Variables (Vercel)

```
ADMIN_PASSWORD=<set in Vercel dashboard>
NODE_ENV=production
```

---

## Changelog

### 2026-02-02 - Shock Studio App & UX Improvements

**Shock Studio** - Wallet-gated AI video transition prompt builder:
- **Route**: `/studio` - requires Web3 wallet connection (MetaMask, etc.)
- **Template Wizard**: 8-step wizard for creating transition prompt templates
  - Role, Source State, Transition Mechanic, Destination State, Style/Timing
  - Quick Fill presets with professional cinematic prompts
  - Variable syntax `{{KEY}}` for reusable templates
  - Lock/unlock components for repeatability
- **Generate Page**: Fill variables and generate prompts
  - Live preview with unfilled variable highlighting
  - **"Cook This Prompt"** - transforms raw templates into mega-prompts with:
    - Technical specs (4K, fps, aspect ratio)
    - Cinematic flourishes and visual enhancement notes
    - AI model guidance section
    - Sound design sync points
- **Creator Tools**: Internal apps accessible from studio home
  - Creator Forge (`/studio/creator-forge`) - content network mapping tool
- **localStorage Persistence**: Templates saved per wallet address

**Hex Logo Loader**:
- Rotating gradient hex border with static centered logo
- Logo clipped to hex shape (no overflow)
- 4-second max timeout - loader never gets stuck
- Soft purple/pink glow effect

**Navigation & UX**:
- Back to Studio link on Creator Forge page
- Creator Tools section on studio dashboard

### 2026-01-29 - Interactive Blog Template & UI Enhancements
- **Interactive Shooter Blog Template**: Blog pages now feature an engaging game layer
  - Floating emoji targets that can be clicked to explode
  - Moving starfield background with parallax effect
  - HUD overlay with crosshair, corner brackets, and score tracking
  - Particle explosion effects on target destruction
  - Applied to: `ai-vs-websites`, `headshot-portrait-styles`, `using-wordpress`
- **Hero Section Enhancement**: Added GenerativeMotion particle background from About page
- **Panel Navigation Update**: Changed "Home" to "Quick Start" across all 13+ service pages
- **Service Cards**: Swapped feature card images to unique GIFs from galleries
  - Get Started: SMP-mash-reel-redrum-L.gif
  - Shock Kit: celeberties-and-civilians-small.gif
  - Video: All-sports-need-videography.gif
  - Website Help: tyson-timelapse-small.gif
- **Contact Page**: Updated YouTube embed to new video (rM2iyf9Ivz8)
- **Blog Listing**: Enhanced with emojis and improved descriptions
- **Admin Panel**: Fixed YouTube thumbnail generation for video previews

### 2026-01-29 - Vercel Migration & Gallery API
- **Migrated from Hostinger to Vercel** for proper API route support
- **Removed static gallery system** - all galleries now use API
- **Single data source**: `public/data/galleries.json` stores all 43 media items
- **Fixed photography page** responsive grid (mobile layout)
- **Fixed motion graphics** hash navigation timing
- **Updated DNS**: shockai.io now points to Vercel

### Previous Changes
- Added external media URLs from roblogo.com
- Implemented admin upload panel with password auth
- Created 8 gallery types with category filtering

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Service Pages](#service-pages)
- [Gallery System](#gallery-system)
- [Admin Upload System](#admin-upload-system)
- [Customization Guide](#customization-guide)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Deployment](#deployment)

## Features

- **Dark Mode Aesthetic**: Deep blacks with electric blue and neon green accents
- **Panel-Based Navigation**: Service pages feature sidebar navigation with smooth panel switching
- **Dynamic Gallery System**: 8 gallery types with category filtering and lightbox viewing
- **Admin Upload Portal**: Password-protected upload system for images, videos, and external URLs
- **Responsive Breakpoints**: `xl:` breakpoint (1280px) for optimal two-column layouts
- **Smooth Animations**: Framer Motion scroll reveals, hover effects, and generative backgrounds
- **TypeScript**: Fully typed for better development experience

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to see the site.

## Service Pages

Each service page features a panel-based layout with sidebar navigation:

| Route | Service | Gallery Type |
|-------|---------|--------------|
| `/photography` | Photography Services | photography |
| `/video` | Video Production | video |
| `/drone` | Drone Services | drone |
| `/podcast` | Shock Podcast | podcast |
| `/media-production` | Media Production | media-production |
| `/motion-graphics` | Motion Graphics & 3D | motion-graphics |
| `/digital-builds` | Websites & Web Apps | digital-builds |
| `/website-redesign` | Website Redesign | website-redesign |
| `/seo` | SEO Services | - |
| `/website-help` | Website Help | - |
| `/blog` | Blog Listing | - |
| `/contact` | Contact Page | - |
| `/about` | About Page | - |
| `/studio` | Shock Studio (Wallet-Gated) | - |
| `/studio/creator-forge` | Creator Forge | - |

### Panel Navigation

Service pages use a consistent panel structure:
- **HeroPanel**: Main landing section with service overview
- **ServicesPanel**: Detailed service offerings (where applicable)
- **ShockKitPanel**: Equipment/tools showcase
- **ExamplesPanel**: Gallery showcase with category filtering
- **ContactPanel**: Contact form and information

Navigate directly to galleries using hash URLs: `/photography#view-gallery`

## Shock Studio (Wallet-Gated App)

A Web3-gated internal tool for creating AI video transition prompt templates.

### Access Requirements
- Connect Web3 wallet (MetaMask, WalletConnect, Coinbase Wallet)
- Templates are saved per wallet address in localStorage

### Routes
| Route | Description |
|-------|-------------|
| `/studio` | Dashboard - view templates, access Creator Tools |
| `/studio/templates/new` | 8-step wizard to create new template |
| `/studio/templates/[id]` | View/edit existing template |
| `/studio/templates/[id]/generate` | Fill variables and generate prompt |
| `/studio/creator-forge` | Content network mapping tool |

### Template Structure
```typescript
interface TransitionTemplate {
  id: string
  walletAddress: string
  name: string
  category: string
  role: TemplateComponent        // AI persona/expertise
  sourceState: TemplateComponent // Opening shot description
  transitionMechanic: TemplateComponent // Core motion (lockable)
  destinationState: TemplateComponent  // Landing shot description
  styleTiming: {
    duration: string
    motionCurve: string
    energy: 'low' | 'medium' | 'high' | 'cinematic'
  }
}
```

### Variable Syntax
Use `{{VARIABLE_NAME}}` in template text:
- `{{SUBJECT}}` - Main subject
- `{{ENVIRONMENT}}` - Location/setting
- `{{NEW_SUBJECT}}` - Post-transition subject

### "Cook This Prompt" Feature
Transforms raw templates into professional mega-prompts:
- Technical specifications (4K, fps, duration)
- Creative direction based on energy settings
- Scene breakdown with camera notes
- Visual enhancement notes (color science, depth)
- AI model guidance section

### Key Files
| File | Purpose |
|------|---------|
| `src/app/studio/layout.tsx` | Wallet gate wrapper |
| `src/app/studio/page.tsx` | Dashboard with Creator Tools |
| `src/types/studio.ts` | TypeScript interfaces |
| `src/lib/studio/template-storage.ts` | localStorage CRUD |
| `src/components/studio/wizard/` | Wizard step components |

---

## Interactive Blog Template

Blog pages use an interactive "shooter" game template for engagement:

### Template Features

- **Moving Stars Background**: CSS-animated starfield using radial gradients
- **HUD Overlay**: Crosshair, corner brackets, and status readouts
- **Floating Emoji Targets**: Click to explode with particle effects
- **Score Tracking**: Points display in bottom-left HUD
- **Parallax Content**: Main content moves subtly with mouse

### Blog Template Structure

```typescript
// Key state for shooter mechanics
const [asteroids, setAsteroids] = useState<Asteroid[]>([])
const [particles, setParticles] = useState<Particle[]>([])
const [clickEffects, setClickEffects] = useState<ClickEffect[]>([])
const [scorePopups, setScorePopups] = useState<ScorePopup[]>([])
const [destroyedCount, setDestroyedCount] = useState(0)
const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

// Emoji targets per blog theme
const EMOJIS = ['🔧', '⚡', '🚀', '💻'] // Tech-themed for WordPress blog
const EMOJIS = ['📸', '🎬', '💡', '✨'] // Photography-themed for headshot blog
```

### Blog Pages Using Template

| Route | Theme | Emojis |
|-------|-------|--------|
| `/blog/ai-vs-websites` | AI/Tech | 🤖 |
| `/blog/using-wordpress` | Web Dev | 🔧⚡🚀💻🔒🌐📊⚙️ |
| `/blog/headshot-portrait-styles` | Photography | 📸🎬💡✨🌟💎🎯⚡ |

### Required CSS Animations

```css
@keyframes starMove { from { transform: translateY(0); } to { transform: translateY(-2000px); } }
@keyframes scanMove { from { background-position-y: 0; } to { background-position-y: 100px; } }
@keyframes ripple { 0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(2); opacity: 0; } }
```

### Panel Navigation Code Pattern

```typescript
// Check for hash on mount
useEffect(() => {
  const checkHash = () => {
    if (window.location.hash === '#view-gallery') {
      setActivePanel('examples')
    }
  }
  checkHash()
  const timeout = setTimeout(checkHash, 100) // Timing fix for Next.js
  window.addEventListener('hashchange', checkHash)
  return () => {
    clearTimeout(timeout)
    window.removeEventListener('hashchange', checkHash)
  }
}, [])
```

## Gallery System

### Gallery Types

The site supports 8 gallery types:

```typescript
export const GALLERY_TYPES = [
  'photography',      // 33 items - commercial, events
  'video',            // 1 item
  'drone',            // 0 items
  'podcast',          // 1 item
  'media-production', // 0 items
  'motion-graphics',  // 9 items - 3d-renders, animations, ai-generated
  'digital-builds',   // 0 items
  'website-redesign'  // 0 items
] as const
```

### Gallery Data Location

**ALL gallery data is in ONE file**: `public/data/galleries.json`

The `src/lib/gallery.ts` file reads/writes this JSON file:

```typescript
const GALLERIES_JSON_PATH = path.join(process.cwd(), 'public', 'data', 'galleries.json')

function loadGalleriesJson(): Record<GalleryType, GalleryData> {
  // Loads and caches galleries.json (5 second cache TTL)
}
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/gallery?type={type}` | GET | Fetch gallery items by type |
| `/api/gallery?type={type}&category={cat}` | GET | Fetch filtered by category |
| `/api/upload` | POST | Upload new media (requires auth) |
| `/api/auth` | POST | Validate admin password |
| `/api/media` | GET | Get all media with stats |
| `/api/media` | PATCH | Update media metadata |
| `/api/media?id={id}` | DELETE | Delete media item |

### GalleryItem Interface

```typescript
interface GalleryItem {
  id: string                    // Unique identifier
  filename: string              // Original filename
  url: string                   // Full URL or /media/... path
  thumbnail: string             // Thumbnail URL
  category: string              // Category within gallery
  type: 'image' | 'video' | 'url'
  uploadDate: string            // ISO date string
  title?: string
  description?: string
  featured?: boolean
  isExternal?: boolean          // true for roblogo.com URLs
  galleries?: GalleryType[]     // Can appear in multiple galleries
  primaryGallery?: GalleryType  // Main gallery
}
```

## Admin Upload System

### Accessing the Upload Portal

Navigate to `/admin/upload` and enter the admin password.

**Password**: Set via `ADMIN_PASSWORD` environment variable

### Upload Modes

1. **File Upload**: Direct upload of images/videos
   - Images are optimized and resized (max 2000px)
   - Thumbnails are auto-generated (400x400)
   - Max file size: 50MB

2. **URL Mode**: Add external media (YouTube, Vimeo, hosted images)
   - No file storage required
   - Saved directly to galleries.json

### Authentication

Admin routes use Bearer token auth:

```typescript
// Request header
Authorization: Bearer {ADMIN_PASSWORD}

// API checks
const authHeader = request.headers.get('authorization')
const token = authHeader?.replace('Bearer ', '')
if (token !== process.env.ADMIN_PASSWORD) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

## Customization Guide

### Changing Colors

Edit `tailwind.config.js`:
- `primary`: Background colors (default: deep black)
- `secondary`: Main accent color (default: electric blue)
- `accent`: Secondary accent color (default: neon green)

### Adding External Image Domains

Edit `next.config.js`:

```javascript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'roblogo.com' },
    { protocol: 'https', hostname: 'your-domain.com' },
  ],
}
```

### Adding Gallery Categories

Edit the `categories` array in `public/data/galleries.json` for each gallery type.

### Responsive Breakpoints

- `xl:` (1280px) - Two-column grid layouts
- `lg:` (1024px) - Sidebar visibility
- `md:` (768px) - Medium device adjustments
- `sm:` (640px) - Small device adjustments

## Project Structure

```
ShockAI/
├── public/
│   └── data/
│       └── galleries.json          # ALL GALLERY DATA HERE
├── src/
│   ├── app/
│   │   ├── page.tsx                # Homepage
│   │   ├── layout.tsx              # Root layout
│   │   ├── api/
│   │   │   ├── gallery/route.ts    # Gallery GET endpoint
│   │   │   ├── upload/route.ts     # Upload POST endpoint
│   │   │   ├── auth/route.ts       # Auth POST endpoint
│   │   │   └── media/route.ts      # Media CRUD endpoints
│   │   ├── admin/
│   │   │   └── upload/page.tsx     # Admin upload portal
│   │   ├── photography/page.tsx    # Photography service page
│   │   ├── motion-graphics/page.tsx
│   │   ├── video/page.tsx
│   │   ├── drone/page.tsx
│   │   ├── podcast/page.tsx
│   │   ├── media-production/page.tsx
│   │   ├── digital-builds/page.tsx
│   │   ├── website-redesign/page.tsx
│   │   └── blog/
│   │       ├── page.tsx              # Blog listing page
│   │       ├── ai-vs-websites/       # Interactive shooter blog
│   │       ├── using-wordpress/      # Interactive shooter blog
│   │       └── headshot-portrait-styles/ # Interactive shooter blog
│   ├── components/
│   │   ├── gallery/
│   │   │   ├── gallery-grid.tsx    # Grid display + lightbox
│   │   │   └── lightbox.tsx        # Fullscreen viewer
│   │   ├── sections/
│   │   │   ├── hero.tsx              # Hero with GenerativeMotion background
│   │   │   ├── gallery-showcase.tsx  # Homepage gallery cards
│   │   │   └── ...
│   │   ├── generative-motion.tsx     # Canvas particle animation
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── container.tsx
│   │       └── section.tsx
│   └── lib/
│       └── gallery.ts              # Gallery CRUD functions
├── next.config.js                  # Image domains, settings
├── tailwind.config.js              # Theme colors
└── package.json
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Image Processing**: Sharp
- **Language**: TypeScript
- **Hosting**: Vercel

## Deployment

### Vercel (Current Production)

Site is deployed at **https://shockai.io** via Vercel.

**Environment Variables in Vercel:**
```
ADMIN_PASSWORD=<set in Vercel dashboard>
NODE_ENV=production
```

**Auto-deploy**: Push to `main` branch triggers automatic deployment.

**DNS Configuration:**
- A record `@` → `76.76.21.21`
- CNAME `www` → `cname.vercel-dns.com`

### Why Vercel over Hostinger?

Hostinger's "Next.js hosting" only runs `npm build` - it doesn't start a Node.js server. API routes require a running server, which Vercel provides via serverless functions.

### Local Development

```bash
npm run dev     # Development server at localhost:3000
npm run build   # Production build
npm start       # Production server (requires build first)
```

## Common Tasks

### Add a new gallery image

**Option 1: Via Admin Panel (Local Only)**
1. Run `npm run dev` locally
2. Go to `http://localhost:3000/admin/upload`
3. Upload file or add URL
4. Files save to `public/media/`, metadata to `galleries.json`
5. Commit and push - auto-deploys to Vercel

**Option 2: Edit galleries.json directly**
1. Edit `public/data/galleries.json`
2. Add item to the appropriate gallery's `items` array
3. Commit and push - auto-deploys to Vercel

> **Note:** File uploads don't work on Vercel (read-only filesystem). Always upload locally then push to git.

### Change admin password

1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Update `ADMIN_PASSWORD`
3. Redeploy

### Add a new gallery type

1. Add type to `GALLERY_TYPES` in `src/lib/gallery.ts`
2. Add empty structure to `galleries.json`
3. Create page at `src/app/{type}/page.tsx`
4. Add card to `src/components/sections/gallery-showcase.tsx`

---

## SEO Configuration

### Metadata System

All page metadata is centralized in `src/lib/metadata.ts`. The `generateLocalMetadata()` function auto-injects:
- Title template: `{Page Title} | Norfolk & Virginia Beach | ShockAI`
- Location suffix on all descriptions
- 28 local keywords (Norfolk, Virginia Beach, Ghent, Chics Beach, etc.)
- Self-referencing canonical URLs

### JSON-LD Schema

The `src/components/seo/json-ld-schema.tsx` component injects:
- `ProfessionalService` schema with Norfolk GPS coordinates
- `Organization` schema with social `sameAs` links
- `BreadcrumbList` for funnel navigation

### Sitemap

Dynamic sitemap at `src/app/sitemap.ts` includes all 41 routes with priority weighting:
- 1.0: Homepage
- 0.95: Get Started (conversion page)
- 0.9: Funnel pages
- 0.8: Service pages
- 0.6: Blog posts

### Image Alt Text Workflow

When adding images, use location-tagged alt text for local SEO:

**Naming Convention:**
```
{service}-{neighborhood}-{year}
```

**Examples:**
| Service | Alt Text |
|---------|----------|
| Drone | `"Aerial drone photography Sandbridge Virginia Beach 2026"` |
| Video | `"4K video production Downtown Norfolk NEON District"` |
| Headshots | `"Professional LinkedIn headshot photography Ghent Norfolk"` |
| Website | `"Custom web development Town Center Virginia Beach"` |

**Neighborhood Zones:**
- **Creative Hub**: Ghent, Downtown Norfolk, NEON District
- **Business District**: Town Center VB, Greenbrier
- **Coastal/Real Estate**: Chics Beach, Sandbridge, Oceanfront, Great Neck
- **Upscale Residential**: Larchmont, Hilltop, Great Neck

---

## License

Private - All Rights Reserved
