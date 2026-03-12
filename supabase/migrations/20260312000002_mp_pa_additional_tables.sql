-- ============================================================
-- MP-CONNECT: ADDITIONAL TABLES FOR MP & PA PORTALS
-- Run in Supabase SQL Editor after the previous migrations.
-- ============================================================

-- ── Add attendees + purpose to plan_today_events ────────────
ALTER TABLE public.plan_today_events
  ADD COLUMN IF NOT EXISTS attendees  JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS purpose    TEXT;

-- ── mplads_funds ────────────────────────────────────────────
-- Annual MPLADS fund cycle (recommended / sanctioned / released)
CREATE TABLE IF NOT EXISTS public.mplads_funds (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  year            TEXT        NOT NULL UNIQUE,
  recommended_cr  NUMERIC     NOT NULL DEFAULT 0,
  sanctioned_cr   NUMERIC     NOT NULL DEFAULT 0,
  released_cr     NUMERIC     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mplads_funds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mplads_funds_auth" ON public.mplads_funds;
CREATE POLICY "mplads_funds_auth" ON public.mplads_funds
  FOR ALL USING (auth.role() = 'authenticated');

-- Seed initial data (safe to re-run)
INSERT INTO public.mplads_funds (year, recommended_cr, sanctioned_cr, released_cr)
VALUES
  ('2020', 5,   4.5, 4  ),
  ('2021', 5,   4.8, 4.5),
  ('2022', 5,   5,   5  ),
  ('2023', 7.5, 7,   6.5),
  ('2024', 7.5, 3.5, 2  )
ON CONFLICT (year) DO NOTHING;

-- ── mplads_projects ─────────────────────────────────────────
-- Individual MPLADS project sanctions
CREATE TABLE IF NOT EXISTS public.mplads_projects (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name     TEXT        NOT NULL DEFAULT '',
  recommended_date DATE,
  amount_lakhs     NUMERIC     NOT NULL DEFAULT 0,
  status           TEXT        NOT NULL DEFAULT 'In Process',
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mplads_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mplads_projects_auth" ON public.mplads_projects;
CREATE POLICY "mplads_projects_auth" ON public.mplads_projects
  FOR ALL USING (auth.role() = 'authenticated');

-- Seed initial projects (safe to re-run by checking for existing names)
INSERT INTO public.mplads_projects (project_name, recommended_date, amount_lakhs, status)
SELECT v.project_name, v.recommended_date::DATE, v.amount_lakhs, v.status
FROM (VALUES
  ('Community Center, Block G',  '2024-02-12', 45, 'Sanctioned'),
  ('Solar Street Lights Phase IV','2024-01-05', 88, 'Released'),
  ('Library Digitalization',      '2023-12-22', 12, 'In Process')
) AS v(project_name, recommended_date, amount_lakhs, status)
WHERE NOT EXISTS (
  SELECT 1 FROM public.mplads_projects mp WHERE mp.project_name = v.project_name
);

-- ── media_clips ─────────────────────────────────────────────
-- News clips and media monitoring for the MP
CREATE TABLE IF NOT EXISTS public.media_clips (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT        NOT NULL DEFAULT '',
  source       TEXT        NOT NULL DEFAULT '',
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sentiment    TEXT        NOT NULL DEFAULT 'Neutral'
                           CHECK (sentiment IN ('Positive', 'Negative', 'Neutral')),
  summary      TEXT,
  url          TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.media_clips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "media_clips_auth" ON public.media_clips;
CREATE POLICY "media_clips_auth" ON public.media_clips
  FOR ALL USING (auth.role() = 'authenticated');

-- Seed initial clips (check by title to avoid duplication)
INSERT INTO public.media_clips (title, source, published_at, sentiment, summary)
SELECT v.title, v.source, v.published_at::TIMESTAMPTZ, v.sentiment, v.summary
FROM (VALUES
  ('MP inaugurates new hospital wing in Northeast Delhi',
   'The Daily Herald', NOW() - INTERVAL '2 hours', 'Positive',
   'The inauguration marks a major milestone for local healthcare accessibility.'),
  ('Local residents protest delay in road repairs near Metro station',
   'City Times', NOW() - INTERVAL '5 hours', 'Negative',
   'Protestors expressed frustration over the 3-month delay in finishing road work.'),
  ('Constituency reports 15% increase in solar energy adoption',
   'Global News', NOW() - INTERVAL '1 day', 'Positive',
   'Efforts by the local representative office to promote green energy yield results.'),
  ('New policy announcement for local vendors upcoming',
   'Economic Times', NOW() - INTERVAL '2 days', 'Neutral',
   'The MP Connect team is drafting a guideline for street vendor organization.')
) AS v(title, source, published_at, sentiment, summary)
WHERE NOT EXISTS (
  SELECT 1 FROM public.media_clips mc WHERE mc.title = v.title
);

-- ── greeting_logs ────────────────────────────────────────────
-- Tracks which contacts have been greeted on birthdays / anniversaries
CREATE TABLE IF NOT EXISTS public.greeting_logs (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id     UUID        REFERENCES public.contacts(contact_id) ON DELETE SET NULL,
  contact_name   TEXT        NOT NULL DEFAULT '',
  occasion       TEXT        NOT NULL DEFAULT 'Birthday',
  channel        TEXT        NOT NULL DEFAULT 'WhatsApp',
  status         TEXT        NOT NULL DEFAULT 'Sent',
  greeted_year   INT         NOT NULL DEFAULT EXTRACT(YEAR FROM now())::INT,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.greeting_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "greeting_logs_auth" ON public.greeting_logs;
CREATE POLICY "greeting_logs_auth" ON public.greeting_logs
  FOR ALL USING (auth.role() = 'authenticated');

-- ── RPC: get_todays_birthdays ────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_todays_birthdays()
RETURNS SETOF public.contacts
LANGUAGE sql STABLE
AS $$
  SELECT *
  FROM public.contacts
  WHERE birthday = TO_CHAR(CURRENT_DATE, 'MM-DD')
    AND deleted_at IS NULL
  ORDER BY full_name;
$$;

-- ── RPC: get_todays_anniversaries ───────────────────────────
CREATE OR REPLACE FUNCTION public.get_todays_anniversaries()
RETURNS SETOF public.contacts
LANGUAGE sql STABLE
AS $$
  SELECT *
  FROM public.contacts
  WHERE anniversary = TO_CHAR(CURRENT_DATE, 'MM-DD')
    AND deleted_at IS NULL
  ORDER BY full_name;
$$;

-- ── RPC: finalize_day_plan ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.finalize_day_plan(p_date TEXT, p_pa_id UUID)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.plan_today_events
  SET day_finalized = true,
      updated_at    = now()
  WHERE scheduled_date = p_date::DATE
    AND pa_id = p_pa_id;
$$;
