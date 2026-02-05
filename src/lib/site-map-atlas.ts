/**
 * SHOCK ASSISTANT - SITE MAP ATLAS
 * ================================
 * Static Knowledge Router for ShockAI
 *
 * This is the "brain" - no API calls, instant responses.
 * All knowledge is pre-compiled at build time.
 *
 * VERSION: 2026.1
 * MISSION: "Shock The Media & Beat The Algorithm."
 */

export interface KnowledgeModule {
  id: string
  keywords: string[]
  title: string
  response: string
  actions?: QuickAction[]
  category: 'navigation' | 'studio' | 'tools' | 'services' | 'help' | 'pricing'
}

export interface QuickAction {
  label: string
  href?: string
  action?: 'copy' | 'scroll'
  data?: string
}

// ============================================
// QUICK ACTION CHIPS - Most common user intents
// ============================================
export const QUICK_ACTIONS: QuickAction[] = [
  { label: '🎬 Create Template', href: '/studio/templates/new' },
  { label: '🔗 Creator Forge', href: '/studio/creator-forge' },
  { label: '📸 View Gallery', href: '/photography#view-gallery' },
  { label: '💬 Contact Us', href: '/contact' },
  { label: '🚀 Get Started', href: '/get-started' },
]

// ============================================
// PRICING PROTOCOL - Value-First Redirect Logic
// ============================================
// Rule: Never hallucinate prices. Guide users to quotes/pricing pages.

interface PricingMatch {
  serviceType: string
  keywords: string[]
  response: string
  actions: QuickAction[]
}

const PRICING_PROTOCOLS: PricingMatch[] = [
  {
    serviceType: 'website',
    keywords: ['website', 'web', 'site', 'app', 'landing page', 'ecommerce', 'e-commerce'],
    response: `Web projects vary by scope ⚡

**Factors that affect pricing:**
• Type: Landing page vs. full site vs. web app
• Features: E-commerce, booking, custom functionality
• Integrations: APIs, CRM, payment systems

We specialize in high-converting Next.js builds. Most custom projects are quoted individually based on your needs.

**Want an instant estimate?** Fill out our quick form!`,
    actions: [
      { label: '💬 Get A Quote', href: '/contact' },
      { label: '💻 Website Help', href: '/website-help' },
      { label: '💰 View Pricing', href: '/pricing' },
    ],
  },
  {
    serviceType: 'video',
    keywords: ['video', 'filming', 'production', 'commercial', 'shoot'],
    response: `Video pricing depends on scope ⚡

**What affects cost:**
• Duration: 30-sec spot vs. full production
• Crew: Solo shooter vs. full team
• Post-production: Basic edit vs. motion graphics

AI accelerates our workflow = faster turnaround, better value.

**Let's scope your project!**`,
    actions: [
      { label: '💬 Get A Quote', href: '/contact' },
      { label: '🎬 View Work', href: '/video#view-gallery' },
      { label: '💰 View Pricing', href: '/pricing' },
    ],
  },
  {
    serviceType: 'drone',
    keywords: ['drone', 'aerial', 'fly', 'flying'],
    response: `Drone services are priced by the shoot ⚡

**Typical packages include:**
• Half-day or full-day shoots
• Real estate packages (quick turnaround)
• Event coverage rates

All flights are FAA-certified, insured, and permitted.

**Tell us about your project!**`,
    actions: [
      { label: '💬 Get A Quote', href: '/contact' },
      { label: '🚁 View Aerials', href: '/drone#view-gallery' },
      { label: '💰 View Pricing', href: '/pricing' },
    ],
  },
  {
    serviceType: 'photo',
    keywords: ['photo', 'photography', 'headshot', 'portrait', 'pictures'],
    response: `Photography is session-based ⚡

**Session types:**
• Headshots (quick & professional)
• Event coverage (hourly rates)
• Commercial shoots (day rates)
• Product photography (per-item or package)

**Let's book your session!**`,
    actions: [
      { label: '💬 Get A Quote', href: '/contact' },
      { label: '📸 View Gallery', href: '/photography#view-gallery' },
      { label: '💰 View Pricing', href: '/pricing' },
    ],
  },
  {
    serviceType: 'seo',
    keywords: ['seo', 'google', 'search', 'ranking', 'found'],
    response: `SEO is typically monthly or project-based ⚡

**Options:**
• Monthly retainer (ongoing optimization)
• One-time audit + recommendations
• Full SEO + content strategy

Results take time, but we focus on ROI not vanity metrics.

**Get a free SEO audit!**`,
    actions: [
      { label: '💬 Get Audit', href: '/contact' },
      { label: '🔍 Learn More', href: '/seo' },
      { label: '💰 View Pricing', href: '/pricing' },
    ],
  },
  {
    serviceType: 'shock-kit',
    keywords: ['shock kit', 'social media', 'posting', 'content', 'instagram', 'tiktok'],
    response: `The Shock Kit starts at $950 ⚡

**What you get:**
• Social content strategy
• Professional posts, reels, stories
• "We Create. You Post." model
• No long-term contracts

3 pricing tiers based on volume and services.

**See all packages!**`,
    actions: [
      { label: '⚡ View Shock Kit', href: '/shock-kit' },
      { label: '💰 All Pricing', href: '/pricing' },
      { label: '💬 Get Started', href: '/get-started' },
    ],
  },
  {
    serviceType: 'general',
    keywords: [], // Fallback for generic pricing questions
    response: `We work within YOUR budget ⚡

**Here's the deal:**
• Tell us your project + budget cap
• We'll maximize services to fit that number
• Mix & match: Video, Web, SEO, Social

**Quick reference:**
• Shock Kit bundles: from $950
• Custom projects: Get a quote
• Retainer packages: Available

No surprise fees. No BS.`,
    actions: [
      { label: '💬 Get A Quote', href: '/contact' },
      { label: '💰 View Pricing', href: '/pricing' },
      { label: '⚡ Shock Kit', href: '/shock-kit' },
    ],
  },
]

// ============================================
// THE KNOWLEDGE BASE - All pre-written responses
// ============================================
export const KNOWLEDGE_BASE: KnowledgeModule[] = [
  // -------- NAVIGATION --------
  {
    id: 'nav-home',
    keywords: ['home', 'homepage', 'main', 'start', 'landing'],
    title: '🏠 Homepage',
    response: `The homepage showcases all our creative services. It's your launchpad to everything ShockAI offers!`,
    actions: [{ label: 'Go Home', href: '/' }],
    category: 'navigation',
  },
  {
    id: 'nav-studio',
    keywords: ['studio', 'shock studio', 'template', 'templates', 'ai video', 'transition', 'prompt builder'],
    title: '⚡ Shock Studio',
    response: `Shock Studio is our wallet-gated AI video transition prompt builder. Create reusable templates with variables like {{SUBJECT}}, then "Cook" them into cinematic mega-prompts!

**Features:**
• 8-step template wizard
• Quick Fill presets
• Lock/unlock components
• "Cook This Prompt" - adds tech specs & flourishes

**Requires:** Web3 wallet connection`,
    actions: [
      { label: 'Open Studio', href: '/studio' },
      { label: 'New Template', href: '/studio/templates/new' },
    ],
    category: 'studio',
  },
  {
    id: 'nav-creator-forge',
    keywords: ['creator forge', 'forge', 'network', 'content network', 'creator economy', 'blueprint', 'sub-brand', 'flagship'],
    title: '🔨 Creator Forge',
    response: `Creator Forge helps you build your content creator network map. Plan your flagship account, hub channels, and sub-brands visually!

**How it works:**
1. Define your Flagship (main account)
2. Add a Hub (collective like "Nerd Athletes")
3. Create Sub-Brands (faceless channels)
4. Draw Synergy Links between them
5. Export as PNG, SVG, or JSON`,
    actions: [
      { label: 'Open Creator Forge', href: '/studio/creator-forge' },
    ],
    category: 'tools',
  },
  {
    id: 'studio-variables',
    keywords: ['variable', 'variables', 'syntax', 'placeholder', 'dynamic', 'curly', 'braces', '{{'],
    title: '🔤 Template Variables',
    response: `Variables let you create reusable templates! Use double curly braces:

**Syntax:** \`{{VARIABLE_NAME}}\`

**Common variables:**
• \`{{SUBJECT}}\` - Main subject/person
• \`{{ENVIRONMENT}}\` - Location/setting
• \`{{NEW_SUBJECT}}\` - Post-transition subject
• \`{{COLOR}}\` - Dominant color
• \`{{MOOD}}\` - Emotional tone

Variables show as [ORANGE] in the preview until filled.`,
    actions: [
      { label: 'Create Template', href: '/studio/templates/new' },
    ],
    category: 'studio',
  },
  {
    id: 'studio-cook',
    keywords: ['cook', 'cooking', 'mega prompt', 'mega-prompt', 'enhance', 'beef up', 'extra sauce'],
    title: '👨‍🍳 Cook This Prompt',
    response: `"Cook This Prompt" transforms your raw template into a professional mega-prompt!

**What gets added:**
• Technical specs (4K, fps, aspect ratio)
• Creative direction based on energy
• Scene breakdown with camera notes
• Color science & atmosphere tips
• Sound design sync points
• AI model guidance

Hit the chef hat button on the Generate page to cook!`,
    actions: [
      { label: 'Open Studio', href: '/studio' },
    ],
    category: 'studio',
  },
  {
    id: 'studio-presets',
    keywords: ['preset', 'presets', 'quick fill', 'autofill', 'prefill', 'example'],
    title: '⚡ Quick Fill Presets',
    response: `Don't want to write from scratch? Use Quick Fill presets!

Each step in the wizard has 5 pro-level presets:
• **Role:** Cinematic Director, VFX Supervisor, etc.
• **Source:** Product reveals, portraits, landscapes
• **Transition:** Liquid Morph, Hyper Zoom, Data Corruption
• **Destination:** Hero shots, environments, abstracts

Click any preset to instantly fill that section with professional copy.`,
    category: 'studio',
  },

  // -------- SERVICES --------
  {
    id: 'svc-photography',
    keywords: ['photo', 'photography', 'headshot', 'portrait', 'commercial', 'picture', 'shoot'],
    title: '📸 Photography',
    response: `Professional photography services in Norfolk & Virginia Beach!

**We offer:**
• Commercial photography
• Event coverage
• Headshots & portraits
• Product photography

View our portfolio and book a session.`,
    actions: [
      { label: 'View Gallery', href: '/photography#view-gallery' },
      { label: 'Get Quote', href: '/contact' },
    ],
    category: 'services',
  },
  {
    id: 'svc-video',
    keywords: ['video', 'videography', 'film', 'filming', 'production', 'commercial video'],
    title: '🎬 Video Production',
    response: `Full-service video production from concept to delivery!

**Services include:**
• Commercial spots
• Brand videos
• Event coverage
• Social media content
• Motion graphics

AI-accelerated workflow = 10x faster turnaround.`,
    actions: [
      { label: 'View Work', href: '/video#view-gallery' },
      { label: 'Get Quote', href: '/contact' },
    ],
    category: 'services',
  },
  {
    id: 'svc-drone',
    keywords: ['drone', 'aerial', 'dji', 'fly', 'flying', 'overhead', 'birds eye'],
    title: '🚁 Drone Services',
    response: `FAA-certified drone pilots for stunning aerial content!

**We capture:**
• Real estate aerials
• Event overviews
• Commercial B-roll
• Construction progress
• Beach & coastal shots

All flights are insured and permitted.`,
    actions: [
      { label: 'View Aerials', href: '/drone#view-gallery' },
      { label: 'Book Flight', href: '/contact' },
    ],
    category: 'services',
  },
  {
    id: 'svc-motion',
    keywords: ['motion', 'graphics', 'animation', '3d', 'render', 'after effects', 'cinema 4d', 'vfx'],
    title: '✨ Motion Graphics',
    response: `Eye-catching motion graphics and 3D renders!

**What we create:**
• Logo animations
• Title sequences
• Social media animations
• 3D product renders
• AI-generated visuals

From subtle movements to full VFX shots.`,
    actions: [
      { label: 'View Work', href: '/motion-graphics#view-gallery' },
      { label: 'Get Quote', href: '/contact' },
    ],
    category: 'services',
  },
  {
    id: 'svc-web',
    keywords: ['website', 'web', 'site', 'digital', 'app', 'development', 'build', 'redesign'],
    title: '💻 Web Development',
    response: `Modern websites and web apps that convert!

**We build:**
• Marketing websites
• E-commerce stores
• Web applications
• Landing pages
• Website redesigns

Next.js, React, and AI-native builds.`,
    actions: [
      { label: 'Website Help', href: '/website-help' },
      { label: 'Get Quote', href: '/contact' },
    ],
    category: 'services',
  },
  {
    id: 'svc-seo',
    keywords: ['seo', 'search', 'google', 'ranking', 'optimization', 'keywords', 'traffic', 'found'],
    title: '🔍 SEO Services',
    response: `Get found on Google with strategic SEO!

**Our approach:**
• Local SEO (Norfolk/VA Beach)
• Technical optimization
• Content strategy
• AI Engine Optimization (AEO)

We optimize for both humans AND AI bots.`,
    actions: [
      { label: 'Learn More', href: '/seo' },
      { label: 'Get Audit', href: '/contact' },
    ],
    category: 'services',
  },
  {
    id: 'svc-podcast',
    keywords: ['podcast', 'audio', 'recording', 'episode', 'show', 'interview'],
    title: '🎙️ Podcast Production',
    response: `Full podcast production services!

**We handle:**
• Recording sessions
• Audio editing
• Show notes
• Distribution setup
• Video podcasts

From solo shows to interview formats.`,
    actions: [
      { label: 'Learn More', href: '/podcast' },
      { label: 'Get Quote', href: '/contact' },
    ],
    category: 'services',
  },
  {
    id: 'svc-shock-kit',
    keywords: ['shock kit', 'social media', 'content', 'posting', 'instagram', 'tiktok', 'reels'],
    title: '⚡ The Shock Kit',
    response: `The Shock Kit: "We Create. You Post." ⚡

**What is it?**
Social content system for brands who hate editing.

**What you get:**
• AI-driven design systems
• Reels, posts, stories strategy
• Professional content monthly
• No long-term contracts

**Starting at:** $950`,
    actions: [
      { label: 'View Shock Kit', href: '/shock-kit' },
      { label: 'Get Started', href: '/get-started' },
    ],
    category: 'services',
  },

  // -------- HELP & SUPPORT --------
  {
    id: 'help-contact',
    keywords: ['contact', 'reach', 'email', 'phone', 'message', 'talk', 'call'],
    title: '💬 Contact Us',
    response: `Ready to start a project? Let's talk!

**Get in touch:**
• Fill out our contact form
• We respond within 24 hours
• Free consultations available

Tell us about your project and budget.`,
    actions: [
      { label: 'Contact Form', href: '/contact' },
      { label: 'Get Started', href: '/get-started' },
    ],
    category: 'help',
  },
  {
    id: 'help-pricing',
    keywords: ['price', 'pricing', 'cost', 'rate', 'quote', 'budget', 'package', 'packages', 'expensive', 'cheap', 'afford'],
    title: '💰 Pricing',
    response: `We work within YOUR budget ⚡

**Quick reference:**
• Shock Kit bundles: from $950
• Custom projects: Get a quote
• Retainer packages: Available

Tell us your cap, we'll maximize services to fit.`,
    actions: [
      { label: 'View Pricing', href: '/pricing' },
      { label: 'Shock Kit', href: '/shock-kit' },
      { label: 'Get Quote', href: '/contact' },
    ],
    category: 'help',
  },
  {
    id: 'help-location',
    keywords: ['location', 'where', 'norfolk', 'virginia', 'beach', 'hampton', 'roads', 'area', 'local', 'chesapeake'],
    title: '📍 Location',
    response: `We're based in Norfolk, Virginia! 🌊

**Service area:**
• Norfolk & Virginia Beach
• Chesapeake & Suffolk
• Hampton Roads region
• Remote work available worldwide

Local shoots + global digital services.`,
    actions: [
      { label: 'Contact', href: '/contact' },
    ],
    category: 'help',
  },
  {
    id: 'help-about',
    keywords: ['about', 'who', 'team', 'company', 'robbie', 'ceo', 'founder', 'you'],
    title: '👋 About Us',
    response: `ShockAI is a creative studio specializing in AI-powered media production.

We blend traditional filmmaking with cutting-edge AI tools to create stunning visual content.

**Our mission:** Shock The Media & Beat The Algorithm ⚡

Based in Norfolk, VA - serving clients worldwide.`,
    actions: [
      { label: 'About Page', href: '/about' },
      { label: 'Meet the Team', href: '/about/ceo-robbie-creates' },
    ],
    category: 'help',
  },
  {
    id: 'help-wallet',
    keywords: ['wallet', 'connect', 'metamask', 'web3', 'crypto', 'login', 'sign in'],
    title: '🔐 Wallet Connection',
    response: `Shock Studio requires a Web3 wallet to access.

**Supported wallets:**
• MetaMask
• WalletConnect
• Coinbase Wallet

Your templates are saved locally, keyed to your wallet address. No data leaves your browser!`,
    actions: [
      { label: 'Open Studio', href: '/studio' },
    ],
    category: 'help',
  },

  // -------- FAQ / LAYMAN QUESTIONS --------
  {
    id: 'faq-ai',
    keywords: ['chatgpt', 'ai', 'artificial intelligence', 'gpt', 'machine learning', 'robot'],
    title: '🤖 Do You Use AI?',
    response: `Yes, but not the way you'd think!

We use a custom stack of AI tools (including our own) to merge human creativity with machine speed.

**It's not just "prompting"** - it's an engineering pipeline that accelerates every step.

Result: Better work, faster turnaround, competitive pricing.`,
    actions: [
      { label: 'Learn More', href: '/about' },
    ],
    category: 'help',
  },
  {
    id: 'faq-manage-social',
    keywords: ['manage', 'run', 'post for me', 'handle', 'manage my'],
    title: '📱 Can You Manage My Socials?',
    response: `Yes! That's exactly what the Shock Kit is for ⚡

**"We Create. You Post."**
Or, if you whitelist us, we can handle posting too.

We create the strategy, content, and schedule - you focus on running your business.`,
    actions: [
      { label: 'View Shock Kit', href: '/shock-kit' },
      { label: 'Get Started', href: '/get-started' },
    ],
    category: 'help',
  },
  {
    id: 'faq-aeo',
    keywords: ['aeo', 'llmo', 'ai optimization', 'ai engine', 'chatgpt search'],
    title: '🔮 What is AEO / LLMO?',
    response: `**AEO = AI Engine Optimization**
**LLMO = Large Language Model Optimization**

It means we optimize your site so *AI bots* (Gemini, ChatGPT, Perplexity) can read and recommend your business.

Google isn't the only search anymore. We prepare you for all of them.`,
    actions: [
      { label: 'SEO Services', href: '/seo' },
      { label: 'Learn More', href: '/contact' },
    ],
    category: 'help',
  },
  {
    id: 'faq-turnaround',
    keywords: ['fast', 'quick', 'turnaround', 'delivery', 'how long', 'when', 'timeline', 'deadline'],
    title: '⚡ How Fast Is Delivery?',
    response: `AI supercharges our speed!

**Typical turnarounds:**
• Simple assets: Same day - few days
• Social content batches: 1-2 weeks
• Full video productions: 10x faster than traditional

We always discuss timeline before starting.`,
    actions: [
      { label: 'Start Project', href: '/contact' },
    ],
    category: 'help',
  },
  {
    id: 'faq-book',
    keywords: ['book', 'schedule', 'appointment', 'meeting', 'calendar', 'availability'],
    title: '📅 Ready to Book?',
    response: `Let's get on the calendar!

**How to book:**
1. Fill out our Get Started form
2. We'll review and respond within 24 hours
3. Schedule a free consultation

No commitment required for the first chat.`,
    actions: [
      { label: 'Get Started', href: '/get-started' },
      { label: 'Contact Us', href: '/contact' },
    ],
    category: 'help',
  },

  // -------- GALLERIES & PORTFOLIO --------
  {
    id: 'faq-gallery',
    keywords: ['gallery', 'portfolio', 'work', 'samples', 'examples', 'see', 'view', 'show'],
    title: '🖼️ View Our Work',
    response: `Want to see what we've created? Check out our galleries!

**Browse by category:**
• 📸 Photography - portraits, events, commercial
• 🎬 Video - commercials, events, brand content
• 🚁 Drone - aerial shots & flyovers
• ✨ Motion Graphics - animations & VFX
• 🎙️ Podcast - interview & discussion samples

Each gallery has our best work. Click any piece for details!`,
    actions: [
      { label: '📸 Photography', href: '/photography#view-gallery' },
      { label: '🎬 Video', href: '/video#view-gallery' },
      { label: '🚁 Drone', href: '/drone#view-gallery' },
      { label: '✨ Motion', href: '/motion-graphics#view-gallery' },
    ],
    category: 'help',
  },

  // -------- SPECIALS & PROMOTIONS --------
  {
    id: 'faq-specials',
    keywords: ['special', 'deal', 'promotion', 'discount', 'offer', 'sale', 'coupon', 'promo'],
    title: '⚡ Special Offers',
    response: `Yes, we run special promotions!

**Current specials:**
• Event-specific pricing packages
• Limited-time promotional rates
• QR code / flyer verified deals

**How to claim:**
1. Check our Specials page
2. Save the QR code or flyer
3. Present when booking

Specials change regularly - check back often!`,
    actions: [
      { label: '⚡ View Specials', href: '/pricing/specials' },
      { label: '💰 All Pricing', href: '/pricing' },
    ],
    category: 'help',
  },

  // -------- PROCESS & WORKFLOW --------
  {
    id: 'faq-process',
    keywords: ['process', 'workflow', 'steps', 'how does', 'work with', 'journey', 'what happens'],
    title: '🔄 Our Process',
    response: `Here's how working with us goes:

**1. Discovery (Free)**
• You fill out Get Started form
• We review & respond in 24 hours
• Quick call to understand your vision

**2. Proposal**
• Custom quote based on your needs
• Clear scope & deliverables
• Timeline & payment terms

**3. Production**
• We create, you review
• Revisions included
• Regular updates on progress

**4. Delivery**
• Final files in your preferred format
• All source files if requested
• Support after delivery

No surprises, no BS ⚡`,
    actions: [
      { label: '🚀 Get Started', href: '/get-started' },
      { label: '💬 Questions?', href: '/contact' },
    ],
    category: 'help',
  },

  // -------- FILE DELIVERY --------
  {
    id: 'faq-delivery',
    keywords: ['delivery', 'files', 'format', 'formats', 'receive', 'get', 'download', 'send'],
    title: '📦 File Delivery',
    response: `Here's how you get your files:

**Delivery method:**
• Secure cloud link (Google Drive/Dropbox)
• Direct download for smaller files
• Hard drive shipping for massive projects

**Common formats:**
• Video: MP4, MOV, ProRes
• Photos: JPG, PNG, RAW/DNG
• Graphics: PNG, SVG, AI, PSD
• Web: Deployed to your hosting

**Turnaround:**
• Files delivered as agreed in scope
• Preview links for approval first
• Final files after sign-off

Need specific formats? Just ask!`,
    actions: [
      { label: '💬 Ask About Formats', href: '/contact' },
    ],
    category: 'help',
  },

  // -------- TRAVEL & SERVICE AREA --------
  {
    id: 'faq-travel',
    keywords: ['travel', 'location', 'area', 'distance', 'far', 'outside', 'fly', 'come to'],
    title: '✈️ Travel & Service Area',
    response: `We're based in Norfolk, VA but we travel!

**Local (no travel fee):**
• Norfolk, Virginia Beach
• Chesapeake, Suffolk
• Hampton Roads region

**Regional:**
• Richmond, DC, NC coast
• Travel fee may apply

**National/International:**
• Yes, we travel for projects!
• Travel costs added to quote
• We've shot coast to coast

**Remote work:**
• Web, SEO, social - 100% remote
• Worldwide clients welcome

Tell us where you are - we'll figure it out ⚡`,
    actions: [
      { label: '💬 Discuss Location', href: '/contact' },
    ],
    category: 'help',
  },

  // -------- REVISIONS --------
  {
    id: 'faq-revisions',
    keywords: ['revision', 'revisions', 'changes', 'edit', 'modify', 'redo', 'fix', 'adjust'],
    title: '🔄 Revisions Policy',
    response: `Revisions are built into every project!

**Standard packages include:**
• 2-3 rounds of revisions
• Clear feedback windows
• Quick turnaround on changes

**What counts as a revision:**
• Color/tone adjustments
• Minor layout changes
• Text/copy updates
• Timing tweaks (video)

**What's extra:**
• Scope changes (new features)
• Additional deliverables
• Rush revision requests

We want you 100% happy with the final product ⚡`,
    actions: [
      { label: '💬 Discuss Project', href: '/contact' },
    ],
    category: 'help',
  },

  // -------- RUSH ORDERS --------
  {
    id: 'faq-rush',
    keywords: ['rush', 'urgent', 'asap', 'fast', 'quick', 'deadline', 'tomorrow', 'friday', 'emergency'],
    title: '⚡ Rush Orders',
    response: `Need it fast? We can expedite!

**Rush availability:**
• Depends on current workload
• AI tools help us move faster
• Some projects can't be rushed

**Rush pricing:**
• 25-50% premium typically
• Depends on timeline & scope
• Worth it when you need it

**To request rush:**
1. Contact us immediately
2. Explain deadline & project
3. We'll confirm if possible

The sooner you reach out, the better ⚡`,
    actions: [
      { label: '🚨 Rush Request', href: '/contact' },
    ],
    category: 'help',
  },

  // -------- AI TOOLS --------
  {
    id: 'faq-ai-tools',
    keywords: ['ai', 'tools', 'software', 'runway', 'pika', 'midjourney', 'model', 'models', 'generate'],
    title: '🤖 AI Tools We Use',
    response: `Our prompts work with major AI video tools!

**Video AI platforms:**
• Runway ML (Gen-2, Gen-3)
• Pika Labs
• Kling AI
• Luma Dream Machine

**Image AI:**
• Midjourney
• DALL-E
• Stable Diffusion

**Our templates are designed for:**
• Maximum compatibility
• Professional output
• Consistent results

The "Cook This Prompt" feature adds model-specific optimizations ⚡`,
    actions: [
      { label: '⚡ Try Studio', href: '/studio' },
    ],
    category: 'help',
  },

  // -------- CONTRACTS --------
  {
    id: 'faq-contracts',
    keywords: ['contract', 'agreement', 'terms', 'sign', 'legal', 'binding', 'commitment'],
    title: '📝 Contracts & Agreements',
    response: `Yes, we use simple contracts!

**What's included:**
• Scope of work (what we're delivering)
• Timeline & milestones
• Payment terms
• Revision policy
• Usage rights

**What we DON'T do:**
• Long-term lock-ins (unless you want retainer)
• Hidden fees or gotchas
• Confusing legal jargon

**Shock Kit:**
• Month-to-month, cancel anytime
• No long-term contracts required

We keep it simple and fair ⚡`,
    actions: [
      { label: '💬 Discuss Terms', href: '/contact' },
    ],
    category: 'help',
  },

  // -------- WHITE LABEL --------
  {
    id: 'faq-whitelabel',
    keywords: ['white label', 'whitelabel', 'agency', 'resell', 'your brand', 'my brand', 'rebrand', 'partner'],
    title: '🏷️ White-Label Services',
    response: `Yes, we offer white-label partnerships!

**For agencies & resellers:**
• We create under YOUR brand
• No ShockAI watermarks
• Direct client handoff

**What we white-label:**
• Video production
• Photography
• Motion graphics
• Web development
• Social content

**How it works:**
1. You sell to your client
2. We produce behind the scenes
3. You deliver as your own work

Agency pricing available - let's talk ⚡`,
    actions: [
      { label: '🤝 Partner With Us', href: '/contact' },
    ],
    category: 'help',
  },

  // -------- FALLBACK --------
  {
    id: 'fallback',
    keywords: [],
    title: '🤔 Not Sure?',
    response: `I couldn't find an exact match, but here are some popular options:

• **Create content** → Shock Studio
• **Plan your network** → Creator Forge
• **Hire us** → Contact page
• **See our work** → Gallery pages

What are you looking for?`,
    actions: QUICK_ACTIONS,
    category: 'help',
  },
]

// ============================================
// PRICING INTENT DETECTOR
// ============================================
function detectPricingIntent(query: string): PricingMatch | null {
  const lowerQuery = query.toLowerCase()

  // Check for pricing-related phrases
  const pricingPhrases = [
    'how much',
    'what does',
    'cost',
    'price',
    'pricing',
    'expensive',
    'cheap',
    'afford',
    'budget',
    'rate',
    'rates',
    'charge',
    'fee',
    'fees',
    'pay',
    'payment',
    'invest',
    'spend',
    'dollar',
    '$',
  ]

  const hasPricingIntent = pricingPhrases.some((phrase) => lowerQuery.includes(phrase))

  if (!hasPricingIntent) return null

  // Find the most relevant service mentioned
  for (const protocol of PRICING_PROTOCOLS) {
    if (protocol.keywords.length === 0) continue // Skip general fallback for now

    for (const keyword of protocol.keywords) {
      if (lowerQuery.includes(keyword)) {
        return protocol
      }
    }
  }

  // Return general pricing if no specific service detected
  return PRICING_PROTOCOLS.find((p) => p.serviceType === 'general') || null
}

// ============================================
// CONTEXT-AWARE RESPONSES - Studio-specific help
// ============================================
interface ContextModule {
  context: string // route prefix (e.g., '/studio')
  keywords: string[]
  title: string
  response: string
  actions?: QuickAction[]
}

const CONTEXT_MODULES: ContextModule[] = [
  // -------- HOME PAGE --------
  {
    context: '/',
    keywords: ['what', 'do', 'here', 'this', 'how', 'start', 'help', 'work', 'begin', 'first'],
    title: '⚡ Welcome to ShockAI!',
    response: `You're on our homepage - let's get you started!

**What ShockAI does:**
• Video, Photo, Drone production
• Web development & SEO
• AI-powered social content (Shock Kit)

**Best next steps:**
1. 🎬 **See Our Work** → Browse galleries
2. 💰 **Check Pricing** → Find your budget fit
3. 🚀 **Get Started** → Fill out the quick form

**Not sure what you need?**
Just ask! I can help you figure out the right service.`,
    actions: [
      { label: '🚀 Get Started', href: '/get-started' },
      { label: '📸 View Work', href: '/photography#view-gallery' },
      { label: '💰 Pricing', href: '/pricing' },
    ],
  },

  // -------- STUDIO PAGES --------
  {
    context: '/studio',
    keywords: ['what', 'do', 'here', 'this', 'how', 'use', 'help', 'work', 'start'],
    title: '⚡ Shock Studio Help',
    response: `You're in Shock Studio - our AI video transition prompt builder!

**What you can do here:**
• Create reusable prompt templates with {{VARIABLES}}
• Use Quick Fill presets to speed up creation
• "Cook" your prompts into cinematic mega-prompts
• Save & manage your template library

**Getting started:**
1. Click "New Template" to create
2. Follow the 8-step wizard
3. Fill variables or use presets
4. Hit "Cook This Prompt" for the magic ✨`,
    actions: [
      { label: '📝 New Template', href: '/studio/templates/new' },
      { label: '📚 My Templates', href: '/studio' },
    ],
  },
  {
    context: '/studio/creator-forge',
    keywords: ['what', 'do', 'here', 'this', 'how', 'use', 'help', 'work', 'forge', 'start'],
    title: '🔨 Creator Forge Help',
    response: `You're in Creator Forge - build your content creator network map!

**What you can do here:**
• Define your Flagship account (main brand)
• Create Hubs (collectives like "Nerd Athletes")
• Add Sub-Brands (faceless channels)
• Draw Synergy Links between them
• Export as PNG, SVG, or JSON

**Think of it as:**
A visual blueprint for your multi-channel content empire ⚡`,
    actions: [
      { label: '🏠 Back to Studio', href: '/studio' },
    ],
  },
  {
    context: '/studio/templates/new',
    keywords: ['what', 'do', 'here', 'this', 'how', 'use', 'help', 'work', 'create', 'template', 'start'],
    title: '📝 Template Wizard Help',
    response: `You're creating a new prompt template!

**The 8 Steps:**
1. **Role** - Who's the creative director?
2. **Source** - What's the starting scene?
3. **Transition** - How does it morph?
4. **Destination** - What's the end scene?
5. **Energy** - Pacing & intensity
6. **Tech Specs** - Resolution, FPS
7. **Variables** - Add {{PLACEHOLDERS}}
8. **Preview** - Review & save

**Tips:**
• Use Quick Fill presets (⚡ buttons)
• Add variables like \`{{SUBJECT}}\` for reuse
• Lock sections you like to protect them`,
    actions: [
      { label: '📚 My Templates', href: '/studio' },
    ],
  },

  // -------- SERVICE PAGES --------
  {
    context: '/photography',
    keywords: ['what', 'do', 'here', 'this', 'how', 'start', 'book', 'work', 'help'],
    title: '📸 Photography Page',
    response: `You're viewing our photography portfolio!

**What's here:**
• Our best photo work across categories
• Commercial, event, portrait samples
• Click any image to view full size

**Ready to book?**
1. Browse the gallery for style reference
2. Click "Get Quote" to describe your project
3. We'll respond within 24 hours with options

Sessions available in Norfolk/VA Beach & surrounding areas.`,
    actions: [
      { label: '💬 Get Quote', href: '/contact' },
      { label: '📅 Get Started', href: '/get-started' },
    ],
  },
  {
    context: '/video',
    keywords: ['what', 'do', 'here', 'this', 'how', 'start', 'book', 'work', 'help'],
    title: '🎬 Video Page',
    response: `You're viewing our video production portfolio!

**What's here:**
• Commercial spots & brand videos
• Event coverage samples
• AI-enhanced productions

**Ready to create?**
1. Watch samples to see our style
2. Click "Get Quote" with your project details
3. We'll scope it out and send options

AI accelerates our workflow = faster delivery, better value ⚡`,
    actions: [
      { label: '💬 Get Quote', href: '/contact' },
      { label: '📅 Get Started', href: '/get-started' },
    ],
  },
  {
    context: '/drone',
    keywords: ['what', 'do', 'here', 'this', 'how', 'start', 'book', 'work', 'help', 'aerial'],
    title: '🚁 Drone Services Page',
    response: `You're viewing our aerial/drone portfolio!

**What's here:**
• Stunning aerial shots & videos
• Real estate, events, commercial B-roll
• All FAA-certified & insured flights

**Ready to fly?**
1. Browse samples for inspiration
2. Tell us your location & project type
3. We'll check airspace and quote it

We handle all permits and flight planning.`,
    actions: [
      { label: '💬 Get Quote', href: '/contact' },
      { label: '📅 Get Started', href: '/get-started' },
    ],
  },
  {
    context: '/motion-graphics',
    keywords: ['what', 'do', 'here', 'this', 'how', 'start', 'work', 'help', 'animation'],
    title: '✨ Motion Graphics Page',
    response: `You're viewing our motion graphics & animation work!

**What's here:**
• Logo animations & title sequences
• Social media motion content
• AI-generated visuals & VFX

**Want something custom?**
1. See styles you like in the gallery
2. Describe your vision in a quote request
3. We'll mock up concepts for approval

From subtle motion to full VFX shots ⚡`,
    actions: [
      { label: '💬 Get Quote', href: '/contact' },
      { label: '📅 Get Started', href: '/get-started' },
    ],
  },
  {
    context: '/podcast',
    keywords: ['what', 'do', 'here', 'this', 'how', 'start', 'work', 'help', 'audio'],
    title: '🎙️ Podcast Page',
    response: `You're viewing our podcast production services!

**What we offer:**
• Full recording sessions
• Audio editing & mixing
• Show notes & distribution setup
• Video podcast production

**Ready to launch your show?**
1. Check out sample episodes
2. Tell us your podcast concept
3. We'll build a package that fits

Solo shows, interviews, or panel formats - we got you.`,
    actions: [
      { label: '💬 Get Quote', href: '/contact' },
      { label: '📅 Get Started', href: '/get-started' },
    ],
  },
  {
    context: '/seo',
    keywords: ['what', 'do', 'here', 'this', 'how', 'start', 'work', 'help', 'google'],
    title: '🔍 SEO Services Page',
    response: `You're viewing our SEO & search optimization services!

**What we do:**
• Local SEO (Norfolk/Hampton Roads)
• Technical website optimization
• Content strategy & keywords
• AEO - AI Engine Optimization (ChatGPT, Perplexity, etc.)

**Ready to get found?**
1. Request a free SEO audit
2. We'll analyze your current rankings
3. Get a custom optimization plan

We optimize for humans AND AI bots ⚡`,
    actions: [
      { label: '🔍 Get Free Audit', href: '/contact' },
      { label: '📅 Get Started', href: '/get-started' },
    ],
  },
  {
    context: '/shock-kit',
    keywords: ['what', 'do', 'here', 'this', 'how', 'start', 'work', 'help', 'social'],
    title: '⚡ Shock Kit Page',
    response: `You're viewing The Shock Kit - our social content system!

**"We Create. You Post."**
• AI-driven content strategy
• Professional posts, reels, stories
• Monthly content batches
• No long-term contracts

**How to start:**
1. Review the 3 pricing tiers
2. Pick what fits your volume needs
3. Fill out Get Started form
4. We onboard you in 24-48 hours

Starting at $950/month ⚡`,
    actions: [
      { label: '💰 View Pricing', href: '/pricing' },
      { label: '🚀 Get Started', href: '/get-started' },
    ],
  },
  {
    context: '/website-help',
    keywords: ['what', 'do', 'here', 'this', 'how', 'start', 'work', 'help', 'web'],
    title: '💻 Website Help Page',
    response: `You're on our web development services page!

**What we build:**
• Marketing websites & landing pages
• E-commerce stores
• Web applications
• Website redesigns

**How to start:**
1. Describe your project needs
2. We'll scope features & timeline
3. Get a detailed quote
4. Approve and we start building

Next.js, React, AI-native builds ⚡`,
    actions: [
      { label: '💬 Get Quote', href: '/contact' },
      { label: '📅 Get Started', href: '/get-started' },
    ],
  },

  // -------- CONVERSION PAGES --------
  {
    context: '/pricing',
    keywords: ['what', 'do', 'here', 'this', 'how', 'start', 'work', 'help', 'choose'],
    title: '💰 Pricing Page',
    response: `You're viewing our pricing options!

**What's here:**
• Service-specific pricing guides
• Shock Kit bundle tiers
• Special event pricing (check the banner!)

**How to choose:**
1. Find your service category
2. See starting prices & what's included
3. Click to get a custom quote

**Pro tip:** We work within YOUR budget - tell us your cap and we'll maximize value ⚡`,
    actions: [
      { label: '⚡ View Specials', href: '/pricing/specials' },
      { label: '💬 Get Quote', href: '/contact' },
    ],
  },
  {
    context: '/pricing/specials',
    keywords: ['what', 'do', 'here', 'this', 'how', 'start', 'work', 'help', 'special', 'deal'],
    title: '⚡ Special Pricing Page',
    response: `You're viewing our special event pricing!

**What's here:**
• Limited-time promotional rates
• Event-specific packages
• Exclusive deals (QR/flyer required)

**How to claim:**
1. Check if your event qualifies
2. Save the QR code or flyer
3. Present at booking to verify
4. Get the special rate applied

These deals don't last forever - act fast! ⚡`,
    actions: [
      { label: '💬 Book Now', href: '/contact' },
      { label: '📅 Get Started', href: '/get-started' },
    ],
  },
  {
    context: '/contact',
    keywords: ['what', 'do', 'here', 'this', 'how', 'start', 'work', 'help', 'next', 'send'],
    title: '💬 Contact Page',
    response: `You're on the contact form - almost there!

**What happens next:**
1. Fill out the form with project details
2. Include your budget range (helps us scope)
3. Hit send - we get notified instantly
4. Response within 24 hours (usually faster)

**Tips for faster response:**
• Be specific about what you need
• Mention timeline if urgent
• Include reference links if you have them

No commitment - just a conversation ⚡`,
    actions: [
      { label: '📅 Or Get Started', href: '/get-started' },
    ],
  },
  {
    context: '/get-started',
    keywords: ['what', 'do', 'here', 'this', 'how', 'start', 'work', 'help', 'next', 'fill'],
    title: '🚀 Get Started Page',
    response: `You're on the Get Started form - let's build something!

**What this form does:**
• Collects your project requirements
• Helps us understand your goals
• Starts the conversation

**After you submit:**
1. We review within 24 hours
2. Schedule a free consultation call
3. Get a custom proposal
4. Approve and we kick off

No pressure, no hard sells - just solutions ⚡`,
    actions: [
      { label: '💬 Or Just Contact', href: '/contact' },
    ],
  },

  // -------- INFO PAGES --------
  {
    context: '/about',
    keywords: ['what', 'do', 'here', 'this', 'how', 'who', 'work', 'help', 'team'],
    title: '👋 About Page',
    response: `You're learning about ShockAI!

**Who we are:**
• Creative studio in Norfolk, VA
• AI-powered media production
• Traditional filmmaking + cutting-edge tech

**Our mission:**
"Shock The Media & Beat The Algorithm" ⚡

**What makes us different:**
• AI accelerates everything we do
• Faster turnaround, better value
• We actually use the tools we talk about

Want to work together?`,
    actions: [
      { label: '💬 Contact Us', href: '/contact' },
      { label: '🚀 Get Started', href: '/get-started' },
    ],
  },
  {
    context: '/about/ceo-robbie-creates',
    keywords: ['what', 'do', 'here', 'this', 'who', 'robbie', 'ceo', 'founder', 'help'],
    title: '👤 Meet Robbie',
    response: `You're reading about Robbie Creates - ShockAI's founder!

**Who is Robbie?**
• Creative director & founder of ShockAI
• 10+ years in media production
• AI workflow pioneer

**Connect with Robbie:**
• Follow the creative journey
• See behind-the-scenes content
• Learn from his experience

Want to work with the team?`,
    actions: [
      { label: '💬 Contact Us', href: '/contact' },
      { label: '🚀 Get Started', href: '/get-started' },
    ],
  },
  {
    context: '/blog',
    keywords: ['what', 'do', 'here', 'this', 'how', 'read', 'article', 'learn', 'help'],
    title: '📚 Blog & Resources',
    response: `You're in our blog section!

**What's here:**
• Tips on video, photo, and web
• AI and marketing insights
• How-to guides and tutorials

**Popular topics:**
• Photography tips
• Website best practices
• AI in creative work

Browse articles and level up your knowledge ⚡`,
    actions: [
      { label: '🏠 Back Home', href: '/' },
      { label: '💬 Contact Us', href: '/contact' },
    ],
  },
  {
    context: '/digital-builds',
    keywords: ['what', 'do', 'here', 'this', 'how', 'start', 'work', 'help', 'digital'],
    title: '🖥️ Digital Builds',
    response: `You're viewing our digital builds portfolio!

**What's here:**
• Custom web applications
• Digital tools we've built
• Interactive experiences

**Want something built?**
Tell us your vision and we'll scope it out.

Custom software, apps, and digital products ⚡`,
    actions: [
      { label: '💬 Get Quote', href: '/contact' },
      { label: '🚀 Get Started', href: '/get-started' },
    ],
  },
  {
    context: '/media-production',
    keywords: ['what', 'do', 'here', 'this', 'how', 'start', 'work', 'help', 'media'],
    title: '🎬 Media Production',
    response: `You're viewing our full media production services!

**What we offer:**
• End-to-end video production
• Commercial shoots
• Event coverage
• Post-production & editing

**Full-service production:**
From concept to delivery, we handle it all.

AI-accelerated workflow = faster, better, cheaper ⚡`,
    actions: [
      { label: '💬 Get Quote', href: '/contact' },
      { label: '🚀 Get Started', href: '/get-started' },
    ],
  },
  {
    context: '/website-fix',
    keywords: ['what', 'do', 'here', 'this', 'how', 'start', 'work', 'help', 'fix', 'broken'],
    title: '🔧 Website Fix',
    response: `Need your website fixed? You're in the right place!

**Common fixes:**
• Broken pages or links
• Speed optimization
• Mobile responsiveness
• Security updates

**How it works:**
1. Tell us what's wrong
2. We diagnose the issue
3. Get a quick fix quote
4. Fast turnaround

Don't let a broken site lose you business ⚡`,
    actions: [
      { label: '🔧 Fix My Site', href: '/contact' },
      { label: '🚀 Get Started', href: '/get-started' },
    ],
  },
  {
    context: '/website-redesign',
    keywords: ['what', 'do', 'here', 'this', 'how', 'start', 'work', 'help', 'redesign', 'new'],
    title: '✨ Website Redesign',
    response: `Ready for a fresh new website?

**What we redesign:**
• Outdated branding
• Poor mobile experience
• Slow loading sites
• Confusing navigation

**Our approach:**
• Modern, fast Next.js builds
• Mobile-first design
• SEO-optimized from day one
• AI-native development

Let's transform your online presence ⚡`,
    actions: [
      { label: '💬 Get Quote', href: '/contact' },
      { label: '🚀 Get Started', href: '/get-started' },
    ],
  },
  {
    context: '/thank-you',
    keywords: ['what', 'do', 'here', 'this', 'how', 'next', 'work', 'help', 'now'],
    title: '🎉 Thanks for Reaching Out!',
    response: `You submitted a form - awesome!

**What happens next:**
1. We review your submission
2. Response within 24 hours (usually faster)
3. We'll discuss your project
4. Get a custom proposal

**While you wait:**
• Browse our galleries
• Check out the blog
• Explore Shock Studio

We're excited to work with you ⚡`,
    actions: [
      { label: '📸 View Work', href: '/photography#view-gallery' },
      { label: '⚡ Try Studio', href: '/studio' },
    ],
  },
  {
    context: '/whitelist',
    keywords: ['what', 'do', 'here', 'this', 'how', 'whitelist', 'access', 'help', 'join'],
    title: '🔐 Whitelist Access',
    response: `This is our whitelist/early access page!

**What's whitelisting?**
• Early access to new features
• Exclusive tools and content
• Priority support

**How to join:**
Connect your wallet and check eligibility.

Be part of the inner circle ⚡`,
    actions: [
      { label: '🏠 Back Home', href: '/' },
      { label: '⚡ Try Studio', href: '/studio' },
    ],
  },
  {
    context: '/pricing/specials/latin-fest',
    keywords: ['what', 'do', 'here', 'this', 'how', 'start', 'work', 'help', 'latin', 'fest'],
    title: '🎉 Latin Fest Special',
    response: `You found our Latin Fest special pricing!

**This exclusive deal includes:**
• Special event rates
• Limited-time packages
• Must present QR/flyer to verify

**How to claim:**
1. Save this page or QR code
2. Contact us to book
3. Present code at booking
4. Get the special rate applied

Don't miss out - these deals expire! ⚡`,
    actions: [
      { label: '💬 Book Now', href: '/contact' },
      { label: '🚀 Get Started', href: '/get-started' },
    ],
  },
]

// ============================================
// FUZZY SEARCH ENGINE - No external deps
// ============================================
export function findBestMatch(query: string, context?: string): KnowledgeModule {
  const normalizedQuery = query.toLowerCase().trim()
  const queryWords = normalizedQuery.split(/\s+/)

  // STEP 0: Check for CONTEXT-AWARE responses first (if in studio, etc.)
  if (context) {
    // Find the most specific context match
    // Special handling: '/' only matches exactly '/', other routes use startsWith
    const contextMatches = CONTEXT_MODULES.filter((cm) => {
      if (cm.context === '/') {
        return context === '/' // Exact match for home page
      }
      return context.startsWith(cm.context)
    }).sort((a, b) => b.context.length - a.context.length) // Most specific first

    for (const contextModule of contextMatches) {
      // Check if query matches context keywords
      const matchCount = contextModule.keywords.filter((kw) =>
        queryWords.some((word) => word.includes(kw) || kw.includes(word))
      ).length

      if (matchCount >= 2) {
        // Return context-aware response
        return {
          id: `context-${contextModule.context}`,
          keywords: contextModule.keywords,
          title: contextModule.title,
          response: contextModule.response,
          actions: contextModule.actions,
          category: 'studio',
        }
      }
    }
  }

  // STEP 1: Check for pricing intent
  const pricingMatch = detectPricingIntent(normalizedQuery)
  if (pricingMatch) {
    // Return a synthetic KnowledgeModule for pricing
    return {
      id: `pricing-${pricingMatch.serviceType}`,
      keywords: pricingMatch.keywords,
      title: '💰 Pricing Info',
      response: pricingMatch.response,
      actions: pricingMatch.actions,
      category: 'pricing',
    }
  }

  // STEP 2: Standard keyword matching
  let bestMatch: KnowledgeModule | null = null
  let bestScore = 0

  for (const module of KNOWLEDGE_BASE) {
    if (module.id === 'fallback') continue

    let score = 0

    for (const keyword of module.keywords) {
      const normalizedKeyword = keyword.toLowerCase()

      // Exact match in query (highest weight)
      if (normalizedQuery.includes(normalizedKeyword)) {
        score += 10
      }

      // Word-level matches
      for (const word of queryWords) {
        if (normalizedKeyword.includes(word) || word.includes(normalizedKeyword)) {
          score += 5
        }
        // Partial match (first 3 chars)
        if (word.length >= 3 && normalizedKeyword.startsWith(word.slice(0, 3))) {
          score += 2
        }
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestMatch = module
    }
  }

  // Return fallback if no good match
  if (!bestMatch || bestScore < 5) {
    return KNOWLEDGE_BASE.find((m) => m.id === 'fallback')!
  }

  return bestMatch
}

// ============================================
// GREETING RESPONSES - Context-aware variety
// ============================================
const HOME_GREETINGS = [
  `⚡ Welcome! Looking to create video, photos, or grow online? I can help you find the right service.`,
  `⚡ Hey there! Want to see our work, check pricing, or get started on a project?`,
  `⚡ Welcome to ShockAI! Ask me about services, pricing, or say "get started" to begin!`,
]

export const GREETINGS = [
  `⚡ Hey! I'm your Shock Assistant. What can I help you find?`,
  `⚡ Welcome to ShockAI! Ask me anything about our services.`,
  `⚡ Ready to create something electric? I'm here to help!`,
  `⚡ Shock Assistant online. What are we building today?`,
]

const STUDIO_GREETINGS = [
  `⚡ Welcome to Shock Studio! Need help with templates or prompts?`,
  `⚡ Studio mode activated! Ask me how to use any feature.`,
  `⚡ Hey creator! I can help you build amazing prompt templates.`,
]

const FORGE_GREETINGS = [
  `⚡ Welcome to Creator Forge! Ready to map your content empire?`,
  `🔨 Forge mode! Ask me how to build your creator network.`,
]

export function getRandomGreeting(context?: string): string {
  if (context?.includes('/studio/creator-forge')) {
    return FORGE_GREETINGS[Math.floor(Math.random() * FORGE_GREETINGS.length)]
  }
  if (context?.startsWith('/studio')) {
    return STUDIO_GREETINGS[Math.floor(Math.random() * STUDIO_GREETINGS.length)]
  }
  if (context === '/') {
    return HOME_GREETINGS[Math.floor(Math.random() * HOME_GREETINGS.length)]
  }
  return GREETINGS[Math.floor(Math.random() * GREETINGS.length)]
}
