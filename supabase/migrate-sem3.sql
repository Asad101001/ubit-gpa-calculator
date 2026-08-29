-- ========================================================
-- UBIT Results - Semester 3 Schema Migration for Supabase
-- Copy and paste this into Supabase SQL Editor and click RUN
-- ========================================================

-- 1. Add Semester 3 Course Columns with default 'Results Unannounced'
ALTER TABLE student_results 
  ADD COLUMN IF NOT EXISTS cs451 TEXT DEFAULT 'Results Unannounced',
  ADD COLUMN IF NOT EXISTS cs453 TEXT DEFAULT 'Results Unannounced',
  ADD COLUMN IF NOT EXISTS cs455 TEXT DEFAULT 'Results Unannounced',
  ADD COLUMN IF NOT EXISTS cs457 TEXT DEFAULT 'Results Unannounced',
  ADD COLUMN IF NOT EXISTS cs459 TEXT DEFAULT 'Results Unannounced',
  ADD COLUMN IF NOT EXISTS cs461 TEXT DEFAULT 'Results Unannounced';

-- 2. Populate any existing rows where Semester 3 values might be NULL
UPDATE student_results
SET 
  cs451 = COALESCE(cs451, 'Results Unannounced'),
  cs453 = COALESCE(cs453, 'Results Unannounced'),
  cs455 = COALESCE(cs455, 'Results Unannounced'),
  cs457 = COALESCE(cs457, 'Results Unannounced'),
  cs459 = COALESCE(cs459, 'Results Unannounced'),
  cs461 = COALESCE(cs461, 'Results Unannounced');

-- 3. Notify schema cache reload
NOTIFY pgrst, 'reload schema';
