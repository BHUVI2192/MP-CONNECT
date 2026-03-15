-- ============================================================
-- MP-CONNECT: ALIGN OFFICIAL ROLE HELPERS
-- ============================================================
-- The application stores staff accounts as OFFICE_STAFF / FIELD_STAFF,
-- but the security helpers only recognized STAFF. That blocked real
-- staff users once restrictive RLS started being enforced.
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
      AND p.role IN ('ADMIN', 'MP', 'PA', 'STAFF', 'OFFICE_STAFF', 'FIELD_STAFF')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_elevated_role()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND COALESCE(p.is_active, true) = true
      AND p.role IN ('ADMIN', 'MP', 'PA')
  );
$$;