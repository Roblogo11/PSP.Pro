'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { MessageCircle, Send, ArrowLeft, Users, Loader2, Plus } from 'lucide-react'
import Image from 'next/image'

interface Conversation {
  id: string
  participants: { id: string; name: string; avatar_url: string | null; role: string }[]
  lastMessage: { content: string; sender_id: string; created_at: string } | null
  unreadCount: number
}

interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
  read_at: string | null
  sender: { full_name: string; avatar_url: string | null } | null
}

export default function MessagesPage() {
  const { profile, isCoach, isAdmin } = useUserRole()
  const supabase = createClient()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [contacts, setContacts] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchConversations = useCallback(async () => {
    const res = await fetch('/api/messages')
    const data = await res.json()
    if (data.conversations) setConversations(data.conversations)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Subscribe to realtime messages
  useEffect(() => {
    if (!selectedConv) return

    const channel = supabase
      .channel(`messages:${selectedConv}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedConv}`,
      }, (payload: any) => {
        const newMsg = payload.new as any
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev
          return [...prev, newMsg]
        })
        fetchConversations()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selectedConv, supabase, fetchConversations])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const openConversation = async (convId: string) => {
    setSelectedConv(convId)
    const res = await fetch(`/api/messages/${convId}`)
    const data = await res.json()
    if (data.messages) setMessages(data.messages)
    fetchConversations() // refresh unread counts
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return
    setSending(true)

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: selectedConv, content: newMessage.trim() }),
      })
      const data = await res.json()
      if (data.message) {
        setMessages(prev => [...prev, { ...data.message, sender: { full_name: profile?.full_name || 'You', avatar_url: profile?.avatar_url } }])
      }
      setNewMessage('')
      fetchConversations()
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }

  const startNewChat = async (recipientId: string) => {
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId, content: 'Hi! 👋' }),
      })
      const data = await res.json()
      if (data.conversationId) {
        await fetchConversations()
        openConversation(data.conversationId)
        setShowNewChat(false)
      }
    } catch (err) {
      console.error('Failed to start conversation:', err)
    } finally {
      setSending(false)
    }
  }

  const loadContacts = async () => {
    setShowNewChat(true)
    if (isCoach || isAdmin) {
      // Coaches can message their athletes
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .neq('id', profile?.id || '')
        .in('role', ['athlete', 'coach', 'admin'])
        .order('full_name')
        .limit(50)
      setContacts(data || [])
    } else {
      // Athletes can message coaches they've booked with
      const { data: bookings } = await supabase
        .from('bookings')
        .select('coach_id, coach:coach_id(id, full_name, avatar_url, role)')
        .eq('athlete_id', profile?.id || '')
        .not('coach_id', 'is', null)
      const uniqueCoaches = new Map()
      bookings?.forEach((b: any) => {
        if (b.coach && !uniqueCoaches.has(b.coach.id)) {
          uniqueCoaches.set(b.coach.id, b.coach)
        }
      })
      setContacts(Array.from(uniqueCoaches.values()))
    }
  }

  const selectedConversation = conversations.find(c => c.id === selectedConv)
  const otherParticipant = selectedConversation?.participants[0]

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen px-3 py-4 md:p-8 pb-24 lg:pb-8">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-8 h-8 text-blue-400" />
        <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white">Messages</h1>
      </div>

      <div className="glass-card overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
        <div className="flex h-full">
          {/* Conversation List */}
          <div className={`w-full md:w-80 border-r border-slate-200 dark:border-white/10 flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-white">Conversations</h2>
              <button onClick={loadContacts} className="p-2 rounded-lg hover:bg-cyan/10 text-cyan">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* New Chat Contact List */}
            {showNewChat && (
              <div className="p-3 border-b border-slate-200 dark:border-white/10 bg-cyan-50/50 dark:bg-cyan/5">
                <p className="text-xs font-semibold text-slate-600 dark:text-white/60 mb-2">Start a conversation:</p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {contacts.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => startNewChat(c.id)}
                      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white dark:hover:bg-white/10 text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {c.full_name?.charAt(0) || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{c.full_name}</p>
                        <p className="text-[10px] text-slate-500 capitalize">{c.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowNewChat(false)} className="text-xs text-slate-400 mt-2 hover:text-slate-600">Cancel</button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center"><Loader2 className="w-6 h-6 text-orange animate-spin mx-auto" /></div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 dark:text-white/50">No conversations yet</p>
                  <button onClick={loadContacts} className="mt-3 text-sm text-cyan hover:text-cyan/80">Start a conversation</button>
                </div>
              ) : (
                conversations.map((conv) => {
                  const other = conv.participants[0]
                  return (
                    <button
                      key={conv.id}
                      onClick={() => openConversation(conv.id)}
                      className={`w-full flex items-center gap-3 p-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 text-left transition-colors ${
                        selectedConv === conv.id ? 'bg-cyan-50 dark:bg-cyan/10' : ''
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        {other?.avatar_url ? (
                          <Image src={other.avatar_url} alt="" width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange to-cyan flex items-center justify-center text-white font-bold text-sm">
                            {other?.name?.charAt(0) || '?'}
                          </div>
                        )}
                        {conv.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange text-white text-[10px] font-bold flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{other?.name || 'Unknown'}</p>
                          {conv.lastMessage && (
                            <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">{formatTime(conv.lastMessage.created_at)}</span>
                          )}
                        </div>
                        {conv.lastMessage && (
                          <p className="text-xs text-slate-500 dark:text-white/50 truncate mt-0.5">
                            {conv.lastMessage.sender_id === profile?.id ? 'You: ' : ''}{conv.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Message Thread */}
          <div className={`flex-1 flex flex-col ${!selectedConv ? 'hidden md:flex' : 'flex'}`}>
            {selectedConv && otherParticipant ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-3">
                  <button onClick={() => setSelectedConv(null)} className="md:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10">
                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-white" />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange to-cyan flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {otherParticipant.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{otherParticipant.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{otherParticipant.role}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => {
                    const isMe = msg.sender_id === profile?.id
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                          isMe
                            ? 'bg-orange text-white rounded-br-sm'
                            : 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white rounded-bl-sm'
                        }`}>
                          <p className="text-sm break-words">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-slate-200 dark:border-white/10 flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-sm text-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="px-4 py-2.5 rounded-xl bg-orange text-white hover:bg-orange/90 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-slate-300 dark:text-white/20 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-white/50">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
