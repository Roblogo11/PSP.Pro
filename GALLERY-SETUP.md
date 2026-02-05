# Gallery Management System Setup

## Overview
Simple folder-based gallery system with auto-optimization for images and videos, plus URL linking for external media (YouTube, Vimeo, etc.).

## How It Works

### Upload Flow

**Option 1: Upload File**
1. Photographer goes to `/admin/upload`
2. Logs in with password (set via ADMIN_PASSWORD env var)
3. Selects gallery type (Photography, Video, Drone, or Podcast)
4. Selects category
5. Clicks "Upload File" mode
6. Uploads file(s)
7. Images are automatically optimized and thumbnails generated
8. Media appears instantly on gallery pages

**Option 2: Add URL Link** (Recommended for videos!)
1. Photographer goes to `/admin/upload`
2. Logs in with password
3. Selects gallery type and category
4. Clicks "Add URL Link" mode
5. Pastes YouTube/Vimeo/direct media URL
6. Adds title and description
7. Link appears instantly in gallery - no file storage needed!

### Folder Structure
```
public/media/
├── photography/
│   ├── products/
│   ├── events/
│   ├── portraits/
│   ├── lifestyle/
│   ├── headshots/
│   └── commercial/
├── video/
│   ├── corporate/
│   ├── events/
│   ├── promotional/
│   ├── documentary/
│   └── wedding/
├── drone/
│   ├── aerial/
│   ├── real-estate/
│   ├── events/
│   ├── landscape/
│   └── construction/
└── podcast/
    ├── interviews/
    ├── tutorials/
    ├── reviews/
    ├── discussions/
    ├── live-shows/
    └── behind-the-scenes/
```

## Setup Instructions

### 1. Change Admin Password
Edit `.env.local` and change the password:
```
ADMIN_PASSWORD=your_secure_password_here
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Access Admin Panel
Navigate to: `http://localhost:3000/admin/upload`

### 4. Upload Media
- Select gallery type and category
- Choose file (images or videos)
- Optionally add title and description
- Mark as featured if needed
- Click Upload

## Using Galleries on Pages

### Import Gallery Components
```tsx
import { getGalleryItems } from '@/lib/gallery'
import { GalleryGrid } from '@/components/gallery/gallery-grid'
```

### Display Gallery
```tsx
export default function GalleryPage() {
  const items = getGalleryItems('photography') // or 'video' or 'drone'

  return (
    <div>
      <h1>Photography Gallery</h1>
      <GalleryGrid items={items} columns={3} />
    </div>
  )
}
```

### Filter by Category
```tsx
const items = getGalleryItems('photography', 'products')
```

## Features

### Automatic Image Optimization
- Resizes images to max 2000px width
- Compresses to 85% quality (JPEG)
- Generates 400px thumbnails
- Uses Sharp for fast processing

### Lightbox Viewer
- Click any image to view full size
- Navigate with arrow keys or buttons
- Press ESC to close
- Shows image info and metadata

### Security
- Password protected admin panel
- File type validation
- File size limit (50MB)
- Sanitized filenames

## Deployment to Hostinger

### 1. Environment Variables
Add to Hostinger environment:
```
ADMIN_PASSWORD=your_production_password
```

### 2. Media Folder Permissions
Ensure `/public/media/` folder is writable

### 3. Upload Limits
Check Hostinger's upload size limits and adjust if needed

### 4. Build Command
```bash
npm run build
npm start
```

## File & URL Limits

### File Upload
- Individual files: 50MB max
- Supported images: JPG, PNG, GIF, WebP
- Supported videos: MP4, MOV, AVI, WebM

### URL Links
- No size limits!
- Supported platforms: YouTube, Vimeo
- Direct URLs: Any image or video URL
- Benefits: No storage used, faster site, professional streaming

## Best Practices

### When to Upload Files vs Add URLs

**Upload Files for:**
- Small images (product photos, headshots, portraits)
- Photos you want optimized and compressed
- Media you own exclusively

**Add URLs for:**
- Videos (always recommended!)
- Large files that would slow down the site
- YouTube/Vimeo hosted content
- Media hosted elsewhere that you want to showcase

**Why URLs are Better for Videos:**
- Zero storage impact on your app
- Professional streaming quality
- No bandwidth costs for you
- Faster page loads
- Better mobile performance

## Troubleshooting

### Images not appearing
- Check folder permissions
- Verify metadata.json exists in gallery folder
- Check browser console for errors

### Upload fails
- Verify file size under 50MB
- Check file type is supported
- Ensure admin password is correct

### Lightbox not working
- Clear browser cache
- Check for JavaScript errors in console

## Adding New Categories

Edit `src/config/gallery-categories.ts` and add new categories:
```typescript
photography: [
  // existing categories...
  {
    id: 'new-category',
    label: 'New Category',
    description: 'Description here'
  }
]
```

Then create the folder:
```bash
mkdir -p public/media/photography/new-category
```
