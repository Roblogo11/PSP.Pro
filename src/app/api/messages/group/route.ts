import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Group conversations: create, add participants, remove participants.
 *
 * ⚠ Removing a participant deletes ONE conversation_participants row. It must
 * never delete the conversation or its messages — everyone else keeps the
 * history. Leaving a group is the same operation applied to yourself.
 */

async function requireUser() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// POST /api/messages/group — create a named group chat
export async function POST(request: NextRequest) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { title, participantIds } = body as { title?: string; participantIds?: string[] }

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Group name is required' }, { status: 400 })
  }
  if (!Array.isArray(participantIds) || participantIds.length === 0) {
    return NextResponse.json({ error: 'Add at least one other person' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: conversation, error: convError } = await admin
    .from('conversations')
    .insert({ is_group: true, title: title.trim(), created_by: user.id })
    .select('id')
    .single()

  if (convError) {
    console.error('Group create failed:', convError.message)
    return NextResponse.json({ error: 'Could not create group' }, { status: 500 })
  }

  // Creator is always a participant; dedupe in case they included themselves.
  const unique = Array.from(new Set([user.id, ...participantIds]))
  const { error: partError } = await admin
    .from('conversation_participants')
    .insert(unique.map(id => ({ conversation_id: conversation.id, user_id: id })))

  if (partError) {
    await admin.from('conversations').delete().eq('id', conversation.id)
    console.error('Group participants failed, rolled back:', partError.message)
    return NextResponse.json({ error: 'Could not add members' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, conversationId: conversation.id, memberCount: unique.length })
}

// PATCH /api/messages/group — add people to an existing group
export async function PATCH(request: NextRequest) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { conversationId, addUserIds, title } = body as {
    conversationId?: string; addUserIds?: string[]; title?: string
  }
  if (!conversationId) {
    return NextResponse.json({ error: 'conversationId is required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Only an existing member may modify the group.
  const { data: membership } = await admin
    .from('conversation_participants')
    .select('id')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership) {
    return NextResponse.json({ error: 'You are not in this conversation' }, { status: 403 })
  }

  if (title?.trim()) {
    await admin.from('conversations').update({ title: title.trim() }).eq('id', conversationId)
  }

  if (Array.isArray(addUserIds) && addUserIds.length > 0) {
    const { data: existing } = await admin
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)

    const already = new Set((existing || []).map((p: any) => p.user_id))
    const toAdd = addUserIds.filter(id => !already.has(id))

    if (toAdd.length > 0) {
      const { error } = await admin
        .from('conversation_participants')
        .insert(toAdd.map(id => ({ conversation_id: conversationId, user_id: id })))
      if (error) {
        return NextResponse.json({ error: 'Could not add members' }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ ok: true })
}

// DELETE /api/messages/group?conversationId=..&userId=.. — remove one person
export async function DELETE(request: NextRequest) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const conversationId = request.nextUrl.searchParams.get('conversationId')
  const userId = request.nextUrl.searchParams.get('userId') || user.id
  if (!conversationId) {
    return NextResponse.json({ error: 'conversationId is required' }, { status: 400 })
  }

  const admin = createAdminClient()

  const [{ data: conversation }, { data: profile }] = await Promise.all([
    admin.from('conversations').select('created_by').eq('id', conversationId).single(),
    admin.from('profiles').select('role').eq('id', user.id).single(),
  ])

  const isSelf = userId === user.id
  const isCreator = conversation?.created_by === user.id
  const isStaff = ['coach', 'admin', 'master_admin'].includes(profile?.role)

  if (!isSelf && !isCreator && !isStaff) {
    return NextResponse.json({ error: 'Only the group creator can remove others' }, { status: 403 })
  }

  // Removes ONE membership row. Conversation + message history stay intact.
  const { error } = await admin
    .from('conversation_participants')
    .delete()
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: 'Could not remove member' }, { status: 500 })
  return NextResponse.json({ ok: true, removed: userId })
}
