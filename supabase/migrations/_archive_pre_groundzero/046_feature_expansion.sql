-- Migration 046: Feature Expansion
-- Adds: Messaging, Promo Codes, Calendar Sync, RSVP/Attendance,
--        Payment Plans, Progress Reports, Device Imports

-- ═══════════════════════════════════════════════════════════════
-- 1. IN-APP MESSAGING
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for messaging
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- RLS for conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (id IN (
    SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS for conversation_participants
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view participants of their conversations"
  ON conversation_participants FOR SELECT
  USING (conversation_id IN (
    SELECT conversation_id FROM conversation_participants cp WHERE cp.user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can add participants"
  ON conversation_participants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (conversation_id IN (
    SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can send messages to their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND conversation_id IN (
      SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can mark their received messages as read"
  ON messages FOR UPDATE
  USING (
    sender_id != auth.uid()
    AND conversation_id IN (
      SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (read_at IS NOT NULL);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ═══════════════════════════════════════════════════════════════
-- 2. PROMO CODES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_cents')),
  discount_value INTEGER NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all', 'booking', 'package', 'membership')),
  min_amount_cents INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active) WHERE is_active = true;

-- RLS for promo_codes
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can validate promo codes"
  ON promo_codes FOR SELECT
  USING (true);

CREATE POLICY "Coaches and admins can manage promo codes"
  ON promo_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('coach', 'admin', 'master_admin')
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- 3. CALENDAR SYNC
-- ═══════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'calendar_token'
  ) THEN
    ALTER TABLE profiles ADD COLUMN calendar_token UUID DEFAULT gen_random_uuid();
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 4. RSVP / ATTENDANCE TRACKING
-- ═══════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'rsvp_status'
  ) THEN
    ALTER TABLE bookings ADD COLUMN rsvp_status TEXT DEFAULT 'confirmed'
      CHECK (rsvp_status IN ('confirmed', 'maybe', 'declined', 'no_response'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'checked_in_by'
  ) THEN
    ALTER TABLE bookings ADD COLUMN checked_in_by UUID REFERENCES profiles(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'no_show_marked_at'
  ) THEN
    ALTER TABLE bookings ADD COLUMN no_show_marked_at TIMESTAMPTZ;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 5. PAYMENT PLANS / INSTALLMENTS
-- ═══════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'athlete_packages' AND column_name = 'installment_plan'
  ) THEN
    ALTER TABLE athlete_packages ADD COLUMN installment_plan BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'athlete_packages' AND column_name = 'installments_total'
  ) THEN
    ALTER TABLE athlete_packages ADD COLUMN installments_total INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'athlete_packages' AND column_name = 'installments_paid'
  ) THEN
    ALTER TABLE athlete_packages ADD COLUMN installments_paid INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'athlete_packages' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE athlete_packages ADD COLUMN stripe_subscription_id TEXT;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 6. PROGRESS REPORTS
-- ═══════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'progress_report_frequency'
  ) THEN
    ALTER TABLE profiles ADD COLUMN progress_report_frequency TEXT DEFAULT 'never'
      CHECK (progress_report_frequency IN ('monthly', 'never'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_progress_report_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_progress_report_at TIMESTAMPTZ;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 7. DEVICE / WEARABLE IMPORTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS device_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL CHECK (device_type IN ('rapsodo', 'blast_motion', 'pocket_radar', 'hittrax', 'manual')),
  imported_by UUID NOT NULL REFERENCES profiles(id),
  file_name TEXT,
  records_count INTEGER DEFAULT 0,
  records_processed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_device_imports_athlete ON device_imports(athlete_id);
CREATE INDEX IF NOT EXISTS idx_device_imports_imported_by ON device_imports(imported_by);

-- RLS for device_imports
ALTER TABLE device_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes can view their own imports"
  ON device_imports FOR SELECT
  USING (athlete_id = auth.uid());

CREATE POLICY "Coaches and admins can manage imports"
  ON device_imports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('coach', 'admin', 'master_admin')
    )
  );
