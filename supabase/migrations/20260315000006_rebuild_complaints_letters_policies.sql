-- ============================================================
-- MP-CONNECT: REBUILD complaints + letters POLICIES
-- ============================================================
-- Live smoke testing showed complaint/letter access was still broad
-- even after the second-pass security migration and FORCE RLS.
-- The safest remediation is to remove every existing policy on these
-- two tables and recreate only the intended restrictive policy set.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_official_role()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND COALESCE(p.is_active, true) = true
      AND p.role IN ('ADMIN', 'MP', 'PA', 'STAFF')
  );
$$;

DO $$
DECLARE
  policy_row record;
BEGIN
  FOR policy_row IN
    SELECT polname
    FROM pg_policy
    WHERE polrelid = 'public.complaints'::regclass
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.complaints', policy_row.polname);
  END LOOP;

  FOR policy_row IN
    SELECT polname
    FROM pg_policy
    WHERE polrelid = 'public.letters'::regclass
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.letters', policy_row.polname);
  END LOOP;
END $$;

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints FORCE ROW LEVEL SECURITY;

CREATE POLICY complaints_select ON public.complaints
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND (
      submitted_by = auth.uid()
      OR public.is_official_role()
    )
  );

CREATE POLICY complaints_insert ON public.complaints
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND submitted_by = auth.uid()
  );

CREATE POLICY complaints_update_official ON public.complaints
  FOR UPDATE USING (
    auth.role() = 'authenticated'
    AND public.is_official_role()
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND public.is_official_role()
  );

CREATE POLICY complaints_delete_official ON public.complaints
  FOR DELETE USING (
    auth.role() = 'authenticated'
    AND public.is_official_role()
  );

ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters FORCE ROW LEVEL SECURITY;

CREATE POLICY letters_select_official ON public.letters
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND public.is_official_role()
  );

CREATE POLICY letters_insert_official ON public.letters
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND public.is_official_role()
    AND (sender_id IS NULL OR sender_id = auth.uid())
  );

CREATE POLICY letters_update_official ON public.letters
  FOR UPDATE USING (
    auth.role() = 'authenticated'
    AND public.is_official_role()
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND public.is_official_role()
  );

CREATE POLICY letters_delete_official ON public.letters
  FOR DELETE USING (
    auth.role() = 'authenticated'
    AND public.is_official_role()
  );