-- ============================================================================
-- 065: Group chat — named conversations with add/remove participants
-- ============================================================================
--
-- ⚠ IF YOU TOUCH MESSAGING, YOU MUST:
--    1. Keep every read/write policy routed through is_conversation_participant().
--       That function is the ONLY thing standing between a user and another
--       family's private messages. Migration 055 settled this; don't re-derive it.
--    2. Removing a participant must NOT delete the conversation or its history
--       for everyone else. Removal deletes ONE conversation_participants row.
--    3. Leave 1-on-1 conversations alone. is_group defaults false, so every
--       existing DM keeps behaving exactly as before.
--
-- WHAT THIS ADDS:
--    - conversations.is_group / title / created_by
--    - participant DELETE policy (was missing entirely — nobody could be removed)
--
-- Idempotent — safe to re-run.
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '--- 065: group chat ---';

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='conversations' AND column_name='is_group') THEN
    ALTER TABLE public.conversations ADD COLUMN is_group boolean NOT NULL DEFAULT false;
    RAISE NOTICE '  [1] conversations.is_group added (default false)';
  ELSE
    RAISE NOTICE '  [1] conversations.is_group already present - skipped';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='conversations' AND column_name='title') THEN
    ALTER TABLE public.conversations ADD COLUMN title text;
    RAISE NOTICE '  [2] conversations.title added';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='conversations' AND column_name='created_by') THEN
    ALTER TABLE public.conversations ADD COLUMN created_by uuid;
    ALTER TABLE public.conversations ADD CONSTRAINT conversations_created_by_fkey
      FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
    RAISE NOTICE '  [3] conversations.created_by added';
  END IF;

  CREATE INDEX IF NOT EXISTS idx_conversations_is_group ON public.conversations USING btree (is_group);
END $$;

-- ---------------------------------------------------------------------
-- 4. Participant removal.
--    There was NO delete policy on conversation_participants, so removing
--    someone from a chat was impossible via the client. Allowed for: the
--    group's creator, staff, or the user removing THEMSELVES (leave chat).
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Creator staff or self can remove participants" ON public.conversation_participants;
CREATE POLICY "Creator staff or self can remove participants"
  ON public.conversation_participants
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_participants.conversation_id
        AND c.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = ANY (ARRAY['coach','admin','master_admin'])
    )
  );

-- ---------------------------------------------------------------------
-- 5. Only participants may rename / archive a conversation.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Participants can update their conversation" ON public.conversations;
CREATE POLICY "Participants can update their conversation"
  ON public.conversations
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (public.is_conversation_participant(id))
  WITH CHECK (public.is_conversation_participant(id));

DO $$
BEGIN
  RAISE NOTICE '  [4] participant DELETE policy (creator | staff | self)';
  RAISE NOTICE '  [5] conversation UPDATE policy (participants only)';
  RAISE NOTICE '--- 065 complete ---';
END $$;
