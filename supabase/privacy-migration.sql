-- ============================================================
-- UBIT Privacy & RLS Migration
-- Run this in Supabase SQL Editor to enforce privacy rules
-- ============================================================

-- 1. Ensure is_hidden column exists in student_results
ALTER TABLE student_results ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;

-- 2. Allow public (anon) read access to profiles visibility field
--    (so api/results.ts can fetch hidden seat numbers without a service key)
DROP POLICY IF EXISTS "Public can view visibility settings" ON profiles;
CREATE POLICY "Public can view visibility settings" ON profiles
  FOR SELECT USING (true);

-- 3. Sync is_hidden in student_results from current profiles data
UPDATE student_results sr
SET is_hidden = true
FROM profiles p
WHERE p.seat_no = sr.seat_no
  AND p.show_results_publicly = false;
