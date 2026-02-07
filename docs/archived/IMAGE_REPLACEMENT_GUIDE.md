# Image Replacement Guide for PSP.Pro

## Overview
This guide explains how to replace placeholder images with your high-quality team photography while maintaining optimal performance and aspect ratios.

## Quick Start

### Admin Interface
1. Navigate to `/admin/images` in your dashboard
2. Each section shows the current placeholder image
3. Drag & drop or click to upload your replacement image
4. System will automatically optimize and deploy

## Image Specifications

### Hero Section
- **Dimensions:** 1920x1080px (16:9)
- **Purpose:** Main landing page background
- **Content:** High-energy action shot - pitcher in motion, batter swing, or fielding action
- **Tips:**
  - Leave room for text overlay in center
  - Ensure dynamic movement capture
  - Show training facility in background
  - Use high shutter speed for crisp motion

### Feature Cards
- **Dimensions:** 600x400px (3:2)
- **Quantity:** 3 images needed
- **Images:**
  1. **Velocity Tracking:** Screenshot of velocity dashboard with performance charts
  2. **Drill Bank:** Athletes training with professional equipment
  3. **Personalized Training:** One-on-one coaching session
- **Tips:**
  - Clear subject focus
  - Well-lit, professional quality
  - Show technology/equipment in use

### Coach Headshots
- **Dimensions:** 400x400px (1:1 square)
- **Quantity:** 3 headshots
- **Coaches:**
  1. Coach Rachel - Lead Pitching Coach
  2. Coach Mike - Velocity Training Specialist
  3. Coach Sarah - Movement & Mechanics Coach
- **Tips:**
  - Eye-level camera position
  - Professional lighting (three-point setup ideal)
  - Friendly, approachable expression
  - PSP branded gear/clothing
  - Solid or slightly blurred background
  - High-resolution for quality

### Facility Photos
- **Dimensions:** 1200x675px (16:9)
- **Quantity:** 3 photos
- **Locations:**
  1. **Training Center:** Main facility overview
  2. **Equipment:** Professional training equipment and technology
  3. **Indoor Bay:** Indoor training bay with batting cages
- **Tips:**
  - Wide-angle lens recommended
  - Show space and layout
  - Highlight professional equipment
  - Ensure excellent lighting
  - Clean, organized appearance

### Drill Thumbnails
- **Dimensions:** 320x180px (16:9)
- **Purpose:** Video drill demonstrations
- **Content:** Freeze frame of key position/movement
- **Tips:**
  - Capture at peak action moment
  - Clear demonstration of technique
  - Athlete clearly visible
  - Good lighting and focus

### Profile Photos
- **Dimensions:** 200x200px (1:1 square)
- **Purpose:** User avatars throughout platform
- **Content:** Athlete headshots
- **Tips:**
  - Face clearly visible
  - Friendly expression
  - Uploaded by athletes themselves

### Achievement Badges
- **Dimensions:** 120x120px (1:1 square)
- **Format:** PNG with transparent background
- **Content:** Illustrated graphics (NOT photos)
- **Examples:**
  - Trophy icons for milestones
  - Lightning bolt for velocity achievements
  - Flame for training streaks
  - Target for accuracy goals
- **Tips:**
  - Simple, iconic design
  - Bold, recognizable shapes
  - Use PSP brand colors (Cyan #00B4D8, Orange #B8301A)
  - Vector graphics preferred (export to PNG)

## Photography Shoot Checklist

### Tier 1 - Critical (Shoot First)
- [ ] 1 Hero banner action shot (1920x1080)
- [ ] 3 Coach headshots (400x400 each)
- [ ] 1 Training facility overview (1200x675)

### Tier 2 - High Priority
- [ ] 3 Feature card images (600x400 each)
- [ ] 2 Additional facility photos (1200x675 each)
- [ ] 5 Drill video recordings for thumbnails

### Tier 3 - Nice to Have
- [ ] Before/after comparison shots (800x600)
- [ ] Team group photos
- [ ] Equipment detail shots
- [ ] Athlete testimonial backgrounds

## Technical Requirements

### File Format
- **Primary:** WebP (best compression)
- **Fallback:** JPG (90% quality)
- **Transparent Graphics:** PNG

### File Size
- **Maximum:** 5MB per image
- **Recommended:** Under 2MB
- **Hero Images:** Under 500KB (after optimization)
- **Thumbnails:** Under 100KB

### Resolution
- Shoot at **2x display size** for retina screens
- Example: 1920x1080 display → shoot at 3840x2160

### Color Profile
- **sRGB** color space
- Calibrated monitor recommended for editing

## Upload Process

### Via Admin Interface (`/admin/images`)
1. Select category (Hero, Features, Coaches, etc.)
2. Upload image
3. System automatically:
   - Converts to WebP
   - Generates responsive sizes
   - Optimizes compression
   - Uploads to CDN
4. Verify preview
5. Publish changes

### Via Supabase Storage (Advanced)
1. Navigate to Supabase Dashboard
2. Go to Storage → `images` bucket
3. Upload to appropriate folder:
   - `/hero/` - Hero images
   - `/features/` - Feature card images
   - `/coaches/` - Coach headshots
   - `/facility/` - Facility photos
   - `/drills/` - Drill thumbnails
4. Update image URLs in `/src/lib/placeholder-images.ts`

## Image Optimization Tips

### Before Upload
1. **Crop to exact aspect ratio** in Photoshop/Lightroom
2. **Export at 2x size** for retina displays
3. **Compress with TinyPNG** or similar tool
4. **Check file size** - aim for under 2MB

### Lighting Checklist
- [ ] No harsh shadows on faces
- [ ] Even, professional lighting
- [ ] Natural or studio lights (avoid mixed lighting)
- [ ] White balance corrected

### Composition Checklist
- [ ] Subject in focus
- [ ] Clean, uncluttered background
- [ ] Rule of thirds applied
- [ ] Proper headroom in portraits
- [ ] Action captured at peak moment

## Brand Guidelines

### Colors to Emphasize
- **Cyan (#00B4D8):** Technology, data, analytics
- **Orange (#B8301A):** Action, energy, achievement
- **Dark Background:** Most images will be on dark backgrounds

### Style Guide
- **Mood:** Professional yet approachable
- **Energy:** Dynamic, high-energy action shots
- **Technology:** Show equipment, tablets, radar guns
- **Results:** Before/after, data displays, progress

## Current Placeholder Sources
All current placeholders are sourced from:
- Unsplash (free high-quality stock photos)
- Aspect ratios are correct
- Replace with your actual team photography

## Next Steps After Upload

### 1. Verify Deployment
- Check image loads on homepage
- Test responsive sizes (mobile, tablet, desktop)
- Verify loading speed

### 2. Monitor Performance
- Use Lighthouse to check page speed
- Ensure images are lazy-loading
- Check Core Web Vitals

### 3. Update Regularly
- Add new drill videos monthly
- Update coach photos annually
- Refresh hero image seasonally
- Add athlete success photos

## Support

For technical issues with image uploads:
1. Check image meets dimension requirements
2. Verify file size under 5MB
3. Ensure file format is supported (JPG, PNG, WebP)
4. Contact support at info@propersports.pro

## Advanced: Custom Image URLs

To manually update image sources, edit:
```typescript
// /src/lib/placeholder-images.ts

export const PLACEHOLDER_IMAGES = {
  hero: {
    main: 'YOUR_IMAGE_URL_HERE',
    // ...
  }
}
```

Then rebuild and deploy:
```bash
npm run build
```

---

**Pro Tip:** Use the exact dimensions listed in this guide when shooting/editing to avoid cropping issues during upload.
