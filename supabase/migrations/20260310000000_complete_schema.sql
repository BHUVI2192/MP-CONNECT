-- ============================================================
-- MP-CONNECT COMPLETE SCHEMA MIGRATION
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ============================================================
-- PART 1: ALTER EXISTING TABLES (add missing columns)
-- ============================================================

-- ── 1a. plan_today_events ──────────────────────────────────
-- The hooks use scheduled_date / scheduled_time / title instead of
-- event_date / start_time / event_title, plus several new columns.

ALTER TABLE public.plan_today_events
  ADD COLUMN IF NOT EXISTS title                text,
  ADD COLUMN IF NOT EXISTS type                 text,
  ADD COLUMN IF NOT EXISTS duration             text,
  ADD COLUMN IF NOT EXISTS location             text,
  ADD COLUMN IF NOT EXISTS description          text,
  ADD COLUMN IF NOT EXISTS scheduled_date       date,
  ADD COLUMN IF NOT EXISTS scheduled_time       time without time zone,
  ADD COLUMN IF NOT EXISTS pa_id                uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_attended          boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS internal_notes       text,
  ADD COLUMN IF NOT EXISTS final_notes          text,
  ADD COLUMN IF NOT EXISTS staff_notified_at    timestamptz,
  ADD COLUMN IF NOT EXISTS voice_note_url       text,
  ADD COLUMN IF NOT EXISTS voice_transcript     text,
  ADD COLUMN IF NOT EXISTS day_finalized        boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at           timestamptz NOT NULL DEFAULT now();

-- Make pa_id nullable (original table may have had NOT NULL)
DO $$
BEGIN
  ALTER TABLE public.plan_today_events ALTER COLUMN pa_id DROP NOT NULL;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'pa_id drop not null: %', SQLERRM;
END $$;

-- Make event_title nullable (new code uses the "title" column instead)
DO $$
BEGIN
  ALTER TABLE public.plan_today_events ALTER COLUMN event_title DROP NOT NULL;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'event_title drop not null: %', SQLERRM;
END $$;

-- Backfill title from event_title if that column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'plan_today_events'
      AND column_name  = 'event_title'
  ) THEN
    UPDATE public.plan_today_events
    SET title = event_title
    WHERE title IS NULL AND event_title IS NOT NULL;
  END IF;
END $$;

-- Broaden the status CHECK so hooks can set VISITED / IN_PROGRESS
DO $$
BEGIN
  ALTER TABLE public.plan_today_events
    DROP CONSTRAINT IF EXISTS plan_today_events_status_check;
  ALTER TABLE public.plan_today_events
    ADD CONSTRAINT plan_today_events_status_check
    CHECK (status IN ('SCHEDULED','COMPLETED','CANCELLED','POSTPONED','VISITED','IN_PROGRESS'));
EXCEPTION WHEN others THEN
  RAISE NOTICE 'plan_today_events status constraint: %', SQLERRM;
END $$;

-- ── 1b. contacts ──────────────────────────────────────────
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS deleted_at         timestamptz,
  ADD COLUMN IF NOT EXISTS state              text,
  ADD COLUMN IF NOT EXISTS zilla              text,
  ADD COLUMN IF NOT EXISTS gram_panchayat     text,
  ADD COLUMN IF NOT EXISTS is_vip             boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS birthday           text,          -- MM-DD format
  ADD COLUMN IF NOT EXISTS anniversary        text,          -- MM-DD format
  ADD COLUMN IF NOT EXISTS last_greeted_year  int;

-- FTS column (contacts)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'fts'
  ) THEN
    EXECUTE $q$
      ALTER TABLE public.contacts
        ADD COLUMN fts tsvector GENERATED ALWAYS AS (
          to_tsvector('english',
            coalesce(full_name, '')       || ' ' ||
            coalesce(mobile, '')          || ' ' ||
            coalesce(organization, '')    || ' ' ||
            coalesce(designation, '')     || ' ' ||
            coalesce(notes, '')
          )
        ) STORED
    $q$;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS contacts_fts_idx ON public.contacts USING gin(fts);

-- ── 1c. development_works ──────────────────────────────────
ALTER TABLE public.development_works
  ADD COLUMN IF NOT EXISTS deleted_at         timestamptz,
  ADD COLUMN IF NOT EXISTS zilla              text,
  ADD COLUMN IF NOT EXISTS gram_panchayat     text,
  ADD COLUMN IF NOT EXISTS work_type          text,
  ADD COLUMN IF NOT EXISTS is_public          boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_by         uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- FTS column (development_works)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'development_works' AND column_name = 'fts'
  ) THEN
    EXECUTE $q$
      ALTER TABLE public.development_works
        ADD COLUMN fts tsvector GENERATED ALWAYS AS (
          to_tsvector('english',
            coalesce(work_title, '')       || ' ' ||
            coalesce(sector, '')           || ' ' ||
            coalesce(scheme_name, '')      || ' ' ||
            coalesce(village, '')          || ' ' ||
            coalesce(taluk, '')            || ' ' ||
            coalesce(contractor_name, '')
          )
        ) STORED
    $q$;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS dev_works_fts_idx ON public.development_works USING gin(fts);


-- ============================================================
-- PART 2: NEW TABLES
-- ============================================================

-- ── development_work_media ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.development_work_media (
  media_id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id         uuid        NOT NULL,
  media_type      text        NOT NULL DEFAULT 'PHOTO',
  storage_path    text        NOT NULL DEFAULT '',
  file_name       text,
  file_size       bigint,
  display_order   int         NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Add missing columns if table already existed from a prior run
ALTER TABLE public.development_work_media
  ADD COLUMN IF NOT EXISTS media_type     text NOT NULL DEFAULT 'PHOTO',
  ADD COLUMN IF NOT EXISTS storage_path   text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS file_name      text,
  ADD COLUMN IF NOT EXISTS file_size      bigint,
  ADD COLUMN IF NOT EXISTS display_order  int NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'development_work_media_work_id_fkey'
      AND table_name = 'development_work_media'
  ) THEN
    ALTER TABLE public.development_work_media
      ADD CONSTRAINT development_work_media_work_id_fkey
      FOREIGN KEY (work_id) REFERENCES public.development_works(work_id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'development_work_media work_id FK: %', SQLERRM;
END $$;

DO $$
BEGIN
  ALTER TABLE public.development_work_media
    DROP CONSTRAINT IF EXISTS development_work_media_media_type_check;
  ALTER TABLE public.development_work_media
    ADD CONSTRAINT development_work_media_media_type_check
    CHECK (media_type IN ('PHOTO', 'VIDEO'));
EXCEPTION WHEN others THEN
  RAISE NOTICE 'development_work_media type constraint: %', SQLERRM;
END $$;

CREATE INDEX IF NOT EXISTS dev_work_media_work_id_idx ON public.development_work_media(work_id);

-- ── notifications ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  notif_id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    uuid        NOT NULL,
  type            text        NOT NULL,
  title           text        NOT NULL,
  body            text,
  metadata        jsonb       NOT NULL DEFAULT '{}',
  is_read         boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Add missing columns if table already existed from a prior run
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS type       text NOT NULL DEFAULT 'INFO',
  ADD COLUMN IF NOT EXISTS title      text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS body       text,
  ADD COLUMN IF NOT EXISTS metadata   jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_read    boolean NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'notifications_recipient_id_fkey'
      AND table_name = 'notifications'
  ) THEN
    ALTER TABLE public.notifications
      ADD CONSTRAINT notifications_recipient_id_fkey
      FOREIGN KEY (recipient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'notifications recipient FK: %', SQLERRM;
END $$;

CREATE INDEX IF NOT EXISTS notifications_recipient_idx ON public.notifications(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_unread_idx    ON public.notifications(recipient_id) WHERE is_read = false;

-- ── train_master ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.train_master (
  train_id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  train_number    text        NOT NULL UNIQUE,
  train_name      text        NOT NULL,
  origin          text,
  destination     text,
  division        text,
  stops           jsonb       NOT NULL DEFAULT '[]',
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Add missing columns if table already existed from a prior run
ALTER TABLE public.train_master
  ADD COLUMN IF NOT EXISTS train_name   text,
  ADD COLUMN IF NOT EXISTS origin       text,
  ADD COLUMN IF NOT EXISTS destination  text,
  ADD COLUMN IF NOT EXISTS division     text,
  ADD COLUMN IF NOT EXISTS stops        jsonb NOT NULL DEFAULT '[]';

CREATE INDEX IF NOT EXISTS train_master_number_idx ON public.train_master(train_number);

-- ── railway_quota_config ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.railway_quota_config (
  config_id       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  division        text        NOT NULL UNIQUE,
  drm_office      text,
  drm_email       text,
  monthly_quota   int         NOT NULL DEFAULT 10,
  used_quota      int         NOT NULL DEFAULT 0,
  quota_reset_day int         NOT NULL DEFAULT 1,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Add missing columns if table already existed from a prior run
ALTER TABLE public.railway_quota_config
  ADD COLUMN IF NOT EXISTS drm_office      text,
  ADD COLUMN IF NOT EXISTS drm_email       text,
  ADD COLUMN IF NOT EXISTS monthly_quota   int NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS used_quota      int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quota_reset_day int NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS updated_at      timestamptz NOT NULL DEFAULT now();

-- ── railway_eq_requests ────────────────────────────────────
-- Primary key is "id" (used by all three edge functions).
-- The client hook must use .eq('id', ...) – see useRailwayEQ.ts fix.
CREATE TABLE IF NOT EXISTS public.railway_eq_requests (
  id                  uuid   PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_number       text   UNIQUE,
  applicant_name      text   NOT NULL,
  mobile              text,
  email               text,
  emergency_reason    text   NOT NULL,
  train_number        text,
  train_name          text,
  origin_station      text,
  destination_station text,
  from_station        text   NOT NULL,
  to_station          text   NOT NULL,
  journey_date        date   NOT NULL,
  travel_class        text,
  division            text,
  pnr_number          text,
  status              text   NOT NULL DEFAULT 'PENDING_PA_APPROVAL',
  submitted_by        uuid,
  letter_path         text,
  pa_signature_path   text,
  signed_at           timestamptz,
  rejection_reason    text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Add missing columns if table already existed from a prior run
ALTER TABLE public.railway_eq_requests
  ADD COLUMN IF NOT EXISTS letter_number       text,
  ADD COLUMN IF NOT EXISTS mobile              text,
  ADD COLUMN IF NOT EXISTS email               text,
  ADD COLUMN IF NOT EXISTS train_number        text,
  ADD COLUMN IF NOT EXISTS train_name          text,
  ADD COLUMN IF NOT EXISTS origin_station      text,
  ADD COLUMN IF NOT EXISTS destination_station text,
  ADD COLUMN IF NOT EXISTS travel_class        text,
  ADD COLUMN IF NOT EXISTS division            text,
  ADD COLUMN IF NOT EXISTS pnr_number          text,
  ADD COLUMN IF NOT EXISTS submitted_by        uuid,
  ADD COLUMN IF NOT EXISTS letter_path         text,
  ADD COLUMN IF NOT EXISTS pa_signature_path   text,
  ADD COLUMN IF NOT EXISTS signed_at           timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason    text,
  ADD COLUMN IF NOT EXISTS updated_at          timestamptz NOT NULL DEFAULT now();

-- Add FK constraints if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'railway_eq_requests_division_fkey'
      AND table_name = 'railway_eq_requests'
  ) THEN
    ALTER TABLE public.railway_eq_requests
      ADD CONSTRAINT railway_eq_requests_division_fkey
      FOREIGN KEY (division) REFERENCES public.railway_quota_config(division);
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'railway_eq_requests division FK: %', SQLERRM;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'railway_eq_requests_submitted_by_fkey'
      AND table_name = 'railway_eq_requests'
  ) THEN
    ALTER TABLE public.railway_eq_requests
      ADD CONSTRAINT railway_eq_requests_submitted_by_fkey
      FOREIGN KEY (submitted_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'railway_eq_requests submitted_by FK: %', SQLERRM;
END $$;

-- Add/update status CHECK constraint
DO $$
BEGIN
  ALTER TABLE public.railway_eq_requests
    DROP CONSTRAINT IF EXISTS railway_eq_requests_status_check;
  ALTER TABLE public.railway_eq_requests
    ADD CONSTRAINT railway_eq_requests_status_check
    CHECK (status IN ('PENDING_PA_APPROVAL','APPROVED','SENT','REJECTED'));
EXCEPTION WHEN others THEN
  RAISE NOTICE 'railway_eq_requests status constraint: %', SQLERRM;
END $$;

CREATE INDEX IF NOT EXISTS eq_requests_status_idx       ON public.railway_eq_requests(status);
CREATE INDEX IF NOT EXISTS eq_requests_submitted_by_idx ON public.railway_eq_requests(submitted_by);

-- ── parliament_letters ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.parliament_letters (
  letter_id              uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_number             text,
  subject                text  NOT NULL DEFAULT '',
  ministry               text  NOT NULL DEFAULT '',
  department             text,
  addressed_to           text,
  type                   text,
  priority               text  NOT NULL DEFAULT 'Medium',
  sent_date              date,
  expected_response_date date,
  summary                text,
  constituency_issue     text,
  document_url           text,
  status                 text  NOT NULL DEFAULT 'SENT',
  follow_up_date         date,
  timeline               jsonb NOT NULL DEFAULT '[]',
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

-- Add missing columns if table already existed from a prior run
ALTER TABLE public.parliament_letters
  ADD COLUMN IF NOT EXISTS ref_number             text,
  ADD COLUMN IF NOT EXISTS department             text,
  ADD COLUMN IF NOT EXISTS addressed_to           text,
  ADD COLUMN IF NOT EXISTS type                   text,
  ADD COLUMN IF NOT EXISTS sent_date              date,
  ADD COLUMN IF NOT EXISTS expected_response_date date,
  ADD COLUMN IF NOT EXISTS summary                text,
  ADD COLUMN IF NOT EXISTS constituency_issue     text,
  ADD COLUMN IF NOT EXISTS document_url           text,
  ADD COLUMN IF NOT EXISTS follow_up_date         date,
  ADD COLUMN IF NOT EXISTS timeline               jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS updated_at             timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS parliament_letters_status_idx   ON public.parliament_letters(status);
CREATE INDEX IF NOT EXISTS parliament_letters_ministry_idx ON public.parliament_letters(ministry);

-- ── parliament_questions ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.parliament_questions (
  id                     uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  question_number        text,
  type                   text,
  session_name           text,
  session_date           date,
  subject                text  NOT NULL DEFAULT '',
  full_text              text,
  ministry               text,
  department             text,
  constituency_relevance text,
  tags                   text[]      NOT NULL DEFAULT '{}',
  expected_answer_date   date,
  priority               text        NOT NULL DEFAULT 'Medium',
  status                 text        NOT NULL DEFAULT 'SUBMITTED',
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

-- Add missing columns if table already existed from a prior run
ALTER TABLE public.parliament_questions
  ADD COLUMN IF NOT EXISTS question_number        text,
  ADD COLUMN IF NOT EXISTS type                   text,
  ADD COLUMN IF NOT EXISTS session_name           text,
  ADD COLUMN IF NOT EXISTS session_date           date,
  ADD COLUMN IF NOT EXISTS full_text              text,
  ADD COLUMN IF NOT EXISTS ministry               text,
  ADD COLUMN IF NOT EXISTS department             text,
  ADD COLUMN IF NOT EXISTS constituency_relevance text,
  ADD COLUMN IF NOT EXISTS tags                   text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS expected_answer_date   date,
  ADD COLUMN IF NOT EXISTS updated_at             timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS parliament_questions_status_idx   ON public.parliament_questions(status);
CREATE INDEX IF NOT EXISTS parliament_questions_ministry_idx ON public.parliament_questions(ministry);

-- ── parliament_answers ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.parliament_answers (
  answer_id           uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id         uuid  NOT NULL,
  answer_date         date,
  answered_by         text,
  answer_type         text,
  text                text,
  document_url        text,
  satisfaction        text,
  follow_up_required  boolean NOT NULL DEFAULT false,
  follow_up_notes     text,
  actions_taken       text,
  constituency_impact text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- Add missing columns if table already existed from a prior run
ALTER TABLE public.parliament_answers
  ADD COLUMN IF NOT EXISTS answer_date         date,
  ADD COLUMN IF NOT EXISTS answered_by         text,
  ADD COLUMN IF NOT EXISTS answer_type         text,
  ADD COLUMN IF NOT EXISTS text                text,
  ADD COLUMN IF NOT EXISTS document_url        text,
  ADD COLUMN IF NOT EXISTS satisfaction        text,
  ADD COLUMN IF NOT EXISTS follow_up_required  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS follow_up_notes     text,
  ADD COLUMN IF NOT EXISTS actions_taken       text,
  ADD COLUMN IF NOT EXISTS constituency_impact text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'parliament_answers_question_id_fkey'
      AND table_name = 'parliament_answers'
  ) THEN
    ALTER TABLE public.parliament_answers
      ADD CONSTRAINT parliament_answers_question_id_fkey
      FOREIGN KEY (question_id) REFERENCES public.parliament_questions(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'parliament_answers question_id FK: %', SQLERRM;
END $$;

-- ── photo_gallery_albums ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.photo_gallery_albums (
  gallery_id      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text        NOT NULL DEFAULT '',
  description     text,
  event_date      date,
  location        text,
  is_public       boolean     NOT NULL DEFAULT true,
  cover_photo_url text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Add missing columns if table already existed from a prior run
ALTER TABLE public.photo_gallery_albums
  ADD COLUMN IF NOT EXISTS description     text,
  ADD COLUMN IF NOT EXISTS event_date      date,
  ADD COLUMN IF NOT EXISTS location        text,
  ADD COLUMN IF NOT EXISTS is_public       boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS cover_photo_url text,
  ADD COLUMN IF NOT EXISTS updated_at      timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS gallery_albums_event_date_idx ON public.photo_gallery_albums(event_date DESC);

-- ── photo_gallery_photos ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.photo_gallery_photos (
  photo_id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id      uuid        NOT NULL,
  storage_path    text        NOT NULL DEFAULT '',
  file_name       text,
  file_size       bigint,
  caption         text,
  display_order   int         NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Add missing columns if table already existed from a prior run
ALTER TABLE public.photo_gallery_photos
  ADD COLUMN IF NOT EXISTS storage_path  text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS file_name     text,
  ADD COLUMN IF NOT EXISTS file_size     bigint,
  ADD COLUMN IF NOT EXISTS caption       text,
  ADD COLUMN IF NOT EXISTS display_order int NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'photo_gallery_photos_gallery_id_fkey'
      AND table_name = 'photo_gallery_photos'
  ) THEN
    ALTER TABLE public.photo_gallery_photos
      ADD CONSTRAINT photo_gallery_photos_gallery_id_fkey
      FOREIGN KEY (gallery_id) REFERENCES public.photo_gallery_albums(gallery_id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'photo_gallery_photos gallery_id FK: %', SQLERRM;
END $$;

CREATE INDEX IF NOT EXISTS gallery_photos_gallery_idx ON public.photo_gallery_photos(gallery_id, display_order);

-- ── speech_storage ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.speech_storage (
  speech_id       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text        NOT NULL DEFAULT '',
  type            text,
  event_name      text,
  speech_date     date,
  location        text,
  occasion        text,
  language        text        NOT NULL DEFAULT 'English',
  description     text,
  key_topics      text[]      NOT NULL DEFAULT '{}',
  key_points      text[]      NOT NULL DEFAULT '{}',
  audio_url       text,
  video_url       text,
  video_thumbnail text,
  transcript      text,
  duration        text,
  is_public       boolean     NOT NULL DEFAULT false,
  is_important    boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Add missing columns if table already existed from a prior run
ALTER TABLE public.speech_storage
  ADD COLUMN IF NOT EXISTS type            text,
  ADD COLUMN IF NOT EXISTS event_name      text,
  ADD COLUMN IF NOT EXISTS speech_date     date,
  ADD COLUMN IF NOT EXISTS location        text,
  ADD COLUMN IF NOT EXISTS occasion        text,
  ADD COLUMN IF NOT EXISTS description     text,
  ADD COLUMN IF NOT EXISTS key_topics      text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS key_points      text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS audio_url       text,
  ADD COLUMN IF NOT EXISTS video_url       text,
  ADD COLUMN IF NOT EXISTS video_thumbnail text,
  ADD COLUMN IF NOT EXISTS transcript      text,
  ADD COLUMN IF NOT EXISTS duration        text,
  ADD COLUMN IF NOT EXISTS is_public       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_important    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at      timestamptz NOT NULL DEFAULT now();

-- ── audit_logs ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  log_id          uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid,
  user_role       text,
  action          text  NOT NULL DEFAULT 'INSERT',
  table_name      text  NOT NULL DEFAULT '',
  record_id       text  NOT NULL DEFAULT '',
  old_data        jsonb,
  new_data        jsonb,
  ip_address      inet,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Add missing columns if table already existed from a prior run
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS user_role   text,
  ADD COLUMN IF NOT EXISTS old_data    jsonb,
  ADD COLUMN IF NOT EXISTS new_data    jsonb,
  ADD COLUMN IF NOT EXISTS ip_address  inet;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'audit_logs_user_id_fkey'
      AND table_name = 'audit_logs'
  ) THEN
    ALTER TABLE public.audit_logs
      ADD CONSTRAINT audit_logs_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'audit_logs user_id FK: %', SQLERRM;
END $$;

CREATE INDEX IF NOT EXISTS audit_logs_table_idx ON public.audit_logs(table_name, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_user_idx  ON public.audit_logs(user_id, created_at DESC);


-- ============================================================
-- PART 3: ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.development_work_media  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.train_master            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.railway_quota_config    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.railway_eq_requests     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parliament_letters      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parliament_questions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parliament_answers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_gallery_albums    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_gallery_photos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speech_storage          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs              ENABLE ROW LEVEL SECURITY;

-- Notifications: each user sees only their own
DROP POLICY IF EXISTS "own_notifications" ON public.notifications;
CREATE POLICY "own_notifications" ON public.notifications
  FOR ALL USING (recipient_id = auth.uid());

-- Dev-work media: public read, authenticated write
DROP POLICY IF EXISTS "read_dev_work_media" ON public.development_work_media;
CREATE POLICY "read_dev_work_media" ON public.development_work_media
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "write_dev_work_media" ON public.development_work_media;
CREATE POLICY "write_dev_work_media" ON public.development_work_media
  FOR ALL USING (auth.role() = 'authenticated');

-- Gallery: public albums/photos readable by everyone
DROP POLICY IF EXISTS "public_gallery_albums_read" ON public.photo_gallery_albums;
CREATE POLICY "public_gallery_albums_read" ON public.photo_gallery_albums
  FOR SELECT USING (is_public = true OR auth.role() = 'authenticated');
DROP POLICY IF EXISTS "auth_gallery_albums_write" ON public.photo_gallery_albums;
CREATE POLICY "auth_gallery_albums_write" ON public.photo_gallery_albums
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "public_gallery_photos_read" ON public.photo_gallery_photos;
CREATE POLICY "public_gallery_photos_read" ON public.photo_gallery_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.photo_gallery_albums a
      WHERE a.gallery_id = photo_gallery_photos.gallery_id
        AND (a.is_public = true OR auth.role() = 'authenticated')
    )
  );
DROP POLICY IF EXISTS "auth_gallery_photos_write" ON public.photo_gallery_photos;
CREATE POLICY "auth_gallery_photos_write" ON public.photo_gallery_photos
  FOR ALL USING (auth.role() = 'authenticated');

-- Everything else: authenticated users only
DROP POLICY IF EXISTS "auth_train_master"         ON public.train_master;
CREATE POLICY "auth_train_master"         ON public.train_master         FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "auth_railway_quota_config" ON public.railway_quota_config;
CREATE POLICY "auth_railway_quota_config" ON public.railway_quota_config  FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "auth_railway_eq_requests"  ON public.railway_eq_requests;
CREATE POLICY "auth_railway_eq_requests"  ON public.railway_eq_requests   FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "auth_parliament_letters"   ON public.parliament_letters;
CREATE POLICY "auth_parliament_letters"   ON public.parliament_letters    FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "auth_parliament_questions" ON public.parliament_questions;
CREATE POLICY "auth_parliament_questions" ON public.parliament_questions  FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "auth_parliament_answers"   ON public.parliament_answers;
CREATE POLICY "auth_parliament_answers"   ON public.parliament_answers    FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "auth_speech_storage"       ON public.speech_storage;
CREATE POLICY "auth_speech_storage"       ON public.speech_storage        FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "auth_audit_logs"           ON public.audit_logs;
CREATE POLICY "auth_audit_logs"           ON public.audit_logs            FOR ALL USING (auth.role() = 'authenticated');


-- ============================================================
-- PART 4: RPC FUNCTIONS
-- ============================================================

-- ── Sequence for EQ letter numbers ────────────────────────
CREATE SEQUENCE IF NOT EXISTS public.eq_letter_number_seq START 1;

-- ── get_todays_birthdays ───────────────────────────────────
DROP FUNCTION IF EXISTS public.get_todays_birthdays();
CREATE OR REPLACE FUNCTION public.get_todays_birthdays()
RETURNS SETOF public.contacts
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT * FROM public.contacts
  WHERE deleted_at IS NULL
    AND birthday = to_char(now() AT TIME ZONE 'Asia/Kolkata', 'MM-DD');
$$;

-- ── get_todays_anniversaries ───────────────────────────────
DROP FUNCTION IF EXISTS public.get_todays_anniversaries();
CREATE OR REPLACE FUNCTION public.get_todays_anniversaries()
RETURNS SETOF public.contacts
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT * FROM public.contacts
  WHERE deleted_at IS NULL
    AND anniversary = to_char(now() AT TIME ZONE 'Asia/Kolkata', 'MM-DD');
$$;

-- ── get_parliament_stats ───────────────────────────────────
DROP FUNCTION IF EXISTS public.get_parliament_stats();
CREATE OR REPLACE FUNCTION public.get_parliament_stats()
RETURNS json
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'total_letters',      (SELECT count(*)  FROM public.parliament_letters),
    'pending_letters',    (SELECT count(*)  FROM public.parliament_letters  WHERE status NOT IN ('REPLIED','CLOSED')),
    'overdue_letters',    (SELECT count(*)  FROM public.parliament_letters  WHERE expected_response_date < CURRENT_DATE AND status NOT IN ('REPLIED','CLOSED')),
    'total_questions',    (SELECT count(*)  FROM public.parliament_questions),
    'answered_questions', (SELECT count(*)  FROM public.parliament_questions WHERE status = 'ANSWERED'),
    'pending_questions',  (SELECT count(*)  FROM public.parliament_questions WHERE status IN ('SUBMITTED','ADMITTED'))
  );
$$;

-- ── get_eq_quota_status ────────────────────────────────────
DROP FUNCTION IF EXISTS public.get_eq_quota_status();
CREATE OR REPLACE FUNCTION public.get_eq_quota_status()
RETURNS TABLE (
  division      text,
  monthly_quota int,
  used_quota    int,
  remaining     int
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT division,
         monthly_quota,
         used_quota,
         monthly_quota - used_quota AS remaining
  FROM   public.railway_quota_config;
$$;

-- ── generate_eq_letter_number ──────────────────────────────
DROP FUNCTION IF EXISTS public.generate_eq_letter_number(text);
CREATE OR REPLACE FUNCTION public.generate_eq_letter_number(constituency text)
RETURNS text
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT constituency || '/EQ/' || to_char(now(), 'YYYY') || '/' ||
         lpad(nextval('public.eq_letter_number_seq')::text, 4, '0');
$$;

-- ── finalize_day_plan ──────────────────────────────────────
DROP FUNCTION IF EXISTS public.finalize_day_plan(date, uuid);
CREATE OR REPLACE FUNCTION public.finalize_day_plan(
  p_date  date,
  p_pa_id uuid
)
RETURNS void
LANGUAGE sql SECURITY DEFINER
AS $$
  UPDATE public.plan_today_events
  SET    day_finalized = true,
         updated_at    = now()
  WHERE  scheduled_date = p_date
    AND  pa_id          = p_pa_id
    AND  day_finalized  = false;
$$;


-- ============================================================
-- PART 5: STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('dev-works-media', 'dev-works-media', true ),
  ('daybook-audio',   'daybook-audio',   false),
  ('photo-gallery',   'photo-gallery',   true ),
  ('eq-letters',      'eq-letters',      false),
  ('eq-signatures',   'eq-signatures',   false)
ON CONFLICT (id) DO NOTHING;

-- Storage object policies
-- dev-works-media: public read, auth write
DROP POLICY IF EXISTS "s3_devworks_select" ON storage.objects;
CREATE POLICY "s3_devworks_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'dev-works-media');
DROP POLICY IF EXISTS "s3_devworks_insert" ON storage.objects;
CREATE POLICY "s3_devworks_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'dev-works-media' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "s3_devworks_delete" ON storage.objects;
CREATE POLICY "s3_devworks_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'dev-works-media' AND auth.role() = 'authenticated');

-- photo-gallery: public read, auth write
DROP POLICY IF EXISTS "s3_gallery_select" ON storage.objects;
CREATE POLICY "s3_gallery_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'photo-gallery');
DROP POLICY IF EXISTS "s3_gallery_insert" ON storage.objects;
CREATE POLICY "s3_gallery_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photo-gallery' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "s3_gallery_delete" ON storage.objects;
CREATE POLICY "s3_gallery_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'photo-gallery' AND auth.role() = 'authenticated');

-- daybook-audio: authenticated only (private)
DROP POLICY IF EXISTS "s3_daybook_all" ON storage.objects;
CREATE POLICY "s3_daybook_all" ON storage.objects
  FOR ALL USING (bucket_id = 'daybook-audio' AND auth.role() = 'authenticated');

-- eq-letters: authenticated only (private)
DROP POLICY IF EXISTS "s3_eqletters_all" ON storage.objects;
CREATE POLICY "s3_eqletters_all" ON storage.objects
  FOR ALL USING (bucket_id = 'eq-letters' AND auth.role() = 'authenticated');

-- eq-signatures: authenticated only (private vault)
DROP POLICY IF EXISTS "s3_eqsig_all" ON storage.objects;
CREATE POLICY "s3_eqsig_all" ON storage.objects
  FOR ALL USING (bucket_id = 'eq-signatures' AND auth.role() = 'authenticated');


-- ============================================================
-- PART 6: CUSTOM ACCESS TOKEN HOOK (Auth Hook)
-- ============================================================
-- This function injects the user's role from the profiles table
-- into every JWT so lib/auth.ts can read it as app_metadata.user_role.
-- After running this SQL you MUST also enable it in the Supabase
-- Dashboard: Authentication → Hooks → Custom Access Token Hook
-- → select schema "public", function "custom_access_token_hook".

DROP FUNCTION IF EXISTS public.custom_access_token_hook(jsonb);
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER STABLE
AS $$
DECLARE
  claims        jsonb;
  user_role_val text;
BEGIN
  -- Look up this user's role from profiles
  SELECT role::text
  INTO   user_role_val
  FROM   public.profiles
  WHERE  id = (event->>'user_id')::uuid;

  claims := event->'claims';

  IF user_role_val IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role_val));
  END IF;

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

-- Grant execution right to the Supabase auth service role
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
-- Revoke from regular roles for security
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;

-- ============================================================
-- DONE
-- ============================================================
-- Reminder: go to Dashboard → Authentication → Hooks and set
-- "Custom Access Token Hook" to public.custom_access_token_hook
-- ============================================================
