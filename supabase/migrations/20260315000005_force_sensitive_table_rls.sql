-- ============================================================
-- MP-CONNECT: FORCE RLS ON SENSITIVE TABLES
-- ============================================================
-- Live smoke testing showed citizen users could read/insert rows in
-- complaints and letters despite restrictive policies being present.
-- That only happens when RLS is not actively enforced on the table.
-- Re-enable and FORCE RLS on the sensitive workflow tables.
-- ============================================================

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints FORCE ROW LEVEL SECURITY;

ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters FORCE ROW LEVEL SECURITY;

ALTER TABLE public.railway_eq_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.railway_eq_requests FORCE ROW LEVEL SECURITY;

ALTER TABLE public.parliament_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parliament_letters FORCE ROW LEVEL SECURITY;

ALTER TABLE public.parliament_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parliament_questions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.parliament_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parliament_answers FORCE ROW LEVEL SECURITY;

ALTER TABLE public.speech_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speech_storage FORCE ROW LEVEL SECURITY;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;