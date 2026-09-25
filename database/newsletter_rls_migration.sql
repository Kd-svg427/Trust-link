-- ============================================
-- Newsletter — allow public (signed-out) subscriptions
-- Run this in your Supabase SQL Editor.
--
-- Symptom: footer newsletter form shows
--   "new row violates row-level security policy for table newsletter_subscribers"
-- Cause: the live table has an insert policy restricted to signed-in users only,
--        so visitors without a session are rejected. schema.sql's public policy
--        was never applied to this database.
-- ============================================

-- 1) Remove every existing INSERT policy on the table (unknown name in live DB)
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'newsletter_subscribers'
      AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.newsletter_subscribers', p.policyname);
  END LOOP;
END $$;

-- 2) Anyone — including signed-out visitors — may subscribe
CREATE POLICY "newsletter_insert_public"
  ON public.newsletter_subscribers FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

-- 3) Ensure the grants exist (idempotent, safe to re-run)
GRANT SELECT, INSERT ON public.newsletter_subscribers TO anon, authenticated;
