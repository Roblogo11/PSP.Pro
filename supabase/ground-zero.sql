-- =============================================================================
-- PSP.Pro — ground-zero.sql  (CONSOLIDATED SCHEMA BASELINE)
-- =============================================================================
-- ⚠  GENERATED FILE — DO NOT HAND-EDIT.
--
-- What this is:
--   A single, fully idempotent SQL file that reproduces the ENTIRE current
--   `public` schema of the live PSP Supabase database. It is the consolidated
--   baseline that REPLACES the historical 60-file migration chain — running
--   this file on an EMPTY database yields the full, current PSP schema.
--
-- How it was made:
--   Every object's DDL below was generated verbatim from the live catalog via
--   Postgres' pg_get_*def() family (pg_get_constraintdef, pg_get_indexdef,
--   pg_get_functiondef, pg_get_triggerdef, pg_get_viewdef, pg_get_expr).
--   Nothing here is hand-authored. To regenerate after schema changes, re-run
--   the generator queries against the live DB — do NOT patch this file by hand.
--
-- Idempotency contract (hard rule):
--   Safe to run twice with zero errors. Tables use CREATE TABLE IF NOT EXISTS;
--   constraints are guarded by DO/IF NOT EXISTS blocks; indexes use IF NOT
--   EXISTS; functions/views use CREATE OR REPLACE; triggers, event triggers,
--   and policies are DROP ... IF EXISTS then CREATE.
--
-- Section order is dependency-safe (FK-safe): tables → constraints → indexes →
--   functions → event trigger → views → triggers → RLS enable → policies →
--   grants → summary.
--
-- Inventory reproduced: 46 tables, 4 views, 20 functions, 167 indexes
--   (46 PK + 21 UNIQUE constraint-backed + 100 standalone), 141 RLS policies,
--   RLS enabled on all 46 tables, 22 public table triggers + 1 auth.users
--   trigger, 1 event trigger (ensure_rls).
--
-- Verified 2026-07-06: rebuilt on an empty Postgres 17 with zero errors, re-run
--   clean (idempotent), and every object class hashed byte-identical to the live
--   PSP DB (tables/constraints/indexes/policies/functions/triggers/views all match).
-- =============================================================================


-- ------------------------------------------------------------------------------
-- 2. EXTENSIONS (app-managed only; platform extensions are Supabase-managed)
-- ------------------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
-- Platform extensions pg_cron, pg_stat_statements, pg_graphql, supabase_vault
-- are provisioned/managed by Supabase and are intentionally NOT recreated here.

-- Supabase installs extension objects (uuid_generate_v4, etc.) into the `extensions`
-- schema and keeps it on the search_path. Mirror that so unqualified calls like
-- uuid_generate_v4() resolve on ANY database, not only a live Supabase project.
DO $$
BEGIN
  EXECUTE 'ALTER DATABASE ' || quote_ident(current_database())
        || ' SET search_path TO "$user", public, extensions';
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE '⚠ Could not ALTER DATABASE search_path — ensure extensions is on search_path.';
END $$;
SET search_path TO "$user", public, extensions;

-- ------------------------------------------------------------------------------
-- 3. TABLES (columns + defaults only; constraints added below)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.action_requests (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    requested_by uuid NOT NULL,
    action_type text NOT NULL,
    target_id uuid NOT NULL,
    target_table text NOT NULL,
    reason text,
    status text NOT NULL DEFAULT 'pending'::text,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.admin_whitelist (
    email text NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    notes text
);
CREATE TABLE IF NOT EXISTS public.assigned_drills (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    drill_id uuid NOT NULL,
    due_date date,
    priority text DEFAULT 'medium'::text,
    notes text,
    completed boolean DEFAULT false,
    completed_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    assigned_by_id uuid
);
CREATE TABLE IF NOT EXISTS public.assigned_questionnaires (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    questionnaire_id uuid NOT NULL,
    assigned_by_id uuid,
    due_date date,
    notes text,
    completed boolean DEFAULT false,
    completed_at timestamp with time zone,
    responses jsonb,
    score integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.athlete_memberships (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    athlete_id uuid NOT NULL,
    tier_id uuid NOT NULL,
    status text NOT NULL DEFAULT 'active'::text,
    stripe_subscription_id text,
    stripe_customer_id text,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    cancel_at_period_end boolean DEFAULT false,
    cancelled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.athlete_packages (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    athlete_id uuid NOT NULL,
    package_id uuid NOT NULL,
    sessions_total integer NOT NULL,
    sessions_used integer DEFAULT 0,
    sessions_remaining integer GENERATED ALWAYS AS (sessions_total - sessions_used) STORED,
    purchased_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone NOT NULL,
    payment_status text NOT NULL DEFAULT 'pending'::text,
    stripe_payment_intent_id text,
    amount_cents integer NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    org_id uuid,
    installment_plan boolean DEFAULT false,
    installments_total integer,
    installments_paid integer DEFAULT 0,
    stripe_subscription_id text
);
CREATE TABLE IF NOT EXISTS public.athlete_performance_goals (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    athlete_id uuid NOT NULL,
    set_by uuid NOT NULL,
    goal_type text NOT NULL,
    metric_name text NOT NULL,
    current_value numeric(10,2),
    target_value numeric(10,2) NOT NULL,
    target_date date,
    status text DEFAULT 'active'::text,
    achieved_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.athlete_performance_metrics (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    athlete_id uuid NOT NULL,
    recorded_by uuid NOT NULL,
    session_id uuid,
    recorded_at timestamp with time zone DEFAULT now(),
    test_date date NOT NULL,
    location text,
    conditions text,
    notes text,
    throwing_velocity_mph numeric(5,2),
    throwing_velocity_avg_mph numeric(5,2),
    throwing_accuracy_percentage numeric(5,2),
    throwing_consistency_score integer,
    exit_velocity_mph numeric(5,2),
    exit_velocity_avg_mph numeric(5,2),
    bat_speed_mph numeric(5,2),
    launch_angle_degrees numeric(5,2),
    hitting_percentage numeric(5,2),
    sixty_yard_dash_seconds numeric(5,2),
    ten_yard_split_seconds numeric(5,2),
    home_to_first_seconds numeric(5,2),
    vertical_jump_inches numeric(5,2),
    broad_jump_inches numeric(5,2),
    squat_weight_lbs integer,
    bench_press_lbs integer,
    deadlift_lbs integer,
    flexibility_score integer,
    range_of_motion_score integer,
    overall_performance_score integer,
    improvement_since_last numeric(5,2),
    custom_metrics jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    child_id uuid
);
CREATE TABLE IF NOT EXISTS public.athlete_performance_notes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    athlete_id uuid NOT NULL,
    coach_id uuid NOT NULL,
    session_id uuid,
    note_type text DEFAULT 'observation'::text,
    title text NOT NULL,
    content text NOT NULL,
    is_private boolean DEFAULT false,
    tags text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.audit_log (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid,
    action text NOT NULL,
    resource_type text,
    resource_id text,
    metadata jsonb DEFAULT '{}'::jsonb,
    ip_address text,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.available_slots (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    coach_id uuid NOT NULL,
    service_id uuid,
    slot_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    location text,
    max_bookings integer DEFAULT 1,
    current_bookings integer DEFAULT 0,
    is_available boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    org_id uuid
);
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text,
    content text NOT NULL DEFAULT ''::text,
    category text DEFAULT 'General'::text,
    thumbnail_url text,
    published boolean DEFAULT false,
    featured boolean DEFAULT false,
    read_time text DEFAULT '5 min read'::text,
    author_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.bookings (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    athlete_id uuid NOT NULL,
    coach_id uuid,
    service_id uuid NOT NULL,
    slot_id uuid,
    booking_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    duration_minutes integer NOT NULL,
    location text,
    status text NOT NULL DEFAULT 'pending'::text,
    amount_cents integer NOT NULL,
    payment_status text NOT NULL DEFAULT 'pending'::text,
    stripe_payment_intent_id text,
    stripe_checkout_session_id text,
    notes text,
    cancellation_reason text,
    cancelled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    package_id uuid,
    athlete_notes text,
    coach_notes text,
    internal_notes text,
    checked_in_at timestamp with time zone,
    completed_at timestamp with time zone,
    org_id uuid,
    rsvp_status text DEFAULT 'confirmed'::text,
    checked_in_by uuid,
    no_show_marked_at timestamp with time zone,
    child_id uuid,
    promo_code text
);
CREATE TABLE IF NOT EXISTS public.coach_athletes (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    coach_id uuid NOT NULL,
    athlete_id uuid NOT NULL,
    assigned_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    active boolean DEFAULT true,
    notes text
);
CREATE TABLE IF NOT EXISTS public.coach_payout_accounts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    coach_id uuid NOT NULL,
    org_id uuid,
    stripe_account_id text,
    stripe_account_type text DEFAULT 'express'::text,
    stripe_onboarding_url text,
    account_status text DEFAULT 'not_connected'::text,
    coach_revenue_percent numeric(5,2) DEFAULT 70.00,
    charges_enabled boolean DEFAULT false,
    payouts_enabled boolean DEFAULT false,
    details_submitted boolean DEFAULT false,
    bank_last4 text,
    bank_routing text,
    country text DEFAULT 'US'::text,
    currency text DEFAULT 'usd'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.coach_payouts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    booking_id uuid,
    org_id uuid,
    coach_id uuid NOT NULL,
    payout_account_id uuid,
    gross_amount_cents integer NOT NULL,
    platform_fee_cents integer NOT NULL,
    coach_amount_cents integer NOT NULL,
    stripe_charge_id text,
    stripe_transfer_id text,
    stripe_payment_intent_id text,
    status text NOT NULL DEFAULT 'pending'::text,
    transferred_at timestamp with time zone,
    failure_reason text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.coach_schedules (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    coach_id uuid NOT NULL,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    location text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    interest text NOT NULL DEFAULT 'training'::text,
    message text NOT NULL,
    submitted_at timestamp with time zone DEFAULT now(),
    is_read boolean DEFAULT false,
    read_at timestamp with time zone,
    notes text
);
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL,
    user_id uuid NOT NULL,
    joined_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.conversations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    athlete_id uuid NOT NULL,
    course_id uuid NOT NULL,
    enrolled_at timestamp with time zone DEFAULT now(),
    payment_status text DEFAULT 'free'::text,
    stripe_payment_intent_id text,
    expires_at timestamp with time zone
);
CREATE TABLE IF NOT EXISTS public.course_lessons (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    video_url text NOT NULL,
    thumbnail_url text,
    sort_order integer DEFAULT 0,
    duration_seconds integer,
    is_preview boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.courses (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    slug text NOT NULL,
    description text,
    thumbnail_url text,
    category text,
    price_cents integer DEFAULT 0,
    pricing_type text DEFAULT 'free'::text,
    stripe_price_id text,
    is_active boolean DEFAULT true,
    included_in_membership boolean DEFAULT false,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.device_imports (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    athlete_id uuid NOT NULL,
    device_type text NOT NULL,
    imported_by uuid NOT NULL,
    file_name text,
    records_count integer DEFAULT 0,
    records_processed integer DEFAULT 0,
    status text DEFAULT 'pending'::text,
    error_message text,
    raw_data jsonb,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.drill_completions (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    drill_id uuid NOT NULL,
    session_id uuid,
    velocity_mph numeric(5,2),
    reps_completed integer,
    notes text,
    completed_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE TABLE IF NOT EXISTS public.drills (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    slug text NOT NULL,
    description text,
    instructions text,
    youtube_url text,
    thumbnail_url text,
    tags text[] DEFAULT '{}'::text[],
    category text,
    difficulty text NOT NULL,
    duration_seconds integer NOT NULL,
    equipment text[] DEFAULT '{}'::text[],
    focus_areas text[] DEFAULT '{}'::text[],
    is_published boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    view_count integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    created_by uuid,
    duration text,
    equipment_needed text[] DEFAULT '{}'::text[],
    published boolean DEFAULT true,
    featured boolean DEFAULT false,
    video_url text
);
CREATE TABLE IF NOT EXISTS public.invite_links (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    token text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'::text),
    coach_id uuid,
    sport text,
    trial_days integer DEFAULT 30,
    max_uses integer DEFAULT 1,
    uses integer DEFAULT 0,
    expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval),
    created_at timestamp with time zone DEFAULT now(),
    org_id uuid
);
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    athlete_id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    completed boolean DEFAULT false,
    completed_at timestamp with time zone,
    watch_time_seconds integer DEFAULT 0
);
CREATE TABLE IF NOT EXISTS public.membership_features (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    tier_id uuid NOT NULL,
    feature_slug text NOT NULL,
    feature_label text NOT NULL,
    is_enabled boolean DEFAULT true,
    metadata jsonb DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS public.membership_tiers (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    slug text NOT NULL,
    name text NOT NULL,
    description text,
    price_cents integer NOT NULL DEFAULT 0,
    billing_interval text DEFAULT 'free'::text,
    stripe_price_id text,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    features jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    content text NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    email text NOT NULL,
    subscribed_at timestamp with time zone DEFAULT now(),
    unsubscribed_at timestamp with time zone,
    is_active boolean DEFAULT true,
    source text DEFAULT 'blog'::text
);
CREATE TABLE IF NOT EXISTS public.organization_members (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'athlete'::text,
    status text NOT NULL DEFAULT 'active'::text,
    invited_by uuid,
    joined_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.organizations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL,
    owner_id uuid NOT NULL,
    logo_url text,
    primary_color text DEFAULT '#f97316'::text,
    secondary_color text DEFAULT '#06b6d4'::text,
    accent_color text DEFAULT '#ffffff'::text,
    custom_domain text,
    tagline text,
    hero_headline text,
    hero_subheadline text,
    about_text text,
    stripe_connect_account_id text,
    stripe_connect_status text DEFAULT 'not_connected'::text,
    platform_fee_percent numeric(5,2) DEFAULT 15.00,
    is_active boolean DEFAULT true,
    allow_self_signup boolean DEFAULT true,
    require_approval boolean DEFAULT false,
    timezone text DEFAULT 'America/New_York'::text,
    sport_focus text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.packages (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    athlete_id uuid NOT NULL,
    name text NOT NULL,
    total_sessions integer NOT NULL,
    sessions_remaining integer NOT NULL,
    price_paid numeric(10,2) NOT NULL,
    purchased_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at timestamp with time zone NOT NULL,
    active boolean DEFAULT true,
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE TABLE IF NOT EXISTS public.parent_children (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    parent_id uuid NOT NULL,
    child_name text NOT NULL,
    child_age integer,
    athlete_type text,
    sports text[],
    notes text,
    avatar_url text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL,
    full_name text NOT NULL,
    avatar_url text,
    athlete_type text,
    age integer,
    parent_email text,
    parent_phone text,
    emergency_contact text,
    velocity_goal_mph numeric(5,2),
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    role text DEFAULT 'athlete'::text,
    parent_guardian_name text,
    parent_guardian_email text,
    parent_guardian_phone text,
    email text,
    sports text[],
    leaderboard_opt_in boolean DEFAULT false,
    region text,
    newsletter_consent boolean DEFAULT false,
    marketing_consent boolean DEFAULT false,
    data_consent boolean DEFAULT false,
    data_consent_at timestamp with time zone,
    parent_consent_sent_at timestamp with time zone,
    parent_consent_verified boolean DEFAULT false,
    trial_expires_at timestamp with time zone,
    membership_tier text DEFAULT 'basic'::text,
    calendar_token uuid DEFAULT gen_random_uuid(),
    progress_report_frequency text DEFAULT 'never'::text,
    last_progress_report_at timestamp with time zone,
    calendar_token_expires_at timestamp with time zone DEFAULT (now() + '90 days'::interval),
    notification_preferences jsonb DEFAULT '{"newDrills": true, "achievements": true, "coachMessages": true, "progressUpdates": true, "sessionReminders": true}'::jsonb,
    bio text,
    specialties text[],
    profile_slug text,
    years_experience integer,
    certifications text[],
    account_type text DEFAULT 'standard'::text,
    child_name text,
    child_age integer,
    archived_at timestamp with time zone,
    archived_by uuid,
    phone text,
    active_child_id uuid
);
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    code text NOT NULL,
    discount_type text NOT NULL,
    discount_value integer NOT NULL,
    max_uses integer,
    current_uses integer DEFAULT 0,
    expires_at timestamp with time zone,
    applies_to text DEFAULT 'all'::text,
    min_amount_cents integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.questionnaires (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    questions jsonb NOT NULL DEFAULT '[]'::jsonb,
    category text,
    published boolean DEFAULT true,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.services (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    duration_minutes integer NOT NULL,
    price_cents integer NOT NULL,
    category text NOT NULL,
    max_participants integer DEFAULT 1,
    is_active boolean DEFAULT true,
    stripe_price_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    slug text NOT NULL,
    featured_on_homepage boolean DEFAULT false,
    homepage_image_url text,
    homepage_order integer DEFAULT 0,
    video_url text,
    org_id uuid
);
CREATE TABLE IF NOT EXISTS public.sessions (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    title text NOT NULL DEFAULT 'Training Session'::text,
    scheduled_at timestamp with time zone NOT NULL,
    duration_minutes integer DEFAULT 60,
    location text DEFAULT 'PSP Training Facility'::text,
    completed boolean DEFAULT false,
    notes text,
    coach_notes text,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE TABLE IF NOT EXISTS public.simulation_data_log (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    simulation_id uuid NOT NULL,
    table_name text NOT NULL,
    record_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.simulation_sessions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    admin_id uuid NOT NULL,
    simulated_role text NOT NULL,
    started_at timestamp with time zone NOT NULL DEFAULT now(),
    ended_at timestamp with time zone,
    cleaned_up boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.training_packages (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    sessions_included integer NOT NULL,
    price_cents integer NOT NULL,
    validity_days integer DEFAULT 90,
    service_id uuid,
    is_active boolean DEFAULT true,
    stripe_price_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    org_id uuid
);
CREATE TABLE IF NOT EXISTS public.velocity_logs (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    session_id uuid,
    drill_id uuid,
    velocity_mph numeric(5,2) NOT NULL,
    pitch_type text,
    notes text,
    recorded_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE TABLE IF NOT EXISTS public.video_analysis_submissions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    athlete_id uuid NOT NULL,
    submitted_by uuid,
    video_url text NOT NULL,
    source_type text NOT NULL DEFAULT 'upload'::text,
    athlete_name text,
    notes text,
    status text NOT NULL DEFAULT 'pending'::text,
    coach_feedback text,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 4. CONSTRAINTS (guarded ADD CONSTRAINT; order: PK -> UNIQUE -> CHECK -> FK)
-- ------------------------------------------------------------------------------

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='action_requests_pkey' AND conrelid='action_requests'::regclass) THEN ALTER TABLE action_requests ADD CONSTRAINT action_requests_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='admin_whitelist_pkey' AND conrelid='admin_whitelist'::regclass) THEN ALTER TABLE admin_whitelist ADD CONSTRAINT admin_whitelist_pkey PRIMARY KEY (email); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='assigned_drills_pkey' AND conrelid='assigned_drills'::regclass) THEN ALTER TABLE assigned_drills ADD CONSTRAINT assigned_drills_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='assigned_questionnaires_pkey' AND conrelid='assigned_questionnaires'::regclass) THEN ALTER TABLE assigned_questionnaires ADD CONSTRAINT assigned_questionnaires_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_memberships_pkey' AND conrelid='athlete_memberships'::regclass) THEN ALTER TABLE athlete_memberships ADD CONSTRAINT athlete_memberships_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_packages_pkey' AND conrelid='athlete_packages'::regclass) THEN ALTER TABLE athlete_packages ADD CONSTRAINT athlete_packages_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_performance_goals_pkey' AND conrelid='athlete_performance_goals'::regclass) THEN ALTER TABLE athlete_performance_goals ADD CONSTRAINT athlete_performance_goals_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_performance_metrics_pkey' AND conrelid='athlete_performance_metrics'::regclass) THEN ALTER TABLE athlete_performance_metrics ADD CONSTRAINT athlete_performance_metrics_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_performance_notes_pkey' AND conrelid='athlete_performance_notes'::regclass) THEN ALTER TABLE athlete_performance_notes ADD CONSTRAINT athlete_performance_notes_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='audit_log_pkey' AND conrelid='audit_log'::regclass) THEN ALTER TABLE audit_log ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='available_slots_pkey' AND conrelid='available_slots'::regclass) THEN ALTER TABLE available_slots ADD CONSTRAINT available_slots_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='blog_posts_pkey' AND conrelid='blog_posts'::regclass) THEN ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='bookings_pkey' AND conrelid='bookings'::regclass) THEN ALTER TABLE bookings ADD CONSTRAINT bookings_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='coach_athletes_pkey' AND conrelid='coach_athletes'::regclass) THEN ALTER TABLE coach_athletes ADD CONSTRAINT coach_athletes_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='coach_payout_accounts_pkey' AND conrelid='coach_payout_accounts'::regclass) THEN ALTER TABLE coach_payout_accounts ADD CONSTRAINT coach_payout_accounts_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='coach_payouts_pkey' AND conrelid='coach_payouts'::regclass) THEN ALTER TABLE coach_payouts ADD CONSTRAINT coach_payouts_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='coach_schedules_pkey' AND conrelid='coach_schedules'::regclass) THEN ALTER TABLE coach_schedules ADD CONSTRAINT coach_schedules_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='contact_submissions_pkey' AND conrelid='contact_submissions'::regclass) THEN ALTER TABLE contact_submissions ADD CONSTRAINT contact_submissions_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='conversation_participants_pkey' AND conrelid='conversation_participants'::regclass) THEN ALTER TABLE conversation_participants ADD CONSTRAINT conversation_participants_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='conversations_pkey' AND conrelid='conversations'::regclass) THEN ALTER TABLE conversations ADD CONSTRAINT conversations_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='course_enrollments_pkey' AND conrelid='course_enrollments'::regclass) THEN ALTER TABLE course_enrollments ADD CONSTRAINT course_enrollments_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='course_lessons_pkey' AND conrelid='course_lessons'::regclass) THEN ALTER TABLE course_lessons ADD CONSTRAINT course_lessons_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='courses_pkey' AND conrelid='courses'::regclass) THEN ALTER TABLE courses ADD CONSTRAINT courses_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='device_imports_pkey' AND conrelid='device_imports'::regclass) THEN ALTER TABLE device_imports ADD CONSTRAINT device_imports_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='drill_completions_pkey' AND conrelid='drill_completions'::regclass) THEN ALTER TABLE drill_completions ADD CONSTRAINT drill_completions_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='drills_pkey' AND conrelid='drills'::regclass) THEN ALTER TABLE drills ADD CONSTRAINT drills_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='invite_links_pkey' AND conrelid='invite_links'::regclass) THEN ALTER TABLE invite_links ADD CONSTRAINT invite_links_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lesson_progress_pkey' AND conrelid='lesson_progress'::regclass) THEN ALTER TABLE lesson_progress ADD CONSTRAINT lesson_progress_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='membership_features_pkey' AND conrelid='membership_features'::regclass) THEN ALTER TABLE membership_features ADD CONSTRAINT membership_features_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='membership_tiers_pkey' AND conrelid='membership_tiers'::regclass) THEN ALTER TABLE membership_tiers ADD CONSTRAINT membership_tiers_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='messages_pkey' AND conrelid='messages'::regclass) THEN ALTER TABLE messages ADD CONSTRAINT messages_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='newsletter_subscribers_pkey' AND conrelid='newsletter_subscribers'::regclass) THEN ALTER TABLE newsletter_subscribers ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='organization_members_pkey' AND conrelid='organization_members'::regclass) THEN ALTER TABLE organization_members ADD CONSTRAINT organization_members_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='organizations_pkey' AND conrelid='organizations'::regclass) THEN ALTER TABLE organizations ADD CONSTRAINT organizations_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='packages_pkey' AND conrelid='packages'::regclass) THEN ALTER TABLE packages ADD CONSTRAINT packages_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='parent_children_pkey' AND conrelid='parent_children'::regclass) THEN ALTER TABLE parent_children ADD CONSTRAINT parent_children_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='profiles_pkey' AND conrelid='profiles'::regclass) THEN ALTER TABLE profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='promo_codes_pkey' AND conrelid='promo_codes'::regclass) THEN ALTER TABLE promo_codes ADD CONSTRAINT promo_codes_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='questionnaires_pkey' AND conrelid='questionnaires'::regclass) THEN ALTER TABLE questionnaires ADD CONSTRAINT questionnaires_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='services_pkey' AND conrelid='services'::regclass) THEN ALTER TABLE services ADD CONSTRAINT services_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='sessions_pkey' AND conrelid='sessions'::regclass) THEN ALTER TABLE sessions ADD CONSTRAINT sessions_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='simulation_data_log_pkey' AND conrelid='simulation_data_log'::regclass) THEN ALTER TABLE simulation_data_log ADD CONSTRAINT simulation_data_log_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='simulation_sessions_pkey' AND conrelid='simulation_sessions'::regclass) THEN ALTER TABLE simulation_sessions ADD CONSTRAINT simulation_sessions_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='training_packages_pkey' AND conrelid='training_packages'::regclass) THEN ALTER TABLE training_packages ADD CONSTRAINT training_packages_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='velocity_logs_pkey' AND conrelid='velocity_logs'::regclass) THEN ALTER TABLE velocity_logs ADD CONSTRAINT velocity_logs_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='video_analysis_submissions_pkey' AND conrelid='video_analysis_submissions'::regclass) THEN ALTER TABLE video_analysis_submissions ADD CONSTRAINT video_analysis_submissions_pkey PRIMARY KEY (id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_memberships_athlete_id_key' AND conrelid='athlete_memberships'::regclass) THEN ALTER TABLE athlete_memberships ADD CONSTRAINT athlete_memberships_athlete_id_key UNIQUE (athlete_id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='unique_coach_time_slot' AND conrelid='available_slots'::regclass) THEN ALTER TABLE available_slots ADD CONSTRAINT unique_coach_time_slot UNIQUE (coach_id, slot_date, start_time); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='blog_posts_slug_key' AND conrelid='blog_posts'::regclass) THEN ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='coach_athletes_coach_id_athlete_id_key' AND conrelid='coach_athletes'::regclass) THEN ALTER TABLE coach_athletes ADD CONSTRAINT coach_athletes_coach_id_athlete_id_key UNIQUE (coach_id, athlete_id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='coach_payout_accounts_coach_id_org_id_key' AND conrelid='coach_payout_accounts'::regclass) THEN ALTER TABLE coach_payout_accounts ADD CONSTRAINT coach_payout_accounts_coach_id_org_id_key UNIQUE (coach_id, org_id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='coach_payout_accounts_stripe_account_id_key' AND conrelid='coach_payout_accounts'::regclass) THEN ALTER TABLE coach_payout_accounts ADD CONSTRAINT coach_payout_accounts_stripe_account_id_key UNIQUE (stripe_account_id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='conversation_participants_conversation_id_user_id_key' AND conrelid='conversation_participants'::regclass) THEN ALTER TABLE conversation_participants ADD CONSTRAINT conversation_participants_conversation_id_user_id_key UNIQUE (conversation_id, user_id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='course_enrollments_athlete_id_course_id_key' AND conrelid='course_enrollments'::regclass) THEN ALTER TABLE course_enrollments ADD CONSTRAINT course_enrollments_athlete_id_course_id_key UNIQUE (athlete_id, course_id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='courses_slug_key' AND conrelid='courses'::regclass) THEN ALTER TABLE courses ADD CONSTRAINT courses_slug_key UNIQUE (slug); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='drills_slug_key' AND conrelid='drills'::regclass) THEN ALTER TABLE drills ADD CONSTRAINT drills_slug_key UNIQUE (slug); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='invite_links_token_key' AND conrelid='invite_links'::regclass) THEN ALTER TABLE invite_links ADD CONSTRAINT invite_links_token_key UNIQUE (token); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lesson_progress_athlete_id_lesson_id_key' AND conrelid='lesson_progress'::regclass) THEN ALTER TABLE lesson_progress ADD CONSTRAINT lesson_progress_athlete_id_lesson_id_key UNIQUE (athlete_id, lesson_id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='membership_features_tier_id_feature_slug_key' AND conrelid='membership_features'::regclass) THEN ALTER TABLE membership_features ADD CONSTRAINT membership_features_tier_id_feature_slug_key UNIQUE (tier_id, feature_slug); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='membership_tiers_slug_key' AND conrelid='membership_tiers'::regclass) THEN ALTER TABLE membership_tiers ADD CONSTRAINT membership_tiers_slug_key UNIQUE (slug); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='newsletter_subscribers_email_unique' AND conrelid='newsletter_subscribers'::regclass) THEN ALTER TABLE newsletter_subscribers ADD CONSTRAINT newsletter_subscribers_email_unique UNIQUE (email); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='organization_members_org_id_user_id_key' AND conrelid='organization_members'::regclass) THEN ALTER TABLE organization_members ADD CONSTRAINT organization_members_org_id_user_id_key UNIQUE (org_id, user_id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='organizations_custom_domain_key' AND conrelid='organizations'::regclass) THEN ALTER TABLE organizations ADD CONSTRAINT organizations_custom_domain_key UNIQUE (custom_domain); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='organizations_slug_key' AND conrelid='organizations'::regclass) THEN ALTER TABLE organizations ADD CONSTRAINT organizations_slug_key UNIQUE (slug); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='organizations_stripe_connect_account_id_key' AND conrelid='organizations'::regclass) THEN ALTER TABLE organizations ADD CONSTRAINT organizations_stripe_connect_account_id_key UNIQUE (stripe_connect_account_id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='profiles_profile_slug_key' AND conrelid='profiles'::regclass) THEN ALTER TABLE profiles ADD CONSTRAINT profiles_profile_slug_key UNIQUE (profile_slug); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='promo_codes_code_key' AND conrelid='promo_codes'::regclass) THEN ALTER TABLE promo_codes ADD CONSTRAINT promo_codes_code_key UNIQUE (code); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='action_requests_action_type_check' AND conrelid='action_requests'::regclass) THEN ALTER TABLE action_requests ADD CONSTRAINT action_requests_action_type_check CHECK ((action_type = ANY (ARRAY['delete_session'::text, 'delete_athlete'::text, 'delete_drill'::text, 'delete_performance_metric'::text, 'modify_session'::text, 'modify_athlete'::text, 'other'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='action_requests_status_check' AND conrelid='action_requests'::regclass) THEN ALTER TABLE action_requests ADD CONSTRAINT action_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'denied'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='action_requests_target_table_check' AND conrelid='action_requests'::regclass) THEN ALTER TABLE action_requests ADD CONSTRAINT action_requests_target_table_check CHECK ((target_table = ANY (ARRAY['bookings'::text, 'profiles'::text, 'drills'::text, 'athlete_performance_metrics'::text, 'other'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='admin_whitelist_role_check' AND conrelid='admin_whitelist'::regclass) THEN ALTER TABLE admin_whitelist ADD CONSTRAINT admin_whitelist_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'coach'::text, 'master_admin'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='assigned_drills_priority_check' AND conrelid='assigned_drills'::regclass) THEN ALTER TABLE assigned_drills ADD CONSTRAINT assigned_drills_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_memberships_status_check' AND conrelid='athlete_memberships'::regclass) THEN ALTER TABLE athlete_memberships ADD CONSTRAINT athlete_memberships_status_check CHECK ((status = ANY (ARRAY['active'::text, 'cancelled'::text, 'past_due'::text, 'trialing'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_packages_payment_status_check' AND conrelid='athlete_packages'::regclass) THEN ALTER TABLE athlete_packages ADD CONSTRAINT athlete_packages_payment_status_check CHECK ((payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'refunded'::text, 'failed'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='valid_session_usage' AND conrelid='athlete_packages'::regclass) THEN ALTER TABLE athlete_packages ADD CONSTRAINT valid_session_usage CHECK ((sessions_used <= sessions_total)); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_performance_goals_status_check' AND conrelid='athlete_performance_goals'::regclass) THEN ALTER TABLE athlete_performance_goals ADD CONSTRAINT athlete_performance_goals_status_check CHECK ((status = ANY (ARRAY['active'::text, 'achieved'::text, 'expired'::text, 'revised'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_performance_metrics_flexibility_score_check' AND conrelid='athlete_performance_metrics'::regclass) THEN ALTER TABLE athlete_performance_metrics ADD CONSTRAINT athlete_performance_metrics_flexibility_score_check CHECK (((flexibility_score >= 0) AND (flexibility_score <= 100))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_performance_metrics_overall_performance_score_check' AND conrelid='athlete_performance_metrics'::regclass) THEN ALTER TABLE athlete_performance_metrics ADD CONSTRAINT athlete_performance_metrics_overall_performance_score_check CHECK (((overall_performance_score >= 0) AND (overall_performance_score <= 100))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_performance_metrics_range_of_motion_score_check' AND conrelid='athlete_performance_metrics'::regclass) THEN ALTER TABLE athlete_performance_metrics ADD CONSTRAINT athlete_performance_metrics_range_of_motion_score_check CHECK (((range_of_motion_score >= 0) AND (range_of_motion_score <= 100))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_performance_metrics_throwing_consistency_score_check' AND conrelid='athlete_performance_metrics'::regclass) THEN ALTER TABLE athlete_performance_metrics ADD CONSTRAINT athlete_performance_metrics_throwing_consistency_score_check CHECK (((throwing_consistency_score >= 0) AND (throwing_consistency_score <= 100))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_performance_notes_note_type_check' AND conrelid='athlete_performance_notes'::regclass) THEN ALTER TABLE athlete_performance_notes ADD CONSTRAINT athlete_performance_notes_note_type_check CHECK ((note_type = ANY (ARRAY['observation'::text, 'strength'::text, 'weakness'::text, 'improvement'::text, 'injury'::text, 'general'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='check_bookings_within_limit' AND conrelid='available_slots'::regclass) THEN ALTER TABLE available_slots ADD CONSTRAINT check_bookings_within_limit CHECK ((current_bookings <= max_bookings)); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='valid_booking_count' AND conrelid='available_slots'::regclass) THEN ALTER TABLE available_slots ADD CONSTRAINT valid_booking_count CHECK ((current_bookings <= max_bookings)); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='valid_slot_time' AND conrelid='available_slots'::regclass) THEN ALTER TABLE available_slots ADD CONSTRAINT valid_slot_time CHECK ((end_time > start_time)); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='bookings_payment_status_check' AND conrelid='bookings'::regclass) THEN ALTER TABLE bookings ADD CONSTRAINT bookings_payment_status_check CHECK ((payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'refunded'::text, 'failed'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='bookings_rsvp_status_check' AND conrelid='bookings'::regclass) THEN ALTER TABLE bookings ADD CONSTRAINT bookings_rsvp_status_check CHECK ((rsvp_status = ANY (ARRAY['confirmed'::text, 'maybe'::text, 'declined'::text, 'no_response'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='bookings_status_check' AND conrelid='bookings'::regclass) THEN ALTER TABLE bookings ADD CONSTRAINT bookings_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'cancelled'::text, 'completed'::text, 'no-show'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='coach_payout_accounts_account_status_check' AND conrelid='coach_payout_accounts'::regclass) THEN ALTER TABLE coach_payout_accounts ADD CONSTRAINT coach_payout_accounts_account_status_check CHECK ((account_status = ANY (ARRAY['not_connected'::text, 'pending'::text, 'active'::text, 'restricted'::text, 'disabled'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='coach_payout_accounts_coach_revenue_percent_check' AND conrelid='coach_payout_accounts'::regclass) THEN ALTER TABLE coach_payout_accounts ADD CONSTRAINT coach_payout_accounts_coach_revenue_percent_check CHECK (((coach_revenue_percent >= (0)::numeric) AND (coach_revenue_percent <= (100)::numeric))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='coach_payout_accounts_stripe_account_type_check' AND conrelid='coach_payout_accounts'::regclass) THEN ALTER TABLE coach_payout_accounts ADD CONSTRAINT coach_payout_accounts_stripe_account_type_check CHECK ((stripe_account_type = ANY (ARRAY['express'::text, 'standard'::text, 'custom'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='coach_payouts_status_check' AND conrelid='coach_payouts'::regclass) THEN ALTER TABLE coach_payouts ADD CONSTRAINT coach_payouts_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'transferred'::text, 'failed'::text, 'refunded'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='coach_schedules_day_of_week_check' AND conrelid='coach_schedules'::regclass) THEN ALTER TABLE coach_schedules ADD CONSTRAINT coach_schedules_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='valid_time_range' AND conrelid='coach_schedules'::regclass) THEN ALTER TABLE coach_schedules ADD CONSTRAINT valid_time_range CHECK ((end_time > start_time)); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='course_enrollments_payment_status_check' AND conrelid='course_enrollments'::regclass) THEN ALTER TABLE course_enrollments ADD CONSTRAINT course_enrollments_payment_status_check CHECK ((payment_status = ANY (ARRAY['free'::text, 'paid'::text, 'comp'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='courses_pricing_type_check' AND conrelid='courses'::regclass) THEN ALTER TABLE courses ADD CONSTRAINT courses_pricing_type_check CHECK ((pricing_type = ANY (ARRAY['free'::text, 'one_time'::text, 'monthly'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='device_imports_device_type_check' AND conrelid='device_imports'::regclass) THEN ALTER TABLE device_imports ADD CONSTRAINT device_imports_device_type_check CHECK ((device_type = ANY (ARRAY['rapsodo'::text, 'blast_motion'::text, 'pocket_radar'::text, 'hittrax'::text, 'manual'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='device_imports_status_check' AND conrelid='device_imports'::regclass) THEN ALTER TABLE device_imports ADD CONSTRAINT device_imports_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='drills_category_check' AND conrelid='drills'::regclass) THEN ALTER TABLE drills ADD CONSTRAINT drills_category_check CHECK ((category = ANY (ARRAY['mechanics'::text, 'speed'::text, 'power'::text, 'recovery'::text, 'warmup'::text, 'conditioning'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='drills_difficulty_check' AND conrelid='drills'::regclass) THEN ALTER TABLE drills ADD CONSTRAINT drills_difficulty_check CHECK ((difficulty = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='drills_duration_seconds_check' AND conrelid='drills'::regclass) THEN ALTER TABLE drills ADD CONSTRAINT drills_duration_seconds_check CHECK ((duration_seconds > 0)); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='membership_tiers_billing_interval_check' AND conrelid='membership_tiers'::regclass) THEN ALTER TABLE membership_tiers ADD CONSTRAINT membership_tiers_billing_interval_check CHECK ((billing_interval = ANY (ARRAY['monthly'::text, 'yearly'::text, 'one_time'::text, 'free'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='organization_members_role_check' AND conrelid='organization_members'::regclass) THEN ALTER TABLE organization_members ADD CONSTRAINT organization_members_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'coach'::text, 'athlete'::text, 'admin'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='organization_members_status_check' AND conrelid='organization_members'::regclass) THEN ALTER TABLE organization_members ADD CONSTRAINT organization_members_status_check CHECK ((status = ANY (ARRAY['active'::text, 'pending'::text, 'suspended'::text, 'removed'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='organizations_platform_fee_percent_check' AND conrelid='organizations'::regclass) THEN ALTER TABLE organizations ADD CONSTRAINT organizations_platform_fee_percent_check CHECK (((platform_fee_percent >= (0)::numeric) AND (platform_fee_percent <= (100)::numeric))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='organizations_stripe_connect_status_check' AND conrelid='organizations'::regclass) THEN ALTER TABLE organizations ADD CONSTRAINT organizations_stripe_connect_status_check CHECK ((stripe_connect_status = ANY (ARRAY['not_connected'::text, 'pending'::text, 'active'::text, 'restricted'::text, 'disabled'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='packages_price_paid_check' AND conrelid='packages'::regclass) THEN ALTER TABLE packages ADD CONSTRAINT packages_price_paid_check CHECK ((price_paid >= (0)::numeric)); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='packages_sessions_remaining_check' AND conrelid='packages'::regclass) THEN ALTER TABLE packages ADD CONSTRAINT packages_sessions_remaining_check CHECK ((sessions_remaining >= 0)); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='packages_total_sessions_check' AND conrelid='packages'::regclass) THEN ALTER TABLE packages ADD CONSTRAINT packages_total_sessions_check CHECK ((total_sessions > 0)); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='profiles_age_check' AND conrelid='profiles'::regclass) THEN ALTER TABLE profiles ADD CONSTRAINT profiles_age_check CHECK (((age >= 5) AND (age <= 100))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='profiles_athlete_type_check' AND conrelid='profiles'::regclass) THEN ALTER TABLE profiles ADD CONSTRAINT profiles_athlete_type_check CHECK ((athlete_type = ANY (ARRAY['soccer'::text, 'basketball'::text, 'softball'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='profiles_progress_report_frequency_check' AND conrelid='profiles'::regclass) THEN ALTER TABLE profiles ADD CONSTRAINT profiles_progress_report_frequency_check CHECK ((progress_report_frequency = ANY (ARRAY['monthly'::text, 'never'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='profiles_role_check' AND conrelid='profiles'::regclass) THEN ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK ((role = ANY (ARRAY['athlete'::text, 'coach'::text, 'admin'::text, 'master_admin'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='promo_codes_applies_to_check' AND conrelid='promo_codes'::regclass) THEN ALTER TABLE promo_codes ADD CONSTRAINT promo_codes_applies_to_check CHECK ((applies_to = ANY (ARRAY['all'::text, 'booking'::text, 'package'::text, 'membership'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='promo_codes_discount_type_check' AND conrelid='promo_codes'::regclass) THEN ALTER TABLE promo_codes ADD CONSTRAINT promo_codes_discount_type_check CHECK ((discount_type = ANY (ARRAY['percentage'::text, 'fixed_cents'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='simulation_sessions_simulated_role_check' AND conrelid='simulation_sessions'::regclass) THEN ALTER TABLE simulation_sessions ADD CONSTRAINT simulation_sessions_simulated_role_check CHECK ((simulated_role = ANY (ARRAY['athlete'::text, 'coach'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='velocity_logs_velocity_mph_check' AND conrelid='velocity_logs'::regclass) THEN ALTER TABLE velocity_logs ADD CONSTRAINT velocity_logs_velocity_mph_check CHECK (((velocity_mph >= (0)::numeric) AND (velocity_mph <= (200)::numeric))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='video_analysis_submissions_source_type_check' AND conrelid='video_analysis_submissions'::regclass) THEN ALTER TABLE video_analysis_submissions ADD CONSTRAINT video_analysis_submissions_source_type_check CHECK ((source_type = ANY (ARRAY['upload'::text, 'youtube'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='video_analysis_submissions_status_check' AND conrelid='video_analysis_submissions'::regclass) THEN ALTER TABLE video_analysis_submissions ADD CONSTRAINT video_analysis_submissions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'in_review'::text, 'completed'::text]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='action_requests_requested_by_fkey' AND conrelid='action_requests'::regclass) THEN ALTER TABLE action_requests ADD CONSTRAINT action_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES auth.users(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='action_requests_reviewed_by_fkey' AND conrelid='action_requests'::regclass) THEN ALTER TABLE action_requests ADD CONSTRAINT action_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='assigned_drills_assigned_by_id_fkey' AND conrelid='assigned_drills'::regclass) THEN ALTER TABLE assigned_drills ADD CONSTRAINT assigned_drills_assigned_by_id_fkey FOREIGN KEY (assigned_by_id) REFERENCES profiles(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='assigned_drills_drill_id_fkey' AND conrelid='assigned_drills'::regclass) THEN ALTER TABLE assigned_drills ADD CONSTRAINT assigned_drills_drill_id_fkey FOREIGN KEY (drill_id) REFERENCES drills(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='assigned_drills_user_id_fkey' AND conrelid='assigned_drills'::regclass) THEN ALTER TABLE assigned_drills ADD CONSTRAINT assigned_drills_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='assigned_questionnaires_assigned_by_id_fkey' AND conrelid='assigned_questionnaires'::regclass) THEN ALTER TABLE assigned_questionnaires ADD CONSTRAINT assigned_questionnaires_assigned_by_id_fkey FOREIGN KEY (assigned_by_id) REFERENCES profiles(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='assigned_questionnaires_questionnaire_id_fkey' AND conrelid='assigned_questionnaires'::regclass) THEN ALTER TABLE assigned_questionnaires ADD CONSTRAINT assigned_questionnaires_questionnaire_id_fkey FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='assigned_questionnaires_user_id_fkey' AND conrelid='assigned_questionnaires'::regclass) THEN ALTER TABLE assigned_questionnaires ADD CONSTRAINT assigned_questionnaires_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_memberships_athlete_id_fkey' AND conrelid='athlete_memberships'::regclass) THEN ALTER TABLE athlete_memberships ADD CONSTRAINT athlete_memberships_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_memberships_tier_id_fkey' AND conrelid='athlete_memberships'::regclass) THEN ALTER TABLE athlete_memberships ADD CONSTRAINT athlete_memberships_tier_id_fkey FOREIGN KEY (tier_id) REFERENCES membership_tiers(id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_packages_athlete_id_fkey' AND conrelid='athlete_packages'::regclass) THEN ALTER TABLE athlete_packages ADD CONSTRAINT athlete_packages_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_packages_org_id_fkey' AND conrelid='athlete_packages'::regclass) THEN ALTER TABLE athlete_packages ADD CONSTRAINT athlete_packages_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_packages_package_id_fkey' AND conrelid='athlete_packages'::regclass) THEN ALTER TABLE athlete_packages ADD CONSTRAINT athlete_packages_package_id_fkey FOREIGN KEY (package_id) REFERENCES training_packages(id) ON DELETE RESTRICT; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_performance_goals_athlete_id_fkey' AND conrelid='athlete_performance_goals'::regclass) THEN ALTER TABLE athlete_performance_goals ADD CONSTRAINT athlete_performance_goals_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_performance_goals_set_by_fkey' AND conrelid='athlete_performance_goals'::regclass) THEN ALTER TABLE athlete_performance_goals ADD CONSTRAINT athlete_performance_goals_set_by_fkey FOREIGN KEY (set_by) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_performance_metrics_athlete_id_fkey' AND conrelid='athlete_performance_metrics'::regclass) THEN ALTER TABLE athlete_performance_metrics ADD CONSTRAINT athlete_performance_metrics_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_performance_metrics_child_id_fkey' AND conrelid='athlete_performance_metrics'::regclass) THEN ALTER TABLE athlete_performance_metrics ADD CONSTRAINT athlete_performance_metrics_child_id_fkey FOREIGN KEY (child_id) REFERENCES parent_children(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_performance_metrics_recorded_by_fkey' AND conrelid='athlete_performance_metrics'::regclass) THEN ALTER TABLE athlete_performance_metrics ADD CONSTRAINT athlete_performance_metrics_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_performance_metrics_session_id_fkey' AND conrelid='athlete_performance_metrics'::regclass) THEN ALTER TABLE athlete_performance_metrics ADD CONSTRAINT athlete_performance_metrics_session_id_fkey FOREIGN KEY (session_id) REFERENCES bookings(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_performance_notes_athlete_id_fkey' AND conrelid='athlete_performance_notes'::regclass) THEN ALTER TABLE athlete_performance_notes ADD CONSTRAINT athlete_performance_notes_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_performance_notes_coach_id_fkey' AND conrelid='athlete_performance_notes'::regclass) THEN ALTER TABLE athlete_performance_notes ADD CONSTRAINT athlete_performance_notes_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='athlete_performance_notes_session_id_fkey' AND conrelid='athlete_performance_notes'::regclass) THEN ALTER TABLE athlete_performance_notes ADD CONSTRAINT athlete_performance_notes_session_id_fkey FOREIGN KEY (session_id) REFERENCES bookings(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='audit_log_user_id_fkey' AND conrelid='audit_log'::regclass) THEN ALTER TABLE audit_log ADD CONSTRAINT audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='available_slots_coach_id_fkey' AND conrelid='available_slots'::regclass) THEN ALTER TABLE available_slots ADD CONSTRAINT available_slots_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='available_slots_org_id_fkey' AND conrelid='available_slots'::regclass) THEN ALTER TABLE available_slots ADD CONSTRAINT available_slots_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='available_slots_service_id_fkey' AND conrelid='available_slots'::regclass) THEN ALTER TABLE available_slots ADD CONSTRAINT available_slots_service_id_fkey FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='blog_posts_author_id_fkey' AND conrelid='blog_posts'::regclass) THEN ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES profiles(id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='bookings_athlete_id_fkey' AND conrelid='bookings'::regclass) THEN ALTER TABLE bookings ADD CONSTRAINT bookings_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='bookings_checked_in_by_fkey' AND conrelid='bookings'::regclass) THEN ALTER TABLE bookings ADD CONSTRAINT bookings_checked_in_by_fkey FOREIGN KEY (checked_in_by) REFERENCES profiles(id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='bookings_child_id_fkey' AND conrelid='bookings'::regclass) THEN ALTER TABLE bookings ADD CONSTRAINT bookings_child_id_fkey FOREIGN KEY (child_id) REFERENCES parent_children(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='bookings_coach_id_fkey' AND conrelid='bookings'::regclass) THEN ALTER TABLE bookings ADD CONSTRAINT bookings_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='bookings_org_id_fkey' AND conrelid='bookings'::regclass) THEN ALTER TABLE bookings ADD CONSTRAINT bookings_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='bookings_package_id_fkey' AND conrelid='bookings'::regclass) THEN ALTER TABLE bookings ADD CONSTRAINT bookings_package_id_fkey FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='bookings_service_id_fkey' AND conrelid='bookings'::regclass) THEN ALTER TABLE bookings ADD CONSTRAINT bookings_service_id_fkey FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='bookings_slot_id_fkey' AND conrelid='bookings'::regclass) THEN ALTER TABLE bookings ADD CONSTRAINT bookings_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES available_slots(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='coach_athletes_athlete_id_fkey' AND conrelid='coach_athletes'::regclass) THEN ALTER TABLE coach_athletes ADD CONSTRAINT coach_athletes_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='coach_athletes_coach_id_fkey' AND conrelid='coach_athletes'::regclass) THEN ALTER TABLE coach_athletes ADD CONSTRAINT coach_athletes_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='coach_payout_accounts_coach_id_fkey' AND conrelid='coach_payout_accounts'::regclass) THEN ALTER TABLE coach_payout_accounts ADD CONSTRAINT coach_payout_accounts_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='coach_payout_accounts_org_id_fkey' AND conrelid='coach_payout_accounts'::regclass) THEN ALTER TABLE coach_payout_accounts ADD CONSTRAINT coach_payout_accounts_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='coach_payouts_booking_id_fkey' AND conrelid='coach_payouts'::regclass) THEN ALTER TABLE coach_payouts ADD CONSTRAINT coach_payouts_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='coach_payouts_coach_id_fkey' AND conrelid='coach_payouts'::regclass) THEN ALTER TABLE coach_payouts ADD CONSTRAINT coach_payouts_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='coach_payouts_org_id_fkey' AND conrelid='coach_payouts'::regclass) THEN ALTER TABLE coach_payouts ADD CONSTRAINT coach_payouts_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='coach_payouts_payout_account_id_fkey' AND conrelid='coach_payouts'::regclass) THEN ALTER TABLE coach_payouts ADD CONSTRAINT coach_payouts_payout_account_id_fkey FOREIGN KEY (payout_account_id) REFERENCES coach_payout_accounts(id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='coach_schedules_coach_id_fkey' AND conrelid='coach_schedules'::regclass) THEN ALTER TABLE coach_schedules ADD CONSTRAINT coach_schedules_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='conversation_participants_conversation_id_fkey' AND conrelid='conversation_participants'::regclass) THEN ALTER TABLE conversation_participants ADD CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='conversation_participants_user_id_fkey' AND conrelid='conversation_participants'::regclass) THEN ALTER TABLE conversation_participants ADD CONSTRAINT conversation_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='course_enrollments_athlete_id_fkey' AND conrelid='course_enrollments'::regclass) THEN ALTER TABLE course_enrollments ADD CONSTRAINT course_enrollments_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='course_enrollments_course_id_fkey' AND conrelid='course_enrollments'::regclass) THEN ALTER TABLE course_enrollments ADD CONSTRAINT course_enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='course_lessons_course_id_fkey' AND conrelid='course_lessons'::regclass) THEN ALTER TABLE course_lessons ADD CONSTRAINT course_lessons_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='courses_created_by_fkey' AND conrelid='courses'::regclass) THEN ALTER TABLE courses ADD CONSTRAINT courses_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='device_imports_athlete_id_fkey' AND conrelid='device_imports'::regclass) THEN ALTER TABLE device_imports ADD CONSTRAINT device_imports_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='device_imports_imported_by_fkey' AND conrelid='device_imports'::regclass) THEN ALTER TABLE device_imports ADD CONSTRAINT device_imports_imported_by_fkey FOREIGN KEY (imported_by) REFERENCES profiles(id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='drill_completions_drill_id_fkey' AND conrelid='drill_completions'::regclass) THEN ALTER TABLE drill_completions ADD CONSTRAINT drill_completions_drill_id_fkey FOREIGN KEY (drill_id) REFERENCES drills(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='drill_completions_session_id_fkey' AND conrelid='drill_completions'::regclass) THEN ALTER TABLE drill_completions ADD CONSTRAINT drill_completions_session_id_fkey FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='drill_completions_user_id_fkey' AND conrelid='drill_completions'::regclass) THEN ALTER TABLE drill_completions ADD CONSTRAINT drill_completions_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='drills_created_by_fkey' AND conrelid='drills'::regclass) THEN ALTER TABLE drills ADD CONSTRAINT drills_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='invite_links_coach_id_fkey' AND conrelid='invite_links'::regclass) THEN ALTER TABLE invite_links ADD CONSTRAINT invite_links_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='invite_links_org_id_fkey' AND conrelid='invite_links'::regclass) THEN ALTER TABLE invite_links ADD CONSTRAINT invite_links_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lesson_progress_athlete_id_fkey' AND conrelid='lesson_progress'::regclass) THEN ALTER TABLE lesson_progress ADD CONSTRAINT lesson_progress_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='lesson_progress_lesson_id_fkey' AND conrelid='lesson_progress'::regclass) THEN ALTER TABLE lesson_progress ADD CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='membership_features_tier_id_fkey' AND conrelid='membership_features'::regclass) THEN ALTER TABLE membership_features ADD CONSTRAINT membership_features_tier_id_fkey FOREIGN KEY (tier_id) REFERENCES membership_tiers(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='messages_conversation_id_fkey' AND conrelid='messages'::regclass) THEN ALTER TABLE messages ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='messages_sender_id_fkey' AND conrelid='messages'::regclass) THEN ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='organization_members_invited_by_fkey' AND conrelid='organization_members'::regclass) THEN ALTER TABLE organization_members ADD CONSTRAINT organization_members_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES profiles(id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='organization_members_org_id_fkey' AND conrelid='organization_members'::regclass) THEN ALTER TABLE organization_members ADD CONSTRAINT organization_members_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='organization_members_user_id_fkey' AND conrelid='organization_members'::regclass) THEN ALTER TABLE organization_members ADD CONSTRAINT organization_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='organizations_owner_id_fkey' AND conrelid='organizations'::regclass) THEN ALTER TABLE organizations ADD CONSTRAINT organizations_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE RESTRICT; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='packages_athlete_id_fkey' AND conrelid='packages'::regclass) THEN ALTER TABLE packages ADD CONSTRAINT packages_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='parent_children_parent_id_fkey' AND conrelid='parent_children'::regclass) THEN ALTER TABLE parent_children ADD CONSTRAINT parent_children_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='profiles_active_child_id_fkey' AND conrelid='profiles'::regclass) THEN ALTER TABLE profiles ADD CONSTRAINT profiles_active_child_id_fkey FOREIGN KEY (active_child_id) REFERENCES parent_children(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='profiles_archived_by_fkey' AND conrelid='profiles'::regclass) THEN ALTER TABLE profiles ADD CONSTRAINT profiles_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES profiles(id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='profiles_id_fkey' AND conrelid='profiles'::regclass) THEN ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='promo_codes_created_by_fkey' AND conrelid='promo_codes'::regclass) THEN ALTER TABLE promo_codes ADD CONSTRAINT promo_codes_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='questionnaires_created_by_fkey' AND conrelid='questionnaires'::regclass) THEN ALTER TABLE questionnaires ADD CONSTRAINT questionnaires_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='services_org_id_fkey' AND conrelid='services'::regclass) THEN ALTER TABLE services ADD CONSTRAINT services_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='sessions_user_id_fkey' AND conrelid='sessions'::regclass) THEN ALTER TABLE sessions ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='simulation_data_log_simulation_id_fkey' AND conrelid='simulation_data_log'::regclass) THEN ALTER TABLE simulation_data_log ADD CONSTRAINT simulation_data_log_simulation_id_fkey FOREIGN KEY (simulation_id) REFERENCES simulation_sessions(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='simulation_sessions_admin_id_fkey' AND conrelid='simulation_sessions'::regclass) THEN ALTER TABLE simulation_sessions ADD CONSTRAINT simulation_sessions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='training_packages_org_id_fkey' AND conrelid='training_packages'::regclass) THEN ALTER TABLE training_packages ADD CONSTRAINT training_packages_org_id_fkey FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='training_packages_service_id_fkey' AND conrelid='training_packages'::regclass) THEN ALTER TABLE training_packages ADD CONSTRAINT training_packages_service_id_fkey FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='velocity_logs_drill_id_fkey' AND conrelid='velocity_logs'::regclass) THEN ALTER TABLE velocity_logs ADD CONSTRAINT velocity_logs_drill_id_fkey FOREIGN KEY (drill_id) REFERENCES drills(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='velocity_logs_session_id_fkey' AND conrelid='velocity_logs'::regclass) THEN ALTER TABLE velocity_logs ADD CONSTRAINT velocity_logs_session_id_fkey FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='velocity_logs_user_id_fkey' AND conrelid='velocity_logs'::regclass) THEN ALTER TABLE velocity_logs ADD CONSTRAINT velocity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='video_analysis_submissions_athlete_id_fkey' AND conrelid='video_analysis_submissions'::regclass) THEN ALTER TABLE video_analysis_submissions ADD CONSTRAINT video_analysis_submissions_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES profiles(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='video_analysis_submissions_reviewed_by_fkey' AND conrelid='video_analysis_submissions'::regclass) THEN ALTER TABLE video_analysis_submissions ADD CONSTRAINT video_analysis_submissions_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES profiles(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='video_analysis_submissions_submitted_by_fkey' AND conrelid='video_analysis_submissions'::regclass) THEN ALTER TABLE video_analysis_submissions ADD CONSTRAINT video_analysis_submissions_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES profiles(id) ON DELETE SET NULL; END IF; END $$;

-- ------------------------------------------------------------------------------
-- 5. STANDALONE INDEXES (not constraint-backed)
-- ------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_action_requests_created_at ON public.action_requests USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_action_requests_requested_by ON public.action_requests USING btree (requested_by);
CREATE INDEX IF NOT EXISTS idx_action_requests_status ON public.action_requests USING btree (status);
CREATE INDEX IF NOT EXISTS idx_action_requests_target ON public.action_requests USING btree (target_table, target_id);
CREATE INDEX IF NOT EXISTS assigned_drills_completed_idx ON public.assigned_drills USING btree (completed);
CREATE INDEX IF NOT EXISTS assigned_drills_user_id_idx ON public.assigned_drills USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_assigned_drills_assigned_by ON public.assigned_drills USING btree (assigned_by_id);
CREATE INDEX IF NOT EXISTS idx_assigned_questionnaires_questionnaire_id ON public.assigned_questionnaires USING btree (questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_assigned_questionnaires_user_id ON public.assigned_questionnaires USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_athlete_packages_active ON public.athlete_packages USING btree (is_active);
CREATE INDEX IF NOT EXISTS idx_athlete_packages_athlete ON public.athlete_packages USING btree (athlete_id);
CREATE INDEX IF NOT EXISTS idx_performance_goals_athlete ON public.athlete_performance_goals USING btree (athlete_id);
CREATE INDEX IF NOT EXISTS idx_metrics_child ON public.athlete_performance_metrics USING btree (child_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_athlete ON public.athlete_performance_metrics USING btree (athlete_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_date ON public.athlete_performance_metrics USING btree (test_date);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_recorded_by ON public.athlete_performance_metrics USING btree (recorded_by);
CREATE INDEX IF NOT EXISTS idx_performance_notes_athlete ON public.athlete_performance_notes USING btree (athlete_id);
CREATE INDEX IF NOT EXISTS idx_performance_notes_coach ON public.athlete_performance_notes USING btree (coach_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log USING btree (action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON public.audit_log USING btree (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON public.audit_log USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_available_slots_available ON public.available_slots USING btree (is_available);
CREATE INDEX IF NOT EXISTS idx_available_slots_coach ON public.available_slots USING btree (coach_id);
CREATE INDEX IF NOT EXISTS idx_available_slots_coach_date ON public.available_slots USING btree (coach_id, slot_date, is_available);
CREATE INDEX IF NOT EXISTS idx_available_slots_date ON public.available_slots USING btree (slot_date);
CREATE INDEX IF NOT EXISTS idx_slots_org_id ON public.available_slots USING btree (org_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON public.blog_posts USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts USING btree (published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts USING btree (slug);
CREATE INDEX IF NOT EXISTS idx_bookings_athlete ON public.bookings USING btree (athlete_id);
CREATE INDEX IF NOT EXISTS idx_bookings_child ON public.bookings USING btree (child_id);
CREATE INDEX IF NOT EXISTS idx_bookings_coach ON public.bookings USING btree (coach_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings USING btree (booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_org_id ON public.bookings USING btree (org_id);
CREATE INDEX IF NOT EXISTS idx_bookings_package ON public.bookings USING btree (package_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings USING btree (payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_slot ON public.bookings USING btree (slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_slot_id ON public.bookings USING btree (slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings USING btree (status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_unique_checkout_session ON public.bookings USING btree (stripe_checkout_session_id) WHERE (stripe_checkout_session_id IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_coach_athletes_athlete ON public.coach_athletes USING btree (athlete_id) WHERE (active = true);
CREATE INDEX IF NOT EXISTS idx_coach_athletes_coach ON public.coach_athletes USING btree (coach_id) WHERE (active = true);
CREATE INDEX IF NOT EXISTS idx_payout_accounts_coach ON public.coach_payout_accounts USING btree (coach_id);
CREATE INDEX IF NOT EXISTS idx_payout_accounts_org ON public.coach_payout_accounts USING btree (org_id);
CREATE INDEX IF NOT EXISTS idx_payouts_booking ON public.coach_payouts USING btree (booking_id);
CREATE INDEX IF NOT EXISTS idx_payouts_coach ON public.coach_payouts USING btree (coach_id);
CREATE INDEX IF NOT EXISTS idx_payouts_org ON public.coach_payouts USING btree (org_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.coach_payouts USING btree (status);
CREATE INDEX IF NOT EXISTS idx_coach_schedules_coach ON public.coach_schedules USING btree (coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_schedules_day ON public.coach_schedules USING btree (day_of_week);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON public.conversation_participants USING btree (conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON public.conversation_participants USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_athlete_id ON public.course_enrollments USING btree (athlete_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON public.course_enrollments USING btree (course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON public.course_lessons USING btree (course_id);
CREATE INDEX IF NOT EXISTS idx_device_imports_athlete ON public.device_imports USING btree (athlete_id);
CREATE INDEX IF NOT EXISTS idx_device_imports_imported_by ON public.device_imports USING btree (imported_by);
CREATE INDEX IF NOT EXISTS drill_completions_completed_at_idx ON public.drill_completions USING btree (completed_at);
CREATE INDEX IF NOT EXISTS drill_completions_drill_id_idx ON public.drill_completions USING btree (drill_id);
CREATE INDEX IF NOT EXISTS drill_completions_user_id_idx ON public.drill_completions USING btree (user_id);
CREATE INDEX IF NOT EXISTS drills_category_idx ON public.drills USING btree (category);
CREATE INDEX IF NOT EXISTS drills_difficulty_idx ON public.drills USING btree (difficulty);
CREATE INDEX IF NOT EXISTS drills_featured_idx ON public.drills USING btree (is_featured);
CREATE INDEX IF NOT EXISTS drills_published_idx ON public.drills USING btree (is_published);
CREATE INDEX IF NOT EXISTS drills_tags_idx ON public.drills USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_drills_created_by ON public.drills USING btree (created_by);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_athlete_id ON public.lesson_progress USING btree (athlete_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON public.lesson_progress USING btree (lesson_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages USING btree (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read ON public.messages USING btree (read_at) WHERE (read_at IS NULL);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages USING btree (sender_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.organization_members USING btree (org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_members USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_packages_active ON public.packages USING btree (active) WHERE (active = true);
CREATE INDEX IF NOT EXISTS idx_packages_athlete ON public.packages USING btree (athlete_id);
CREATE INDEX IF NOT EXISTS idx_parent_children_parent ON public.parent_children USING btree (parent_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles USING btree (email);
CREATE INDEX IF NOT EXISTS idx_profiles_leaderboard ON public.profiles USING btree (leaderboard_opt_in) WHERE (leaderboard_opt_in = true);
CREATE INDEX IF NOT EXISTS idx_profiles_newsletter_consent ON public.profiles USING btree (newsletter_consent) WHERE (newsletter_consent = true);
CREATE INDEX IF NOT EXISTS idx_profiles_parent_accounts ON public.profiles USING btree (account_type) WHERE (account_type = 'parent_guardian'::text);
CREATE INDEX IF NOT EXISTS idx_profiles_parent_email ON public.profiles USING btree (parent_guardian_email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_profile_slug ON public.profiles USING btree (profile_slug) WHERE (profile_slug IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_profiles_region ON public.profiles USING btree (region) WHERE (region IS NOT NULL);
CREATE INDEX IF NOT EXISTS profiles_archived_at_idx ON public.profiles USING btree (archived_at) WHERE (archived_at IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON public.promo_codes USING btree (is_active) WHERE (is_active = true);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes USING btree (code);
CREATE INDEX IF NOT EXISTS idx_services_featured ON public.services USING btree (featured_on_homepage) WHERE (featured_on_homepage = true);
CREATE INDEX IF NOT EXISTS idx_services_org_id ON public.services USING btree (org_id);
CREATE UNIQUE INDEX IF NOT EXISTS services_slug_unique ON public.services USING btree (slug);
CREATE INDEX IF NOT EXISTS sessions_completed_idx ON public.sessions USING btree (completed);
CREATE INDEX IF NOT EXISTS sessions_scheduled_at_idx ON public.sessions USING btree (scheduled_at);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON public.sessions USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_sim_data_sim_id ON public.simulation_data_log USING btree (simulation_id);
CREATE INDEX IF NOT EXISTS idx_sim_data_table ON public.simulation_data_log USING btree (table_name);
CREATE INDEX IF NOT EXISTS idx_sim_sessions_admin ON public.simulation_sessions USING btree (admin_id);
CREATE INDEX IF NOT EXISTS velocity_logs_recorded_at_idx ON public.velocity_logs USING btree (recorded_at);
CREATE INDEX IF NOT EXISTS velocity_logs_session_id_idx ON public.velocity_logs USING btree (session_id);
CREATE INDEX IF NOT EXISTS velocity_logs_user_id_idx ON public.velocity_logs USING btree (user_id);

-- ------------------------------------------------------------------------------
-- 6. FUNCTIONS (includes rls_auto_enable + handle_new_user; latter is intentionally not wired to a trigger)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.expire_overdue_trials()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  expired_count INTEGER;
BEGIN
  WITH expired AS (
    UPDATE athlete_memberships
    SET status = 'cancelled',
        cancelled_at = now(),
        updated_at = now()
    WHERE status = 'trialing'
      AND current_period_end IS NOT NULL
      AND current_period_end < now()
    RETURNING athlete_id
  )
  UPDATE profiles
  SET membership_tier = 'basic'
  WHERE id IN (SELECT athlete_id FROM expired)
    AND membership_tier = 'elite';

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_weekly_slots(p_coach_id uuid, p_start_date date, p_end_date date, p_days_of_week integer[], p_start_time time without time zone, p_end_time time without time zone, p_slot_duration_minutes integer, p_location text DEFAULT 'PSP Training Facility'::text, p_max_bookings integer DEFAULT 1)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_date DATE;
  v_current_time TIME;
  v_slots_created INTEGER := 0;
BEGIN
  v_current_date := p_start_date;

  WHILE v_current_date <= p_end_date LOOP
    IF EXTRACT(DOW FROM v_current_date)::INTEGER = ANY(p_days_of_week) THEN
      v_current_time := p_start_time;

      WHILE v_current_time < p_end_time LOOP
        INSERT INTO available_slots (
          coach_id,
          slot_date,
          start_time,
          end_time,
          location,
          max_bookings
        ) VALUES (
          p_coach_id,
          v_current_date,
          v_current_time,
          v_current_time + (p_slot_duration_minutes || ' minutes')::INTERVAL,
          p_location,
          p_max_bookings
        );

        v_slots_created := v_slots_created + 1;
        v_current_time := v_current_time + (p_slot_duration_minutes || ' minutes')::INTERVAL;
      END LOOP;
    END IF;

    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;

  RETURN v_slots_created;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$function$
;

CREATE OR REPLACE FUNCTION public.get_next_session(user_uuid uuid)
 RETURNS TABLE(id uuid, title text, scheduled_at timestamp with time zone, location text, duration_minutes integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT s.id, s.title, s.scheduled_at, s.location, s.duration_minutes
  FROM public.sessions s
  WHERE s.user_id = user_uuid
    AND s.scheduled_at > NOW()
    AND s.completed = false
  ORDER BY s.scheduled_at ASC
  LIMIT 1;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.grant_signup_trial()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  elite_tier_id UUID;
BEGIN
  IF NEW.role IS DISTINCT FROM 'athlete' THEN
    RETURN NEW;
  END IF;

  IF EXISTS (SELECT 1 FROM athlete_memberships WHERE athlete_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  SELECT id INTO elite_tier_id FROM membership_tiers WHERE slug = 'elite_membership' LIMIT 1;
  IF elite_tier_id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO athlete_memberships (
    athlete_id,
    tier_id,
    status,
    current_period_start,
    current_period_end
  ) VALUES (
    NEW.id,
    elite_tier_id,
    'trialing',
    now(),
    now() + INTERVAL '60 days'
  )
  ON CONFLICT (athlete_id) DO NOTHING;

  UPDATE profiles
  SET membership_tier = 'elite'
  WHERE id = NEW.id;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_booking_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  result RECORD;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Use the safe increment function
    SELECT * INTO result FROM increment_slot_booking(NEW.slot_id);

    IF NOT result.success THEN
      RAISE EXCEPTION 'Cannot book slot: %', result.message;
    END IF;

    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement on cancellation
    UPDATE available_slots
    SET
      current_bookings = GREATEST(0, current_bookings - 1),
      is_available = TRUE,
      updated_at = NOW()
    WHERE id = OLD.slot_id;

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  admin_role TEXT;
BEGIN
  -- Check if email is in admin whitelist
  SELECT role INTO admin_role FROM admin_whitelist WHERE email = new.email;

  -- Insert profile with email from auth.users
  INSERT INTO public.profiles (id, full_name, email, role, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email, -- Include email in profile
    COALESCE(admin_role, 'athlete'),
    now(),
    now()
  );

  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_drill_views(drill_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.drills
  SET view_count = view_count + 1
  WHERE id = drill_uuid;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_promo_usage(promo_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE promo_codes
  SET current_uses = current_uses + 1,
      updated_at = now()
  WHERE id = promo_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_slot_availability()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' AND NEW.slot_id IS NOT NULL THEN
    UPDATE available_slots
    SET current_bookings = GREATEST(current_bookings - 1, 0),
        is_available = true
    WHERE id = NEW.slot_id;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_slot_booking(slot_id uuid)
 RETURNS TABLE(success boolean, message text, available boolean)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  slot_record RECORD;
BEGIN
  -- Lock the row for update to prevent race conditions
  SELECT * INTO slot_record
  FROM available_slots
  WHERE id = slot_id
  FOR UPDATE;

  -- Check if slot exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Slot not found'::TEXT, FALSE;
    RETURN;
  END IF;

  -- Check if slot is available
  IF NOT slot_record.is_available THEN
    RETURN QUERY SELECT FALSE, 'Slot is not available'::TEXT, FALSE;
    RETURN;
  END IF;

  -- Check if slot is full
  IF slot_record.current_bookings >= slot_record.max_bookings THEN
    RETURN QUERY SELECT FALSE, 'Slot is full'::TEXT, FALSE;
    RETURN;
  END IF;

  -- Increment the booking count
  UPDATE available_slots
  SET
    current_bookings = current_bookings + 1,
    is_available = CASE
      WHEN current_bookings + 1 >= max_bookings THEN FALSE
      ELSE TRUE
    END,
    updated_at = NOW()
  WHERE id = slot_id;

  -- Return success
  RETURN QUERY SELECT TRUE, 'Booking count incremented'::TEXT, TRUE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = conv_id AND user_id = auth.uid()
  );
$function$
;

CREATE OR REPLACE FUNCTION public.recalculate_all_slot_counts()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE available_slots
  SET
    current_bookings = COALESCE((
      SELECT COUNT(*) FROM bookings
      WHERE bookings.slot_id = available_slots.id
        AND bookings.status IN ('confirmed', 'pending')
    ), 0),
    is_available = (COALESCE((
      SELECT COUNT(*) FROM bookings
      WHERE bookings.slot_id = available_slots.id
        AND bookings.status IN ('confirmed', 'pending')
    ), 0) < max_bookings)
  WHERE
    -- Only touch upcoming slots (don't churn historical data)
    slot_date >= CURRENT_DATE - INTERVAL '1 day';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.recalculate_slot_availability()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  active_count INTEGER;
  slot_max     INTEGER;
  target_slot  UUID;
BEGIN
  -- Determine which slot we're recalculating, based on operation
  IF TG_OP = 'INSERT' THEN
    IF NEW.slot_id IS NULL THEN
      RETURN NEW;
    END IF;
    target_slot := NEW.slot_id;

  ELSIF TG_OP = 'UPDATE' THEN
    -- For UPDATE, only act on status changes (count membership changes)
    -- OR slot_id changes (booking moved to a different slot).
    IF OLD.slot_id IS NULL AND NEW.slot_id IS NULL THEN
      RETURN NEW;
    END IF;
    IF OLD.status = NEW.status AND OLD.slot_id IS NOT DISTINCT FROM NEW.slot_id THEN
      RETURN NEW;
    END IF;
    target_slot := COALESCE(NEW.slot_id, OLD.slot_id);

    -- If slot_id changed, also recalc the OLD slot (booking moved away from it)
    IF OLD.slot_id IS NOT NULL AND OLD.slot_id IS DISTINCT FROM NEW.slot_id THEN
      SELECT COUNT(*) INTO active_count
      FROM bookings
      WHERE slot_id = OLD.slot_id
        AND status IN ('confirmed', 'pending');
      SELECT max_bookings INTO slot_max FROM available_slots WHERE id = OLD.slot_id;
      IF slot_max IS NOT NULL THEN
        UPDATE available_slots
        SET current_bookings = active_count,
            is_available     = (active_count < slot_max)
        WHERE id = OLD.slot_id;
      END IF;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.slot_id IS NULL THEN
      RETURN OLD;
    END IF;
    target_slot := OLD.slot_id;
  END IF;

  -- Recalculate the target slot exactly from live booking data
  SELECT COUNT(*) INTO active_count
  FROM bookings
  WHERE slot_id = target_slot
    AND status IN ('confirmed', 'pending');

  SELECT max_bookings INTO slot_max
  FROM available_slots
  WHERE id = target_slot;

  -- Slot may have been deleted before the booking row — guard the update
  IF slot_max IS NOT NULL THEN
    UPDATE available_slots
    SET current_bookings = active_count,
        is_available     = (active_count < slot_max)
    WHERE id = target_slot;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_active_child_to_profile()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.active_child_id IS NOT NULL AND NEW.active_child_id IS DISTINCT FROM OLD.active_child_id THEN
    UPDATE profiles
    SET
      child_name = (SELECT child_name FROM parent_children WHERE id = NEW.active_child_id),
      child_age  = (SELECT child_age FROM parent_children WHERE id = NEW.active_child_id)
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_auth_email_to_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- When email changes in auth.users, update it in profiles
  UPDATE profiles
  SET email = NEW.email, updated_at = NOW()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_action_requests_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_slot_booking_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.slot_id IS NOT NULL THEN
    -- Increment count when booking is created
    UPDATE available_slots
    SET current_bookings = current_bookings + 1
    WHERE id = NEW.slot_id;

    -- Mark slot as unavailable if full
    UPDATE available_slots
    SET is_available = FALSE
    WHERE id = NEW.slot_id
      AND current_bookings >= max_bookings;

  ELSIF TG_OP = 'DELETE' AND OLD.slot_id IS NOT NULL THEN
    -- Decrement count when booking is deleted
    UPDATE available_slots
    SET current_bookings = current_bookings - 1,
        is_available = TRUE
    WHERE id = OLD.slot_id;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes (cancelled bookings)
    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' AND NEW.slot_id IS NOT NULL THEN
      UPDATE available_slots
      SET current_bookings = current_bookings - 1,
          is_available = TRUE
      WHERE id = NEW.slot_id;
    END IF;

    -- Handle slot_id changes
    IF OLD.slot_id IS DISTINCT FROM NEW.slot_id THEN
      IF OLD.slot_id IS NOT NULL THEN
        UPDATE available_slots
        SET current_bookings = current_bookings - 1,
            is_available = TRUE
        WHERE id = OLD.slot_id;
      END IF;

      IF NEW.slot_id IS NOT NULL THEN
        UPDATE available_slots
        SET current_bookings = current_bookings + 1
        WHERE id = NEW.slot_id;

        UPDATE available_slots
        SET is_available = FALSE
        WHERE id = NEW.slot_id
          AND current_bookings >= max_bookings;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$function$
;

-- ------------------------------------------------------------------------------
-- 7. EVENT TRIGGER ensure_rls -> public.rls_auto_enable() (PSP-owned; platform event triggers excluded)
-- ------------------------------------------------------------------------------

DROP EVENT TRIGGER IF EXISTS ensure_rls;
CREATE EVENT TRIGGER ensure_rls ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  EXECUTE FUNCTION public.rls_auto_enable();

-- ------------------------------------------------------------------------------
-- 8. VIEWS
-- ------------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.athlete_progress_summary AS 
 SELECT p.id AS athlete_id,
    p.full_name AS athlete_name,
    p.avatar_url,
    ca.coach_id,
    count(DISTINCT ad.id) AS drills_assigned,
    count(DISTINCT
        CASE
            WHEN ad.completed THEN ad.id
            ELSE NULL::uuid
        END) AS drills_completed,
    count(DISTINCT
        CASE
            WHEN b.status = 'completed'::text THEN b.id
            ELSE NULL::uuid
        END) AS sessions_completed,
    max(b.booking_date) AS last_session_date,
    max(vl.velocity_mph) AS max_velocity,
    avg(vl.velocity_mph) AS avg_velocity,
    count(vl.id) AS velocity_readings
   FROM profiles p
     LEFT JOIN coach_athletes ca ON p.id = ca.athlete_id AND ca.active = true
     LEFT JOIN assigned_drills ad ON p.id = ad.user_id
     LEFT JOIN bookings b ON p.id = b.athlete_id
     LEFT JOIN velocity_logs vl ON p.id = vl.user_id
  WHERE p.role = 'athlete'::text
  GROUP BY p.id, p.full_name, p.avatar_url, ca.coach_id;

CREATE OR REPLACE VIEW public.coach_upcoming_sessions AS 
 SELECT b.id,
    b.booking_date,
    b.start_time,
    b.end_time,
    b.status,
    s.name AS service_name,
    s.duration_minutes,
    a.full_name AS athlete_name,
    a.avatar_url AS athlete_avatar,
    b.coach_id
   FROM bookings b
     JOIN profiles a ON b.athlete_id = a.id
     JOIN services s ON b.service_id = s.id
  WHERE (b.status = ANY (ARRAY['pending'::text, 'confirmed'::text])) AND b.booking_date >= CURRENT_DATE
  ORDER BY b.booking_date, b.start_time;

CREATE OR REPLACE VIEW public.popular_drills AS 
 SELECT d.id,
    d.title,
    d.category,
    d.difficulty,
    count(dc.id) AS completion_count,
    d.view_count
   FROM drills d
     LEFT JOIN drill_completions dc ON dc.drill_id = d.id
  WHERE d.is_published = true
  GROUP BY d.id
  ORDER BY (count(dc.id)) DESC, d.view_count DESC;

CREATE OR REPLACE VIEW public.user_stats AS 
 SELECT p.id,
    p.full_name,
    count(DISTINCT s.id) AS total_sessions,
    count(DISTINCT dc.id) AS drills_completed,
    avg(vl.velocity_mph)::numeric(5,2) AS avg_velocity,
    max(vl.velocity_mph)::numeric(5,2) AS max_velocity,
    count(DISTINCT date(vl.recorded_at)) AS training_days
   FROM profiles p
     LEFT JOIN sessions s ON s.user_id = p.id AND s.completed = true
     LEFT JOIN drill_completions dc ON dc.user_id = p.id
     LEFT JOIN velocity_logs vl ON vl.user_id = p.id
  GROUP BY p.id, p.full_name;

-- ------------------------------------------------------------------------------
-- 9. TRIGGERS (public tables + auth.users email-sync trigger)
-- ------------------------------------------------------------------------------

DROP TRIGGER IF EXISTS on_auth_user_email_change ON auth.users;
CREATE TRIGGER on_auth_user_email_change AFTER UPDATE OF email ON auth.users FOR EACH ROW WHEN (((old.email)::text IS DISTINCT FROM (new.email)::text)) EXECUTE FUNCTION sync_auth_email_to_profile();

DROP TRIGGER IF EXISTS update_action_requests_updated_at ON action_requests;
CREATE TRIGGER update_action_requests_updated_at BEFORE UPDATE ON public.action_requests FOR EACH ROW EXECUTE FUNCTION update_action_requests_updated_at();

DROP TRIGGER IF EXISTS update_athlete_packages_updated_at ON athlete_packages;
CREATE TRIGGER update_athlete_packages_updated_at BEFORE UPDATE ON public.athlete_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_athlete_performance_goals_updated_at ON athlete_performance_goals;
CREATE TRIGGER update_athlete_performance_goals_updated_at BEFORE UPDATE ON public.athlete_performance_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_athlete_performance_metrics_updated_at ON athlete_performance_metrics;
CREATE TRIGGER update_athlete_performance_metrics_updated_at BEFORE UPDATE ON public.athlete_performance_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_athlete_performance_notes_updated_at ON athlete_performance_notes;
CREATE TRIGGER update_athlete_performance_notes_updated_at BEFORE UPDATE ON public.athlete_performance_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_available_slots_updated_at ON available_slots;
CREATE TRIGGER update_available_slots_updated_at BEFORE UPDATE ON public.available_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS on_booking_created ON bookings;
CREATE TRIGGER on_booking_created BEFORE INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION handle_booking_count();

DROP TRIGGER IF EXISTS on_booking_deleted ON bookings;
CREATE TRIGGER on_booking_deleted AFTER DELETE ON public.bookings FOR EACH ROW EXECUTE FUNCTION recalculate_slot_availability();

DROP TRIGGER IF EXISTS on_booking_inserted ON bookings;
CREATE TRIGGER on_booking_inserted AFTER INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION recalculate_slot_availability();

DROP TRIGGER IF EXISTS on_booking_status_change ON bookings;
CREATE TRIGGER on_booking_status_change AFTER UPDATE OF status, slot_id ON public.bookings FOR EACH ROW EXECUTE FUNCTION recalculate_slot_availability();

DROP TRIGGER IF EXISTS update_payout_accounts_updated_at ON coach_payout_accounts;
CREATE TRIGGER update_payout_accounts_updated_at BEFORE UPDATE ON public.coach_payout_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payouts_updated_at ON coach_payouts;
CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON public.coach_payouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coach_schedules_updated_at ON coach_schedules;
CREATE TRIGGER update_coach_schedules_updated_at BEFORE UPDATE ON public.coach_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_drills_updated_at ON drills;
CREATE TRIGGER update_drills_updated_at BEFORE UPDATE ON public.drills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS on_active_child_change ON profiles;
CREATE TRIGGER on_active_child_change AFTER UPDATE OF active_child_id ON public.profiles FOR EACH ROW WHEN ((new.account_type = 'parent_guardian'::text)) EXECUTE FUNCTION sync_active_child_to_profile();

DROP TRIGGER IF EXISTS trg_grant_signup_trial ON profiles;
CREATE TRIGGER trg_grant_signup_trial AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION grant_signup_trial();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_training_packages_updated_at ON training_packages;
CREATE TRIGGER update_training_packages_updated_at BEFORE UPDATE ON public.training_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 10. ENABLE ROW LEVEL SECURITY (all 46 public tables)
-- ------------------------------------------------------------------------------

ALTER TABLE public.action_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assigned_drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assigned_questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_performance_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_performance_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.available_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_payout_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drill_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_data_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.velocity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_analysis_submissions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 11. RLS POLICIES (141 total)
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Coaches and admins can create requests" ON public.action_requests;
CREATE POLICY "Coaches and admins can create requests" ON public.action_requests AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (((requested_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS "Master admins can update requests" ON public.action_requests;
CREATE POLICY "Master admins can update requests" ON public.action_requests AS PERMISSIVE FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'master_admin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'master_admin'::text)))));

DROP POLICY IF EXISTS "Master admins can view all requests" ON public.action_requests;
CREATE POLICY "Master admins can view all requests" ON public.action_requests AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'master_admin'::text)))));

DROP POLICY IF EXISTS "Users can view their own requests" ON public.action_requests;
CREATE POLICY "Users can view their own requests" ON public.action_requests AS PERMISSIVE FOR SELECT TO authenticated USING ((requested_by = auth.uid()));

DROP POLICY IF EXISTS "Admins can view admin whitelist" ON public.admin_whitelist;
CREATE POLICY "Admins can view admin whitelist" ON public.admin_whitelist AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS "Master admins can modify admin whitelist" ON public.admin_whitelist;
CREATE POLICY "Master admins can modify admin whitelist" ON public.admin_whitelist AS PERMISSIVE FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'master_admin'::text)))));

DROP POLICY IF EXISTS assigned_drills_delete ON public.assigned_drills;
CREATE POLICY assigned_drills_delete ON public.assigned_drills AS PERMISSIVE FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS assigned_drills_insert ON public.assigned_drills;
CREATE POLICY assigned_drills_insert ON public.assigned_drills AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS assigned_drills_select ON public.assigned_drills;
CREATE POLICY assigned_drills_select ON public.assigned_drills AS PERMISSIVE FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS assigned_drills_update ON public.assigned_drills;
CREATE POLICY assigned_drills_update ON public.assigned_drills AS PERMISSIVE FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS assigned_q_delete ON public.assigned_questionnaires;
CREATE POLICY assigned_q_delete ON public.assigned_questionnaires AS PERMISSIVE FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS assigned_q_insert ON public.assigned_questionnaires;
CREATE POLICY assigned_q_insert ON public.assigned_questionnaires AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS assigned_q_select ON public.assigned_questionnaires;
CREATE POLICY assigned_q_select ON public.assigned_questionnaires AS PERMISSIVE FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS assigned_q_update ON public.assigned_questionnaires;
CREATE POLICY assigned_q_update ON public.assigned_questionnaires AS PERMISSIVE FOR UPDATE TO authenticated USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS memberships_insert ON public.athlete_memberships;
CREATE POLICY memberships_insert ON public.athlete_memberships AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS memberships_select ON public.athlete_memberships;
CREATE POLICY memberships_select ON public.athlete_memberships AS PERMISSIVE FOR SELECT TO authenticated USING (((athlete_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS memberships_update ON public.athlete_memberships;
CREATE POLICY memberships_update ON public.athlete_memberships AS PERMISSIVE FOR UPDATE TO authenticated USING (((athlete_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS "Athletes can purchase packages" ON public.athlete_packages;
CREATE POLICY "Athletes can purchase packages" ON public.athlete_packages AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = athlete_id));

DROP POLICY IF EXISTS "Athletes can view their own packages" ON public.athlete_packages;
CREATE POLICY "Athletes can view their own packages" ON public.athlete_packages AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = athlete_id));

DROP POLICY IF EXISTS staff_manage_athlete_packages ON public.athlete_packages;
CREATE POLICY staff_manage_athlete_packages ON public.athlete_packages AS PERMISSIVE FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS staff_view_athlete_packages ON public.athlete_packages;
CREATE POLICY staff_view_athlete_packages ON public.athlete_packages AS PERMISSIVE FOR SELECT TO authenticated USING (((athlete_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS "Coaches and admins can manage goals" ON public.athlete_performance_goals;
CREATE POLICY "Coaches and admins can manage goals" ON public.athlete_performance_goals AS PERMISSIVE FOR ALL TO authenticated USING (((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))) OR (athlete_id = auth.uid())));

DROP POLICY IF EXISTS "Coaches and admins can delete performance metrics" ON public.athlete_performance_metrics;
CREATE POLICY "Coaches and admins can delete performance metrics" ON public.athlete_performance_metrics AS PERMISSIVE FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS "Coaches and admins can insert performance metrics" ON public.athlete_performance_metrics;
CREATE POLICY "Coaches and admins can insert performance metrics" ON public.athlete_performance_metrics AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS "Coaches and admins can update performance metrics" ON public.athlete_performance_metrics;
CREATE POLICY "Coaches and admins can update performance metrics" ON public.athlete_performance_metrics AS PERMISSIVE FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS "Coaches and admins can view all performance metrics" ON public.athlete_performance_metrics;
CREATE POLICY "Coaches and admins can view all performance metrics" ON public.athlete_performance_metrics AS PERMISSIVE FOR SELECT TO authenticated USING (((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))) OR (athlete_id = auth.uid())));

DROP POLICY IF EXISTS "Coaches and admins can manage notes" ON public.athlete_performance_notes;
CREATE POLICY "Coaches and admins can manage notes" ON public.athlete_performance_notes AS PERMISSIVE FOR ALL TO authenticated USING (((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))) OR ((athlete_id = auth.uid()) AND (is_private = false))));

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_log;
CREATE POLICY "Admins can view audit logs" ON public.audit_log AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS "Admins can manage all slots" ON public.available_slots;
CREATE POLICY "Admins can manage all slots" ON public.available_slots AS PERMISSIVE FOR ALL TO public USING ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text])))));

DROP POLICY IF EXISTS "Admins can view all slots" ON public.available_slots;
CREATE POLICY "Admins can view all slots" ON public.available_slots AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text])))));

DROP POLICY IF EXISTS "Anyone can view available slots" ON public.available_slots;
CREATE POLICY "Anyone can view available slots" ON public.available_slots AS PERMISSIVE FOR SELECT TO public USING (((is_available = true) AND (slot_date >= CURRENT_DATE)));

DROP POLICY IF EXISTS "Staff can manage own slots" ON public.available_slots;
CREATE POLICY "Staff can manage own slots" ON public.available_slots AS PERMISSIVE FOR ALL TO public USING (((coach_id = auth.uid()) AND (auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS "Staff can view own slots" ON public.available_slots;
CREATE POLICY "Staff can view own slots" ON public.available_slots AS PERMISSIVE FOR SELECT TO public USING ((coach_id = auth.uid()));

DROP POLICY IF EXISTS blog_posts_delete_staff ON public.blog_posts;
CREATE POLICY blog_posts_delete_staff ON public.blog_posts AS PERMISSIVE FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS blog_posts_insert_staff ON public.blog_posts;
CREATE POLICY blog_posts_insert_staff ON public.blog_posts AS PERMISSIVE FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS blog_posts_select_published ON public.blog_posts;
CREATE POLICY blog_posts_select_published ON public.blog_posts AS PERMISSIVE FOR SELECT TO public USING ((published = true));

DROP POLICY IF EXISTS blog_posts_select_staff ON public.blog_posts;
CREATE POLICY blog_posts_select_staff ON public.blog_posts AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS blog_posts_update_staff ON public.blog_posts;
CREATE POLICY blog_posts_update_staff ON public.blog_posts AS PERMISSIVE FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS bookings_delete_policy ON public.bookings;
CREATE POLICY bookings_delete_policy ON public.bookings AS PERMISSIVE FOR DELETE TO public USING (((athlete_id = auth.uid()) OR (coach_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS bookings_insert_policy ON public.bookings;
CREATE POLICY bookings_insert_policy ON public.bookings AS PERMISSIVE FOR INSERT TO public WITH CHECK (((athlete_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS bookings_select_policy ON public.bookings;
CREATE POLICY bookings_select_policy ON public.bookings AS PERMISSIVE FOR SELECT TO public USING (((athlete_id = auth.uid()) OR (coach_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS bookings_update_policy ON public.bookings;
CREATE POLICY bookings_update_policy ON public.bookings AS PERMISSIVE FOR UPDATE TO public USING (((athlete_id = auth.uid()) OR (coach_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS coach_athletes_delete ON public.coach_athletes;
CREATE POLICY coach_athletes_delete ON public.coach_athletes AS PERMISSIVE FOR DELETE TO authenticated USING (((coach_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS coach_athletes_insert ON public.coach_athletes;
CREATE POLICY coach_athletes_insert ON public.coach_athletes AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (((coach_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS coach_athletes_select ON public.coach_athletes;
CREATE POLICY coach_athletes_select ON public.coach_athletes AS PERMISSIVE FOR SELECT TO authenticated USING (((coach_id = auth.uid()) OR (athlete_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS coach_athletes_update ON public.coach_athletes;
CREATE POLICY coach_athletes_update ON public.coach_athletes AS PERMISSIVE FOR UPDATE TO authenticated USING (((coach_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS "Admins see all payout accounts" ON public.coach_payout_accounts;
CREATE POLICY "Admins see all payout accounts" ON public.coach_payout_accounts AS PERMISSIVE FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS "Coaches insert their own payout account" ON public.coach_payout_accounts;
CREATE POLICY "Coaches insert their own payout account" ON public.coach_payout_accounts AS PERMISSIVE FOR INSERT TO public WITH CHECK ((coach_id = auth.uid()));

DROP POLICY IF EXISTS "Coaches see their own payout account" ON public.coach_payout_accounts;
CREATE POLICY "Coaches see their own payout account" ON public.coach_payout_accounts AS PERMISSIVE FOR SELECT TO public USING ((coach_id = auth.uid()));

DROP POLICY IF EXISTS "Coaches update their own payout account" ON public.coach_payout_accounts;
CREATE POLICY "Coaches update their own payout account" ON public.coach_payout_accounts AS PERMISSIVE FOR UPDATE TO public USING ((coach_id = auth.uid()));

DROP POLICY IF EXISTS "Admins see all payouts" ON public.coach_payouts;
CREATE POLICY "Admins see all payouts" ON public.coach_payouts AS PERMISSIVE FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS "Coaches see their own payouts" ON public.coach_payouts;
CREATE POLICY "Coaches see their own payouts" ON public.coach_payouts AS PERMISSIVE FOR SELECT TO public USING ((coach_id = auth.uid()));

DROP POLICY IF EXISTS "Active coach schedules are viewable by everyone" ON public.coach_schedules;
CREATE POLICY "Active coach schedules are viewable by everyone" ON public.coach_schedules AS PERMISSIVE FOR SELECT TO public USING ((is_active = true));

DROP POLICY IF EXISTS "Coaches can manage their own schedules" ON public.coach_schedules;
CREATE POLICY "Coaches can manage their own schedules" ON public.coach_schedules AS PERMISSIVE FOR ALL TO public USING (((auth.uid() = coach_id) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS coach_schedules_admin_select ON public.coach_schedules;
CREATE POLICY coach_schedules_admin_select ON public.coach_schedules AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS "Staff can update submissions" ON public.contact_submissions;
CREATE POLICY "Staff can update submissions" ON public.contact_submissions AS PERMISSIVE FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS "Staff can view submissions" ON public.contact_submissions;
CREATE POLICY "Staff can view submissions" ON public.contact_submissions AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS contact_insert ON public.contact_submissions;
CREATE POLICY contact_insert ON public.contact_submissions AS PERMISSIVE FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can add participants" ON public.conversation_participants;
CREATE POLICY "Authenticated users can add participants" ON public.conversation_participants AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() IS NOT NULL));

DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;
CREATE POLICY "Users can view participants of their conversations" ON public.conversation_participants AS PERMISSIVE FOR SELECT TO public USING (is_conversation_participant(conversation_id));

DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations" ON public.conversations AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() IS NOT NULL));

DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations" ON public.conversations AS PERMISSIVE FOR SELECT TO public USING ((id IN ( SELECT conversation_participants.conversation_id
   FROM conversation_participants
  WHERE (conversation_participants.user_id = auth.uid()))));

DROP POLICY IF EXISTS enrollments_delete ON public.course_enrollments;
CREATE POLICY enrollments_delete ON public.course_enrollments AS PERMISSIVE FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS enrollments_insert ON public.course_enrollments;
CREATE POLICY enrollments_insert ON public.course_enrollments AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (((athlete_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS enrollments_select ON public.course_enrollments;
CREATE POLICY enrollments_select ON public.course_enrollments AS PERMISSIVE FOR SELECT TO authenticated USING (((athlete_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS course_lessons_delete ON public.course_lessons;
CREATE POLICY course_lessons_delete ON public.course_lessons AS PERMISSIVE FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS course_lessons_insert ON public.course_lessons;
CREATE POLICY course_lessons_insert ON public.course_lessons AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS course_lessons_select ON public.course_lessons;
CREATE POLICY course_lessons_select ON public.course_lessons AS PERMISSIVE FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS course_lessons_update ON public.course_lessons;
CREATE POLICY course_lessons_update ON public.course_lessons AS PERMISSIVE FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS courses_delete ON public.courses;
CREATE POLICY courses_delete ON public.courses AS PERMISSIVE FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS courses_insert ON public.courses;
CREATE POLICY courses_insert ON public.courses AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS courses_select ON public.courses;
CREATE POLICY courses_select ON public.courses AS PERMISSIVE FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS courses_update ON public.courses;
CREATE POLICY courses_update ON public.courses AS PERMISSIVE FOR UPDATE TO authenticated USING (((created_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS "Athletes can view their own imports" ON public.device_imports;
CREATE POLICY "Athletes can view their own imports" ON public.device_imports AS PERMISSIVE FOR SELECT TO public USING ((athlete_id = auth.uid()));

DROP POLICY IF EXISTS "Coaches and admins can manage imports" ON public.device_imports;
CREATE POLICY "Coaches and admins can manage imports" ON public.device_imports AS PERMISSIVE FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS drill_completions_insert ON public.drill_completions;
CREATE POLICY drill_completions_insert ON public.drill_completions AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS drill_completions_select ON public.drill_completions;
CREATE POLICY drill_completions_select ON public.drill_completions AS PERMISSIVE FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS drill_completions_update ON public.drill_completions;
CREATE POLICY drill_completions_update ON public.drill_completions AS PERMISSIVE FOR UPDATE TO authenticated USING ((user_id = auth.uid()));

DROP POLICY IF EXISTS drills_delete ON public.drills;
CREATE POLICY drills_delete ON public.drills AS PERMISSIVE FOR DELETE TO authenticated USING (((created_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS drills_insert ON public.drills;
CREATE POLICY drills_insert ON public.drills AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS drills_select ON public.drills;
CREATE POLICY drills_select ON public.drills AS PERMISSIVE FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS drills_update ON public.drills;
CREATE POLICY drills_update ON public.drills AS PERMISSIVE FOR UPDATE TO authenticated USING (((created_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text])))))));
DROP POLICY IF EXISTS coaches_manage_own_links ON public.invite_links;
CREATE POLICY coaches_manage_own_links ON public.invite_links AS PERMISSIVE FOR ALL TO public USING ((coach_id = auth.uid()));

DROP POLICY IF EXISTS public_read_invite_links ON public.invite_links;
CREATE POLICY public_read_invite_links ON public.invite_links AS PERMISSIVE FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS progress_insert ON public.lesson_progress;
CREATE POLICY progress_insert ON public.lesson_progress AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((athlete_id = auth.uid()));

DROP POLICY IF EXISTS progress_select ON public.lesson_progress;
CREATE POLICY progress_select ON public.lesson_progress AS PERMISSIVE FOR SELECT TO authenticated USING (((athlete_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS progress_update ON public.lesson_progress;
CREATE POLICY progress_update ON public.lesson_progress AS PERMISSIVE FOR UPDATE TO authenticated USING ((athlete_id = auth.uid()));

DROP POLICY IF EXISTS features_admin_write ON public.membership_features;
CREATE POLICY features_admin_write ON public.membership_features AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS features_public_read ON public.membership_features;
CREATE POLICY features_public_read ON public.membership_features AS PERMISSIVE FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS tiers_admin_write ON public.membership_tiers;
CREATE POLICY tiers_admin_write ON public.membership_tiers AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS tiers_public_read ON public.membership_tiers;
CREATE POLICY tiers_public_read ON public.membership_tiers AS PERMISSIVE FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Users can mark their received messages as read" ON public.messages;
CREATE POLICY "Users can mark their received messages as read" ON public.messages AS PERMISSIVE FOR UPDATE TO public USING (((sender_id <> auth.uid()) AND (conversation_id IN ( SELECT conversation_participants.conversation_id
   FROM conversation_participants
  WHERE (conversation_participants.user_id = auth.uid()))))) WITH CHECK ((read_at IS NOT NULL));

DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
CREATE POLICY "Users can send messages to their conversations" ON public.messages AS PERMISSIVE FOR INSERT TO public WITH CHECK (((sender_id = auth.uid()) AND is_conversation_participant(conversation_id)));

DROP POLICY IF EXISTS "Users can update read status" ON public.messages;
CREATE POLICY "Users can update read status" ON public.messages AS PERMISSIVE FOR UPDATE TO public USING (is_conversation_participant(conversation_id)) WITH CHECK (is_conversation_participant(conversation_id));

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" ON public.messages AS PERMISSIVE FOR SELECT TO public USING (is_conversation_participant(conversation_id));

DROP POLICY IF EXISTS "Staff can view subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Staff can view subscribers" ON public.newsletter_subscribers AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS newsletter_insert ON public.newsletter_subscribers;
CREATE POLICY newsletter_insert ON public.newsletter_subscribers AS PERMISSIVE FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Master admin manages all org members" ON public.organization_members;
CREATE POLICY "Master admin manages all org members" ON public.organization_members AS PERMISSIVE FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'master_admin'::text)))));

DROP POLICY IF EXISTS "Org coaches can see all org members" ON public.organization_members;
CREATE POLICY "Org coaches can see all org members" ON public.organization_members AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM organization_members om
  WHERE ((om.org_id = organization_members.org_id) AND (om.user_id = auth.uid()) AND (om.role = ANY (ARRAY['owner'::text, 'coach'::text, 'admin'::text])) AND (om.status = 'active'::text)))));

DROP POLICY IF EXISTS "Users can join orgs" ON public.organization_members;
CREATE POLICY "Users can join orgs" ON public.organization_members AS PERMISSIVE FOR INSERT TO public WITH CHECK ((user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can leave orgs" ON public.organization_members;
CREATE POLICY "Users can leave orgs" ON public.organization_members AS PERMISSIVE FOR DELETE TO public USING ((user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can see their own org memberships" ON public.organization_members;
CREATE POLICY "Users can see their own org memberships" ON public.organization_members AS PERMISSIVE FOR SELECT TO public USING ((user_id = auth.uid()));

DROP POLICY IF EXISTS "Master admins can manage organizations" ON public.organizations;
CREATE POLICY "Master admins can manage organizations" ON public.organizations AS PERMISSIVE FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'master_admin'::text)))));

DROP POLICY IF EXISTS "Org owner can update their org" ON public.organizations;
CREATE POLICY "Org owner can update their org" ON public.organizations AS PERMISSIVE FOR UPDATE TO public USING ((owner_id = auth.uid()));

DROP POLICY IF EXISTS "Organizations are publicly readable" ON public.organizations;
CREATE POLICY "Organizations are publicly readable" ON public.organizations AS PERMISSIVE FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS packages_delete ON public.packages;
CREATE POLICY packages_delete ON public.packages AS PERMISSIVE FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS packages_insert ON public.packages;
CREATE POLICY packages_insert ON public.packages AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS packages_select ON public.packages;
CREATE POLICY packages_select ON public.packages AS PERMISSIVE FOR SELECT TO authenticated USING (((athlete_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS packages_update ON public.packages;
CREATE POLICY packages_update ON public.packages AS PERMISSIVE FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS "Admins manage all children" ON public.parent_children;
CREATE POLICY "Admins manage all children" ON public.parent_children AS PERMISSIVE FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS "Parent manages own children" ON public.parent_children;
CREATE POLICY "Parent manages own children" ON public.parent_children AS PERMISSIVE FOR ALL TO public USING ((parent_id = auth.uid())) WITH CHECK ((parent_id = auth.uid()));

DROP POLICY IF EXISTS "Staff sees all children" ON public.parent_children;
CREATE POLICY "Staff sees all children" ON public.parent_children AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS profiles_delete_policy ON public.profiles;
CREATE POLICY profiles_delete_policy ON public.profiles AS PERMISSIVE FOR DELETE TO public USING ((id = auth.uid()));

DROP POLICY IF EXISTS profiles_insert_policy ON public.profiles;
CREATE POLICY profiles_insert_policy ON public.profiles AS PERMISSIVE FOR INSERT TO public WITH CHECK ((id = auth.uid()));

DROP POLICY IF EXISTS profiles_select_policy ON public.profiles;
CREATE POLICY profiles_select_policy ON public.profiles AS PERMISSIVE FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS profiles_update_policy ON public.profiles;
CREATE POLICY profiles_update_policy ON public.profiles AS PERMISSIVE FOR UPDATE TO public USING ((id = auth.uid())) WITH CHECK ((id = auth.uid()));

DROP POLICY IF EXISTS "Anyone can validate promo codes" ON public.promo_codes;
CREATE POLICY "Anyone can validate promo codes" ON public.promo_codes AS PERMISSIVE FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Coaches and admins can manage promo codes" ON public.promo_codes;
CREATE POLICY "Coaches and admins can manage promo codes" ON public.promo_codes AS PERMISSIVE FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS questionnaires_delete ON public.questionnaires;
CREATE POLICY questionnaires_delete ON public.questionnaires AS PERMISSIVE FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS questionnaires_insert ON public.questionnaires;
CREATE POLICY questionnaires_insert ON public.questionnaires AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS questionnaires_select ON public.questionnaires;
CREATE POLICY questionnaires_select ON public.questionnaires AS PERMISSIVE FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS questionnaires_update ON public.questionnaires;
CREATE POLICY questionnaires_update ON public.questionnaires AS PERMISSIVE FOR UPDATE TO authenticated USING (((created_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS services_delete_policy ON public.services;
CREATE POLICY services_delete_policy ON public.services AS PERMISSIVE FOR DELETE TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS services_insert_policy ON public.services;
CREATE POLICY services_insert_policy ON public.services AS PERMISSIVE FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS services_select_policy ON public.services;
CREATE POLICY services_select_policy ON public.services AS PERMISSIVE FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS services_update_policy ON public.services;
CREATE POLICY services_update_policy ON public.services AS PERMISSIVE FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS "Users can create own sessions" ON public.sessions;
CREATE POLICY "Users can create own sessions" ON public.sessions AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));

DROP POLICY IF EXISTS "Users can update own sessions" ON public.sessions;
CREATE POLICY "Users can update own sessions" ON public.sessions AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = user_id));

DROP POLICY IF EXISTS sessions_delete ON public.sessions;
CREATE POLICY sessions_delete ON public.sessions AS PERMISSIVE FOR DELETE TO authenticated USING ((user_id = auth.uid()));

DROP POLICY IF EXISTS sessions_select ON public.sessions;
CREATE POLICY sessions_select ON public.sessions AS PERMISSIVE FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS master_admin_manage_data_log ON public.simulation_data_log;
CREATE POLICY master_admin_manage_data_log ON public.simulation_data_log AS PERMISSIVE FOR ALL TO public USING ((simulation_id IN ( SELECT simulation_sessions.id
   FROM simulation_sessions
  WHERE (simulation_sessions.admin_id = auth.uid())))) WITH CHECK ((simulation_id IN ( SELECT simulation_sessions.id
   FROM simulation_sessions
  WHERE (simulation_sessions.admin_id = auth.uid()))));

DROP POLICY IF EXISTS master_admin_manage_sessions ON public.simulation_sessions;
CREATE POLICY master_admin_manage_sessions ON public.simulation_sessions AS PERMISSIVE FOR ALL TO public USING ((admin_id = auth.uid())) WITH CHECK ((admin_id = auth.uid()));

DROP POLICY IF EXISTS "Active packages are viewable by everyone" ON public.training_packages;
CREATE POLICY "Active packages are viewable by everyone" ON public.training_packages AS PERMISSIVE FOR SELECT TO public USING ((is_active = true));

DROP POLICY IF EXISTS staff_manage_training_packages ON public.training_packages;
CREATE POLICY staff_manage_training_packages ON public.training_packages AS PERMISSIVE FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS velocity_logs_insert ON public.velocity_logs;
CREATE POLICY velocity_logs_insert ON public.velocity_logs AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS velocity_logs_select ON public.velocity_logs;
CREATE POLICY velocity_logs_select ON public.velocity_logs AS PERMISSIVE FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS velocity_logs_update ON public.velocity_logs;
CREATE POLICY velocity_logs_update ON public.velocity_logs AS PERMISSIVE FOR UPDATE TO authenticated USING ((user_id = auth.uid()));

DROP POLICY IF EXISTS video_analysis_delete ON public.video_analysis_submissions;
CREATE POLICY video_analysis_delete ON public.video_analysis_submissions AS PERMISSIVE FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'master_admin'::text]))))));

DROP POLICY IF EXISTS video_analysis_insert ON public.video_analysis_submissions;
CREATE POLICY video_analysis_insert ON public.video_analysis_submissions AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS video_analysis_select_own ON public.video_analysis_submissions;
CREATE POLICY video_analysis_select_own ON public.video_analysis_submissions AS PERMISSIVE FOR SELECT TO authenticated USING (((athlete_id = auth.uid()) OR (submitted_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text])))))));

DROP POLICY IF EXISTS video_analysis_update ON public.video_analysis_submissions;
CREATE POLICY video_analysis_update ON public.video_analysis_submissions AS PERMISSIVE FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['coach'::text, 'admin'::text, 'master_admin'::text]))))));

-- ------------------------------------------------------------------------------
-- 12. GRANTS (role-level; RLS still restricts rows)
-- ------------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 13. SUMMARY
-- ------------------------------------------------------------------------------

DO $$
DECLARE
  v_tables   INTEGER;
  v_views    INTEGER;
  v_funcs    INTEGER;
  v_policies INTEGER;
  v_rls      INTEGER;
BEGIN
  SELECT count(*) INTO v_tables   FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r';
  SELECT count(*) INTO v_views    FROM pg_views WHERE schemaname='public';
  SELECT count(*) INTO v_funcs    FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public';
  SELECT count(*) INTO v_policies FROM pg_policy pol JOIN pg_class c ON c.oid=pol.polrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public';
  SELECT count(*) INTO v_rls      FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND c.relrowsecurity;
  RAISE NOTICE 'ground-zero.sql applied — tables=% views=% functions=% policies=% rls_enabled=% (expected 46/4/20/141/46)',
    v_tables, v_views, v_funcs, v_policies, v_rls;
END $$;
