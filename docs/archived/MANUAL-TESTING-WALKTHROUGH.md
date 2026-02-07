# PSP.Pro Manual Testing Walkthrough
**Date:** February 6, 2026
**Tester:** Following admin → coach → athlete flow

---

## 🎯 Testing Objectives
1. Test every page and form as admin
2. Create/modify data in every category
3. Switch to coach role and verify changes are visible
4. Switch to athlete role and test booking flow
5. Verify dynamic updates across roles

---

## 👑 PHASE 1: ADMIN TESTING

### Login & Dashboard
- [ ] Navigate to http://localhost:3000/login
- [ ] Login with `roblogo.com@gmail.com`
- [ ] Verify redirect to `/admin` (not `/locker`)
- [ ] Check dark mode toggle works
- [ ] Verify all nav items visible

**Expected:**
- ✅ Redirects to /admin
- ✅ Navigation shows: Dashboard, Athletes, Bookings, Drills, Availability, Media
- ✅ Dark mode text is white

---

### Admin → Athletes Management (`/admin/athletes`)
- [ ] Click "Athletes" in nav
- [ ] Verify existing athletes show with **emails visible**
- [ ] Click "+ Create Athlete" button
- [ ] Fill out form:
  ```
  Name: Test Athlete Dynamic
  Email: test.dynamic@psp.pro
  Password: TestPass123!
  Athlete Type: Baseball
  Age: 17
  Parent/Guardian: Test Parent
  Parent Email: parent@test.com
  Parent Phone: (757) 555-1234
  ```
- [ ] Submit form
- [ ] Verify athlete appears in list with email
- [ ] Click on athlete to view details
- [ ] Click "Edit" and change age to 18
- [ ] Save and verify update

**Issues to Note:**
- Does email show in athlete list? (Should after migration 020)
- Can you edit athlete details?
- Do changes save properly?

---

###  Admin → Services Management (`/admin/services`)
- [ ] Navigate to Services (if exists in nav)
- [ ] Verify 10 services visible
- [ ] Click "+ Create Service" or edit existing
- [ ] Try changing a service price:
  ```
  Service: 1-on-1 Pitching
  Old Price: $75
  New Price: $80
  ```
- [ ] Save and verify price updates
- [ ] **TEST DYNAMIC:** Note this change - will verify athlete sees new price later

**Issues to Note:**
- Can services be edited?
- Does price update persist?

---

### Admin → Drills Management (`/admin/drills`)
- [ ] Navigate to Drills
- [ ] Click "+ Create Drill" button
- [ ] Fill out drill form:
  ```
  Title: Dynamic Test Drill
  Category: Pitching
  Difficulty: Intermediate
  Description: Testing dynamic drill creation
  Duration: 15 minutes
  YouTube URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
  Tags: test, dynamic, pitching
  Equipment: Ball, Glove
  Focus Areas: Mechanics, Velocity
  Is Published: Yes
  Is Featured: No
  ```
- [ ] Submit and verify drill appears
- [ ] **TEST DYNAMIC:** Note this drill - will check if visible to athletes later

**Issues to Note:**
- Does RLS allow admin to create drills?
- Are all fields saving properly?

---

### Admin → Availability Management (`/admin/availability`)
- [ ] Navigate to Availability
- [ ] Verify only YOUR slots show (not other coaches')
- [ ] Click "+ Add Availability"
- [ ] Create new slot:
  ```
  Date: Tomorrow's date
  Start Time: 2:00 PM
  End Time: 3:00 PM
  Service: 1-on-1 Pitching (or leave blank)
  Location: PSP Training Facility
  Max Bookings: 1
  ```
- [ ] Submit and verify slot appears
- [ ] Try deleting an old slot
- [ ] **TEST DYNAMIC:** Note this slot - athlete should see it when booking

**Issues to Note:**
- Can you only see YOUR slots? (Security fix verification)
- Does slot creation work?
- Can you delete slots?

---

### Admin → Bookings Management (`/admin/bookings`)
- [ ] Navigate to Bookings
- [ ] Verify bookings list (may be empty)
- [ ] Check if you can filter by status
- [ ] **TEST DYNAMIC:** After athlete books, come back here to verify booking shows

**Issues to Note:**
- Is bookings table accessible?
- Any errors loading data?

---

### Admin → Media Management (`/admin/media`)
- [ ] Navigate to Media
- [ ] Try uploading an image (if upload works)
- [ ] Verify image appears in gallery

**Issues to Note:**
- Does upload work?
- Any file size limits?

---

## 🎓 PHASE 2: COACH TESTING

### Create Coach Account
- [ ] As admin, go to `/admin/athletes`
- [ ] OR use SQL to update test user role:
  ```sql
  -- In Supabase SQL Editor:
  INSERT INTO admin_whitelist (email, role, notes)
  VALUES ('test.coach@psp.pro', 'coach', 'Test coach account');

  -- Then sign up normally or update existing:
  UPDATE profiles
  SET role = 'coach'
  WHERE email = 'test.coach@psp.pro';
  ```
- [ ] Logout from admin
- [ ] Login as coach: `test.coach@psp.pro` / `TestCoach123!`
- [ ] Verify redirect to `/admin` (coaches also get admin panel)

---

### Coach → View Athletes
- [ ] Navigate to Athletes
- [ ] **DYNAMIC TEST:** Verify "Test Athlete Dynamic" (created earlier) is visible
- [ ] Verify emails show for all athletes
- [ ] Click on athlete to view details
- [ ] Check if you can see their performance metrics

**Expected:**
- ✅ Can view all athletes
- ✅ Emails visible
- ✅ Can view athlete details

**Issues to Note:**
- Can coach see athletes created by admin?
- Are permissions working correctly?

---

### Coach → Manage Own Availability
- [ ] Navigate to Availability
- [ ] **DYNAMIC TEST:** Should NOT see admin's slots (only your own)
- [ ] Create a new availability slot:
  ```
  Date: Day after tomorrow
  Start Time: 10:00 AM
  End Time: 11:00 AM
  Max Bookings: 2
  ```
- [ ] Verify slot appears
- [ ] Try to view admin's slots (should NOT be visible)

**Expected:**
- ✅ Only see own slots
- ✅ Can create new slots
- ❌ Cannot see other coaches' slots

---

### Coach → Create Drills
- [ ] Navigate to Drills
- [ ] **DYNAMIC TEST:** Should see "Dynamic Test Drill" created by admin
- [ ] Create your own drill:
  ```
  Title: Coach's Special Drill
  Category: Hitting
  Difficulty: Beginner
  ```
- [ ] Verify both drills show

**Expected:**
- ✅ Can see admin's drills
- ✅ Can create own drills

---

### Coach → Assign Drills to Athletes
- [ ] Go to athlete detail page
- [ ] Click "Assign Drill" button (if exists)
- [ ] Assign "Dynamic Test Drill" to "Test Athlete Dynamic"
- [ ] **DYNAMIC TEST:** Note this - will check if athlete sees assigned drill

---

## 🏃 PHASE 3: ATHLETE TESTING

### Create Athlete Account
- [ ] Logout from coach account
- [ ] Go to `/signup`
- [ ] Fill out signup form:
  ```
  Full Name: Manual Test Athlete
  Email: manual.athlete@psp.pro
  Password: AthleteTest123!
  Athlete Type: Softball
  Age: 15
  Parent/Guardian Name: Jane Doe
  Parent/Guardian Email: jane@test.com
  ```
- [ ] Submit and verify account created
- [ ] Check email field in database (should have email after migration 020)
- [ ] Login with new account
- [ ] Verify redirect to `/locker` (not `/admin`)

**Expected:**
- ✅ Signup works
- ✅ Email saved in profiles table
- ✅ Redirects to /locker

---

### Athlete → View Services
- [ ] Navigate to Services or Get Started
- [ ] **DYNAMIC TEST:** Verify price of "1-on-1 Pitching" is $80 (changed earlier by admin)
- [ ] Verify all 10 services visible
- [ ] Check if descriptions are clear

**Expected:**
- ✅ Can see updated prices
- ✅ Services list is complete

---

### Athlete → Browse Availability
- [ ] Navigate to Booking page
- [ ] Select service: "1-on-1 Pitching"
- [ ] Select date: Tomorrow
- [ ] **DYNAMIC TEST:** Should see admin's slot (2:00 PM - 3:00 PM) and coach's slot (10:00 AM - 11:00 AM)
- [ ] Verify slot details show correctly

**Expected:**
- ✅ Can see availability from multiple coaches
- ✅ Slot times and locations display correctly

---

### Athlete → Book a Session (WITHOUT PAYMENT)
- [ ] Click on admin's 2:00 PM slot
- [ ] Fill out booking form (if required)
- [ ] **NOTE:** Don't complete Stripe payment (test mode)
- [ ] **TEST DYNAMIC:** After "booking" go back to admin and check if booking appears

**Expected:**
- ⚠️  May not complete without payment
- Need to verify webhook flow works

---

### Athlete → View Assigned Drills
- [ ] Navigate to Drills or My Drills
- [ ] **DYNAMIC TEST:** Should see "Dynamic Test Drill" (assigned by coach earlier)
- [ ] Click on drill to view details
- [ ] Verify YouTube video loads
- [ ] Try marking drill as complete

**Expected:**
- ✅ Can see assigned drills
- ✅ Drill details load properly

---

### Athlete → Performance Tracking
- [ ] Navigate to Performance or Dashboard
- [ ] Check if any performance metrics show
- [ ] Try adding a performance entry (if possible)

---

## 🔄 PHASE 4: DYNAMIC CHANGE VERIFICATION

Go back through roles and verify all changes are visible:

| Change Made | By Role | Visible To | Test Result |
|-------------|---------|------------|-------------|
| Created "Test Athlete Dynamic" | Admin | Coach, Admin | ✅ / ❌ |
| Changed service price to $80 | Admin | Athlete | ✅ / ❌ |
| Created "Dynamic Test Drill" | Admin | Coach, Athlete | ✅ / ❌ |
| Admin created availability slot | Admin | Athlete (booking) | ✅ / ❌ |
| Coach created availability slot | Coach | Athlete (booking) | ✅ / ❌ |
| Coach assigned drill to athlete | Coach | Athlete | ✅ / ❌ |

---

## 🐛 ISSUES FOUND

### Critical Issues
1.

### High Priority
1.

### Medium Priority
1.

### Low Priority / Nice to Have
1.

---

## 💡 UX IMPROVEMENTS NEEDED

### Navigation & Flow
1.

### Forms & Validation
1.

### Feedback & Errors
1.

### Mobile Responsiveness
1.

### Dark Mode
1.

---

## ✅ What Works Well
1. Dark mode text colors ✓
2. Admin whitelist system ✓
3. Email in profiles ✓
4. Role-based access control ✓
5.

---

## 📊 Final Verdict

**Overall UX Score:** _/10

**Production Ready?** Yes / No / Needs Work

**Top 3 Priorities:**
1.
2.
3.

---

**Testing Completed:** [Date/Time]
**Tester:** Manual walkthrough following admin → coach → athlete flow
**Next Steps:** Implement fixes based on findings
