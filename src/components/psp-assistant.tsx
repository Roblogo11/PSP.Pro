'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { MessageSquare, X, Send } from 'lucide-react'

// Quick Actions for PSP.Pro
const QUICK_ACTIONS = [
  { label: 'Buy Lessons', href: '/booking' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
  { label: 'My Dashboard', href: '/locker' },
]

// Knowledge Base for PSP.Pro
const KNOWLEDGE_BASE = [
  {
    keywords: ['pricing', 'cost', 'price', 'how much', 'rate', 'session cost'],
    title: 'Training Pricing',
    response: 'Our training sessions:\n\n• 1-on-1 Skills Training: $75/60min\n• 1-on-1 Performance: $75/60min\n• Speed & Agility Group: $50/90min\n• Small Group Training: $40/75min\n• Strength & Conditioning: $65/60min\n\nSave up to $200 with session packages!',
    actions: [{ label: 'View Pricing', href: '/pricing' }],
  },
  {
    keywords: ['book', 'schedule', 'appointment', 'reserve', 'session', 'training', 'buy', 'lesson'],
    title: 'Buy Lessons',
    response: 'Ready to train? Booking is easy!\n\n1. Choose your training type\n2. Pick your date and time\n3. Select your coach\n4. Complete payment via Stripe\n\nWe have availability Monday-Saturday.',
    actions: [{ label: 'Buy Lessons', href: '/booking' }],
  },
  {
    keywords: ['location', 'where', 'address', 'facility', 'virginia beach', '757'],
    title: 'Training Facility',
    response: 'We\'re located in Virginia Beach, VA serving the entire Hampton Roads / 757 area.\n\nTraining Hours:\n• Monday-Friday: 3PM - 9PM\n• Saturday: 9AM - 5PM\n• Sunday: Closed',
    actions: [{ label: 'Contact Us', href: '/contact' }],
  },
  {
    keywords: ['sport', 'baseball', 'softball', 'what sports', 'what do you train'],
    title: 'Sports We Train',
    response: 'We specialize in:\n\n• Baseball (all positions)\n• Softball (all positions)\n• Pitching mechanics & velocity\n• Hitting & swing development\n• Speed & agility\n• Strength & conditioning',
    actions: [{ label: 'Learn More', href: '/about' }],
  },
  {
    keywords: ['velocity', 'speed', 'throwing', 'mph', 'velo', 'pitching'],
    title: 'Velocity Training',
    response: 'Our velocity development program focuses on:\n\n• Mechanics optimization\n• Power generation\n• Arm health & conditioning\n• Data-driven progress tracking\n\nAverage velocity gains: 3-7 MPH in 12 weeks!',
    actions: [{ label: 'Get Started', href: '/get-started' }],
  },
  {
    keywords: ['age', 'how old', 'youth', 'kid', 'teenager'],
    title: 'Age Groups',
    response: 'We train athletes of all ages:\n\n• Youth (8-12)\n• Middle School (13-14)\n• High School (15-18)\n• College\n• Adult/Recreational\n\nPrograms customized for each age and skill level.',
    actions: [{ label: 'Sign Up', href: '/signup' }],
  },
  {
    keywords: ['coach', 'trainer', 'instructor', 'staff'],
    title: 'Our Coaches',
    response: 'All our coaches have:\n\n• College/Pro playing experience\n• Certified training credentials\n• Data analysis expertise\n• Player development track record\n\nYou\'ll be assigned the best coach for your goals!',
    actions: [{ label: 'About Us', href: '/about' }],
  },
  {
    keywords: ['package', 'deal', 'discount', 'bundle', 'sessions', 'save'],
    title: 'Training Packages',
    response: 'Save with our packages:\n\n• 5-Session Pack: $350 (save $25)\n• 10-Session Pack: $675 (save $75)\n• 20-Session Pack: $1,300 (save $200)\n\nMonthly Membership: $60/mo for unlimited group access + discounted 1-on-1s!',
    actions: [{ label: 'View Packages', href: '/pricing' }],
  },
  {
    keywords: ['dashboard', 'locker', 'my account', 'profile', 'stats', 'progress'],
    title: 'My Dashboard',
    response: 'Your PSP.Pro dashboard shows:\n\n• Performance progress & charts\n• Upcoming sessions\n• Training drills with video\n• Achievement badges\n• Session history\n\nEverything updates in real-time!',
    actions: [{ label: 'My Dashboard', href: '/locker' }],
  },
  {
    keywords: ['drill', 'drills', 'training video', 'exercise', 'workout'],
    title: 'Training Drills',
    response: 'Access our drill library:\n\n• Video drills with YouTube integration\n• Categorized by sport & skill level\n• Assigned by your coach\n• Track completion progress\n\nCoaches can create and assign drills from the Assign Courses page.',
    actions: [{ label: 'Training Drills', href: '/drills' }],
  },
  {
    keywords: ['membership', 'monthly', 'subscribe', 'unlimited'],
    title: 'Monthly Membership',
    response: 'Monthly Membership — $60/mo:\n\n• Unlimited group session access\n• Discounted 1-on-1 sessions\n• Priority scheduling\n• Full PSP.Pro dashboard access\n\nBest value for serious athletes!',
    actions: [{ label: 'View Plans', href: '/pricing' }],
  },
  {
    keywords: ['admin', 'coach dashboard', 'manage athletes', 'coach view'],
    title: 'Coach Dashboard',
    response: 'Coach tools available:\n\n• Coaches — View all team coaches\n• My Athletes — Manage your athletes\n• Manage Trainings — Set up packages & pricing\n• Assign Courses — Create & assign drills\n• Confirm Appointments — Review bookings\n• Analytics — Track performance data',
    actions: [{ label: 'Coach Dashboard', href: '/admin' }],
  },
]

function findBestMatch(query: string): any {
  const lowerQuery = query.toLowerCase()

  for (const item of KNOWLEDGE_BASE) {
    if (item.keywords.some(keyword => lowerQuery.includes(keyword))) {
      return item
    }
  }

  return {
    title: 'How Can We Help?',
    response: 'I can help you with:\n\n• Training pricing & packages\n• Booking sessions\n• Facility location & hours\n• Our training programs\n• Age groups we serve\n\nTry asking about pricing, booking, or our programs!',
    actions: QUICK_ACTIONS.map(a => ({ label: a.label, href: a.href })),
  }
}

export function PSPAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [hasGreeted, setHasGreeted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleOpen = () => {
    setIsOpen(true)
    if (!hasGreeted) {
      setHasGreeted(true)
      setMessages([
        {
          id: 'greeting',
          type: 'assistant',
          content: 'Hey there! 👋 I\'m your PSP.Pro assistant. Ask me about training programs, pricing, booking, or anything else!',
        },
      ])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const query = input.trim()
    setInput('')

    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: query,
    }

    const match = findBestMatch(query)
    const assistantMessage = {
      id: `assistant-${Date.now()}`,
      type: 'assistant',
      content: match.response,
      module: match,
    }

    setMessages(prev => [...prev, userMessage, assistantMessage])
  }

  return (
    <>
      {/* Floating Chat Button - Top right on mobile, bottom right on desktop */}
      <motion.button
        onClick={handleOpen}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[100] flex items-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-orange via-orange-500 to-orange-600 text-white text-sm font-bold shadow-2xl hover:shadow-orange/50 transition-all ring-4 ring-orange/20 hover:ring-orange/40"
        style={{
          animation: 'pulse-glow 3s ease-in-out infinite',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <MessageSquare className="w-5 h-5" />
        <span className="hidden sm:inline">Need Help?</span>
        {/* Notification badge */}
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan rounded-full animate-ping" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan rounded-full" />
      </motion.button>

      <style jsx global>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 10px 30px rgba(184, 48, 26, 0.4), 0 0 20px rgba(184, 48, 26, 0.3);
          }
          50% {
            box-shadow: 0 10px 40px rgba(184, 48, 26, 0.6), 0 0 30px rgba(184, 48, 26, 0.5);
          }
        }
      `}</style>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[101] bg-black/50 backdrop-blur-sm"
            />

            {/* Panel - Top right on mobile, bottom right on desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-4 left-2 right-2 sm:left-auto sm:bottom-6 sm:right-6 z-[102] sm:w-[400px] max-h-[calc(100vh-6rem)] sm:max-h-[600px] rounded-2xl overflow-hidden shadow-2xl command-panel"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-200/40 bg-gradient-to-r from-orange/10 to-cyan/10">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-orange" />
                  <span className="font-bold text-white">PSP.Pro Assistant</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors text-cyan-700 dark:text-white hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="px-4 py-3 border-b border-white/5 bg-cyan-50/50">
                <p className="text-xs text-cyan-700 dark:text-white mb-2">Quick Links</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_ACTIONS.map((action, i) => (
                    <Link
                      key={i}
                      href={action.href}
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-cyan-50/50 hover:bg-orange/20 text-cyan-700 dark:text-white hover:text-orange transition-colors border border-cyan-200/40 hover:border-orange/50"
                    >
                      {action.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="h-[300px] overflow-y-auto px-4 py-3 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id}>
                    {msg.type === 'user' ? (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-tr-sm bg-orange/80 text-white text-sm">
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-tl-sm bg-white/10 text-cyan-700 dark:text-white text-sm whitespace-pre-line">
                          {msg.module?.title && (
                            <div className="font-bold text-white mb-1 text-sm">
                              {msg.module.title}
                            </div>
                          )}
                          {msg.content}
                        </div>
                        {msg.module?.actions && msg.module.actions.length > 0 && (
                          <div className="flex flex-wrap gap-2 ml-1">
                            {msg.module.actions.map((action: any, i: number) => (
                              <Link
                                key={i}
                                href={action.href}
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-orange/20 hover:bg-orange/30 text-orange hover:text-white transition-all border border-orange/20"
                              >
                                {action.label}
                                <span>→</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-cyan-200/40 bg-cyan-50/50">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask about training, pricing..."
                    className="flex-1 px-4 py-2 rounded-xl bg-cyan-50/50 border border-cyan-200/40 text-white placeholder:text-cyan-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-orange/50"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange to-orange-600 text-white font-medium text-sm hover:opacity-90 transition-opacity"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-cyan-800 dark:text-white mt-2 text-center">
                  Instant answers • 100% helpful • No AI fluff
                </p>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
