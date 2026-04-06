-- Add phone column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Fix recursive RLS on conversation_participants
-- The original policy used a self-referencing subquery which causes infinite recursion in Postgres RLS.
-- Solution: use a security definer function (same pattern as the profiles fix in migration 029).

-- Drop the recursive policies
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;
DROP POLICY IF EXISTS "Users can update read status" ON messages;

-- Create a security definer function to safely check conversation membership
CREATE OR REPLACE FUNCTION is_conversation_participant(conv_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = conv_id AND user_id = auth.uid()
  );
$$;

-- Recreate conversation_participants SELECT policy without self-reference
CREATE POLICY "Users can view participants of their conversations"
  ON conversation_participants FOR SELECT
  USING (is_conversation_participant(conversation_id));

-- Recreate messages policies using the function
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (is_conversation_participant(conversation_id));

CREATE POLICY "Users can send messages to their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND is_conversation_participant(conversation_id)
  );

CREATE POLICY "Users can update read status"
  ON messages FOR UPDATE
  USING (is_conversation_participant(conversation_id))
  WITH CHECK (is_conversation_participant(conversation_id));
