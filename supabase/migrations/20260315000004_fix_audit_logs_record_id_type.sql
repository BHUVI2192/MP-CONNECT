-- ======================================================================
-- MP-CONNECT: FIX audit_logs.record_id COLUMN TYPE
-- ======================================================================
-- The live DB has audit_logs.record_id as UUID type, but the intent
-- (per migration 20260310000000) is TEXT (stores PK values from many
-- tables, not all of which are UUIDs). The audit trigger function
-- already declares v_record_id as TEXT — casting to TEXT here so
-- INSERT/UPDATE on complaints (and other audited tables) no longer
-- fails with "column record_id is of type uuid but expression is text".
-- ======================================================================

ALTER TABLE public.audit_logs
  ALTER COLUMN record_id TYPE text USING record_id::text;
