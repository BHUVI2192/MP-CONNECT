-- ============================================================
-- MP-CONNECT: SECURITY SECOND PASS (COMPLAINTS + LETTERS)
-- ============================================================
-- Tightens RLS for citizen complaints and official letters.
-- ============================================================

-- Ensure helper exists (defined in prior security migration)
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

-- ============================================================
-- complaints hardening
-- ============================================================

-- Add ownership column for citizen-visible isolation.
ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Keep inserts working even if client does not explicitly send submitted_by.
ALTER TABLE public.complaints
  ALTER COLUMN submitted_by SET DEFAULT auth.uid();

DROP POLICY IF EXISTS "complaints_auth" ON public.complaints;
DROP POLICY IF EXISTS "complaints_select" ON public.complaints;
DROP POLICY IF EXISTS "complaints_insert" ON public.complaints;
DROP POLICY IF EXISTS "complaints_update_official" ON public.complaints;
DROP POLICY IF EXISTS "complaints_delete_official" ON public.complaints;

-- Citizens can see only their own complaints; officials can see all.
CREATE POLICY "complaints_select" ON public.complaints
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND (
      submitted_by = auth.uid()
      OR public.is_official_role()
    )
  );

-- Only owner can create complaint rows for themselves.
CREATE POLICY "complaints_insert" ON public.complaints
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND submitted_by = auth.uid()
  );

-- Workflow/status changes are official actions.
CREATE POLICY "complaints_update_official" ON public.complaints
  FOR UPDATE USING (
    auth.role() = 'authenticated'
    AND public.is_official_role()
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND public.is_official_role()
  );

-- Complaint deletion is restricted to officials.
CREATE POLICY "complaints_delete_official" ON public.complaints
  FOR DELETE USING (
    auth.role() = 'authenticated'
    AND public.is_official_role()
  );

-- ============================================================
-- letters hardening
-- ============================================================

DROP POLICY IF EXISTS "letters_auth" ON public.letters;
DROP POLICY IF EXISTS "letters_select_official" ON public.letters;
DROP POLICY IF EXISTS "letters_insert_official" ON public.letters;
DROP POLICY IF EXISTS "letters_update_official" ON public.letters;
DROP POLICY IF EXISTS "letters_delete_official" ON public.letters;

-- Letters are internal workflow artifacts.
CREATE POLICY "letters_select_official" ON public.letters
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND public.is_official_role()
  );

CREATE POLICY "letters_insert_official" ON public.letters
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND public.is_official_role()
    AND (sender_id IS NULL OR sender_id = auth.uid())
  );

CREATE POLICY "letters_update_official" ON public.letters
  FOR UPDATE USING (
    auth.role() = 'authenticated'
    AND public.is_official_role()
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND public.is_official_role()
  );

CREATE POLICY "letters_delete_official" ON public.letters
  FOR DELETE USING (
    auth.role() = 'authenticated'
    AND public.is_official_role()
  );
