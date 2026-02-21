import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/messages — list conversations for current user
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get conversations the user is part of, with latest message and participant info
    const { data: participantRows } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id)

    if (!participantRows || participantRows.length === 0) {
      return NextResponse.json({ conversations: [] })
    }

    const conversationIds = participantRows.map((p: any) => p.conversation_id)

    // Get all participants for these conversations (to show who you're talking to)
    const { data: allParticipants } = await supabase
      .from('conversation_participants')
      .select('conversation_id, user_id, profiles:user_id(full_name, avatar_url, role)')
      .in('conversation_id', conversationIds)

    // Get latest message per conversation
    const { data: latestMessages } = await supabase
      .from('messages')
      .select('conversation_id, content, sender_id, created_at, read_at')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false })

    // Get unread counts
    const { data: unreadMessages } = await supabase
      .from('messages')
      .select('conversation_id')
      .in('conversation_id', conversationIds)
      .neq('sender_id', user.id)
      .is('read_at', null)

    // Build conversation list
    const conversations = conversationIds.map((convId: string) => {
      const participants = (allParticipants || [])
        .filter((p: any) => p.conversation_id === convId && p.user_id !== user.id)
        .map((p: any) => ({
          id: p.user_id,
          name: (p.profiles as any)?.full_name || 'Unknown',
          avatar_url: (p.profiles as any)?.avatar_url,
          role: (p.profiles as any)?.role,
        }))

      const messages = (latestMessages || []).filter((m: any) => m.conversation_id === convId)
      const lastMessage = messages[0] || null
      const unreadCount = (unreadMessages || []).filter((m: any) => m.conversation_id === convId).length

      return {
        id: convId,
        participants,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          sender_id: lastMessage.sender_id,
          created_at: lastMessage.created_at,
        } : null,
        unreadCount,
      }
    })

    // Sort by latest message
    conversations.sort((a: any, b: any) => {
      const aTime = a.lastMessage?.created_at || '1970-01-01'
      const bTime = b.lastMessage?.created_at || '1970-01-01'
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })

    return NextResponse.json({ conversations })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/messages — start a new conversation or send a message
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { recipientId, conversationId, content } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 })
    }

    let targetConversationId = conversationId

    // If no conversationId, create new conversation with recipient
    if (!targetConversationId && recipientId) {
      // Check if conversation already exists between these two users
      const { data: existingParticipant } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id)

      if (existingParticipant) {
        for (const ep of existingParticipant) {
          const { data: otherParticipant } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('conversation_id', ep.conversation_id)
            .eq('user_id', recipientId)
            .single()

          if (otherParticipant) {
            targetConversationId = ep.conversation_id
            break
          }
        }
      }

      // Create new conversation if none found
      if (!targetConversationId) {
        const { data: conv } = await supabase
          .from('conversations')
          .insert({})
          .select('id')
          .single()

        if (!conv) {
          return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
        }

        targetConversationId = conv.id

        // Add both participants
        await supabase.from('conversation_participants').insert([
          { conversation_id: targetConversationId, user_id: user.id },
          { conversation_id: targetConversationId, user_id: recipientId },
        ])
      }
    }

    if (!targetConversationId) {
      return NextResponse.json({ error: 'No conversation or recipient specified' }, { status: 400 })
    }

    // Send message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: targetConversationId,
        sender_id: user.id,
        content: content.trim(),
      })
      .select('id, conversation_id, sender_id, content, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', targetConversationId)

    return NextResponse.json({ message, conversationId: targetConversationId })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
