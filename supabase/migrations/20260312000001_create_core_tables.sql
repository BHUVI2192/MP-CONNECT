-- ============================================================
-- MP-CONNECT: CREATE CORE TABLES
-- ============================================================
-- Run this script FIRST in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query → paste → Run)
--
-- After this, run 20260310000000_complete_schema.sql
-- which adds extra columns, RLS policies, and functions.
-- ============================================================

-- ── profiles ──────────────────────────────────────────────
-- Usually created by the Supabase Auth template; safe to re-run.
CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   TEXT        NOT NULL DEFAULT '',
    role        TEXT        NOT NULL DEFAULT 'CITIZEN',
    mobile      TEXT,
    is_active   BOOLEAN     NOT NULL DEFAULT true,
    avatar_url  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_own" ON public.profiles;
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_staff_read" ON public.profiles;
CREATE POLICY "profiles_staff_read" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- ── complaints ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.complaints (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_name    TEXT        NOT NULL DEFAULT '',
    category        TEXT        NOT NULL DEFAULT '',
    location        TEXT,
    description     TEXT        NOT NULL DEFAULT '',
    status          TEXT        NOT NULL DEFAULT 'New',
    priority        TEXT        NOT NULL DEFAULT 'Medium',
    staff_notes     TEXT,
    pa_instructions TEXT,
    assigned_to     UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "complaints_auth" ON public.complaints;
CREATE POLICY "complaints_auth" ON public.complaints
  FOR ALL USING (auth.role() = 'authenticated');

-- ── letters ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.letters (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    type           TEXT        NOT NULL DEFAULT 'Central',
    department     TEXT        NOT NULL DEFAULT '',
    title          TEXT        NOT NULL DEFAULT '',
    content        TEXT,
    status         TEXT        NOT NULL DEFAULT 'Pending',
    version        INTEGER     NOT NULL DEFAULT 1,
    tags           TEXT[]      NOT NULL DEFAULT '{}',
    attachment_url TEXT,
    sender_id      UUID,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "letters_auth" ON public.letters;
CREATE POLICY "letters_auth" ON public.letters
  FOR ALL USING (auth.role() = 'authenticated');

-- ── tour_programs ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tour_programs (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    title             TEXT        NOT NULL DEFAULT '',
    type              TEXT        NOT NULL DEFAULT 'Official Visit',
    start_date        DATE        NOT NULL DEFAULT CURRENT_DATE,
    start_time        TIME,
    duration          TEXT,
    location_name     TEXT,
    location_address  TEXT,
    status            TEXT        NOT NULL DEFAULT 'Scheduled',
    participants      JSONB       NOT NULL DEFAULT '[]',
    instructions      TEXT,
    notification_log  JSONB       NOT NULL DEFAULT '[]',
    created_by        UUID,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tour_programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tour_programs_auth" ON public.tour_programs;
CREATE POLICY "tour_programs_auth" ON public.tour_programs
  FOR ALL USING (auth.role() = 'authenticated');

-- ── plan_today_events ──────────────────────────────────────
-- This is the table giving the 400 errors. Columns match exactly
-- what MockDataContext inserts/selects/updates.
CREATE TABLE IF NOT EXISTS public.plan_today_events (
    event_id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Columns used by INSERT (MockDataContext.addEvent)
    title             TEXT,
    type              TEXT,
    scheduled_date    DATE,
    scheduled_time    TIME,
    duration          TEXT,
    location          TEXT,
    description       TEXT,
    status            TEXT        NOT NULL DEFAULT 'SCHEDULED',
    -- Extra columns used during fetch / future features
    pa_id             UUID,
    is_attended       BOOLEAN     NOT NULL DEFAULT false,
    day_finalized     BOOLEAN     NOT NULL DEFAULT false,
    internal_notes    TEXT,
    final_notes       TEXT,
    voice_note_url    TEXT,
    voice_transcript  TEXT,
    staff_notified_at TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS plan_today_events_date_idx ON public.plan_today_events(scheduled_date);

ALTER TABLE public.plan_today_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "plan_today_events_auth" ON public.plan_today_events;
CREATE POLICY "plan_today_events_auth" ON public.plan_today_events
  FOR ALL USING (auth.role() = 'authenticated');

-- ── contacts ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contacts (
    contact_id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name          TEXT        NOT NULL DEFAULT '',
    mobile             TEXT,
    email              TEXT,
    organization       TEXT,
    designation        TEXT,
    category           TEXT,
    location_hamlet    TEXT,
    location_village   TEXT,
    location_taluk     TEXT,
    address            TEXT,
    notes              TEXT,
    state              TEXT,
    zilla              TEXT,
    gram_panchayat     TEXT,
    is_vip             BOOLEAN     NOT NULL DEFAULT false,
    birthday           TEXT,        -- MM-DD format
    anniversary        TEXT,        -- MM-DD format
    last_greeted_year  INTEGER,
    deleted_at         TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contacts_full_name_idx ON public.contacts(full_name);
CREATE INDEX IF NOT EXISTS contacts_mobile_idx    ON public.contacts(mobile);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contacts_auth" ON public.contacts;
CREATE POLICY "contacts_auth" ON public.contacts
  FOR ALL USING (auth.role() = 'authenticated');

-- ── development_works ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.development_works (
    work_id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    work_title        TEXT        NOT NULL DEFAULT '',
    sector            TEXT,
    scheme_name       TEXT,
    estimated_cost    NUMERIC,
    sanctioned_amount NUMERIC,
    village           TEXT,
    taluk             TEXT,
    zilla             TEXT,
    gram_panchayat    TEXT,
    work_type         TEXT,
    is_public         BOOLEAN     NOT NULL DEFAULT true,
    created_by        UUID,
    status            TEXT        NOT NULL DEFAULT 'PROPOSED',
    progress_pct      INTEGER     NOT NULL DEFAULT 0,
    start_date        DATE,
    target_date       DATE,
    contractor_name   TEXT,
    deleted_at        TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dev_works_status_idx ON public.development_works(status);
CREATE INDEX IF NOT EXISTS dev_works_deleted_idx ON public.development_works(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE public.development_works ENABLE ROW LEVEL SECURITY;

-- Public can read published works; authenticated users can write
DROP POLICY IF EXISTS "dev_works_public_read" ON public.development_works;
CREATE POLICY "dev_works_public_read" ON public.development_works
  FOR SELECT USING (is_public = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "dev_works_auth_write" ON public.development_works;
CREATE POLICY "dev_works_auth_write" ON public.development_works
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- DONE — all core tables created.
-- Now run 20260310000000_complete_schema.sql to add the extra
-- columns, new tables (notifications, railway, gallery, etc.),
-- RLS policies, and Edge Function support.
-- ============================================================
