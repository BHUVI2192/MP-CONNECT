-- ============================================================
-- MP-CONNECT: SECURITY HARDENING
-- ============================================================
-- Tightens RLS and storage policies for sensitive workflows.
-- Safe to re-run (drops/recreates policies).
-- ============================================================

-- Helper: evaluate whether current user is an official role
DROP FUNCTION IF EXISTS public.is_official_role();
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

-- Helper: evaluate whether current user is elevated (decision-makers)
DROP FUNCTION IF EXISTS public.is_elevated_role();
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

-- ============================================================
-- Railway EQ tables
-- ============================================================

-- Drop broad policies from prior migrations
DROP POLICY IF EXISTS "auth_train_master" ON public.train_master;
DROP POLICY IF EXISTS "auth_railway_quota_config" ON public.railway_quota_config;
DROP POLICY IF EXISTS "auth_railway_eq_requests" ON public.railway_eq_requests;

-- train_master: official read, admin write
CREATE POLICY "train_master_official_read" ON public.train_master
  FOR SELECT USING (auth.role() = 'authenticated' AND public.is_official_role());
CREATE POLICY "train_master_admin_write" ON public.train_master
  FOR ALL USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN' AND COALESCE(p.is_active, true) = true
  ));

-- railway_quota_config: official read, admin write
CREATE POLICY "quota_config_official_read" ON public.railway_quota_config
  FOR SELECT USING (auth.role() = 'authenticated' AND public.is_official_role());
CREATE POLICY "quota_config_admin_write" ON public.railway_quota_config
  FOR ALL USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN' AND COALESCE(p.is_active, true) = true
  ));

-- railway_eq_requests: submitter + official visibility, elevated-only workflow updates
CREATE POLICY "eq_requests_select" ON public.railway_eq_requests
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND (
      submitted_by = auth.uid()
      OR public.is_official_role()
    )
  );

CREATE POLICY "eq_requests_insert" ON public.railway_eq_requests
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND public.is_official_role()
    AND submitted_by = auth.uid()
  );

CREATE POLICY "eq_requests_update" ON public.railway_eq_requests
  FOR UPDATE USING (
    auth.role() = 'authenticated'
    AND (
      public.is_elevated_role()
      OR submitted_by = auth.uid()
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (
      public.is_elevated_role()
      OR submitted_by = auth.uid()
    )
  );

CREATE POLICY "eq_requests_delete" ON public.railway_eq_requests
  FOR DELETE USING (auth.role() = 'authenticated' AND public.is_elevated_role());

-- ============================================================
-- Parliament + speech + audit tables
-- ============================================================

DROP POLICY IF EXISTS "auth_parliament_letters" ON public.parliament_letters;
DROP POLICY IF EXISTS "auth_parliament_questions" ON public.parliament_questions;
DROP POLICY IF EXISTS "auth_parliament_answers" ON public.parliament_answers;
DROP POLICY IF EXISTS "auth_speech_storage" ON public.speech_storage;
DROP POLICY IF EXISTS "auth_audit_logs" ON public.audit_logs;

CREATE POLICY "parliament_letters_official" ON public.parliament_letters
  FOR ALL USING (auth.role() = 'authenticated' AND public.is_official_role());

CREATE POLICY "parliament_questions_official" ON public.parliament_questions
  FOR ALL USING (auth.role() = 'authenticated' AND public.is_official_role());

CREATE POLICY "parliament_answers_official" ON public.parliament_answers
  FOR ALL USING (auth.role() = 'authenticated' AND public.is_official_role());

CREATE POLICY "speech_storage_official" ON public.speech_storage
  FOR ALL USING (auth.role() = 'authenticated' AND public.is_official_role());

-- audit logs: official read-only from client; server/service-role may insert
CREATE POLICY "audit_logs_official_read" ON public.audit_logs
  FOR SELECT USING (auth.role() = 'authenticated' AND public.is_official_role());

CREATE POLICY "audit_logs_service_insert" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- Storage bucket hardening
-- ============================================================

-- Restrict private bucket access for EQ artifacts
DROP POLICY IF EXISTS "s3_eqletters_all" ON storage.objects;
DROP POLICY IF EXISTS "s3_eqsig_all" ON storage.objects;

-- eq-letters: official read, elevated write/delete
CREATE POLICY "s3_eqletters_select_official" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'eq-letters'
    AND auth.role() = 'authenticated'
    AND public.is_official_role()
  );

CREATE POLICY "s3_eqletters_write_elevated" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'eq-letters'
    AND auth.role() = 'authenticated'
    AND public.is_elevated_role()
  );

CREATE POLICY "s3_eqletters_delete_elevated" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'eq-letters'
    AND auth.role() = 'authenticated'
    AND public.is_elevated_role()
  );

-- eq-signatures: elevated-only vault
CREATE POLICY "s3_eqsig_select_elevated" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'eq-signatures'
    AND auth.role() = 'authenticated'
    AND public.is_elevated_role()
  );

CREATE POLICY "s3_eqsig_write_elevated" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'eq-signatures'
    AND auth.role() = 'authenticated'
    AND public.is_elevated_role()
  );

CREATE POLICY "s3_eqsig_delete_elevated" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'eq-signatures'
    AND auth.role() = 'authenticated'
    AND public.is_elevated_role()
  );
