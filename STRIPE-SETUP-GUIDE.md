# 🔑 Stripe Setup Guide for PSP.Pro

## Overview
Your PSP.Pro system uses Stripe for payment processing. You need to add your Stripe keys before deploying to production.

---

## 📋 Environment Variables Needed

Add these to your `.env.local` file (for local development) and your production environment (Vercel/hosting):

```bash
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

---

## 🔐 Where to Find Your Stripe Keys

### 1. **Publishable Key** (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
- Go to: https://dashboard.stripe.com/apikeys
- Copy the **Publishable key** (starts with `pk_live_...` for production)
- For testing: use `pk_test_...`

### 2. **Secret Key** (`STRIPE_SECRET_KEY`)
- Same page: https://dashboard.stripe.com/apikeys
- Copy the **Secret key** (starts with `sk_live_...` for production)
- **KEEP THIS SECRET!** Never commit to git or share publicly
- For testing: use `sk_test_...`

### 3. **Webhook Secret** (`STRIPE_WEBHOOK_SECRET`)
- Go to: https://dashboard.stripe.com/webhooks
- Click "Add endpoint"
- Enter your production URL: `https://yourdomain.com/api/webhooks/stripe`
- Select events to listen for:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
- Click "Add endpoint"
- Click "Reveal" under "Signing secret"
- Copy the secret (starts with `whsec_...`)

---

## 🚀 Setup Steps

### For Local Development:

1. Create/edit `.env.local` in your project root:
```bash
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxx
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx
```

2. Test locally:
```bash
npm run dev
```

3. Install Stripe CLI for webhook testing:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

### For Production (Vercel):

1. Go to your Vercel project
2. Navigate to: Settings → Environment Variables
3. Add each variable:
   - Key: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Value: `pk_live_xxxxx` (your live key)
   - Click "Add"

4. Repeat for:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

5. Redeploy your app

---

## ✅ Verify Setup

### Test if keys are working:

```bash
# In your browser console (on any page):
console.log(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
# Should show: pk_live_xxxxx (or pk_test_xxxxx)
```

### Test a booking:
1. Go to `/booking` as an athlete
2. Select a service
3. Choose an availability slot
4. Click "Book Now"
5. Should redirect to Stripe Checkout
6. Use test card: `4242 4242 4242 4242`
7. Any future date, any CVC

---

## 🔄 Webhook Testing

### In Production:
1. Create a test booking
2. Complete payment
3. Check webhook logs: https://dashboard.stripe.com/webhooks
4. Should see `checkout.session.completed` event
5. Check your database - booking status should be "confirmed"

### Common Issues:

**Webhook not firing?**
- Check webhook URL is correct: `https://yourdomain.com/api/webhooks/stripe`
- Verify webhook secret matches your env variable
- Check webhook is "Enabled" in Stripe dashboard

**Payment succeeds but booking not confirmed?**
- Check webhook logs for errors
- Verify your webhook endpoint is accessible (not behind auth)
- Check server logs for errors

---

## 💰 Creating Stripe Price IDs for Services

Your services can be linked to Stripe Price IDs for recurring payments:

### 1. Create a Product in Stripe:
- Go to: https://dashboard.stripe.com/products
- Click "Add product"
- Name: "1-on-1 Training Session" (match your service name)
- Description: Optional
- Click "Add pricing"

### 2. Create a Price:
- Price: Enter amount (e.g., $75.00)
- Billing period: One time (or Recurring if subscription)
- Click "Save product"

### 3. Copy the Price ID:
- After saving, you'll see a Price ID like: `price_1Abc123xyz`
- Copy this ID

### 4. Add to Your Service:
- Go to: `/admin/services` in your app
- Edit the service
- Paste the Price ID in "Stripe Price ID" field
- Save

Now when athletes book this service, it will use the Stripe Price!

---

## 🎯 Test Mode vs Live Mode

### Test Mode (Development):
- Use `pk_test_...` and `sk_test_...` keys
- No real money is charged
- Test card numbers work
- Webhooks can be forwarded with Stripe CLI

### Live Mode (Production):
- Use `pk_live_...` and `sk_live_...` keys
- **REAL MONEY** is charged!
- Only real cards work
- Webhooks must be configured in Stripe dashboard

### Switch Modes:
- In Stripe Dashboard, toggle switch in top-left
- Make sure your `.env` keys match the mode!

---

## 🔒 Security Checklist

- [ ] Never commit `.env.local` to git (already in `.gitignore`)
- [ ] Never share your `STRIPE_SECRET_KEY`
- [ ] Use `pk_test_` keys for development
- [ ] Use `pk_live_` keys for production only
- [ ] Verify webhook signatures (already implemented in `/api/webhooks/stripe`)
- [ ] Test webhooks before going live
- [ ] Monitor webhook logs regularly

---

## 📞 Need Help?

### Stripe Support:
- Docs: https://stripe.com/docs
- Support: https://support.stripe.com/

### Common Errors:

**"No such customer"**
- Customer ID doesn't exist in Stripe
- Check you're using the same mode (test vs live)

**"Invalid API Key"**
- Wrong key for the mode (using test key in live mode or vice versa)
- Check your env variables

**"Webhook signature verification failed"**
- `STRIPE_WEBHOOK_SECRET` doesn't match webhook endpoint
- Re-copy the secret from Stripe dashboard

---

## ✅ Quick Start (TL;DR)

1. Get keys from Stripe Dashboard
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```
3. For production, add same variables to Vercel
4. Setup webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
5. Test a booking!

---

**Ready to deploy!** 🚀

Once Stripe keys are added, your full payment system will work:
- Athletes can book and pay
- Webhooks confirm bookings automatically
- You get paid! 💰
