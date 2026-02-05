'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  QUICK_ACTIONS,
  findBestMatch,
  getRandomGreeting,
  type KnowledgeModule,
  type QuickAction,
} from '@/lib/site-map-atlas'

// ============================================
// SHOCK ASSISTANT - Static Knowledge Router
// ============================================
// No API calls, no AI inference, just instant responses
// from pre-compiled knowledge. Fast, private, cheap.

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  module?: KnowledgeModule
}

export function ShockAssistant() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [hasGreeted, setHasGreeted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Check if we're in studio routes
  const isInStudio = pathname?.startsWith('/studio')

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Show greeting on first open (context-aware)
  const handleOpen = () => {
    setIsOpen(true)
    if (!hasGreeted) {
      setHasGreeted(true)
      setMessages([
        {
          id: 'greeting',
          type: 'assistant',
          content: getRandomGreeting(pathname || undefined),
        },
      ])
    }
  }

  // Process user query
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const query = input.trim()
    setInput('')

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: query,
    }

    // Find best match from knowledge base (pass current route for context-awareness)
    const match = findBestMatch(query, pathname || undefined)

    // Add assistant response
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      type: 'assistant',
      content: match.response,
      module: match,
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
  }

  // Handle quick action click
  const handleQuickAction = (action: QuickAction) => {
    if (action.href) {
      setIsOpen(false)
      // Navigation handled by Link component
    } else if (action.action === 'copy' && action.data) {
      navigator.clipboard.writeText(action.data)
    }
  }

  return (
    <>
      {/* Floating buttons - hide wallet in studio, move chat to bottom when in studio */}
      {!isInStudio && (
        <div className="fixed top-4 right-4 z-[100] flex items-center gap-2">
          {/* Studio / Wallet shortcut */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href="/studio"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-emerald-600/90 to-teal-600/90 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 backdrop-blur-sm border border-white/10"
              title="Shock Studio (Wallet Required)"
            >
              {/* Wallet Icon */}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </Link>
          </motion.div>

          {/* Chat button - top right when not in studio */}
          <motion.button
            onClick={handleOpen}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-violet-600/90 to-pink-600/90 text-white text-sm font-medium shadow-lg hover:shadow-xl transition-shadow backdrop-blur-sm border border-white/10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-lg">⚡</span>
            <span className="hidden sm:inline">Chat</span>
          </motion.button>
        </div>
      )}

      {/* Chat button - bottom right when in studio */}
      {isInStudio && (
        <motion.button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-violet-600/90 to-pink-600/90 text-white text-sm font-medium shadow-lg hover:shadow-xl transition-shadow backdrop-blur-sm border border-white/10"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-lg">⚡</span>
          <span className="hidden sm:inline">Chat</span>
        </motion.button>
      )}

      {/* Command Center Panel */}
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

            {/* Panel - position based on context */}
            <motion.div
              initial={{ opacity: 0, y: isInStudio ? 20 : -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: isInStudio ? 20 : -20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed z-[102] w-[calc(100vw-2rem)] sm:w-[400px] max-h-[80vh] rounded-2xl overflow-hidden shadow-2xl ${
                isInStudio ? 'bottom-20 right-6' : 'top-4 right-4'
              }`}
              style={{
                background:
                  'linear-gradient(135deg, rgba(15, 15, 25, 0.98) 0%, rgba(30, 20, 40, 0.98) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b border-white/10">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-lg sm:text-xl">⚡</span>
                  <span className="font-semibold text-white text-sm sm:text-base">Command Center</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Quick Actions */}
              <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-white/5">
                <p className="text-[10px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2">Quick Actions</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {QUICK_ACTIONS.map((action, i) => (
                    <Link
                      key={i}
                      href={action.href || '#'}
                      onClick={() => handleQuickAction(action)}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors border border-white/10"
                    >
                      {action.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="h-[280px] sm:h-[300px] overflow-y-auto px-3 sm:px-4 py-2 sm:py-3 space-y-2 sm:space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id}>
                    {msg.type === 'user' ? (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl rounded-tr-sm bg-violet-600/80 text-white text-xs sm:text-sm">
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5 sm:gap-2">
                        <div className="max-w-[90%] sm:max-w-[85%] px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl rounded-tl-sm bg-white/10 text-gray-200 text-xs sm:text-sm whitespace-pre-line">
                          {msg.module?.title && (
                            <div className="font-semibold text-white mb-0.5 sm:mb-1 text-xs sm:text-sm">
                              {msg.module.title}
                            </div>
                          )}
                          {msg.content}
                        </div>
                        {/* Action buttons for this response */}
                        {msg.module?.actions && msg.module.actions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 ml-1">
                            {msg.module.actions.map((action, i) => (
                              <Link
                                key={i}
                                href={action.href || '#'}
                                onClick={() => {
                                  handleQuickAction(action)
                                  if (action.href) setIsOpen(false)
                                }}
                                className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium bg-gradient-to-r from-violet-600/50 to-pink-600/50 hover:from-violet-600/70 hover:to-pink-600/70 text-white transition-all border border-white/10"
                              >
                                {action.label}
                                <svg
                                  className="w-2.5 sm:w-3 h-2.5 sm:h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
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
              <form onSubmit={handleSubmit} className="px-3 sm:px-4 py-2 sm:py-3 border-t border-white/10">
                <div className="flex gap-1.5 sm:gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about services, studio, pricing..."
                    className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
                  />
                  <button
                    type="submit"
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-medium text-xs sm:text-sm hover:opacity-90 transition-opacity"
                  >
                    Send
                  </button>
                </div>
                <p className="text-[9px] sm:text-[10px] text-gray-600 mt-1.5 sm:mt-2 text-center">
                  Instant answers • No AI inference • 100% private
                </p>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
