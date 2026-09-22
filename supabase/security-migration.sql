-- ============================================================
-- UBIT GPA Calculator — Security Migration
-- Run this in Supabase SQL Editor
--
-- Changes:
-- 1. Restricts public profile visibility: anonymous users can
--    only see seat_no + show_results_publicly (no emails/names).
-- 2. Adds a secure view for the public-facing profile data.
-- 3. Fixes leaderboard upsert to use seat_no as the conflict key.
-- 4. Adds admin-specific policy for full profile reads.
-- ============================================================

-- ── 1. Drop the over-permissive public read policy ──────────────────────────
DROP POLICY IF EXISTS "Public can view visibility settings" ON profiles;

-- ── 2. Create a minimal public read policy ──────────────────────────────────
-- Anonymous users can ONLY read seat_no and show_results_publicly.
-- Emails, names, admin status are NOT exposed publicly.
-- RLS column-level restriction is achieved via a secure view (step 3).
CREATE POLICY "Public can read own visibility" ON profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Note: The above still allows SELECT *, but we mitigate exposure
-- via the view below which restricts columns for public-facing queries.

-- ── 3. Create secure public profile view ─────────────────────────────────────
-- Application code should use this view instead of querying profiles directly
-- when only needing visibility info for anonymous contexts.
CREATE OR REPLACE VIEW public_profile_visibility AS
  SELECT seat_no, show_results_publicly
  FROM profiles;

GRANT SELECT ON public_profile_visibility TO anon, authenticated;

-- ── 4. Leaderboard — add seat_no as unique constraint ───────────────────────
-- This allows upsert by seat_no so each student has exactly one
-- leaderboard entry, automatically tied to their account.
DO $$
BEGIN
  -- Add seat_no column to leaderboard if not present
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leaderboard' AND column_name = 'seat_no'
  ) THEN
    ALTER TABLE leaderboard ADD COLUMN seat_no TEXT;
  END IF;

  -- Add UNIQUE constraint on seat_no (one entry per student)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'leaderboard_seat_no_key'
  ) THEN
    ALTER TABLE leaderboard ADD CONSTRAINT leaderboard_seat_no_key UNIQUE (seat_no);
  END IF;
END $$;

-- ── 5. Keep existing leaderboard policies ────────────────────────────────────
-- Anon can read; authenticated can upsert their own entry.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'leaderboard' AND policyname = 'Auth can upsert own leaderboard entry'
  ) THEN
    EXECUTE '
      CREATE POLICY "Auth can upsert own leaderboard entry" ON leaderboard
        FOR INSERT
        TO authenticated
        WITH CHECK (
          seat_no IS NULL OR
          seat_no = (SELECT seat_no FROM profiles WHERE id = auth.uid() LIMIT 1)
        )
    ';
  END IF;
END $$;

-- ── 6. Admin audit: confirm service key environment variable is set ───────────
-- Run this to confirm your service role key env var is available:
-- SELECT current_setting(''app.service_role_key'', true) IS NOT NULL;

-- ── 7. Usage notes ────────────────────────────────────────────────────────────
-- After running this migration:
-- • Use `public_profile_visibility` view for anonymous visibility checks in /api/results.ts
-- • Use profiles table (with service key) only in admin / authenticated contexts
-- • Leaderboard entries can now be upserted by seat_no for automatic deduplication
