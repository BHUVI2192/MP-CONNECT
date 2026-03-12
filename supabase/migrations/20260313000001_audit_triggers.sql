-- ======================================================================
-- MP-CONNECT: AUDIT TRIGGERS + PROFILE CONSTITUENCY
-- Automatically populates audit_logs on sensitive table mutations.
-- Safe to re-run (uses CREATE OR REPLACE + DROP IF EXISTS).
-- ======================================================================

-- ── Add constituency column to profiles ────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS constituency TEXT NOT NULL DEFAULT 'Northeast Delhi';

-- ── Trigger function ────────────────────────────────────────────────
-- Writes one row to audit_logs for every INSERT/UPDATE/DELETE on the
-- attached tables. Uses SECURITY DEFINER so it can always write to
-- audit_logs regardless of the calling user's RLS permissions.

CREATE OR REPLACE FUNCTION public.log_sensitive_operation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record_id  TEXT;
  v_old_data   JSONB;
  v_new_data   JSONB;
  v_user_id    UUID;
  v_user_role  TEXT;
BEGIN
  -- Resolve calling user from Supabase auth context (NULL for service-role)
  BEGIN
    v_user_id := auth.uid();
  EXCEPTION WHEN others THEN
    v_user_id := NULL;
  END;

  -- Look up the role stored in profiles
  IF v_user_id IS NOT NULL THEN
    SELECT role INTO v_user_role
    FROM public.profiles
    WHERE id = v_user_id
    LIMIT 1;
  END IF;

  -- Pick out the primary key value (handles different PK column names)
  IF TG_OP = 'DELETE' THEN
    v_record_id := COALESCE(
      (row_to_json(OLD) ->> 'id'),
      (row_to_json(OLD) ->> 'request_id'),
      (row_to_json(OLD) ->> 'letter_id'),
      'unknown'
    );
    v_old_data := row_to_json(OLD)::JSONB;
    v_new_data := NULL;

  ELSIF TG_OP = 'INSERT' THEN
    v_record_id := COALESCE(
      (row_to_json(NEW) ->> 'id'),
      (row_to_json(NEW) ->> 'request_id'),
      (row_to_json(NEW) ->> 'letter_id'),
      'unknown'
    );
    v_old_data := NULL;
    v_new_data := row_to_json(NEW)::JSONB;

  ELSE -- UPDATE
    v_record_id := COALESCE(
      (row_to_json(NEW) ->> 'id'),
      (row_to_json(NEW) ->> 'request_id'),
      (row_to_json(NEW) ->> 'letter_id'),
      'unknown'
    );
    v_old_data := row_to_json(OLD)::JSONB;
    v_new_data := row_to_json(NEW)::JSONB;
  END IF;

  INSERT INTO public.audit_logs (
    user_id, user_role, action, table_name, record_id, old_data, new_data
  ) VALUES (
    v_user_id,
    v_user_role,
    TG_OP,
    TG_TABLE_NAME,
    v_record_id,
    v_old_data,
    v_new_data
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ── Attach triggers to sensitive tables ────────────────────────────

-- complaints
DROP TRIGGER IF EXISTS audit_complaints ON public.complaints;
CREATE TRIGGER audit_complaints
  AFTER INSERT OR UPDATE OR DELETE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_operation();

-- letters (general correspondence)
DROP TRIGGER IF EXISTS audit_letters ON public.letters;
CREATE TRIGGER audit_letters
  AFTER INSERT OR UPDATE OR DELETE ON public.letters
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_operation();

-- railway_eq_requests
DROP TRIGGER IF EXISTS audit_railway_eq ON public.railway_eq_requests;
CREATE TRIGGER audit_railway_eq
  AFTER INSERT OR UPDATE OR DELETE ON public.railway_eq_requests
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_operation();

-- parliament_letters
DROP TRIGGER IF EXISTS audit_parliament_letters ON public.parliament_letters;
CREATE TRIGGER audit_parliament_letters
  AFTER INSERT OR UPDATE OR DELETE ON public.parliament_letters
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_operation();
