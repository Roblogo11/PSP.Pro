# PSP.Pro Platform User Guide
## Athletic OS - Complete User Manual

---

## Table of Contents
1. [Getting Started](#getting-started)
2. [Athlete Guide](#athlete-guide)
3. [Coach/Admin Guide](#coachadmin-guide)
4. [Video Protection & Security](#video-protection--security)
5. [Quick Reference](#quick-reference)

---

## Getting Started

### First Time Setup

**For Athletes:**
1. Receive invitation email from your coach
2. Click the sign-up link
3. Create your account with email/password
4. Complete your profile (age, sport, goals)
5. Start exploring your dashboard!

**For Coaches/Admins:**
1. Log in with your coach credentials
2. Access the Admin Control Center
3. Add your athletes
4. Import or create drills
5. Start assigning training!

---

## Athlete Guide

### Your Dashboard (Locker)

**What You'll See:**
- **Total Sessions**: How many training sessions you've completed
- **Average Velocity**: Your current velocity average (last 10 sessions)
- **Drills Completed**: Total drills you've finished
- **Current Streak**: Days in a row you've been active
- **Velocity Chart**: Visual progress of your velocity improvements
- **Next Session**: Upcoming training session details

**Navigation:**
- **Athlete Locker** 🏠 - Your main dashboard
- **Drill Bank** 💪 - Browse all available drills
- **Sessions** 📅 - View and manage your training sessions
- **Progress** 📈 - Track your performance metrics
- **Achievements** 🏆 - Unlock badges and milestones
- **Booking** 🕐 - Book new training sessions
- **Settings** ⚙️ - Update your profile and preferences

### How to Book a Session

1. Click **"Booking"** in the sidebar
2. Select your preferred date
3. Choose an available time slot
4. Select the type of training (1-on-1, Group, etc.)
5. Review pricing and confirm
6. Complete payment (Stripe secure checkout)
7. Receive confirmation email

**Cancellation Policy:**
- 24+ hours in advance: **Full refund**
- Within 24 hours: **No refund**
- Refunds processed within 3-5 business days

### Viewing Your Sessions

1. Go to **"Sessions"** in the sidebar
2. Use filters: **All**, **Upcoming**, or **Past**
3. Each session shows:
   - Coach name and photo
   - Date, time, and location
   - Session type
   - Notes from coach
   - Peak velocity (for completed sessions)

**For Upcoming Sessions:**
- **Cancel Session** button (with refund policy)
- **Reschedule** button (pick new time slot)

### Completing Assigned Drills

1. Check **"Assigned Drills"** on your Locker dashboard
2. Click on any drill to view:
   - Video demonstration
   - Written instructions
   - Equipment needed
   - Duration and difficulty
3. Complete the drill
4. Mark as complete when done
5. Your coach will see your progress!

### Updating Your Settings

1. Go to **"Settings"** in the sidebar
2. Update:
   - Full name
   - Email address
   - Phone number
   - Profile photo
   - Notification preferences
   - Privacy settings
3. Click **"Save Changes"**
4. Success message confirms update

---

## Coach/Admin Guide

### Admin Control Center

**Main Dashboard (`/admin`):**
- **Quick Stats**: Athletes, sessions, drills, pending bookings
- **Quick Actions**: Create drill, schedule session, add athlete, upload video
- **Platform Management**: Links to all admin features

**Admin Tools in Sidebar:**
- **Admin Control** 🛡️ - Main control center
- **Athletes** 👥 - Manage all athletes
- **Drills** 💪 - Drill bank management
- **Bookings** 📅 - Session scheduling
- **Media Library** 🎥 - Video content
- **Analytics** 📊 - Performance insights

### Managing Athletes

**View All Athletes (`/admin/athletes`):**
- Grid view of all registered athletes
- Search by name or email
- Filter by sport type (Baseball, Softball, Other)
- See real-time stats for each athlete:
  - Total sessions completed
  - Drills finished
  - Average velocity
  - Max velocity
  - Pending drill assignments

**Add New Athlete:**
1. Click **"Add Athlete"** button
2. Fill in required fields:
   - Full Name (required)
   - Email (required)
   - Phone number
   - Age
   - Athlete Type (Baseball/Softball/Other)
   - Velocity Goal (MPH)
3. Optional: Add parent/guardian info
   - Parent email
   - Parent phone
   - Emergency contact
4. Click **"Create Athlete"**
5. Athlete receives auto-generated login credentials via email

**Edit Athlete Profile:**
1. Click on any athlete card
2. Click **"Edit"** button
3. Update any field
4. Click **"Update Athlete"**
5. Changes save immediately

**Delete Athlete:**
1. Click on athlete card
2. Click **"Delete"** button
3. Confirm deletion (⚠️ **WARNING**: This removes all their data)
4. Athlete account and all progress is permanently deleted

### Managing Drills

#### Single Drill Creation (`/admin/drills`)

1. Click **"Create Drill"** button
2. Fill in drill details:
   - **Title** (required) - e.g., "Long Toss Progression"
   - **Description** - Brief overview
   - **Instructions** - Step-by-step guide
   - **Video Source**:
     - **YouTube URL** (recommended) - Paste your YouTube link
     - **Upload File** (coming soon) - Upload MP4/MOV
   - **Thumbnail URL** - Custom thumbnail image
   - **Category** - Mechanics, Speed, Power, Recovery, Warmup, Conditioning
   - **Difficulty** - Beginner, Intermediate, Advanced
   - **Duration** - In seconds (converts to minutes)
   - **Tags** - Add searchable tags (press Enter between tags)
   - **Equipment Needed** - List required equipment
   - **Focus Areas** - Body areas/skills targeted
   - **Published** - Make visible to athletes
   - **Featured** - Highlight on dashboard
3. Click **"Create Drill"**
4. Drill appears in library immediately

#### Bulk Drill Import (`/admin/drills/import`)

**For importing multiple YouTube videos at once:**

1. Click **"Bulk Import"** button on Drills page
2. Download the CSV template
3. Open template in Excel or Google Sheets
4. Fill in your drills (one per row):

| Field | Required | Format | Example |
|-------|----------|--------|---------|
| title | ✅ | Text | Long Toss Progression |
| description | ⬜ | Text | Build arm strength through distance |
| youtube_url | ✅ | URL | https://youtube.com/watch?v=abc123 |
| category | ✅ | mechanics/speed/power/recovery/warmup/conditioning | mechanics |
| difficulty | ⬜ | beginner/intermediate/advanced | intermediate |
| duration_minutes | ⬜ | Number | 15 |
| tags | ⬜ | Semicolon separated | throwing;arm-strength;velocity |
| equipment | ⬜ | Semicolon separated | baseball;partner |
| focus_areas | ⬜ | Semicolon separated | arm;shoulder;mechanics |

5. Save your CSV file
6. Upload the CSV file
7. Review import results:
   - ✅ Success count
   - ❌ Failed count with error details
8. Click **"View All Drills"** to see imported drills

**Pro Tip:** Start with 3-5 drills to test the CSV format, then bulk import the rest!

#### Assigning Drills to Athletes

**Method 1: From Drill Bank**
1. Go to **"Drills"** in admin sidebar
2. Find the drill you want to assign
3. Click **"Assign"** button on that drill
4. Multi-select athletes (checkboxes)
5. Set priority: Low, Medium, High
6. Optional: Add due date
7. Optional: Add notes for athletes
8. Click **"Assign to X Athletes"**
9. Athletes see the drill in their Locker dashboard

**Method 2: From Athlete Profile**
1. Go to **"Athletes"** in admin sidebar
2. Click on an athlete card
3. Click **"Assign Drills"** button
4. Select drill(s) from your library
5. Set details (priority, due date, notes)
6. Click **"Assign"**

### Managing Bookings

**View All Bookings (`/admin/bookings`):**
- Table view of all session bookings
- Filter by:
  - **Status**: All, Pending, Confirmed, Cancelled
  - **Date**: All, Upcoming, Past
- Search by athlete name or service type

**Booking Details Shown:**
- Athlete name and email
- Service type and duration
- Date and time
- Coach assigned
- Location
- Payment amount and status
- Booking status

**Actions Available:**
- **Pending Bookings**:
  - **Confirm** - Approve the session
  - **Cancel** - Reject/cancel the booking
- **Confirmed Bookings**:
  - **Mark Complete** - Session finished
  - **Cancel** - Cancel if needed

**Revenue Tracking:**
- Dashboard shows total revenue
- Filter by payment status: Paid, Pending, Failed, Refunded
- Export data (coming soon)

### Setting Coach Availability

**(Coming soon in Phase 3)**
- Set recurring weekly availability
- Block out dates
- Set different rates for different times
- Auto-accept bookings or manual approval

---

## Video Protection & Security

### YouTube Video Protection (Recommended)

**Why YouTube is Secure:**
✅ **Cannot be downloaded** - YouTube prevents direct video downloads
✅ **Embedded playback** - Videos play within your site, not on YouTube
✅ **You control the content** - Delete or private any time from your YouTube account
✅ **Analytics** - See view counts, watch time, engagement
✅ **Professional hosting** - 99.9% uptime, fast loading worldwide
✅ **Monetization protection** - Can disable ads on embedded videos
✅ **Copyright strikes** - YouTube's copyright system protects YOUR videos

**How to Make Your YouTube Videos Private/Unlisted:**
1. Go to YouTube Studio
2. Select the video
3. Set visibility to **"Unlisted"**:
   - Not searchable on YouTube
   - Only people with the link can watch
   - Perfect for PSP.Pro embedded videos
4. Copy the video URL
5. Paste into PSP.Pro drill creation

**Best Practices:**
- Use **Unlisted** (not Public) for training videos
- Create a dedicated PSP.Pro playlist
- Disable comments on unlisted videos
- Add watermarks in video editor before uploading
- Use descriptive titles for easy management

### Native Video Upload Protection

**(Coming in Phase 3)**

**Planned Security Features:**
- **Signed URLs** - Temporary access links that expire
- **Stream-only delivery** - Cannot download, only stream
- **Watermarking** - Dynamic watermarks with athlete name/date
- **Geofencing** - Restrict viewing to certain locations
- **Device limits** - Limit simultaneous streams
- **Session tracking** - Monitor who watches what and when

**Storage:**
- Stored in Supabase Storage with encryption
- Automatic backups
- CDN delivery for fast loading
- Supports MP4, MOV, WebM formats
- Max file size: 500MB per video

### Additional Security Measures

**Account Protection:**
- All accounts require email verification
- Password requirements: 8+ characters
- Optional: Two-factor authentication (Phase 3)
- Automatic session timeout after inactivity

**Content Access Control:**
- Athletes only see drills assigned to them or marked "Published"
- Unpublished drills are coach-only
- Role-based permissions (Athlete vs Coach vs Admin)
- Audit logging (Phase 3) - track who accessed what

**Payment Security:**
- Stripe integration (PCI DSS compliant)
- No credit card data stored on PSP.Pro servers
- Secure checkout with SSL encryption
- Automatic fraud detection by Stripe

---

## Quick Reference

### Keyboard Shortcuts
- `Ctrl/Cmd + K` - Quick search (coming soon)
- `Esc` - Close modal
- `Enter` - Submit form

### Common URLs
- **Home**: `/`
- **Athlete Dashboard**: `/locker`
- **Admin Dashboard**: `/admin`
- **Drills**: `/drills` (athlete) or `/admin/drills` (coach)
- **Sessions**: `/sessions`
- **Bookings**: `/booking`
- **Settings**: `/settings`
- **Bulk Import**: `/admin/drills/import`

### Contact Support
- **Email**: support@psp.pro (coming soon)
- **In-app**: Settings → Help & Support (coming soon)
- **Phone**: (555) 123-4567 (coming soon)

### Status Indicators

**Session Status:**
- 🟡 **Pending** - Awaiting confirmation
- 🟢 **Confirmed** - Session scheduled
- 🔵 **Completed** - Session finished
- 🔴 **Cancelled** - Session cancelled
- ⚫ **No-Show** - Athlete didn't attend

**Payment Status:**
- 🟢 **Paid** - Payment successful
- 🟡 **Pending** - Payment processing
- 🔴 **Failed** - Payment unsuccessful
- 🟠 **Refunded** - Money returned

### User Roles

**Athlete:**
- View assigned drills
- Book sessions
- Track progress
- Update profile
- Cannot access admin features

**Coach:**
- All athlete features
- Create/edit drills
- Assign drills to athletes
- View all athletes
- Manage bookings
- Access analytics

**Admin:**
- All coach features
- Manage coaches
- Platform settings
- Billing management
- Advanced analytics

---

## User Flow Diagrams

### Athlete Flow: "I want to improve my velocity"

```
1. Log in to PSP.Pro
   ↓
2. View Locker Dashboard
   - See current avg velocity
   - Check assigned drills
   ↓
3. Click on assigned drill
   - Watch video demo
   - Read instructions
   ↓
4. Complete drill at home/field
   ↓
5. Mark drill as complete
   ↓
6. Book 1-on-1 session with coach
   - Choose date/time
   - Complete payment
   ↓
7. Attend session
   - Coach measures velocity
   - Records peak throw
   ↓
8. View updated stats on dashboard
   - New velocity logged
   - Progress chart updated
   - Achievements unlocked
```

### Coach Flow: "I want to onboard a new athlete"

```
1. Log in to Admin Control Center
   ↓
2. Click "Athletes" in admin sidebar
   ↓
3. Click "Add Athlete" button
   ↓
4. Fill in athlete info
   - Name, email, age, sport
   - Velocity goal
   - Parent contact (if minor)
   ↓
5. Click "Create Athlete"
   - Auto-generated credentials sent to athlete email
   ↓
6. Go to "Drills" in admin sidebar
   ↓
7. Find beginner drills
   ↓
8. Click "Assign" on each drill
   - Select new athlete
   - Set priority: High
   - Add welcome note
   ↓
9. Athlete receives email:
   - Login credentials
   - Assigned drills notification
   ↓
10. Athlete logs in and sees welcome drills on dashboard
```

### Coach Flow: "I want to bulk import my YouTube videos"

```
1. Log in to Admin Control Center
   ↓
2. Click "Drills" in admin sidebar
   ↓
3. Click "Bulk Import" button (top right)
   ↓
4. Download CSV template
   ↓
5. Open in Excel/Google Sheets
   ↓
6. Fill in drill information:
   Row 1: Long Toss, [description], youtube.com/watch?v=123, mechanics, intermediate, 15...
   Row 2: Sprint Drills, [description], youtube.com/watch?v=456, speed, beginner, 10...
   Row 3: [continue for all videos]
   ↓
7. Save as CSV file
   ↓
8. Upload CSV file
   ↓
9. Review results:
   ✅ 45 drills imported successfully
   ❌ 2 failed (see error log)
   ↓
10. Fix errors (if any) and re-import failed rows
    ↓
11. Click "View All Drills"
    ↓
12. All videos now in drill bank, ready to assign!
```

---

## Troubleshooting

### Common Issues

**"I can't see the admin tools"**
- Check your account role (must be Coach or Admin)
- Try logging out and back in
- Contact admin if role is incorrect

**"Videos won't play"**
- Check internet connection
- Ensure YouTube video is not private
- Try different browser
- Clear browser cache

**"CSV import failed"**
- Check CSV format matches template exactly
- Ensure all required fields have values
- Check for special characters in data
- Try importing smaller batches (10-20 rows)

**"Payment failed"**
- Verify card details
- Check card has sufficient funds
- Try different payment method
- Contact support if issue persists

**"Can't cancel session"**
- Check cancellation is more than 24 hours before session
- Ensure you're clicking the correct button
- Try refreshing the page

---

## Updates & Roadmap

### Phase 1 (Current) ✅
- User authentication
- Athlete dashboard with real data
- Admin control center
- Drill management (single & bulk)
- Athlete management
- Bookings management
- YouTube video integration
- Role-based access

### Phase 2 (In Progress) 🚧
- Stripe payment integration
- Native video uploads
- Enhanced analytics
- Mobile app (iOS/Android)

### Phase 3 (Planned) 📋
- Advanced video protection (watermarks, DRM)
- Two-factor authentication
- Coach availability calendar
- Automated reminders
- Progress reports (PDF export)
- API for third-party integrations
- White-label options

---

## Need Help?

This guide covers the core functionality of PSP.Pro. For additional questions:

1. **Check this guide** - Most questions answered here
2. **Video tutorials** - Coming soon on YouTube
3. **Contact your coach** - They can help with athlete-specific questions
4. **Submit a ticket** - support@psp.pro (coming soon)
5. **Join our community** - Discord server (coming soon)

---

**Last Updated**: February 6, 2026
**Version**: 2.0
**Platform**: PSP.Pro - Athletic OS

Made with ⚡ by the PSP.Pro team
