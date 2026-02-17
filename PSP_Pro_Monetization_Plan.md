# PSP.Pro — Monetization Action Plan

**For:** Robert (Rob)
**Date:** February 17, 2026
**Status:** Ready to Execute

---

## THE OPPORTUNITY

You have a fully-built, production-deployed sports performance platform that no one else in the market has. The question isn't "is this valuable" — it's "which revenue stream do you turn on first."

There are **4 monetization paths**, and they're not mutually exclusive. You can stack them.

---

## PATH 1: RACHEL & LOREN'S BUSINESS (Immediate Revenue)

**Timeline:** Now
**Effort:** Low — the platform is already built

This is the obvious first move. PSP.Pro is live and functional. Rachel and Loren can start generating revenue through the platform today.

### Action Items:

1. **Set pricing in the admin panel** — Rachel/Loren finalize their service prices, package tiers, and availability schedule through the Lesson Builder and Availability pages. Everything is already wired up.

2. **Onboard existing athletes** — Use the "Add Athlete" tool to create accounts for their current roster. Assign drills, import any existing schedule via CSV.

3. **Turn on Stripe live mode** — Flip from test to live. Athletes can start booking and paying through the platform immediately.

4. **Push marketing** — The website, SEO, and Google Reviews are already in place. Social media posts linking to the Pricing page and "Join the Team" form will drive new signups.

5. **Charge Rachel & Loren a platform fee** — This is YOUR software. Options:
   - **Flat monthly fee:** $200-500/month for platform hosting, maintenance, and support
   - **Revenue share:** 5-10% of bookings processed through the platform
   - **Hybrid:** $150/month base + 3-5% of Stripe revenue
   - **One-time setup + monthly:** $2,500 setup fee + $200/month ongoing

### Expected Revenue:
- Platform fee from Rachel/Loren: $200-500/month
- If they process $5K-10K/month in bookings at 5%: $250-500/month additional
- **Total: $400-1,000/month from one client**

---

## PATH 2: WHITE-LABEL SAAS FOR OTHER COACHES (High Ceiling)

**Timeline:** 2-4 months to multi-tenant
**Effort:** Medium — requires tenant isolation, onboarding flow, billing

This is where the real money is. There are thousands of independent sports performance coaches running their businesses on spreadsheets and Venmo. You'd be giving them a turnkey platform.

### What Needs to Be Built:

1. **Multi-tenant architecture** — Each coach gets their own subdomain (e.g., `coachrachel.psp.pro` or `coachrachel.trainwith.pro`). Isolate data per tenant in Supabase using tenant IDs on all tables. The core code stays the same.

2. **Self-service onboarding** — Landing page where coaches sign up, pick a plan, connect Stripe, set their services/availability, and go live. You already have all the admin tools — just need a first-run wizard.

3. **Billing via Stripe Connect** — Coaches connect their own Stripe account. You take a platform fee (percentage of each transaction or flat monthly). Stripe Connect handles the split automatically.

4. **White-label branding** — Let each coach customize their logo, colors, and business name. The underlying platform stays PSP.Pro.

5. **Admin dashboard for YOU** — A super-admin view where you can see all tenants, their revenue, usage stats, and manage accounts.

### Pricing Model:

| Tier | Price | What They Get |
|---|---|---|
| Starter | $99/month | Up to 25 athletes, 1 coach, core features |
| Pro | $199/month | Up to 100 athletes, 3 coaches, all features |
| Elite | $299/month | Unlimited athletes/coaches, priority support, custom branding |

Plus 2-3% platform fee on all Stripe transactions (on top of Stripe's standard fees).

### Go-to-Market:

1. **Start with Rachel's network** — She knows other coaches. Word of mouth in the softball/sports community is powerful.

2. **Target independent coaches on Instagram/TikTok** — Sports performance coaches with 1K-10K followers who are clearly doing their own thing. DM them: "I built a platform for coaches like you. Want to see it?"

3. **Facebook Groups** — Search for "softball coaches," "sports performance trainers," "youth sports coaching." These groups have thousands of members running businesses on duct tape and Calendly.

4. **Local first, then expand** — Start in Virginia Beach / Hampton Roads. Dominate the 757 area code. Then expand regionally. Then nationally.

5. **Free trial** — 14-day free trial, no credit card required. Let the product sell itself. The admin tooling alone will hook them.

### Revenue Projections:

| Coaches | Avg Plan | Monthly Revenue | Annual Revenue |
|---|---|---|---|
| 10 | $149 | $1,490 | $17,880 |
| 25 | $149 | $3,725 | $44,700 |
| 50 | $175 | $8,750 | $105,000 |
| 100 | $199 | $19,900 | $238,800 |
| 250 | $199 | $49,750 | $597,000 |

Plus transaction fees. At 100 coaches processing an average of $3K/month each, a 2.5% platform fee adds another **$7,500/month ($90K/year)**.

**100 coaches = ~$330K ARR. 250 coaches = ~$700K ARR.**

---

## PATH 3: DEVELOPMENT AGENCY / PORTFOLIO PIECE (Immediate Credibility)

**Timeline:** Now
**Effort:** Low — just marketing yourself

PSP.Pro is a portfolio piece that most freelance developers would kill for. It demonstrates:
- Full-stack Next.js 14 expertise
- Stripe payment integration
- Supabase backend with RLS
- Role-based access control
- AI chatbot integration
- Web3 infrastructure
- Professional UI/UX
- Production deployment on Vercel

### Action Items:

1. **Update your portfolio** — Link to propersports.pro as a live case study. Write up the tech stack, challenges solved, and business impact.

2. **Offer custom platform builds** — "I built a $100K+ sports training platform. What can I build for you?" Target other niche businesses (dance studios, martial arts, music lessons, tutoring) that need the same type of booking + management + content platform.

3. **Charge premium rates** — With a live, production app of this complexity in your portfolio, you can comfortably charge **$150-250/hour** or **$15K-50K per project**. This isn't WordPress freelancing — this is full-stack product development.

4. **Productize the build** — Offer a "Sports Platform in a Box" package:
   - $5,000-10,000 setup
   - $500/month hosting + maintenance
   - Customized for their sport/business

### Expected Revenue:
- 2-3 custom builds per year at $20K average: $40-60K
- Ongoing maintenance contracts: $500-1,500/month per client
- **Total: $50-80K/year as a side business**

---

## PATH 4: CONTENT + AFFILIATE (Passive Income Layer)

**Timeline:** 1-2 months
**Effort:** Low-Medium

### Action Items:

1. **YouTube/TikTok series** — "I Built a $100K Sports App with AI" — document the build process. The dev community eats this up. Show the stack, the features, the business model. This drives inbound leads for both SaaS signups and freelance clients.

2. **Blog content on propersports.pro** — The blog system is already built. Write SEO-optimized articles targeting "softball training Virginia Beach," "youth sports performance," "how to track pitching velocity." This drives organic traffic to the platform.

3. **Course on building SaaS** — Package your knowledge into a course: "How to Build a Vertical SaaS with Next.js, Supabase, and Stripe." Sell on Gumroad or your own platform for $49-199.

4. **Affiliate partnerships** — Partner with sports equipment brands, training gear companies, and supplement brands. Add affiliate links to the blog and chatbot recommendations.

---

## RECOMMENDED EXECUTION ORDER

### Month 1: Foundation
- [ ] Finalize platform fee agreement with Rachel & Loren
- [ ] Help them onboard athletes and go live with real payments
- [ ] Update your personal portfolio with PSP.Pro case study
- [ ] Start posting about the build on social media (LinkedIn, Twitter/X)

### Month 2: Validate
- [ ] Track Rachel/Loren's usage — what features do they use most? What's missing?
- [ ] Reach out to 10 other coaches in the area — offer free demos
- [ ] Get 2-3 beta users on the platform (free or heavily discounted)
- [ ] Start documenting the multi-tenant architecture plan

### Month 3-4: Build the SaaS
- [ ] Implement multi-tenant data isolation
- [ ] Build self-service onboarding wizard
- [ ] Set up Stripe Connect for platform fees
- [ ] Create marketing landing page for coaches
- [ ] Launch with beta pricing ($99/month for early adopters)

### Month 5-6: Grow
- [ ] Hit 10 paying coaches
- [ ] Start content marketing (blog + social)
- [ ] Attend local sports coaching events / youth sports expos
- [ ] Iterate based on coach feedback
- [ ] Raise prices for new signups ($149-199/month)

### Month 7-12: Scale
- [ ] Target 25-50 coaches
- [ ] Hire part-time support (customer success)
- [ ] Consider mobile app (React Native — reuse most of the logic)
- [ ] Explore partnerships with sports organizations
- [ ] Evaluate funding if growth warrants it

---

## THE BOTTOM LINE

| Path | Timeline | Monthly Revenue Potential | Effort |
|---|---|---|---|
| Rachel & Loren's business | Now | $400-1,000 | Low |
| White-label SaaS | 3-6 months | $5,000-50,000+ | Medium |
| Dev agency / portfolio | Now | $3,000-7,000 | Low |
| Content + affiliate | 1-2 months | $500-2,000 | Low-Medium |

**Stacked together at 12 months:** $10K-60K/month is realistic.

The SaaS path has the highest ceiling by far. But the smartest move is to stack Path 1 + Path 3 right now (costs you nothing, generates income immediately), then reinvest that into building Path 2.

You're not starting from zero. You're starting from a live, production platform that works. That's the hardest part, and it's already done.

---

*Let's build the business now.*
