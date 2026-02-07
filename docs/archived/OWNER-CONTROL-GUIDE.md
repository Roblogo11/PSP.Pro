# 🎯 PSP.Pro Owner Control Guide
**What You Can Change Without Touching Code**

---

## ✅ EASY TO CHANGE (No Code Required)

### 1. **Services & Pricing** 💰
**Location:** Supabase Dashboard → Database → `services` table

**What You Can Change:**
- ✅ Service prices (`price_cents` - enter in cents, e.g., 7500 = $75.00)
- ✅ Service names (`name`)
- ✅ Service descriptions (`description`)
- ✅ Session duration (`duration_minutes`)
- ✅ Max participants for group sessions (`max_participants`)
- ✅ Turn services on/off (`is_active`)
- ✅ Service categories (`category`: individual, group, package)

**How to Edit:**
1. Go to Supabase Dashboard
2. Navigate to Table Editor → `services`
3. Click any row to edit
4. Changes are INSTANT - athletes see new prices immediately! ⚡

**Example:**
```sql
-- Change 1-on-1 Training from $75 to $85
UPDATE services
SET price_cents = 8500
WHERE name = '1-on-1 Training Session';
```

---

### 2. **Availability & Scheduling** 📅
**Location:** Admin Dashboard → `/admin/availability`

**What You Can Change:**
- ✅ Create new time slots
- ✅ Delete time slots
- ✅ Change which coach owns each slot
- ✅ Set max participants per slot
- ✅ All done through the admin UI!

**How to Edit:**
- Log in as admin/coach
- Go to Availability page
- Click "Add Slot" or edit existing ones
- Changes are real-time ⚡

---

### 3. **Athletes** 👥
**Location:** Admin Dashboard → `/admin/athletes`

**What You Can Change:**
- ✅ View all athlete profiles
- ✅ See athlete emails, ages, sports
- ✅ View booking history
- ✅ Create new athletes via API

**How to Create Athletes:**
Use the API endpoint (we can build you a UI for this!):
```bash
POST /api/admin/create-athlete
{
  "email": "athlete@example.com",
  "full_name": "Athlete Name",
  "password": "SecurePass123",
  "sports": ["softball", "basketball"],  # Multi-sport!
  "age": 16
}
```

---

### 4. **Drills Library** 🎯
**Location:** Admin Dashboard → `/admin/drills`

**What You Can Change:**
- ✅ Add new drills
- ✅ Edit drill titles, descriptions
- ✅ Add YouTube video URLs
- ✅ Set equipment needed
- ✅ Publish/unpublish drills
- ✅ Feature drills on homepage
- ✅ All through the admin UI!

---

### 5. **Admins & Coaches** 🔐
**Location:** Supabase Dashboard → `admin_whitelist` table

**What You Can Change:**
- ✅ Add new admins
- ✅ Add new coaches
- ✅ Change roles (admin, coach, master_admin)
- ✅ Remove admin access

**How to Add:**
```sql
-- Add a new admin
INSERT INTO admin_whitelist (email, role, notes)
VALUES ('newadmin@example.com', 'admin', 'New admin description');

-- They automatically get admin role when they sign up!
```

---

### 6. **Bookings Management** 📆
**Location:** Admin Dashboard → `/admin/bookings`

**What You Can Change:**
- ✅ View all bookings
- ✅ See booking status (pending, confirmed, completed, cancelled)
- ✅ View athlete information
- ✅ Filter by coach (coaches only see their own)

---

### 7. **Site Content** 📝
**Location:** Code files (but EASY to change)

**Easily Changeable Text:**
- `src/app/page.tsx` - Homepage content
- `src/app/about/page.tsx` - About page
- `src/app/contact/page.tsx` - Contact info
- `src/app/pricing/page.tsx` - Pricing page text
- `src/app/faq/page.tsx` - FAQ questions & answers

**These are just TEXT - no complex logic!**

---

## ⚠️ REQUIRES CODE CHANGES (But Still Easy)

### 1. **Sport Options** 🏀⚽🥎
**Current Sports:** Softball, Basketball, Soccer

**To Add More Sports:**
Edit: `src/app/(auth)/signup/page.tsx` (line ~200)
```tsx
// Just add to this array!
{[
  { value: 'softball', label: 'Softball', emoji: '🥎' },
  { value: 'basketball', label: 'Basketball', emoji: '🏀' },
  { value: 'soccer', label: 'Soccer', emoji: '⚽' },
  { value: 'baseball', label: 'Baseball', emoji: '⚾' },  // ADD NEW SPORTS HERE
  { value: 'volleyball', label: 'Volleyball', emoji: '🏐' },
].map((sport) => (
  // ... rest of the code
))}
```

**Complexity:** LOW - Just add a line! 🟢

---

### 2. **Brand Colors** 🎨
**Current Colors:**
- Orange: `#B8301A` (primary action color)
- Cyan: `#00B4D8` (PSP Blue)

**To Change:**
Edit: `tailwind.config.ts` (lines ~20-25)
```ts
colors: {
  orange: '#B8301A',  // Change this!
  cyan: '#00B4D8',    // Or this!
}
```

**Complexity:** LOW - Two lines! 🟢

---

### 3. **Service Categories** 📦
**Current Categories:** individual, group, package

**To Add Categories:**
1. Add to database (services table allows any text)
2. Add color in: `src/components/booking/service-selector.tsx` (line ~26)
```tsx
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'individual':
      return 'bg-orange/10 text-orange border-orange/20'
    case 'group':
      return 'bg-cyan/10 text-cyan border-cyan/20'
    case 'package':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    case 'premium':  // ADD NEW CATEGORY HERE
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    default:
      return 'bg-cyan-600/10 text-cyan-600 border-cyan-600/20'
  }
}
```

**Complexity:** LOW - Just add a case! 🟢

---

### 4. **Navigation Menu** 🧭
**Athlete Menu:** `src/components/layout/sidebar.tsx` (line ~36)
**Admin Menu:** Same file (line ~46)

**To Add Menu Items:**
```tsx
const athleteNavItems: NavItem[] = [
  { label: 'Athlete Locker', href: '/locker', icon: LayoutDashboard, color: 'text-orange-400' },
  { label: 'NEW ITEM', href: '/new-page', icon: SomeIcon, color: 'text-blue-400' },  // ADD HERE
  // ... rest
]
```

**Complexity:** MEDIUM - Need to create the page too 🟡

---

## 🔴 COMPLEX CHANGES (Requires Developer)

### 1. **Payment Processing**
- Stripe integration is complex
- Webhook handling requires careful testing
- **Recommendation:** Keep as-is or hire developer

### 2. **Multi-Sport Logic**
- Already implemented! ✅
- Changing how sports filter content = complex

### 3. **Authentication System**
- Supabase handles this
- Don't touch unless necessary!

### 4. **Database Schema**
- Adding new fields = requires migrations
- Can break existing features
- **Recommendation:** Plan changes carefully

---

## 📊 SUMMARY: Changeability Score

| Feature | Changeability | How Hard? |
|---------|--------------|-----------|
| **Pricing** | ✅ SUPER EASY | Just edit database! |
| **Services** | ✅ SUPER EASY | Just edit database! |
| **Availability** | ✅ SUPER EASY | Admin UI exists! |
| **Drills** | ✅ SUPER EASY | Admin UI exists! |
| **Admins** | ✅ EASY | SQL query in Supabase |
| **Athletes** | ✅ EASY | API endpoint works |
| **Content/Text** | 🟡 EASY | Edit `.tsx` files (text only) |
| **Sports Options** | 🟡 EASY | Add line to array |
| **Colors** | 🟡 EASY | Edit 2 lines in config |
| **Categories** | 🟡 MEDIUM | Add case to switch |
| **Navigation** | 🟡 MEDIUM | Add menu item + page |
| **Payment Logic** | 🔴 HARD | Requires developer |
| **Auth System** | 🔴 HARD | Don't touch! |

---

## 🎯 RECOMMENDED: Build Admin UIs

### What's Missing Admin UIs For:
1. **Services Management** - Currently requires Supabase Dashboard
2. **Athlete Creation** - Currently requires API call
3. **Content Editor** - Currently requires file editing

### Should We Build These?
**Services Manager Page:** `/admin/services`
- ✅ Edit prices visually
- ✅ Add/remove services
- ✅ Toggle active status
- ✅ Set Stripe price IDs

**Athlete Creator Page:** `/admin/athletes/create`
- ✅ Form to create athletes
- ✅ Multi-sport selection
- ✅ Parent info for minors

**Content Editor:** (Advanced)
- ✅ Edit homepage text
- ✅ Edit FAQ content
- ✅ Change pricing page

**Estimated Time:** 4-6 hours for all three

---

## 💡 RECOMMENDATIONS FOR OWNERS

### DO THIS YOURSELF (Safe & Easy):
1. ✅ Change service prices (Supabase → services table)
2. ✅ Add/remove availability slots (Admin dashboard)
3. ✅ Manage drills (Admin dashboard)
4. ✅ Add new admins (Supabase → admin_whitelist table)
5. ✅ View bookings & athletes (Admin dashboard)

### ASK DEVELOPER FOR HELP:
1. 🟡 Adding new sports
2. 🟡 Changing brand colors
3. 🟡 Adding service categories
4. 🔴 Stripe/payment changes
5. 🔴 Database schema changes

### SHOULD BUILD (Nice to Have):
1. 📝 Visual services editor in admin panel
2. 📝 Visual athlete creator in admin panel
3. 📝 Content management system for pages

---

## 🚀 BOTTOM LINE

**Your system is HIGHLY configurable!** 🎉

**90% of day-to-day changes** (pricing, availability, drills, athletes) can be done **WITHOUT touching code** - just use:
- Admin Dashboard UI
- Supabase Database Editor

**10% of changes** (new sports, colors, categories) require **simple code edits** - literally adding a line or two.

**Only complex payment/auth changes** require a developer.

---

## 📞 NEED HELP?

**Quick Changes (< 5 min):**
- DM us a screenshot of what you want changed
- We'll tell you exactly which line to edit

**New Features (> 1 hour):**
- Schedule a call to discuss
- We can build admin UIs for you
- Or train you to do it yourself!

---

**Last Updated:** February 6, 2026
**Your System Score:** 9.0/10 for Owner Control! 🎯
